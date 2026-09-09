import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Literal

import joblib
import pandas as pd

from bson import ObjectId

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
)
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field

from database import users_collection, predictions_collection, check_connection
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


# ============================================================
# MODEL
# ============================================================

MODEL_PATH = Path(__file__).resolve().parent / "Mental_Health_Model.pkl"

model = joblib.load(MODEL_PATH)

top_countries = [
    "Other",
    "India",
    "USA",
    "Canada",
    "Australia",
    "UK",
    "Germany",
    "Mexico",
    "Turkey",
    "France",
]


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI()


# ============================================================
# CORS
# ============================================================

_allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")

allow_origins = (
    ["*"]
    if _allowed_origins.strip() == "*"
    else [
        origin.strip()
        for origin in _allowed_origins.split(",")
        if origin.strip()
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# AUTHENTICATION
# ============================================================

security = HTTPBearer()


class RegisterRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    email: str = Field(
        ...,
        min_length=5,
        max_length=255
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=72
    )


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    user_id = decode_access_token(token)

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    try:
        user = users_collection.find_one(
            {
                "_id": ObjectId(user_id)
            }
        )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid user token",
        )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


# ============================================================
# STUDENT DATA
# ============================================================

class StudentData(BaseModel):

    age: int = Field(
        ...,
        ge=16,
        le=26
    )

    gender: Literal[
        "Male",
        "Female"
    ]

    country: str

    academic_level: Literal[
        "Undergraduate",
        "Graduate",
        "High School"
    ]

    most_used_platform: Literal[
        "Facebook",
        "LinkedIn",
        "Instagram",
        "Snapchat",
        "Twitter",
        "YouTube",
        "TikTok",
        "LINE",
        "KakaoTalk",
        "VKontakte",
        "WhatsApp",
        "WeChat"
    ]

    purpose_of_use: Literal[
        "Networking",
        "Education",
        "Entertainment",
        "News"
    ]

    avg_daily_usage_hours: float = Field(
        ...,
        ge=0,
        le=24
    )

    daily_unlocks: int = Field(
        ...,
        ge=0
    )

    study_hours: float = Field(
        ...,
        ge=0,
        le=24
    )

    physical_activity_hours: float = Field(
        ...,
        ge=0,
        le=24
    )

    sleep_hours_per_night: float = Field(
        ...,
        ge=0,
        le=24
    )

    stress_level: Literal[
        "Medium",
        "Low",
        "Very High",
        "High"
    ]


# ============================================================
# PREDICTION RESPONSE
# ============================================================

class PredictionResponse(BaseModel):
    predicted_mental_health_score: float


# ============================================================
# BASIC ROUTES
# ============================================================

@app.get("/")
def greet():
    return {
        "Welcome": "to the Mental Health Prediction API"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "db_connected": check_connection()
    }


# ============================================================
# REGISTER
# ============================================================

@app.post(
    "/auth/register",
    response_model=AuthResponse
)
def register(data: RegisterRequest):

    email = data.email.strip().lower()

    # Check whether email already exists
    existing_user = users_collection.find_one(
        {
            "email": email
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered",
        )

    # Create user
    user = {
        "name": data.name.strip(),
        "email": email,
        "password_hash": hash_password(data.password),
        "created_at": datetime.now(timezone.utc),
    }

    # Save user to MongoDB
    result = users_collection.insert_one(user)

    user_id = str(result.inserted_id)

    # Generate JWT
    token = create_access_token(user_id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
        },
    }


# ============================================================
# LOGIN
# ============================================================

@app.post(
    "/auth/login",
    response_model=AuthResponse
)
def login(data: LoginRequest):

    email = data.email.strip().lower()

    user = users_collection.find_one(
        {
            "email": email
        }
    )

    # Don't reveal whether email exists
    if not user or not verify_password(
        data.password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])

    # Generate JWT
    token = create_access_token(user_id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
        },
    }


# ============================================================
# CURRENT USER
# ============================================================

@app.get("/auth/me")
def get_me(
    current_user=Depends(get_current_user)
):

    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict", response_model=PredictionResponse)
def predict(
    data: StudentData,
    current_user=Depends(get_current_user)
):
    country_group = (
        data.country
        if data.country in top_countries
        else "Other"
    )

    input_data = pd.DataFrame([{
        "Age": data.age,
        "Gender": data.gender,
        "Country": data.country,
        "Academic_Level": data.academic_level,
        "Most_Used_Platform": data.most_used_platform,
        "Purpose_Of_Use": data.purpose_of_use,
        "Avg_Daily_Usage_Hours": data.avg_daily_usage_hours,
        "Daily_Unlocks": data.daily_unlocks,
        "Study_Hours": data.study_hours,
        "Physical_Activity_Hours": data.physical_activity_hours,
        "Sleep_Hours_Per_Night": data.sleep_hours_per_night,
        "Stress_Level": data.stress_level,
        "Grouped_country": country_group,
    }])

    prediction = model.predict(input_data)[0]
    score = round(float(prediction), 2)

    predictions_collection.insert_one({
        "user_id": current_user["_id"],

        "age": data.age,
        "gender": data.gender,
        "country": data.country,
        "academic_level": data.academic_level,
        "most_used_platform": data.most_used_platform,
        "purpose_of_use": data.purpose_of_use,
        "avg_daily_usage_hours": data.avg_daily_usage_hours,
        "daily_unlocks": data.daily_unlocks,
        "study_hours": data.study_hours,
        "physical_activity_hours": data.physical_activity_hours,
        "sleep_hours_per_night": data.sleep_hours_per_night,
        "stress_level": data.stress_level,

        "predicted_score": score,
        "created_at": datetime.now(timezone.utc),
    })

    return PredictionResponse(
        predicted_mental_health_score=score
    )

@app.get("/history")
def get_history(current_user=Depends(get_current_user)):
    history = list(
        predictions_collection
        .find(
            {"user_id": current_user["_id"]},
            {
                "_id": 0,
                "user_id": 0,
            },
        )
        .sort("created_at", -1)
    )

    return history
@app.get("/trend")
def get_trend(current_user=Depends(get_current_user)):
    records = list(
        predictions_collection
        .find(
            {"user_id": current_user["_id"]}
        )
        .sort("created_at", -1)
        .limit(2)
    )

    if len(records) == 0:
        return {
            "status": "no_data",
            "message": "No predictions available yet.",
        }

    latest = records[0]

    if len(records) == 1:
        return {
            "status": "first_prediction",
            "latest_score": latest["predicted_score"],
            "previous_score": None,
            "change": None,
            "direction": "neutral",
            "message": "This is your first prediction.",
        }

    previous = records[1]

    latest_score = float(latest["predicted_score"])
    previous_score = float(previous["predicted_score"])

    score_change = round(
        latest_score - previous_score,
        2
    )

    if score_change > 0.5:
        direction = "improving"
        message = (
            f"Your latest predicted score is "
            f"{abs(score_change):.2f} higher than "
            "your previous assessment."
        )

    elif score_change < -0.5:
        direction = "declining"
        message = (
            f"Your latest predicted score is "
            f"{abs(score_change):.2f} lower than "
            "your previous assessment."
        )

    else:
        direction = "stable"
        message = (
            "Your latest predicted score is relatively "
            "close to your previous assessment."
        )

    screen_time_change = round(
        float(latest.get("avg_daily_usage_hours", 0))
        - float(previous.get("avg_daily_usage_hours", 0)),
        2
    )

    sleep_change = round(
        float(latest.get("sleep_hours_per_night", 0))
        - float(previous.get("sleep_hours_per_night", 0)),
        2
    )

    activity_change = round(
        float(latest.get("physical_activity_hours", 0))
        - float(previous.get("physical_activity_hours", 0)),
        2
    )

    unlock_change = (
        int(latest.get("daily_unlocks", 0))
        - int(previous.get("daily_unlocks", 0))
    )

    behavior_changes = {
        "screen_time": {
            "previous": previous.get("avg_daily_usage_hours"),
            "current": latest.get("avg_daily_usage_hours"),
            "change": screen_time_change,
        },
        "sleep": {
            "previous": previous.get("sleep_hours_per_night"),
            "current": latest.get("sleep_hours_per_night"),
            "change": sleep_change,
        },
        "physical_activity": {
            "previous": previous.get("physical_activity_hours"),
            "current": latest.get("physical_activity_hours"),
            "change": activity_change,
        },
        "study_hours": {
            "previous": previous.get("study_hours"),
            "current": latest.get("study_hours"),
            "change": round(
           float(latest.get("study_hours", 0))
         - float(previous.get("study_hours", 0)),
        2
    ),
},
        "daily_unlocks": {
            "previous": previous.get("daily_unlocks"),
            "current": latest.get("daily_unlocks"),
            "change": unlock_change,
        },
        "stress": {
            "previous": previous.get("stress_level"),
            "current": latest.get("stress_level"),
        },
    }

    return {
        "status": "comparison",
        "latest_score": latest_score,
        "previous_score": previous_score,
        "change": score_change,
        "direction": direction,
        "message": message,
        "latest_date": latest["created_at"],
        "previous_date": previous["created_at"],
        "behavior_changes": behavior_changes,
    }
# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    port = int(
        os.getenv(
            "PORT",
            8000
        )
    )

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )