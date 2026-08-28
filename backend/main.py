import joblib
import pandas as pd
import os
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware
from database import save_prediction, check_connection

MODEL_PATH = Path(__file__).resolve().parent / "Mental_Health_Model.pkl"
model = joblib.load(MODEL_PATH)
top_countries = ['Other','India','USA','Canada','Australia','UK','Germany','Mexico','Turkey','France']

app = FastAPI()

# Comma-separated list of allowed origins, e.g. "https://mindpulse.vercel.app,http://localhost:5173"
# Falls back to "*" (allow all) if not set, which is fine for local dev but should be
# tightened to your actual frontend URL(s) in production.
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
allow_origins = ["*"] if _allowed_origins.strip() == "*" else [
    origin.strip() for origin in _allowed_origins.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


#A first Pydantic Model, Validation of the data we send to the model
class StudentData(BaseModel):
    age                     : int = Field(..., ge=10, le=100)
    gender                  : Literal['Male', 'Female']
    country                 : str
    academic_level          : Literal['Undergraduate', 'Graduate', 'High School']
    most_used_platform      : Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat','Twitter','YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp','WeChat']
    purpose_of_use          : Literal['Networking', 'Education', 'Entertainment', 'News']
    avg_daily_usage_hours   : float = Field(..., ge=0, le=24)
    daily_unlocks           : int   = Field(..., ge=0)
    study_hours             : float = Field(..., ge=0, le=24)
    physical_activity_hours : float = Field(..., ge=0, le=24)
    sleep_hours_per_night   : float = Field(..., ge=0, le=24)
    stress_level            : Literal['Medium', 'Low', 'Very High', 'High']




# Describe what we send back
class PredictionResponse(BaseModel):
    predicted_mental_health_score:float
    #6.777777 -> float




@app.get('/')
def greet():
    return {'Welcome to the Mental Health Prediction '}


@app.get('/health')
def health():
    return {"status": "ok", "db_connected": check_connection()}


@app.post('/predict', response_model=PredictionResponse) #6.77777
def predict(data: StudentData):
   
   country_group = data.country if data.country in top_countries else "Other"

   input_row = pd.DataFrame([{
        'Age'                       :data.age,
        'Gender'                    :data.gender,
        'Country'                   :data.country,
        'Academic_Level'            :data.academic_level,
        'Most_Used_Platform'        :data.most_used_platform,
        'Purpose_Of_Use'            :data.purpose_of_use,
        'Avg_Daily_Usage_Hours'     :data.avg_daily_usage_hours,
        'Daily_Unlocks'             :data.daily_unlocks,
        'Study_Hours'               :data.study_hours,
        'Physical_Activity_Hours'   :data.physical_activity_hours,
        'Sleep_Hours_Per_Night'     :data.sleep_hours_per_night,
        'Stress_Level'              :data.stress_level,
        'Grouped_country'           :country_group
   }])

   prediction = model.predict(input_row)[0] #6.77
   score = round(float(prediction), 2)

   # Save to MySQL database
   try:
       save_data = {
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
       }
       save_prediction(save_data, score)
   except Exception:
       pass  # Don't fail prediction if DB save fails

   return PredictionResponse(predicted_mental_health_score=score)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)