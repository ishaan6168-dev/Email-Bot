# 💌 Mail-chan — AI Email Replier

> An anime-styled AI email assistant that drafts smart replies to your Gmail inbox using Groq (Llama 3). Features a cute animated chibi character, visual novel intro, and a clean dark UI.

![Mail-chan](https://img.shields.io/badge/powered%20by-Groq%20%7C%20Llama%203-2ECFBF?style=flat-square)
![Stack](https://img.shields.io/badge/stack-FastAPI%20%2B%20React-FF6B9D?style=flat-square)
![Deploy](https://img.shields.io/badge/deploy-Render.com-FFD166?style=flat-square)

---

## ✨ Features

- 🎌 Animated CSS chibi Mail-chan character with loading screen + visual novel intro
- 📬 Fetches unread emails from your Gmail inbox via OAuth
- ⚡ AI-drafted replies powered by Groq (Llama 3.3 70B)
- ✏️ Edit, regenerate, or discard drafts before sending
- 📦 Bulk draft multiple emails at once
- ✅ One-click send with thread-aware replies
- 🔐 Secure Google OAuth2 login — no passwords stored

---

## 🗂 Project Structure

```
mail-chan/
├── backend/
│   ├── app.py               # FastAPI server + all routes
│   ├── gmail_auth.py        # Google OAuth2 flow
│   ├── email_fetcher.py     # Fetch & parse Gmail messages
│   ├── email_drafter.py     # Groq AI reply generation
│   ├── email_sender.py      # Send replies via Gmail API
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Full React app + Mail-chan character
│   │   └── main.jsx         # React entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🛠 Prerequisites

Before you start, make sure you have:

- **Python 3.10+** installed
- **Node.js 18+** installed
- A **Google account** (Gmail)
- A **Groq API key** — free at [console.groq.com](https://console.groq.com)
- A **GitHub account**
- A **Render.com account** (free)

---

## 📦 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/mail-chan.git
cd mail-chan
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=any-long-random-string
REDIRECT_URI=http://localhost:8000/api/auth/callback
FRONTEND_URL=http://localhost:5173
```

### 3. Set up Google OAuth credentials (local)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Go to **APIs & Services → OAuth consent screen**
   - Set to **External**
   - Fill in app name, support email, developer email
   - Add your Gmail under **Test users**
4. Go to **APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth client ID**
   - Application type: **Desktop app** (for local development)
   - Download the JSON and save it as `backend/credentials.json`
5. Go to **APIs & Services → Library**, search for **Gmail API** and enable it

### 4. Set up the frontend

```bash
cd ../frontend
npm install
```

### 5. Run locally

In one terminal, start the backend:

```bash
cd backend
uvicorn app:app --reload --port 8000
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — Mail-chan will greet you!

---

## 🚀 Deploy to Render (Free)

### Step 1: Push to GitHub

In your project root:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mail-chan.git
git push -u origin main
```

> ⚠️ Make sure your `.gitignore` includes:
> ```
> __pycache__/
> *.pyc
> .env
> _env
> token.json
> credentials.json
> node_modules/
> frontend/dist/
> ```

### Step 2: Create a Web app OAuth client for production

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Click **+ CREATE CREDENTIALS → OAuth client ID**
3. Application type: **Web application**
4. Under **Authorized redirect URIs**, add:
   ```
   https://your-app-name.onrender.com/api/auth/callback
   ```
5. Click **Create** and note down the **Client ID** and **Client Secret**

### Step 3: Deploy on Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New → Web Service**
3. Select your `mail-chan` repository
4. Fill in the settings:

| Field | Value |
|-------|-------|
| **Runtime** | Python |
| **Build Command** | `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT` |

5. Click **Create Web Service**

### Step 4: Get your Render URL

Once deployed, go to **Settings → Networking → Generate Domain**. Your URL will look like:
```
https://mail-chan.onrender.com
```

### Step 5: Set environment variables on Render

Go to your service → **Environment** tab and add:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | Your Groq API key |
| `SECRET_KEY` | Any long random string |
| `FRONTEND_URL` | `https://your-app-name.onrender.com` |
| `REDIRECT_URI` | `https://your-app-name.onrender.com/api/auth/callback` |
| `GOOGLE_CREDENTIALS_JSON` | *(paste full JSON — see below)* |

For `GOOGLE_CREDENTIALS_JSON`, paste the entire contents of your credentials JSON as one line:
```json
{"web":{"client_id":"YOUR_CLIENT_ID","project_id":"YOUR_PROJECT","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"YOUR_CLIENT_SECRET","redirect_uris":["https://your-app-name.onrender.com/api/auth/callback"]}}
```

### Step 6: Update `gmail_auth.py` to read from env var

Make sure your `gmail_auth.py` loads credentials like this (not from a file):

```python
def get_client_config():
    creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if creds_json:
        return json.loads(creds_json)
    with open("credentials.json", "r") as f:
        return json.load(f)
```

### Step 7: Redeploy

Click **Manual Deploy → Deploy latest commit** on Render.

---

## 🔑 Getting a Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Go to **API Keys → Create API Key**
4. Copy the key and add it as `GROQ_API_KEY` in your environment

---

## 🧩 How It Works

```
User opens app
    → LoadingScreen (Mail-chan animation, 3s)
    → IntroScreen (visual novel dialogue)
    → "Connect Gmail Account" → Google OAuth
    → Redirected back to app (authenticated)
    → Gmail inbox loads automatically
    → Select email → click ⚡ draft
    → Groq (Llama 3) generates reply
    → Edit if needed → click → send reply
    → Gmail API sends email in same thread
```

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| `Could not import module "app"` | Update start command to `cd backend && uvicorn app:app ...` |
| `FileNotFoundError: credentials.json` | Add `GOOGLE_CREDENTIALS_JSON` as an env var on Render |
| `Error 400: redirect_uri_mismatch` | Make sure `REDIRECT_URI` env var matches exactly what's in Google Cloud Console |
| `Internal Server Error` on `/api/auth/login` | Check Render logs — usually missing env var or credentials |
| White screen after login | `FRONTEND_URL` is wrong — set it to your Render domain |
| Raw HTML showing in email body | Update `email_fetcher.py` to use the HTML stripper version |

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | Your Groq API key for Llama 3 |
| `SECRET_KEY` | ✅ | Random string for session encryption |
| `FRONTEND_URL` | ✅ | Full URL of your frontend (e.g. `https://mail-chan.onrender.com`) |
| `REDIRECT_URI` | ✅ | OAuth callback URL (e.g. `https://mail-chan.onrender.com/api/auth/callback`) |
| `GOOGLE_CREDENTIALS_JSON` | ✅ (production) | Full Google OAuth credentials JSON as a string |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Pure CSS (inline, no Tailwind) |
| Backend | FastAPI + Uvicorn |
| AI | Groq API — Llama 3.3 70B |
| Auth | Google OAuth2 via `google-auth-oauthlib` |
| Email | Gmail API v1 |
| Hosting | Render.com (free tier) |

---

## 📄 License

MIT — do whatever you want with it. If you build something cool, a ⭐ on the repo is always appreciated!

---

<p align="center">Made with 💌 by Mail-chan</p>
