import os
import uuid
import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from gmail_auth import get_auth_url, exchange_code_for_token, get_gmail_service
from email_fetcher import get_unread_emails
from email_drafter import draft_reply
from email_sender import send_reply

load_dotenv()

app = FastAPI(title="AI Email Replier")

# Session middleware for storing OAuth tokens
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "change-this-secret"))

# CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Models ─────────────────────────────────────────────────────────────

class DraftRequest(BaseModel):
    email_id: str = ""
    subject: str = ""
    sender_raw: str = ""
    sender: str = ""
    sender_name: str = ""
    thread_id: str = ""
    body: str = ""
    snippet: str = ""
    message_id_header: str = ""
    to: str = ""
    date: str = ""
    instructions: str = ""
    user_name: str = ""

class SendRequest(BaseModel):
    reply_body: str
    original_email: dict
    dry_run: bool = True


# ── Auth Routes ────────────────────────────────────────────────────────────────

@app.get("/api/auth/login")
async def login(request: Request):
    """Redirects user to Google OAuth consent screen."""
    auth_url, state = get_auth_url()
    request.session["oauth_state"] = state
    return RedirectResponse(auth_url)


@app.get("/api/auth/callback")
async def auth_callback(request: Request, code: str, state: str):
    """Handles OAuth callback, stores token in session."""
    saved_state = request.session.get("oauth_state")
    if state != saved_state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    token_data = exchange_code_for_token(code)
    request.session["token"] = token_data
    request.session["authenticated"] = True

    # Redirect to frontend
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(url=FRONTEND_URL)



@app.get("/api/auth/status")
async def auth_status(request: Request):
    """Returns whether the user is authenticated."""
    authenticated = request.session.get("authenticated", False)
    if authenticated:
        try:
            service = get_gmail_service(request.session["token"])
            profile = service.users().getProfile(userId="me").execute()
            return {"authenticated": True, "email": profile["emailAddress"]}
        except Exception:
            request.session.clear()
            return {"authenticated": False}
    return {"authenticated": False}


@app.get("/api/auth/logout")
async def logout(request: Request):
    """Clears session."""
    request.session.clear()
    return {"message": "Logged out"}


# ── Email Routes ───────────────────────────────────────────────────────────────

@app.get("/api/emails")
async def fetch_emails(request: Request, max_results: int = 20):
    """Fetches unread emails from Gmail inbox."""
    if not request.session.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        service = get_gmail_service(request.session["token"])
        emails = get_unread_emails(service, max_results=max_results)
        return {"emails": emails, "count": len(emails)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/draft")
async def draft_email_reply(request: Request, body: DraftRequest):
    """Drafts an AI reply for a given email using Groq."""
    if not request.session.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")

    email_data = body.dict()
    reply = draft_reply(
        email_data=email_data,
        custom_instructions=body.instructions,
        user_name=body.user_name
    )

    if not reply:
        raise HTTPException(status_code=500, detail="Failed to generate reply")

    return {"reply": reply}


@app.post("/api/send")
async def send_email_reply(request: Request, body: SendRequest):
    if not request.session.get("authenticated"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        service = get_gmail_service(request.session["token"])
        profile = service.users().getProfile(userId="me").execute()
        user_email = profile["emailAddress"]

        result = send_reply(
            service=service,
            original_email=body.original_email,
            reply_body=body.reply_body,
            sender_email=user_email,
            dry_run=body.dry_run
        )

        # Return success as long as result is not None
        if result is not None:
            return {"success": True, "message_id": result.get("id", "sent")}
        else:
            raise HTTPException(status_code=500, detail="Failed to send reply")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Send route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Serve React Frontend ───────────────────────────────────────────────────────
# This serves the built React app in production
import os
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
