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


def draft_reply(email_data, custom_instructions="", user_name=""):
    subject = email_data.get('subject', '')
    body = email_data.get('body', '')

    user_prompt = f"""Please draft a reply to this email:

FROM: {email_data['sender_raw']}
SUBJECT: {subject}
---
{body}
---

{"Additional instructions: " + custom_instructions if custom_instructions else ""}
{"Sign off with the name: " + user_name if user_name else "Use 'Best regards' without a name."}

Draft the reply now:"""

    print(f"[GROQ] Drafting reply for: '{subject[:50]}' ...")

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

        reply_text = response.choices[0].message.content.strip()
        usage = response.usage
        print(f"[GROQ] Done! (tokens used: {usage.total_tokens})")
        return reply_text

    except Exception as e:
        print(f"[GROQ] Error: {e}")
        return None


def draft_replies_for_all(emails, user_name="", instructions_map=None):
    results = []
    instructions_map = instructions_map or {}

    for i, em in enumerate(emails):
        print(f"\n[DRAFT] Email {i+1}/{len(emails)}: {em['subject'][:40]}")
        custom = instructions_map.get(em['id'], "")
        reply = draft_reply(em, custom_instructions=custom, user_name=user_name)
        results.append({
            'email': em,
            'reply': reply,
            'status': 'drafted' if reply else 'failed'
        })

    return results


def display_drafted_replies(drafted):
    print("\n" + "="*60)
    print(f"✍️  DRAFTED {len(drafted)} REPLY/REPLIES")
    print("="*60)
    for i, item in enumerate(drafted, 1):
        em = item['email']
        print(f"\n{'─'*60}")
        print(f"[{i}] TO: {em['sender']} | Re: {em['subject'][:40]}")
        print(f"{'─'*60}")
        print(item['reply'] if item['reply'] else "❌ FAILED")


if __name__ == "__main__":
    mock_email = {
        'id': 'mock_001',
        'thread_id': 'thread_001',
        'subject': 'Quick Sync Tomorrow?',
        'sender': 'alice@example.com',
        'sender_name': 'Alice',
        'sender_raw': 'Alice <alice@example.com>',
        'to': 'me@gmail.com',
        'body': "Hi,\n\nAre you free for a 15-min call tomorrow at 2pm to discuss the project?\n\nThanks,\nAlice",
        'snippet': 'Are you free for a 15-min call...',
        'message_id_header': '<mock@example.com>'
    }

    print("🧪 Testing Groq API with mock email...")
    reply = draft_reply(mock_email, user_name="Your Name")
    print("\n📝 DRAFTED REPLY:\n" + "─"*40)
    print(reply)
