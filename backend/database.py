import os

from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)


# ============================================================
# MONGODB CONFIGURATION
# ============================================================

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "mindpulse"
)

if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI is not configured"
    )


# ============================================================
# MONGODB CONNECTION
# ============================================================

client = MongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=5000,
)

db = client[MONGODB_DATABASE]


# ============================================================
# COLLECTIONS
# ============================================================

users_collection = db["users"]

predictions_collection = db["predictions"]

tasks_collection = db["tasks"]


# ============================================================
# DATABASE HEALTH CHECK
# ============================================================

def check_connection():
    try:
        client.admin.command("ping")
        return True

    except Exception:
        return False


# ============================================================
# MANUAL CONNECTION TEST
# ============================================================

if __name__ == "__main__":

    try:
        client.admin.command("ping")

        print("✅ MongoDB connection successful!")

        print(
            f"Database: {MONGODB_DATABASE}"
        )

    except Exception as e:

        print("❌ MongoDB connection failed!")

        print(e)