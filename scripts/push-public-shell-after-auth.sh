#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

KEY_PATH="${IHK_GITHUB_SSH_KEY:-/opt/data/.ssh/ihk_lernplattform_github_ed25519}"
if [[ ! -f "$KEY_PATH" ]]; then
  echo "ERROR: SSH key not found: $KEY_PATH" >&2
  exit 1
fi

export GIT_SSH_COMMAND="ssh -i $KEY_PATH -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
SHA="$(git rev-parse --short HEAD)"

echo "== Prüfungskern public-shell deploy =="
echo "local_head=$SHA"
echo

echo "[1/6] Git working tree prüfen"
git status --short --branch
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: Working tree ist nicht sauber. Bitte erst committen oder staschen." >&2
  exit 1
fi

echo

echo "[2/6] Lokale Gates laufen lassen"
npm test
npm run build
npm audit --audit-level=high
git diff --check

echo

echo "[3/6] GitHub-Schreibzugriff testen"
git push --dry-run origin main

echo

echo "[4/6] Push nach GitHub main"
git push origin main

echo

echo "[5/6] Remote-Commit prüfen"
printf 'github_main_https='
git ls-remote https://github.com/Selected0401/ihk-lernplattform.git refs/heads/main | awk '{print substr($1,1,7)}'

echo

echo "[6/6] GitHub Pages Live-Smoke mit Cachebuster"
for attempt in $(seq 1 24); do
  echo "live_smoke_attempt=$attempt cachebuster=$SHA-$attempt"
  if python3 scripts/verify-public-shell-live.py --cachebuster "$SHA-$attempt"; then
    echo "github-pages-live-smoke=PASS sha=$SHA"
    exit 0
  fi
  sleep 15
done

echo "ERROR: Live-Smoke blieb nach dem Push rot. GitHub Pages braucht evtl. länger oder Pages ist falsch konfiguriert." >&2
exit 1
