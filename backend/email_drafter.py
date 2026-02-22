import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are a professional email assistant. Draft clear, concise, and 
appropriate email replies.

Guidelines:
- Match the tone of the original email (formal → formal, casual → casual)
- Be helpful, polite, and to the point
- Do NOT include a subject line — just the email body
- Start with an appropriate greeting using the sender's name if available
- End with a professional sign-off
- Keep replies under 200 words unless more detail is needed
- If specific info is missing, write [PLACEHOLDER: describe what's needed]

Output ONLY the email reply body — no explanations, no meta-comments."""


def draft_reply(email_data: dict, custom_instructions: str = "", user_name: str = "") -> str:
    subject = email_data.get("subject", "")
    body = email_data.get("body", "")

    user_prompt = f"""Please draft a reply to this email:

FROM: {email_data.get('sender_raw', '')}
SUBJECT: {subject}
---
{body}
---

{"Additional instructions: " + custom_instructions if custom_instructions else ""}
{"Sign off with the name: " + user_name if user_name else "Use 'Best regards' without a name."}

Draft the reply now:"""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq error: {e}")
        return None
