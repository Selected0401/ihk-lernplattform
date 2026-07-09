# Option B + Testzugang Runbook

Stand: 2026-07-09

## Ziel

- Neues sauberes Public-Shell-Repo ohne alte Paid-Content-Historie.
- Geschützte Inhalte bleiben ausschließlich im Cloudflare Worker/KV.
- Test-Zugangscode wird erst versendet, wenn der Code serverseitig funktioniert.

## Aktueller Stand

Automatisch vorbereitet:

- Clean Public Shell lokal erstellt: `/opt/data/pruefungskern-public-shell`
- Clean Repo hat nur 2 Commits und keine alte Content-Historie.
- Lokale Gates im Clean Repo: `public-shell-static=PASS`, `npm run build` grün.
- Neuer Deploy Key für Clean Repo wurde erzeugt.
- Helper-Scripts im Hauptrepo:
  - `scripts/setup-staging-worker-and-code.sh`
  - `scripts/google-gmail-send.py`
  - `scripts/send-test-access-email.py`

Blocker, die Alex manuell lösen muss:

1. Neues GitHub-Repo erstellen und Deploy Key eintragen.
2. GitHub Pages im neuen Repo aktivieren.
3. Cloudflare Wrangler Login autorisieren.
4. Gmail Send OAuth autorisieren.

## Manueller Schritt 1: neues GitHub-Repo

Browser:

```text
https://github.com/new
```

Einstellungen:

```text
Owner: Selected0401
Repository name: pruefungskern-public-shell
Visibility: Public
Initialize README: aus
.gitignore/license: aus
```

## Manueller Schritt 2: Deploy Key für neues Repo

Browser:

```text
https://github.com/Selected0401/pruefungskern-public-shell/settings/keys
```

Title:

```text
Hermes Prüfungskern Public Shell Deploy Key
```

Key:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIA3pxgQTWnL8ugLISfwuovRWXhICxPi4Df6NpEAp+MWa pruefungskern-public-shell-hermes-4f7fbd968995-20260709
```

Wichtig: `Allow write access` aktivieren.

Danach:

```bash
cd /opt/data/pruefungskern-public-shell
bash scripts/push-clean-public-shell-after-auth.sh
```

## Manueller Schritt 3: GitHub Pages aktivieren

Browser:

```text
https://github.com/Selected0401/pruefungskern-public-shell/settings/pages
```

- Source: Deploy from a branch
- Branch: main
- Folder: / root
- Save

Erwartete URL:

```text
https://selected0401.github.io/pruefungskern-public-shell/
```

## Manueller Schritt 4: Cloudflare Login

Auf dem Server oder über Hermes ausführen lassen:

```bash
cd /opt/data/ihk-lernplattform/cloudflare-worker
npx --yes wrangler login --browser=false
```

Die URL öffnen und Cloudflare autorisieren.

Danach kann das Staging-Script laufen:

```bash
cd /opt/data/ihk-lernplattform
bash scripts/setup-staging-worker-and-code.sh "DEINE-GMAIL-ADRESSE"
```

Das Script:

- erstellt KV Namespaces, falls nötig,
- setzt Worker-Secrets,
- deployt den Worker,
- lädt geschützte Aufgaben in `PROTECTED_CONTENT`,
- erzeugt einen serverseitigen Testcode,
- prüft `/verify-code` und `/content/tasks`.

Danach muss die Clean Shell einmalig auf den Staging Worker zeigen:

```bash
cd /opt/data/pruefungskern-public-shell
python3 scripts/configure-staging-api.py "https://DEIN-WORKER.workers.dev"
npm test
git add -A
git commit -m "chore: connect staging access worker"
bash scripts/push-clean-public-shell-after-auth.sh
```

Dabei bleibt `VALID_CODES = []`; der Zugang läuft nur serverseitig über den Worker.

## Manueller Schritt 5: Gmail Send OAuth

Es reicht nicht, nur Gmail read-only zu haben. Für Versand braucht Hermes explizit `gmail.send`.

Ablauf:

```bash
cd /opt/data/ihk-lernplattform
python3 scripts/google-gmail-send.py auth-url
```

URL öffnen, Google autorisieren, aus der Browser-Adresszeile den `code=` Wert kopieren, dann:

```bash
python3 scripts/google-gmail-send.py auth-code 'CODE_AUS_GOOGLE'
python3 scripts/google-gmail-send.py check
```

## Test-E-Mail senden

Erst wenn Worker-Staging und Gmail Send OAuth grün sind:

```bash
cd /opt/data/ihk-lernplattform
CODE="$(python3 - <<'PY'
import json
from pathlib import Path
print(json.loads(Path('.protected-content/staging-test-code.json').read_text())['code'])
PY
)"
python3 scripts/send-test-access-email.py \
  --code "$CODE" \
  --platform-url "https://selected0401.github.io/pruefungskern-public-shell/login.html" \
  --to me \
  --support-email "support@pruefungskern.example"
```

## Warum kein statischer Testcode

Ein Code in `VALID_CODES` wäre öffentlich sichtbar über HTML/JS, DevTools, GitHub Pages und Repo-History. Deshalb bleibt `VALID_CODES = []`.
