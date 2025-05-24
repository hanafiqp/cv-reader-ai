markdown name=README.md
# CV Reader AI

An AI-powered web app to extract advanced information from uploaded CV PDFs.

## 🛠 Features
- Upload a CV (PDF)
- Extract name, contact, education, experience, skills, languages, certifications, and more
- Backend: Python (FastAPI, spaCy, Transformers)
- Frontend: React
- Deployable on Vercel (no server setup needed!)

## 🚀 Getting Started

### Backend

1. Install requirements:
   ```
   pip install -r requirements.txt
   ```

2. Run locally:
   ```
   uvicorn api.index:app --reload
   ```

### Frontend

1. Go to `frontend/`:
   ```
   cd frontend
   npm install
   npm start
   ```

### Deploy

- Push your repo to GitHub.
- Link your repo to [Vercel](https://vercel.com/).
- Vercel will auto-detect the API and Frontend.

## 🤖 Customize Extraction

Edit `api/extract_cv.py` to improve info extraction.

---

PRs and issues welcome!