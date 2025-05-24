# CV Reader AI

AI-powered web app to extract information from uploaded CV PDF files.

## Features

- Upload a CV (PDF)
- Extracts Name, Email, Phone, Organizations, Locations, Dates, Skills, and more

## Tech Stack

- **Frontend:** React
- **Backend:** FastAPI (Python), spaCy, Transformers, pdfplumber
- **Deployment:** Vercel

## Local Development

### Backend

```sh
pip install -r requirements.txt
uvicorn api.index:app --reload
```

### Frontend

```sh
cd frontend
npm install
npm start
```

- React app runs at http://localhost:3000 (proxy `/api` to http://localhost:8000 if needed)

## Deployment

1. Push to GitHub
2. Connect GitHub repo to [Vercel](https://vercel.com/)
3. Vercel auto-detects both frontend and backend

---

**Edit `api/extract_cv.py` to customize extraction logic.**