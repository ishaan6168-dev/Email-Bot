import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_reply(service, original_email: dict, reply_body: str, sender_email: str, dry_run: bool = False):
    try:
        message = MIMEMultipart("alternative")

        # Safely get fields with fallbacks
        to = original_email.get("sender_raw") or original_email.get("sender", "")
        subject = original_email.get("subject", "")
        thread_id = original_email.get("thread_id", "")
        msg_id_header = original_email.get("message_id_header", "")

        if not to:
            print("Send error: no recipient address")
            return None

        message["to"] = to
        message["from"] = sender_email
        message["subject"] = subject if subject.startswith("Re:") else f"Re: {subject}"

        if msg_id_header:
            message["In-Reply-To"] = msg_id_header
            message["References"] = msg_id_header

        # Encode body safely
        message.attach(MIMEText(reply_body, "plain", "utf-8"))

        raw_b64 = base64.urlsafe_b64encode(
            message.as_bytes()
        ).decode("utf-8")

        send_body = {"raw": raw_b64}
        if thread_id:
            send_body["threadId"] = thread_id

        # Send
        sent = service.users().messages().send(
            userId="me",
            body=send_body
        ).execute()

        print(f"Email sent successfully! ID: {sent.get('id')}")

        # Mark as read — silently ignore if fails
        try:
            service.users().messages().modify(
                userId="me",
                id=original_email["id"],
                body={"removeLabelIds": ["UNREAD"]}
            ).execute()
        except Exception as e:
            print(f"Warning: could not mark as read: {e}")

        return {"id": sent.get("id", "sent"), "status": "sent"}

    except Exception as e:
        print(f"Send error: {type(e).__name__}: {e}")
        return None