import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"

LABELS = ["Work", "Casual", "Advertisement", "Newsletter", "Finance", "Social", "Spam"]

# Cache keyed by USER EMAIL so different accounts never share label IDs
# Structure: { "user@gmail.com": { "work": "Label_123", ... } }
_label_id_cache = {}

# Gmail's official allowed color palette
LABEL_COLORS = {
    "Work":          {"backgroundColor": "#1c4587", "textColor": "#ffffff"},
    "Casual":        {"backgroundColor": "#16a766", "textColor": "#ffffff"},
    "Advertisement": {"backgroundColor": "#8e63ce", "textColor": "#ffffff"},
    "Newsletter":    {"backgroundColor": "#eaa041", "textColor": "#ffffff"},
    "Finance":       {"backgroundColor": "#cc3a21", "textColor": "#ffffff"},
    "Social":        {"backgroundColor": "#2da2bb", "textColor": "#ffffff"},
    "Spam":          {"backgroundColor": "#666666", "textColor": "#ffffff"},
}

SYSTEM_PROMPT = """You are an email classifier. Given an email's subject and body,
classify it into EXACTLY ONE of these categories:

- Work: professional emails, job-related, meetings, projects, clients, colleagues
- Casual: personal messages, friends, family, informal conversation
- Advertisement: promotional offers, deals, sales, marketing emails
- Newsletter: subscribed newsletters, digests, blog updates, announcements
- Finance: bank statements, invoices, receipts, payment confirmations, billing
- Social: social media notifications, LinkedIn, Twitter, Instagram alerts
- Spam: unwanted, suspicious, scam, or irrelevant emails

Reply with ONLY the category name — nothing else. No punctuation, no explanation."""


def classify_email(email_data: dict) -> str:
    """Returns one of the LABELS for the given email."""
    subject = email_data.get("subject", "")
    body = email_data.get("body", "")[:800]
    sender = email_data.get("sender_raw", "")

    prompt = f"""FROM: {sender}
SUBJECT: {subject}
BODY: {body}

Classify this email:"""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=10,
            temperature=0.1
        )
        result = response.choices[0].message.content.strip()
        for label in LABELS:
            if label.lower() in result.lower():
                return label
        return "Casual"
    except Exception as e:
        print(f"Classification error: {e}")
        return "Casual"


def get_user_email(service) -> str:
    """Get the authenticated user's email address."""
    try:
        profile = service.users().getProfile(userId="me").execute()
        return profile.get("emailAddress", "unknown")
    except Exception:
        return "unknown"


def get_or_create_label(service, label_name: str, user_email: str) -> str | None:
    """
    Gets existing Gmail label ID or creates it.
    Cache is keyed by user_email to prevent cross-account contamination.
    """
    # Per-user cache
    if user_email not in _label_id_cache:
        _label_id_cache[user_email] = {}

    user_cache = _label_id_cache[user_email]
    cache_key = label_name.lower()

    if cache_key in user_cache:
        return user_cache[cache_key]

    full_name = f"Mail-chan/{label_name}"

    try:
        # Fetch all existing labels for this user
        response = service.users().labels().list(userId="me").execute()
        existing_labels = response.get("labels", [])

        # Check if label already exists
        for lbl in existing_labels:
            if lbl.get("name", "").lower() == full_name.lower():
                user_cache[cache_key] = lbl["id"]
                print(f"[{user_email}] Found existing label: {full_name} → {lbl['id']}")
                return lbl["id"]

        # Create the label
        body = {
            "name": full_name,
            "labelListVisibility": "labelShow",
            "messageListVisibility": "show",
            "color": LABEL_COLORS[label_name]
        }

        print(f"[{user_email}] Creating label: {full_name}")
        created = service.users().labels().create(userId="me", body=body).execute()
        label_id = created["id"]
        user_cache[cache_key] = label_id
        print(f"[{user_email}] Created label: {full_name} → {label_id}")
        return label_id

    except Exception as e:
        print(f"[{user_email}] Label error for '{label_name}': {type(e).__name__}: {e}")
        # Fallback: try without color
        try:
            body = {
                "name": full_name,
                "labelListVisibility": "labelShow",
                "messageListVisibility": "show",
            }
            created = service.users().labels().create(userId="me", body=body).execute()
            label_id = created["id"]
            user_cache[cache_key] = label_id
            print(f"[{user_email}] Created label without color: {full_name} → {label_id}")
            return label_id
        except Exception as e2:
            print(f"[{user_email}] Label creation totally failed for '{label_name}': {e2}")
            return None


def apply_label_and_archive(service, message_id: str, label_id: str, user_email: str) -> bool:
    """
    Applies a Mail-chan label AND removes from inbox (archives it).
    """
    try:
        service.users().messages().modify(
            userId="me",
            id=message_id,
            body={
                "addLabelIds": [label_id],
                "removeLabelIds": ["INBOX"]
            }
        ).execute()
        print(f"[{user_email}] Labelled + archived message {message_id}")
        return True
    except Exception as e:
        print(f"[{user_email}] Apply label error for {message_id}: {type(e).__name__}: {e}")
        return False


def classify_and_label(service, email_data: dict) -> str:
    """
    Full pipeline:
    1. Get current user's email (for per-user cache)
    2. Classify email with Groq AI
    3. Get or create Gmail label for THIS user
    4. Apply label + archive (moves out of inbox)
    """
    # Get user email once — used as cache key
    user_email = get_user_email(service)

    category = classify_email(email_data)
    print(f"[{user_email}] Classified '{email_data.get('subject', '')[:50]}' → {category}")

    label_id = get_or_create_label(service, category, user_email)

    if not label_id:
        print(f"[{user_email}] Skipping Gmail update — no label ID for {category}")
        return category

    message_id = email_data.get("id")
    if message_id:
        apply_label_and_archive(service, message_id, label_id, user_email)

    return category
