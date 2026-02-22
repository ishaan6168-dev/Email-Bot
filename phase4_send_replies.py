import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def create_reply_message(original_email, reply_body, sender_email):
    message = MIMEMultipart('alternative')
    message['to'] = original_email['sender_raw']
    message['from'] = sender_email
    message['subject'] = f"Re: {original_email['subject']}"

    if original_email.get('message_id_header'):
        message['In-Reply-To'] = original_email['message_id_header']
        message['References'] = original_email['message_id_header']

    text_part = MIMEText(reply_body, 'plain', 'utf-8')
    message.attach(text_part)

    raw_bytes = message.as_bytes()
    raw_b64 = base64.urlsafe_b64encode(raw_bytes).decode('utf-8')

    return {
        'raw': raw_b64,
        'threadId': original_email['thread_id']
    }


def send_reply(service, original_email, reply_body, sender_email, dry_run=True):
    subject = original_email['subject']
    recipient = original_email['sender']

    print(f"\n[SEND] Preparing reply to: {recipient}")
    print(f"[SEND] Subject: Re: {subject[:50]}")

    if dry_run:
        print(f"[SEND] 🟡 DRY RUN — would send:")
        print(f"       To: {recipient}")
        print(f"       Preview: {reply_body[:120]}...")
        return {'id': 'dry_run_mock', 'status': 'simulated'}

    try:
        mime_msg = create_reply_message(original_email, reply_body, sender_email)

        sent_msg = service.users().messages().send(
            userId='me',
            body=mime_msg
        ).execute()

        print(f"[SEND] ✅ Reply sent! Message ID: {sent_msg['id']}")
        mark_as_read(service, original_email['id'])
        return sent_msg

    except Exception as e:
        print(f"[SEND] ❌ Failed to send: {e}")
        return None


def mark_as_read(service, message_id):
    try:
        service.users().messages().modify(
            userId='me',
            id=message_id,
            body={'removeLabelIds': ['UNREAD']}
        ).execute()
        print(f"[SEND] 📖 Marked as read.")
    except Exception as e:
        print(f"[SEND] Warning — could not mark as read: {e}")


def send_all_replies(service, drafted_items, sender_email, dry_run=True):
    if dry_run:
        print("\n⚠️  DRY RUN MODE — No emails will actually be sent.")
        print("    Set dry_run=False in main.py to send for real.\n")

    sent_count = 0
    failed_count = 0
    skipped_count = 0

    for item in drafted_items:
        if item['status'] != 'drafted' or not item['reply']:
            print(f"[SEND] Skipping — draft failed for: {item['email']['subject'][:40]}")
            skipped_count += 1
            continue

        result = send_reply(
            service=service,
            original_email=item['email'],
            reply_body=item['reply'],
            sender_email=sender_email,
            dry_run=dry_run
        )

        if result:
            sent_count += 1
            item['status'] = 'sent' if not dry_run else 'dry_run'
        else:
            failed_count += 1
            item['status'] = 'send_failed'

    print(f"\n📊 SEND SUMMARY: {sent_count} sent | {failed_count} failed | {skipped_count} skipped")
    return {'sent': sent_count, 'failed': failed_count, 'skipped': skipped_count}
