# MindPulse — Student Mental Health Predictor

MindPulse predicts a student's mental health score (0–10) from their social
media habits, lifestyle, and stress levels, using a Random Forest model
trained on real student survey data.

## Project structure

```
MindPulse/
├── backend/          FastAPI service that loads the trained model and serves predictions
│   ├── main.py                     API entry point (/predict)
│   ├── database.py                 Optional MySQL persistence layer
│   ├── Mental_Health_Model.pkl     Trained Random Forest pipeline
│   ├── model_training_notebook.ipynb  Notebook used to train the model
│   ├── training_data.csv           Source dataset
│   └── requirements.txt
└── frontend/         React + Vite + TypeScript single-page app
    ├── src/
    │   ├── components/             Header, Hero, PredictionForm, ResultCard, HistorySection, AboutSection
    │   ├── prediction.ts            Calls the backend API and shapes the UI data
    │   ├── supabase.ts              Optional prediction-history storage
    │   └── types.ts
    └── package.json
```

## Running it locally

### 1. Backend (API + model)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # only needed if you want MySQL history storage
python main.py                 # serves http://127.0.0.1:8000
```

The `/predict` endpoint validates the request body and returns
`{ "predicted_mental_health_score": <float> }`. Database persistence is
optional — if `MYSQL_*` isn't configured, predictions simply aren't saved
server-side (no impact on the prediction itself).

### 2. Frontend (UI)

```bash
cd frontend
npm install
npm run dev                    # serves http://localhost:5173
```

By default the frontend calls the API at `http://127.0.0.1:8000/predict`.
To point it elsewhere, set `VITE_API_URL` in `frontend/.env`.

Prediction history in the UI is stored via Supabase (`VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` in `frontend/.env`). This is independent of the
backend's optional MySQL storage — you can use either, both, or neither.

## Deploying

### Frontend → Vercel

1. Push the repo (or just the `frontend/` folder) to GitHub and import it in Vercel,
   or run `vercel` from inside `frontend/` with the Vercel CLI.
2. Vercel auto-detects Vite (a `vercel.json` is included to pin the build/output
   settings and handle SPA routing).
3. In the Vercel project's **Settings → Environment Variables**, add:
   - `VITE_API_URL` — your deployed backend's `/predict` URL (see below)
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — if you want prediction history
4. Deploy. Vercel only serves static files, so the FastAPI backend has to be
   hosted separately (Vercel's serverless functions aren't a good fit for a
   ~25MB scikit-learn model — see below).

### Backend → Render or Railway

The backend is a normal long-running FastAPI/uvicorn process, which Vercel
doesn't support well. Render and Railway both work out of the box:

**Render**
1. New → Blueprint, point it at this repo — `backend/render.yaml` is picked
   up automatically (root dir `backend/`, build `pip install -r requirements.txt`,
   start `uvicorn main:app --host 0.0.0.0 --port $PORT`).
2. Fill in the `MYSQL_*` env vars if you want history persistence, or leave
   them blank — the API works fine without a database.
3. Set `ALLOWED_ORIGINS` to your Vercel domain (e.g.
   `https://mindpulse.vercel.app`) instead of `*` once you know it.

**Railway**
1. New Project → Deploy from GitHub, set the root directory to `backend/`.
2. Railway reads the included `Procfile` automatically
   (`web: uvicorn main:app --host 0.0.0.0 --port $PORT`).
3. Add the same env vars as above under the service's Variables tab.

Once the backend is live, copy its public URL + `/predict` into Vercel's
`VITE_API_URL` and redeploy the frontend.

## Model

A Random Forest regression pipeline trained on the `training_data.csv`
dataset (age, gender, country, academic level, platform, purpose of use,
usage hours, unlocks, study hours, activity hours, sleep hours, and stress
level). See `backend/model_training_notebook.ipynb` for the training
process. Reported accuracy: R² = 0.87.

This tool is for educational purposes only and is not a substitute for
professional mental health advice.
