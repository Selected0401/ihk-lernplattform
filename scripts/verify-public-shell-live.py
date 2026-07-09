#!/usr/bin/env python3
"""Verify that a deployed GitHub Pages/public shell does not expose paid content."""

from __future__ import annotations

import argparse
import sys
import time
import urllib.error
import urllib.request

PUBLIC_FILES = {
    "landing.html": ["Prüfungskern Büro", "checkoutWarning"],
    "login.html": ["const ACCESS_API_URL = ''", "const VALID_CODES = []"],
    "sales-config.js": ["checkoutActive: false", "checkoutUrl: ''"],
    "index.html": ["Zugangscode erforderlich", "CONTENT_API_URL = ''"],
    "sw.js": ["CRITICAL_ASSETS", "protected-content-phase1"],
}

FORBIDDEN_MARKERS = [
    "regularTargetPrice",
    "Jetzt sicher über Digistore24",
    "VALID_CODES = ['",
    "VALID_CODES = [\"",
    "data/aufgaben-optimiert.json",
    "data/aufgaben.json",
    "data/ihk-recherche.json",
    "access=granted",
    "preview=true",
]

PROTECTED_PATHS = [
    "data/aufgaben-optimiert.json",
    "data/aufgaben.json",
    "data/ihk-recherche.json",
    "data/lernfeld-1-3.json",
    "data/lernfeld-4-6.json",
    "www/data/aufgaben-optimiert.json",
    "www/data/aufgaben.json",
]


def fetch_text(url: str) -> tuple[int, str]:
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            return response.status, response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", "replace") if error.fp else ""
        return error.code, body
    except urllib.error.URLError as error:
        return 0, f"network_error: {error.reason}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="https://selected0401.github.io/ihk-lernplattform", help="Base URL of deployed public shell")
    parser.add_argument("--cachebuster", default=str(int(time.time())), help="Query value for cache-busting")
    args = parser.parse_args()

    base = args.base.rstrip("/")
    issues: list[str] = []

    for path, required in PUBLIC_FILES.items():
        url = f"{base}/{path}?deploycheck={args.cachebuster}"
        status, body = fetch_text(url)
        if status != 200:
            issues.append(f"{path}: expected HTTP 200, got {status}")
            continue
        for marker in required:
            if marker not in body:
                issues.append(f"{path}: missing marker {marker!r}")
        for marker in FORBIDDEN_MARKERS:
            if marker in body:
                issues.append(f"{path}: forbidden public marker {marker!r}")

    for path in PROTECTED_PATHS:
        url = f"{base}/{path}?deploycheck={args.cachebuster}"
        status, _ = fetch_text(url)
        if status == 200:
            issues.append(f"{path}: protected content still publicly reachable (HTTP 200)")

    if issues:
        print(f"public-shell-live-smoke=FAIL ({len(issues)} issue(s))")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("public-shell-live-smoke=PASS")
    print(f"base={base}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
