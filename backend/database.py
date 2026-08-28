import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

load_dotenv()


def get_env(key, default=""):
    """Read a config value from the environment (.env file or shell)."""
    return os.getenv(key, default)


DB_CONFIG = {
    "host": get_env("MYSQL_HOST", "localhost"),
    "port": int(get_env("MYSQL_PORT", "3306")),
    "user": get_env("MYSQL_USER", "root"),
    "password": get_env("MYSQL_PASSWORD", ""),
    "database": get_env("MYSQL_DATABASE", "mental_health_db"),
}

# Aiven cloud MySQL requires SSL
MYSQL_SSL = get_env("MYSQL_SSL", "false").lower() == "true"
if MYSQL_SSL:
    DB_CONFIG["ssl_disabled"] = False
else:
    DB_CONFIG["ssl_disabled"] = True


def get_connection():
    """Create and return a MySQL connection."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"❌ MySQL Connection Error: {e}")
        return None


def check_connection():
    """Check if MySQL connection is working."""
    conn = get_connection()
    if conn and conn.is_connected():
        conn.close()
        return True
    return False


def save_prediction(data: dict, predicted_score: float):
    """Save a prediction record to the database."""
    conn = get_connection()
    if conn is None:
        return False

    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO predictions
            (age, gender, country, academic_level, most_used_platform,
             purpose_of_use, avg_daily_usage_hours, daily_unlocks,
             study_hours, physical_activity_hours, sleep_hours_per_night,
             stress_level, predicted_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data["age"],
            data["gender"],
            data["country"],
            data["academic_level"],
            data["most_used_platform"],
            data["purpose_of_use"],
            data["avg_daily_usage_hours"],
            data["daily_unlocks"],
            data["study_hours"],
            data["physical_activity_hours"],
            data["sleep_hours_per_night"],
            data["stress_level"],
            predicted_score,
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Error as e:
        print(f"❌ Save Error: {e}")
        return False


def get_all_predictions():
    """Fetch all prediction records from the database."""
    conn = get_connection()
    if conn is None:
        return []

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM predictions ORDER BY created_at DESC"
        )
        records = cursor.fetchall()
        cursor.close()
        conn.close()
        return records
    except Error as e:
        print(f"❌ Fetch Error: {e}")
        return []
