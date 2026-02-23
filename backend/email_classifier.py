import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"

# Labels Mail-chan will create + apply in Gmail
LABELS = ["Work", "Casual", "Advertisement", "Newsletter", "Finance", "Social", "Spam"]

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
        # Validate — fall back to Casual if unexpected
        for label in LABELS:
            if label.lower() in result.lower():
                return label
        return "Casual"
    except Exception as e:
        print(f"Classification error: {e}")
        return "Casual"


def get_or_create_label(service, label_name: str) -> str:
    """Gets existing Gmail label ID or creates it. Returns label ID."""
    label_colors = {
        "Work":          {"backgroundColor": "#1c4587", "textColor": "#ffffff"},
        "Casual":        {"backgroundColor": "#0d652d", "textColor": "#ffffff"},
        "Advertisement": {"backgroundColor": "#7d3c98", "textColor": "#ffffff"},
        "Newsletter":    {"backgroundColor": "#b45f06", "textColor": "#ffffff"},
        "Finance":       {"backgroundColor": "#bf2600", "textColor": "#ffffff"},
        "Social":        {"backgroundColor": "#006064", "textColor": "#ffffff"},
        "Spam":          {"backgroundColor": "#4a4a4a", "textColor": "#ffffff"},
    }

    try:
        # Check existing labels
        existing = service.users().labels().list(userId="me").execute()
        for lbl in existing.get("labels", []):
            if lbl["name"].lower() == f"mail-chan/{label_name}".lower():
                return lbl["id"]

        # Create new label under Mail-chan/ namespace
        body = {
            "name": f"Mail-chan/{label_name}",
            "labelListVisibility": "labelShow",
            "messageListVisibility": "show",
        }
        color = label_colors.get(label_name)
        if color:
            body["color"] = color

        created = service.users().labels().create(userId="me", body=body).execute()
        return created["id"]

    except Exception as e:
        print(f"Label create/get error for {label_name}: {e}")
        return None


def apply_label_to_email(service, message_id: str, label_id: str):
    """Applies a Gmail label to a message."""
    try:
        service.users().messages().modify(
            userId="me",
            id=message_id,
            body={"addLabelIds": [label_id]}
        ).execute()
        return True
    except Exception as e:
        print(f"Apply label error: {e}")
        return False


def classify_and_label(service, email_data: dict) -> str:
    """Full pipeline: classify email → get/create label → apply in Gmail."""
    category = classify_email(email_data)
    label_id = get_or_create_label(service, category)
    if label_id:
        apply_label_to_email(service, email_data["id"], label_id)
    return category
