# ⚡ AI Email Replier — Web App

FastAPI + React + Groq (Llama 3) + Gmail API, deployed on Railway.

## Local Development

### 1. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

Create `.env` in the `backend/` folder:
```
GROQ_API_KEY=gsk_xxxx
SECRET_KEY=any-random-string
REDIRECT_URI=http://localhost:8000/api/auth/callback
```

Place your `credentials.json` inside `backend/`.

Start backend:
```bash
uvicorn app:app --reload --port 8000
```

### 2. Frontend setup (separate terminal)
```bash
cd frontend
npm install
npm run dev       # runs on http://localhost:5173
```

Visit http://localhost:5173 → click Connect Gmail → use the app.

### 3. Build frontend for production
```bash
cd frontend
npm run build     # outputs to backend/frontend/dist/
```

Then backend serves the React app at http://localhost:8000

---

## Deploy to Railway

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
gh repo create emailbot --public --push
```

### 2. Deploy on Railway
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repo
3. Add environment variables in Railway dashboard:
   - `GROQ_API_KEY`
   - `SECRET_KEY` (run `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `REDIRECT_URI` = `https://your-app.railway.app/api/auth/callback`
4. Upload `credentials.json` as a Railway file mount at `/app/backend/credentials.json`

### 3. Update Google OAuth redirect URI
In Google Cloud Console → Credentials → OAuth Client → add your Railway URL:
```
https://your-app.railway.app/api/auth/callback
```

---

## Project Structure
```
emailbot_web/
├── backend/
│   ├── app.py              # FastAPI routes
│   ├── gmail_auth.py       # OAuth2 web flow
│   ├── email_fetcher.py    # Fetch unread emails
│   ├── email_drafter.py    # Groq AI drafting
│   ├── email_sender.py     # Send via Gmail API
│   ├── requirements.txt
│   └── credentials.json    # (not in git)
├── frontend/
│   ├── src/App.jsx         # React UI
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── railway.toml
├── .env.example
└── .gitignore
```
