import base64


def get_unread_emails(service, max_results=20):
    results = service.users().messages().list(
        userId="me",
        labelIds=["INBOX", "UNREAD"],
        maxResults=max_results,
        q="is:unread"
    ).execute()

    messages = results.get("messages", [])
    if not messages:
        return []

    parsed = []
    for msg_ref in messages:
        email_data = fetch_email_details(service, msg_ref["id"])
        if email_data:
            parsed.append(email_data)

    return parsed


def fetch_email_details(service, message_id):
    try:
        msg = service.users().messages().get(
            userId="me", id=message_id, format="full"
        ).execute()

        headers = msg["payload"].get("headers", [])
        header_map = {h["name"].lower(): h["value"] for h in headers}

        subject = header_map.get("subject", "(No Subject)")
        sender_raw = header_map.get("from", "")
        to = header_map.get("to", "")
        message_id_header = header_map.get("message-id", "")
        date = header_map.get("date", "")

        sender_name, sender_email = parse_sender(sender_raw)
        body = extract_body(msg["payload"])

        return {
            "id": message_id,
            "thread_id": msg["threadId"],
            "subject": subject,
            "sender": sender_email,
            "sender_name": sender_name,
            "sender_raw": sender_raw,
            "to": to,
            "date": date,
            "body": body[:3000],
            "snippet": msg.get("snippet", ""),
            "message_id_header": message_id_header,
        }
    except Exception as e:
        print(f"Error parsing email {message_id}: {e}")
        return None


def parse_sender(sender_raw):
    if "<" in sender_raw and ">" in sender_raw:
        name = sender_raw.split("<")[0].strip().strip('"')
        email_addr = sender_raw.split("<")[1].replace(">", "").strip()
    else:
        name = ""
        email_addr = sender_raw.strip()
    return name, email_addr


def extract_body(payload):
    if payload.get("body", {}).get("data"):
        raw = payload["body"]["data"]
        return base64.urlsafe_b64decode(raw + "==").decode("utf-8", errors="replace").strip()

    parts = payload.get("parts", [])
    for part in parts:
        mime_type = part.get("mimeType", "")
        if mime_type == "text/plain":
            data = part.get("body", {}).get("data", "")
            if data:
                return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace").strip()
        elif mime_type.startswith("multipart/"):
            nested = extract_body(part)
            if nested:
                return nested

    return "(No text body found)"
