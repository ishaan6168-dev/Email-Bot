import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
]

TOKEN_FILE = 'token.json'
CREDENTIALS_FILE = 'credentials.json'


def authenticate_gmail():
    creds = None

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        print("[AUTH] Loaded existing credentials.")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("[AUTH] Refreshing expired credentials...")
            creds.refresh(Request())
        else:
            print("[AUTH] Opening browser for Gmail login...")
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
            print("[AUTH] Authentication successful!")

        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
            print("[AUTH] Credentials saved to token.json")

    service = build('gmail', 'v1', credentials=creds)
    print("[AUTH] Gmail service ready!")
    return service


if __name__ == "__main__":
    service = authenticate_gmail()
    profile = service.users().getProfile(userId='me').execute()
    print(f"\n✅ Connected as: {profile['emailAddress']}")
    print(f"   Total messages: {profile['messagesTotal']}")
