import base64
import re
from html.parser import HTMLParser


class HTMLStripper(HTMLParser):
    """Strips HTML tags and decodes entities to plain text."""
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed = []
        self.skip_tags = {'style', 'script', 'head'}
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag.lower() in self.skip_tags:
            self._skip = True
        if tag.lower() in ('br', 'p', 'div', 'tr', 'li'):
            self.fed.append('\n')

    def handle_endtag(self, tag):
        if tag.lower() in self.skip_tags:
            self._skip = False
        if tag.lower() in ('p', 'div', 'tr', 'li'):
            self.fed.append('\n')

    def handle_data(self, d):
        if not self._skip:
            self.fed.append(d)

    def get_text(self):
        text = ''.join(self.fed)
        # Collapse multiple blank lines into max 2
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()


def strip_html(html_content: str) -> str:
    """Convert HTML email body to readable plain text."""
    try:
        stripper = HTMLStripper()
        stripper.feed(html_content)
        return stripper.get_text()
    except Exception:
        # Fallback: regex strip
        text = re.sub(r'<[^>]+>', ' ', html_content)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()


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


def decode_part(data: str) -> str:
    return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace").strip()


def extract_body(payload):
    mime_type = payload.get("mimeType", "")

    # Direct body data
    body_data = payload.get("body", {}).get("data", "")
    if body_data:
        content = decode_part(body_data)
        if "html" in mime_type:
            return strip_html(content)
        return content

    parts = payload.get("parts", [])

    # Prefer plain text first
    for part in parts:
        if part.get("mimeType") == "text/plain":
            data = part.get("body", {}).get("data", "")
            if data:
                return decode_part(data)

    # Fall back to HTML (strip it)
    for part in parts:
        if part.get("mimeType") == "text/html":
            data = part.get("body", {}).get("data", "")
            if data:
                return strip_html(decode_part(data))

    # Recurse into multipart
    for part in parts:
        if part.get("mimeType", "").startswith("multipart/"):
            nested = extract_body(part)
            if nested:
                return nested

    return "(No text body found)"
