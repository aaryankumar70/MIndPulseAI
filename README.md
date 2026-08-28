### MindPulse

A small web app that estimates a student's mental health score (0–10) based on their social media usage, sleep, stress, and study habits. Built as a way to combine a machine learning model with a proper frontend instead of just leaving it as a notebook.

Trained on the Student Social Media and Mental Health Impact dataset, using a Random Forest pipeline that scores around R² = 0.87 on the held-out test set.

### Why I built this

I trained the model first (see backend/model_training_notebook.ipynb) and originally wrapped it in a Streamlit app so I could actually test it. It worked, but Streamlit UIs only get you so far in terms of design, so I rebuilt the frontend in React and kept the FastAPI + model as a separate service behind it. This repo is that setup — a real backend serving real predictions, not a mockup.

### What it does

You fill out a short form — age, average daily screen time, how many times you unlock your phone, sleep hours, stress level, study hours, that kind of thing — and it returns a predicted mental health score along with a short breakdown of what's likely dragging the score down or helping it, plus a few suggestions. There's also a history tab if you want to track predictions over time (stored via Supabase).

To be clear, this is not a diagnostic tool. It's a model trained on survey data, not a clinician. Treat it as a rough, educational estimate.

### Stack
Backend: Python, FastAPI, scikit-learn, pandas, joblib
Frontend: React, TypeScript, Vite, Tailwind
Storage: MySQL (optional, backend-side logging) + Supabase (frontend history)
### Project layout
```
 MindPulse/
 ├── backend/
 │   ├── main.py                        FastAPI app, /predict endpoint
 │   ├── database.py                    optional MySQL logging
 │   ├── Mental_Health_Model.pkl        trained model
 │   ├── model_training_notebook.ipynb  training / EDA
 │   ├── training_data.csv
 │   └── requirements.txt
 └── frontend/
     ├── src/
     │   ├── components/                Header, Hero, PredictionForm, ResultCard, HistorySection, AboutSection
     │   ├── prediction.ts              calls the API, formats results for the UI
     │   ├── supabase.ts
     │   └── types.ts
     └── package.json
```


### Running it locally

You need both halves running — the frontend just calls the backend for predictions, it doesn't do anything on its own.

### Backend

bash
cd backend
python -m venv .venv
source .venv/bin/activate      # .venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py

Runs on http://127.0.0.1:8000. MySQL logging is optional — copy .env.example to .env and fill in MYSQL_* if you want it, otherwise predictions just won't be saved server-side and everything else still works.

### Frontend

bash
cd frontend
npm install
npm run dev

Runs on http://localhost:5173 and talks to the backend at http://127.0.0.1:8000/predict by default. If you want prediction history, add your own Supabase project's URL and anon key to frontend/.env (see .env.example).

### Deploying

The frontend is a static Vite build, so Vercel works fine for it — it auto-detects the framework, vercel.json handles the rest. Add VITE_API_URL (and the Supabase vars if you're using history) under the project's environment variables.

The backend is a different story — it's a real Python process with a ~25MB model loaded in memory, which doesn't fit well into Vercel's serverless functions. I've been running it on Render instead (render.yaml is included as a blueprint); Railway works too and will pick up the Procfile automatically. Either way, once it's deployed, point VITE_API_URL at <your-backend-url>/predict and set ALLOWED_ORIGINS on the backend to your actual frontend domain instead of leaving it wide open.

### Model details

Features going into the model: age, gender, country (grouped into top 10 + "Other"), academic level, most-used platform, purpose of use, daily usage hours, daily unlocks, study hours, physical activity hours, sleep hours, and stress level. Random Forest regression, R² ≈ 0.87 on the test split. Full training process is in the notebook if you want to see the feature engineering or try swapping in a different model.

### Known limitations

Dataset is self-reported survey data, so there's inherent noise/bias in it
No auth on the history feature right now — anyone with the Supabase anon key can read/write, fine for a personal project but not something I'd ship for real users
The model doesn't account for a lot of things that obviously matter (family situation, existing diagnoses, etc.) — it's working off a fairly narrow set of features
