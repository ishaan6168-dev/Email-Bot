import base64
from phase1_auth import authenticate_gmail


def get_unread_emails(service, max_results=10):
    print(f"\n[FETCH] Looking for unread emails...")

    results = service.users().messages().list(
        userId='me',
        labelIds=['INBOX', 'UNREAD'],
        maxResults=max_results,
        q='is:unread'
    ).execute()

    messages = results.get('messages', [])

    if not messages:
        print("[FETCH] No unread emails found.")
        return []

    print(f"[FETCH] Found {len(messages)} unread email(s)")

    parsed_emails = []
    for msg_ref in messages:
        email_data = fetch_email_details(service, msg_ref['id'])
        if email_data:
            parsed_emails.append(email_data)

    return parsed_emails


def fetch_email_details(service, message_id):
    try:
        msg = service.users().messages().get(
            userId='me',
            id=message_id,
            format='full'
        ).execute()

        headers = msg['payload'].get('headers', [])
        header_map = {h['name'].lower(): h['value'] for h in headers}

        subject = header_map.get('subject', '(No Subject)')
        sender_raw = header_map.get('from', '')
        to = header_map.get('to', '')
        message_id_header = header_map.get('message-id', '')

        sender_name, sender_email = parse_sender(sender_raw)
        body = extract_body(msg['payload'])

        return {
            'id': message_id,
            'thread_id': msg['threadId'],
            'subject': subject,
            'sender': sender_email,
            'sender_name': sender_name,
            'sender_raw': sender_raw,
            'to': to,
            'body': body[:3000],
            'snippet': msg.get('snippet', ''),
            'message_id_header': message_id_header
        }

    except Exception as e:
        print(f"[FETCH] Error parsing email {message_id}: {e}")
        return None


def parse_sender(sender_raw):
    if '<' in sender_raw and '>' in sender_raw:
        name = sender_raw.split('<')[0].strip().strip('"')
        email_addr = sender_raw.split('<')[1].replace('>', '').strip()
    else:
        name = ''
        email_addr = sender_raw.strip()
    return name, email_addr


def extract_body(payload):
    body = ''

    if payload.get('body', {}).get('data'):
        raw = payload['body']['data']
        body = base64.urlsafe_b64decode(raw + '==').decode('utf-8', errors='replace')
        return body.strip()

    parts = payload.get('parts', [])
    for part in parts:
        mime_type = part.get('mimeType', '')

        if mime_type == 'text/plain':
            data = part.get('body', {}).get('data', '')
            if data:
                body = base64.urlsafe_b64decode(data + '==').decode('utf-8', errors='replace')
                return body.strip()

        elif mime_type.startswith('multipart/'):
            nested_body = extract_body(part)
            if nested_body:
                return nested_body

    return body.strip() or '(No text body found)'


def display_email_summary(emails):
    print("\n" + "="*60)
    print(f"📬 FETCHED {len(emails)} UNREAD EMAIL(S)")
    print("="*60)
    for i, em in enumerate(emails, 1):
        print(f"\n[{i}] From   : {em['sender_name']} <{em['sender']}>")
        print(f"    Subject: {em['subject']}")
        print(f"    Preview: {em['snippet'][:80]}...")


if __name__ == "__main__":
    service = authenticate_gmail()
    emails = get_unread_emails(service, max_results=5)
    display_email_summary(emails)

    if emails:
        print("\n\n📧 FULL BODY OF FIRST EMAIL:")
        print("-" * 40)
        print(emails[0]['body'])
