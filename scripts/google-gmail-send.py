#!/usr/bin/env python3
"""Minimal Gmail send OAuth helper for one-off buyer/test access emails.

Stores a send-capable token outside the repo at /opt/data/google_gmail_send_token.json.
No secrets are printed. Use only after Alex explicitly authorizes Gmail sending.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
from email.mime.text import MIMEText
from pathlib import Path

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import Flow
    from googleapiclient.discovery import build
except ModuleNotFoundError:
    venv_python = Path("/opt/data/.venvs/google/bin/python")
    if venv_python.exists() and Path(sys.executable) != venv_python:
        os.execv(str(venv_python), [str(venv_python), *sys.argv])
    raise

CLIENT_SECRET = Path("/opt/data/google_client_secret.json")
TOKEN_PATH = Path("/opt/data/google_gmail_send_token.json")
PENDING_PATH = Path("/opt/data/google_gmail_send_oauth_pending.json")
REDIRECT_URI = "http://localhost:1"
SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
]


def flow() -> Flow:
    if not CLIENT_SECRET.exists():
        raise SystemExit(f"client secret missing: {CLIENT_SECRET}")
    oauth = Flow.from_client_secrets_file(str(CLIENT_SECRET), scopes=SCOPES)
    oauth.redirect_uri = REDIRECT_URI
    return oauth


def cmd_auth_url(_: argparse.Namespace) -> int:
    oauth = flow()
    url, state = oauth.authorization_url(
        access_type="offline",
        prompt="consent",
        include_granted_scopes="true",
    )
    PENDING_PATH.write_text(json.dumps({"state": state, "code_verifier": oauth.code_verifier}, indent=2), encoding="utf-8")
    PENDING_PATH.chmod(0o600)
    print(url)
    return 0


def cmd_auth_code(args: argparse.Namespace) -> int:
    if not PENDING_PATH.exists():
        raise SystemExit("pending OAuth session missing; run auth-url first")
    pending = json.loads(PENDING_PATH.read_text(encoding="utf-8"))
    oauth = flow()
    oauth.code_verifier = pending.get("code_verifier")
    oauth.fetch_token(code=args.code.strip())
    creds = oauth.credentials
    TOKEN_PATH.write_text(creds.to_json(), encoding="utf-8")
    TOKEN_PATH.chmod(0o600)
    PENDING_PATH.unlink(missing_ok=True)
    print("gmail_send_auth=OK")
    return 0


def load_creds() -> Credentials:
    if not TOKEN_PATH.exists():
        raise SystemExit(f"gmail send token missing: {TOKEN_PATH}. Run auth-url/auth-code first.")
    creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), scopes=SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN_PATH.write_text(creds.to_json(), encoding="utf-8")
        TOKEN_PATH.chmod(0o600)
    if not creds.valid:
        raise SystemExit("gmail send token invalid; re-run auth-url/auth-code")
    return creds


def gmail_service():
    return build("gmail", "v1", credentials=load_creds())


def profile_email(service) -> str:
    profile = service.users().getProfile(userId="me").execute()
    email = profile.get("emailAddress")
    if not email:
        raise SystemExit("could not determine Gmail profile address")
    return email


def cmd_check(_: argparse.Namespace) -> int:
    service = gmail_service()
    email = profile_email(service)
    print(json.dumps({"gmail_send_auth": "OK", "emailAddress": email}, ensure_ascii=False))
    return 0


def cmd_send(args: argparse.Namespace) -> int:
    service = gmail_service()
    to = args.to
    if to == "me":
        to = profile_email(service)

    message = MIMEText(args.body, "html" if args.html else "plain", "utf-8")
    message["To"] = to
    message["Subject"] = args.subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    result = service.users().messages().send(userId="me", body={"raw": raw}).execute()
    print(json.dumps({"status": "sent", "id": result.get("id"), "threadId": result.get("threadId", "")}, ensure_ascii=False))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("auth-url")
    p.set_defaults(func=cmd_auth_url)

    p = sub.add_parser("auth-code")
    p.add_argument("code")
    p.set_defaults(func=cmd_auth_code)

    p = sub.add_parser("check")
    p.set_defaults(func=cmd_check)

    p = sub.add_parser("send")
    p.add_argument("--to", default="me", help="Recipient email or 'me' for the connected Gmail address")
    p.add_argument("--subject", required=True)
    p.add_argument("--body", required=True)
    p.add_argument("--html", action="store_true")
    p.set_defaults(func=cmd_send)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
