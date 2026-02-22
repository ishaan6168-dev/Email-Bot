import sys
from phase1_auth import authenticate_gmail
from phase2_fetch_emails import get_unread_emails
from phase3_draft_replies import draft_reply
from phase4_send_replies import send_reply

# ─────────────────────────────────────────────
# ⚙️  CONFIGURATION — Edit before running
# ─────────────────────────────────────────────
CONFIG = {
    "your_name": "Your Name",       # Your name for email sign-offs
    "max_emails": 20,               # Max unread emails to load
    "dry_run": False,                # ⚠️ Set to False to actually send emails!
}
# ─────────────────────────────────────────────


def show_inbox(emails):
    """Display numbered list of unread emails."""
    print("\n" + "="*60)
    print(f"📬 UNREAD EMAILS ({len(emails)} found)")
    print("="*60)
    for i, em in enumerate(emails, 1):
        sender = em['sender_name'] or em['sender']
        print(f"  [{i}] From   : {sender}")
        print(f"      Subject: {em['subject']}")
        print(f"      Preview: {em['snippet'][:60]}...")
        print()


def select_emails(emails):
    """
    Lets user pick which emails to reply to.
    Accepts input like: 1 3 5  or  1,3,5  or  all
    """
    print("─"*60)
    print("Which emails do you want to reply to?")
    print("  Enter numbers e.g.  1 3 5")
    print("  Or type 'all' to select all")
    print("  Or type 'q' to quit")
    print("─"*60)

    while True:
        raw = input("Your selection: ").strip().lower()

        if raw == 'q':
            return []

        if raw == 'all':
            return emails

        # Parse numbers — support both "1 2 3" and "1,2,3"
        raw = raw.replace(',', ' ')
        parts = raw.split()

        try:
            indices = [int(p) for p in parts]
        except ValueError:
            print("❌ Invalid input. Enter numbers like: 1 3 5")
            continue

        # Validate range
        invalid = [i for i in indices if i < 1 or i > len(emails)]
        if invalid:
            print(f"❌ Invalid numbers: {invalid}. Choose between 1 and {len(emails)}")
            continue

        selected = [emails[i - 1] for i in indices]
        print(f"\n✅ Selected {len(selected)} email(s): {indices}")
        return selected


def process_email(service, em, user_email):
    """Handles the full flow for a single selected email."""
    print(f"\n{'='*60}")
    print(f"📧 EMAIL DETAILS")
    print(f"{'='*60}")
    print(f"From   : {em['sender_raw']}")
    print(f"Subject: {em['subject']}")
    print(f"\n{em['body'][:600]}{'...' if len(em['body']) > 600 else ''}")
    print(f"{'─'*60}")

    # Optional custom instructions
    extra = input("\nAny special instructions for AI? (Enter to skip): ").strip()

    # Draft reply
    print()
    reply = draft_reply(em, custom_instructions=extra, user_name=CONFIG['your_name'])

    if not reply:
        print("❌ Failed to draft reply. Skipping.")
        return

    # Show draft
    print(f"\n📝 DRAFTED REPLY:\n{'─'*40}\n{reply}\n{'─'*40}")

    # Action on draft
    while True:
        action = input("\n[s]end / [e]dit / [r]egenerate / [skip]: ").strip().lower()

        if action == 'skip':
            print("Skipped.")
            break

        elif action == 'r':
            # Regenerate with new instructions
            extra2 = input("New instructions for regeneration (Enter to keep same): ").strip()
            if extra2:
                extra = extra2
            print()
            reply = draft_reply(em, custom_instructions=extra, user_name=CONFIG['your_name'])
            if reply:
                print(f"\n📝 NEW DRAFT:\n{'─'*40}\n{reply}\n{'─'*40}")
            continue

        elif action == 'e':
            print("Paste your edited reply below. Type END on a new line when done:")
            lines = []
            while True:
                line = input()
                if line.strip() == 'END':
                    break
                lines.append(line)
            reply = '\n'.join(lines)
            print(f"\n📝 EDITED REPLY:\n{'─'*40}\n{reply}\n{'─'*40}")
            continue

        elif action == 's':
            result = send_reply(
                service=service,
                original_email=em,
                reply_body=reply,
                sender_email=user_email,
                dry_run=CONFIG['dry_run']
            )
            if result:
                if CONFIG['dry_run']:
                    print("🟡 Dry run — reply simulated (not actually sent)")
                else:
                    print("✅ Reply sent successfully!")
            break

        else:
            print("Please enter s / e / r / skip")


def run():
    print("🤖 AI EMAIL REPLIER — Powered by Groq (Llama 3)")
    print("="*60)

    if CONFIG['dry_run']:
        print("🟡 DRY RUN mode — no emails will actually be sent")
        print("   Change dry_run to False in CONFIG to go live")
    else:
        print("🔴 LIVE MODE — replies WILL be sent!")
    print()

    # ── Authenticate ───────────────────────────────────────────
    service = authenticate_gmail()
    profile = service.users().getProfile(userId='me').execute()
    user_email = profile['emailAddress']
    print(f"✅ Logged in as: {user_email}")

    # ── Fetch unread emails ────────────────────────────────────
    print("\nFetching unread emails...")
    emails = get_unread_emails(service, max_results=CONFIG['max_emails'])

    if not emails:
        print("✅ No unread emails. You're all caught up!")
        return

    # ── Show inbox + let user pick ─────────────────────────────
    show_inbox(emails)
    selected = select_emails(emails)

    if not selected:
        print("Exiting.")
        return

    # ── Process each selected email one by one ─────────────────
    print(f"\n📋 Processing {len(selected)} selected email(s)...\n")
    sent_count = 0

    for i, em in enumerate(selected):
        print(f"\n[{i+1}/{len(selected)}] Processing: {em['subject'][:50]}")
        process_email(service, em, user_email)

    # ── Done ───────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"🏁 All done! Processed {len(selected)} email(s).")
    print(f"{'='*60}")


if __name__ == "__main__":
    run()