import os
import secrets
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
from database import users_collection, predictions_collection, tasks_collection
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
class TaskSchedule(BaseModel):
    scheduled_at: datetime
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
    
TASK_DEFINITIONS = {
    "screen_time": {
        "title": "Screen-Time Reset",
        "description": "Take a short break from your phone or other screens and spend some time away from your usual digital activities.",
        "type": "screen_time",
        "target": 20,
    },
    "physical_activity": {
        "title": "Movement Break",
        "description": "Take a 30-minute walk, stretch, or do another comfortable form of physical activity.",
        "type": "physical_activity",
        "target": 30,
    },
    "sleep": {
        "title": "Sleep Routine",
        "description": "Start a calm pre-sleep routine and reduce screen use before going to bed.",
        "type": "sleep",
        "target": 30,
    },
    "stress": {
        "title": "Breathing Break",
        "description": "Take 10 minutes for slow breathing or a quiet mindfulness exercise.",
        "type": "stress",
        "target": 10,
    },
    "study": {
        "title": "Focused Study Session",
        "description": "Complete one focused study session without unnecessary phone interruptions.",
        "type": "study",
        "target": 30,
    },
}

TASK_DEFINITIONS = {
    ...
}


ACTIVITY_TYPES = {
    "physical_activity": "movement",
    "screen_time": "screen_break",
    "sleep": "wind_down",
    "stress": "breathing",
    "study": "focus",
    "social": "social",
    "hydration": "hydration",
}

ACTIVITY_INSTRUCTIONS = {
    "movement": [
        "Find a comfortable place to walk or move.",
        "Start the activity when you are ready.",
        "Walk or move at a comfortable pace.",
        "Continue for the target duration.",
        "Stop when the timer reaches zero or when you are ready to finish."
    ],
    "screen_break": [
        "Put your phone and other screens aside.",
        "Move away from your usual screen.",
        "Relax or do something away from the screen.",
        "Continue until the timer finishes."
    ],
    "wind_down": [
        "Put away your phone and other distracting screens.",
        "Find a comfortable and quiet place.",
        "Take some time to relax before sleep.",
        "Continue the wind-down routine for the target duration."
    ],
    "breathing": [
        "Sit comfortably and relax your shoulders.",
        "Breathe in slowly.",
        "Breathe out slowly.",
        "Continue at a comfortable pace.",
        "Stop if you feel uncomfortable."
    ],
    "focus": [
        "Choose one study task to focus on.",
        "Put unnecessary phone notifications aside.",
        "Work on your chosen task without unnecessary interruptions.",
        "Continue until the focus timer finishes."
    ],
    "social": [
        "Choose someone you trust to talk with.",
        "Start a conversation when you are comfortable.",
        "Spend some time talking or connecting.",
        "Finish when you feel the activity is complete."
    ],
    "hydration": [
        "Get a glass of water.",
        "Drink it at a comfortable pace.",
        "Continue your normal hydration routine throughout the day."
    ],
}
def generate_tasks(prediction):
    """
    Generate personalized well-being tasks from the user's
    latest reported behavioral data.
    """

    tasks = []

    screen_time = prediction.get("avg_daily_usage_hours", 0)
    physical_activity = prediction.get("physical_activity_hours", 0)
    sleep = prediction.get("sleep_hours_per_night", 0)
    stress = str(prediction.get("stress_level", "")).strip().lower()
    study = prediction.get("study_hours", 0)
    unlocks = prediction.get("daily_unlocks", 0)

    # =========================================================
    # PHYSICAL ACTIVITY
    # =========================================================

    if physical_activity < 0.5:
        tasks.append({
            "title": "Morning Movement",
            "description": "Take a 20–30 minute walk or light movement session at a comfortable pace.",
            "type": "physical_activity",
            "target": 30,
            "unit": "minutes",
            "suggested_time": "07:00"
        })

        tasks.append({
            "title": "Quick Movement Break",
            "description": "Take a short movement break and stretch or walk around.",
            "type": "physical_activity",
            "target": 10,
            "unit": "minutes",
            "suggested_time": "11:00"
        })

    elif physical_activity < 1:
        tasks.append({
            "title": "Active Break",
            "description": "Take a short walk or do some light movement away from your usual study area.",
            "type": "physical_activity",
            "target": 15,
            "unit": "minutes",
            "suggested_time": "17:00"
        })

    # =========================================================
    # SCREEN TIME
    # =========================================================

    if screen_time >= 8:
        tasks.append({
            "title": "Extended Screen Break",
            "description": "Step away from your phone, computer, and other screens for a longer break.",
            "type": "screen_time",
            "target": 30,
            "unit": "minutes",
            "suggested_time": "18:00"
        })

    elif screen_time >= 6:
        tasks.append({
            "title": "Screen-Time Break",
            "description": "Take a 20-minute break away from your phone and other screens.",
            "type": "screen_time",
            "target": 20,
            "unit": "minutes",
            "suggested_time": "18:00"
        })

    elif screen_time >= 4:
        tasks.append({
            "title": "Short Screen Break",
            "description": "Step away from your screen for a short break before returning to your activities.",
            "type": "screen_time",
            "target": 10,
            "unit": "minutes",
            "suggested_time": "17:30"
        })

    # =========================================================
    # PHONE UNLOCKS
    # =========================================================

    if unlocks >= 150:
        tasks.append({
            "title": "Phone-Free Focus",
            "description": "Put your phone aside and spend some time on one activity without unnecessary interruptions.",
            "type": "screen_time",
            "target": 30,
            "unit": "minutes",
            "suggested_time": "15:00"
        })

    elif unlocks >= 100:
        tasks.append({
            "title": "Notification Break",
            "description": "Silence unnecessary notifications and spend some time away from your phone.",
            "type": "screen_time",
            "target": 20,
            "unit": "minutes",
            "suggested_time": "15:00"
        })

    # =========================================================
    # SLEEP
    # =========================================================

    if sleep < 5:
        tasks.append({
            "title": "Early Wind-Down",
            "description": "Start winding down earlier and keep unnecessary screens away while preparing for sleep.",
            "type": "sleep",
            "target": 45,
            "unit": "minutes",
            "suggested_time": "21:30"
        })

    elif sleep < 7:
        tasks.append({
            "title": "Sleep Wind-Down",
            "description": "Begin a calm screen-free wind-down routine before bedtime.",
            "type": "sleep",
            "target": 30,
            "unit": "minutes",
            "suggested_time": "22:00"
        })

    elif sleep < 8:
        tasks.append({
            "title": "Bedtime Wind-Down",
            "description": "Take some quiet time away from screens before going to bed.",
            "type": "sleep",
            "target": 20,
            "unit": "minutes",
            "suggested_time": "22:30"
        })

    # =========================================================
    # STRESS
    # =========================================================

    if stress in ("very high", "very_high"):
        tasks.append({
            "title": "Mindful Breathing",
            "description": "Spend some quiet time practicing slow, comfortable breathing.",
            "type": "stress",
            "target": 15,
            "unit": "minutes",
            "suggested_time": "19:00"
        })

        tasks.append({
            "title": "Quiet Reset",
            "description": "Take a short quiet break away from screens and other distractions.",
            "type": "stress",
            "target": 10,
            "unit": "minutes",
            "suggested_time": "14:00"
        })

        tasks.append({
            "title": "Talk With Someone",
            "description": "Spend some time talking with someone you trust about how your day is going.",
            "type": "social",
            "target": 15,
            "unit": "minutes",
            "suggested_time": "20:00"
        })

    elif stress == "high":
        tasks.append({
            "title": "Mindful Breathing",
            "description": "Spend some quiet time practicing slow, comfortable breathing.",
            "type": "stress",
            "target": 15,
            "unit": "minutes",
            "suggested_time": "19:00"
        })

        tasks.append({
            "title": "Quiet Break",
            "description": "Take a short break in a comfortable place without unnecessary screen distractions.",
            "type": "stress",
            "target": 10,
            "unit": "minutes",
            "suggested_time": "14:00"
        })

    elif stress == "medium":
        tasks.append({
            "title": "Breathing Break",
            "description": "Take a few minutes to slow down and practice comfortable breathing.",
            "type": "stress",
            "target": 10,
            "unit": "minutes",
            "suggested_time": "19:00"
        })

    # Low stress does not require a stress-specific task.

    # =========================================================
    # STUDY BALANCE
    # =========================================================

    if study < 1:
        tasks.append({
            "title": "Focused Study",
            "description": "Complete one short study session with unnecessary phone interruptions minimized.",
            "type": "study",
            "target": 25,
            "unit": "minutes",
            "suggested_time": "16:00"
        })

    elif study < 2:
        tasks.append({
            "title": "Focused Study",
            "description": "Complete one focused study session with unnecessary phone interruptions minimized.",
            "type": "study",
            "target": 30,
            "unit": "minutes",
            "suggested_time": "16:00"
        })

    elif study >= 6:
        tasks.append({
            "title": "Study Recovery Break",
            "description": "Take a proper break away from your study materials before continuing your work.",
            "type": "study",
            "target": 20,
            "unit": "minutes",
            "suggested_time": "17:00"
        })

    # =========================================================
    # SOCIAL CONNECTION
    # =========================================================

    tasks.append({
        "title": "Connect With Someone",
        "description": "Spend 10–15 minutes talking with a parent, friend, or someone you trust.",
        "type": "social",
        "target": 15,
        "unit": "minutes",
        "suggested_time": "20:00"
    })

    # =========================================================
    # HYDRATION
    # =========================================================

    tasks.append({
        "title": "Hydration Check",
        "description": "Take a moment to drink some water and maintain regular hydration throughout the day.",
        "type": "hydration",
        "target": 1,
        "unit": "glass",
        "suggested_time": "12:00"
    })

    # =========================================================
    # FINAL SAFETY NET
    # =========================================================

    if not tasks:
        tasks.append({
            "title": "Take a Short Break",
            "description": "Take a few minutes away from your usual routine to relax and reset.",
            "type": "simple",
            "target": 10,
            "unit": "minutes",
            "suggested_time": "15:00"
        })

    return tasks
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

@app.get("/tasks")
def get_tasks(current_user=Depends(get_current_user)):
    # Get the user's latest prediction
    latest_prediction = predictions_collection.find_one(
        {"user_id": current_user["_id"]},
        sort=[("created_at", -1)]
    )

    if not latest_prediction:
        raise HTTPException(
            status_code=404,
            detail="No prediction found. Complete a prediction first."
        )

    # Generate the personalized task plan from the latest prediction
    generated_tasks = generate_tasks(latest_prediction)

    # Get tasks that already exist for this prediction
    existing_tasks = list(
        tasks_collection.find({
            "user_id": current_user["_id"],
            "prediction_id": latest_prediction["_id"]
        })
    )

    # Create a lookup of existing tasks by type
    existing_by_type = {
        task["type"]: task
        for task in existing_tasks
    }

    now = datetime.utcnow()

    # Add any missing generated tasks
    for generated_task in generated_tasks:
        task_type = generated_task["type"]

        if task_type in existing_by_type:
            continue

        task_document = {
            "user_id": current_user["_id"],
            "prediction_id": latest_prediction["_id"],
            "title": generated_task["title"],
            "qr_token": secrets.token_urlsafe(32),
            "description": generated_task["description"],
            "type": task_type,
            "activity_type": ACTIVITY_TYPES.get(
                task_type,
                "simple"
            ),
            "target": generated_task["target"],
            "unit": generated_task["unit"],
            "suggested_time": generated_task["suggested_time"],
            "status": "pending",
            "created_at": now,
            "scheduled_at": None,
            "completed_at": None,
        }

        result = tasks_collection.insert_one(task_document)

        task_document["_id"] = result.inserted_id
        existing_by_type[task_type] = task_document

    # Return all tasks belonging to the latest prediction
    saved_tasks = []

    for task in existing_by_type.values():
        saved_tasks.append({
            "id": str(task["_id"]),
            "prediction_id": str(task["prediction_id"]),
            "title": task["title"],
            "description": task["description"],
            "type": task["type"],
            "activity_type": task.get("activity_type"),
            "target": task["target"],
            "unit": task.get("unit"),
            "suggested_time": task.get("suggested_time"),
            "status": task["status"],
            "created_at": task["created_at"],
            "scheduled_at": task.get("scheduled_at"),
            "completed_at": task.get("completed_at"),
            "qr_url": f"/task/qr/{task['qr_token']}"
        })

    return {
        "tasks": saved_tasks
    }
@app.get("/plan")
def get_plan(current_user=Depends(get_current_user)):
    latest_prediction = predictions_collection.find_one(
        {"user_id": current_user["_id"]},
        sort=[("created_at", -1)]
    )

    if not latest_prediction:
        raise HTTPException(
            status_code=404,
            detail="No prediction found. Complete a prediction first."
        )

    tasks = list(
        tasks_collection.find({
            "user_id": current_user["_id"],
            "prediction_id": latest_prediction["_id"]
        })
    )

    if not tasks:
        raise HTTPException(
            status_code=404,
            detail="No tasks found for the latest prediction."
        )

    plan_token = latest_prediction.get("plan_token")

    if not plan_token:
        plan_token = secrets.token_urlsafe(32)

        predictions_collection.update_one(
            {"_id": latest_prediction["_id"]},
            {"$set": {"plan_token": plan_token}}
        )

    return {
        "plan_token": plan_token,
        "tasks": [
            {
                "id": str(task["_id"]),
                "title": task["title"],
                "description": task["description"],
                "activity_type": task.get("activity_type"),
                "target": task["target"],
                "unit": task.get("unit"),
                "suggested_time": task.get("suggested_time"),
                "status": task["status"],
                "scheduled_at": task.get("scheduled_at"),
            }
            for task in tasks
        ]
    }
@app.get("/plan/qr/{plan_token}")
def get_plan_by_qr(plan_token: str):
    prediction = predictions_collection.find_one({
        "plan_token": plan_token
    })

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Plan not found."
        )

    tasks = list(
        tasks_collection.find({
            "user_id": prediction["user_id"],
            "prediction_id": prediction["_id"]
        })
    )

    return {
        "tasks": [
            {
                "id": str(task["_id"]),
                "title": task["title"],
                "description": task["description"],
                "activity_type": task.get("activity_type"),
                "target": task["target"],
                "unit": task.get("unit"),
                "suggested_time": task.get("suggested_time"),
                "status": task["status"],
                "scheduled_at": task.get("scheduled_at"),
            }
            for task in tasks
        ]
    }
@app.get("/plan/qr/{plan_token}/task/{task_id}")
def get_plan_task_by_qr(plan_token: str, task_id: str):
    prediction = predictions_collection.find_one({
        "plan_token": plan_token
    })

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Plan not found."
        )

    try:
        task_object_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid task ID."
        )

    task = tasks_collection.find_one({
        "_id": task_object_id,
        "user_id": prediction["user_id"],
        "prediction_id": prediction["_id"]
    })

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found in this plan."
        )

    return {
        "task_id": str(task["_id"]),
        "prediction_id": str(task["prediction_id"]),
        "title": task["title"],
        "description": task["description"],
        "activity_type": task.get("activity_type"),
        "target": task["target"],
        "unit": task.get("unit"),
        "suggested_time": task.get("suggested_time"),
        "scheduled_at": task.get("scheduled_at"),
        "status": task["status"],
    }
@app.post("/plan/qr/{plan_token}/task/{task_id}/complete")
def complete_plan_task_by_qr(
    plan_token: str,
    task_id: str
):
    prediction = predictions_collection.find_one({
        "plan_token": plan_token
    })

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Plan not found."
        )

    try:
        task_object_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid task ID."
        )

    task = tasks_collection.find_one({
        "_id": task_object_id,
        "user_id": prediction["user_id"],
        "prediction_id": prediction["_id"]
    })

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found in this plan."
        )

    if task["status"] == "completed":
        return {
            "message": "Task already completed.",
            "task_id": task_id,
            "status": "completed"
        }

    from datetime import datetime, timezone

    completed_at = datetime.now(timezone.utc)

    tasks_collection.update_one(
        {"_id": task_object_id},
        {
            "$set": {
                "status": "completed",
                "completed_at": completed_at
            }
        }
    )

    return {
        "message": "Task completed successfully.",
        "task_id": task_id,
        "status": "completed",
        "completed_at": completed_at
    }
@app.post("/tasks/{task_id}/schedule")
def schedule_task(
    task_id: str,
    schedule: TaskSchedule,
    current_user=Depends(get_current_user)
):
    # Validate MongoDB task ID
    try:
        task_object_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid task ID."
        )

    # Find the task and make sure it belongs to the logged-in user
    task = tasks_collection.find_one({
        "_id": task_object_id,
        "user_id": current_user["_id"]
    })

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found."
        )

    # Don't allow scheduling a completed task
    if task.get("status") == "completed":
        raise HTTPException(
            status_code=400,
            detail="Completed tasks cannot be scheduled."
        )

    # Save the selected schedule
    tasks_collection.update_one(
        {
            "_id": task_object_id,
            "user_id": current_user["_id"]
        },
        {
            "$set": {
                "scheduled_at": schedule.scheduled_at
            }
        }
    )

    return {
        "message": "Task scheduled successfully.",
        "task_id": task_id,
        "scheduled_at": schedule.scheduled_at
    }
    
@app.post("/tasks/migrate-activities")
def migrate_task_activities(
    current_user=Depends(get_current_user)
):
    activity_map = {
        "physical_activity": "movement",
        "screen_time": "screen_break",
        "sleep": "wind_down",
        "stress": "breathing",
        "study": "focus",
        "social": "social",
        "hydration": "hydration",
    }

    tasks = tasks_collection.find({
        "user_id": current_user["_id"]
    })

    updated_count = 0

    for task in tasks:
        task_type = task.get("type")

        if task_type in activity_map:
            tasks_collection.update_one(
                {
                    "_id": task["_id"],
                    "user_id": current_user["_id"]
                },
                {
                    "$set": {
                        "activity_type": activity_map[task_type]
                    }
                }
            )

            updated_count += 1

    return {
        "message": "Task activity types updated successfully.",
        "updated_count": updated_count
    }
@app.get("/task/qr/{qr_token}")
def get_task_by_qr(qr_token: str):
    task = tasks_collection.find_one({
        "qr_token": qr_token
    })

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found."
        )

    return {
        "task_id": str(task["_id"]),
        "title": task["title"],
        "description": task["description"],
        "activity_type": task.get("activity_type"),
        "target": task["target"],
        "unit": task.get("unit"),
        "suggested_time": task.get("suggested_time"),
        "status": task["status"]
    }
@app.get("/tasks/{task_id}/activity")
def get_task_activity(
    task_id: str,
    current_user=Depends(get_current_user)
):
    try:
        task_object_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid task ID."
        )

    task = tasks_collection.find_one({
        "_id": task_object_id,
        "user_id": current_user["_id"]
    })

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found."
        )

    activity_type = task.get("activity_type")

    if not activity_type:
        raise HTTPException(
            status_code=400,
            detail="Activity type is not configured for this task."
        )

    return {
        "task_id": str(task["_id"]),
        "title": task["title"],
        "description": task["description"],
        "activity_type": activity_type,
        "instructions": ACTIVITY_INSTRUCTIONS.get(
    activity_type,
    []
),
        "target": task["target"],
        "unit": task.get("unit"),
        "suggested_time": task.get("suggested_time"),
        "scheduled_at": task.get("scheduled_at"),
        "status": task["status"]
    }
@app.post("/tasks/{task_id}/complete")
def complete_task(
    task_id: str,
    current_user=Depends(get_current_user)
):
    try:
        task_object_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid task ID."
        )

    # Find the task AND make sure it belongs to the logged-in user
    task = tasks_collection.find_one({
        "_id": task_object_id,
        "user_id": current_user["_id"]
    })

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found."
        )

    if task.get("status") == "completed":
        return {
            "message": "Task already completed.",
            "task_id": task_id,
            "status": "completed",
            "completed_at": task.get("completed_at")
        }

    completed_at = datetime.utcnow()

    tasks_collection.update_one(
        {
            "_id": task_object_id,
            "user_id": current_user["_id"]
        },
        {
            "$set": {
                "status": "completed",
                "completed_at": completed_at
            }
        }
    )

    return {
        "message": "Task completed successfully.",
        "task_id": task_id,
        "status": "completed",
        "completed_at": completed_at
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