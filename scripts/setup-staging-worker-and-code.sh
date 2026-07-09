#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

WORKER_DIR="cloudflare-worker"
CONTENT_FILE=".protected-content/source/data/aufgaben-optimiert.json"
SECRETS_FILE=".env.staging.local"
BUYER_EMAIL="${1:-}"

if [[ -z "$BUYER_EMAIL" ]]; then
  echo "Usage: $0 <buyer-email>" >&2
  echo "Creates/deploys the staging Worker, seeds protected content, then creates one test access code." >&2
  exit 2
fi

if [[ ! -f "$CONTENT_FILE" ]]; then
  echo "ERROR: protected content file missing: $CONTENT_FILE" >&2
  exit 1
fi

if ! npx --yes wrangler whoami >/dev/null 2>&1; then
  cat >&2 <<'MSG'
ERROR: Cloudflare Wrangler is not authenticated.
Manual step required:
  cd /opt/data/ihk-lernplattform/cloudflare-worker
  npx --yes wrangler login --browser=false
Open the printed URL, authorize Cloudflare, then rerun this script.
MSG
  exit 1
fi

umask 077
if [[ ! -f "$SECRETS_FILE" ]]; then
  python3 - <<'PY' > "$SECRETS_FILE"
import secrets
print(f"ADMIN_SECRET={secrets.token_urlsafe(48)}")
print(f"DIGISTORE_WEBHOOK_SECRET={secrets.token_urlsafe(48)}")
print(f"JWT_SECRET={secrets.token_urlsafe(64)}")
PY
  chmod 600 "$SECRETS_FILE"
fi
# shellcheck disable=SC1090
set -a
source "$SECRETS_FILE"
set +a

cd "$WORKER_DIR"

if grep -q 'REPLACE_WITH_KV_NAMESPACE_ID\|REPLACE_WITH_PROTECTED_CONTENT_KV_NAMESPACE_ID' wrangler.toml; then
  echo "[1/7] Creating KV namespaces and updating wrangler.toml"
  npx --yes wrangler kv namespace create ACCESS_CODES --binding ACCESS_CODES --update-config
  npx --yes wrangler kv namespace create PROTECTED_CONTENT --binding PROTECTED_CONTENT --update-config
else
  echo "[1/7] KV namespace IDs already configured"
fi

echo "[2/7] Uploading Worker secrets"
printf '%s' "$ADMIN_SECRET" | npx --yes wrangler secret put ADMIN_SECRET
printf '%s' "$DIGISTORE_WEBHOOK_SECRET" | npx --yes wrangler secret put DIGISTORE_WEBHOOK_SECRET
printf '%s' "$JWT_SECRET" | npx --yes wrangler secret put JWT_SECRET

echo "[3/7] Deploying Worker"
DEPLOY_LOG="$(mktemp)"
npx --yes wrangler deploy | tee "$DEPLOY_LOG"
WORKER_URL="$(grep -Eo 'https://[^ ]+\.workers\.dev' "$DEPLOY_LOG" | tail -n 1 || true)"
rm -f "$DEPLOY_LOG"
if [[ -z "$WORKER_URL" ]]; then
  echo "ERROR: Could not parse Worker URL from deploy output. Set WORKER_URL manually in $SECRETS_FILE." >&2
  exit 1
fi
if ! grep -q '^WORKER_URL=' "../$SECRETS_FILE"; then
  printf 'WORKER_URL=%q\n' "$WORKER_URL" >> "../$SECRETS_FILE"
else
  python3 - <<PY
from pathlib import Path
p=Path('../$SECRETS_FILE')
lines=p.read_text().splitlines()
lines=[line for line in lines if not line.startswith('WORKER_URL=')]
lines.append('WORKER_URL=' + repr('$WORKER_URL')[1:-1])
p.write_text('\n'.join(lines)+'\n')
PY
fi

echo "[4/7] Health check"
curl -fsS "$WORKER_URL/health" >/dev/null

echo "[5/7] Seeding protected content into PROTECTED_CONTENT KV"
npx --yes wrangler kv key put --binding PROTECTED_CONTENT tasks/aufgaben-optimiert.json --path "../$CONTENT_FILE" --remote

echo "[6/7] Creating one staging access code"
CODE_FILE="../.protected-content/staging-test-code.json"
EXPIRES_AT="$(python3 - <<'PY'
from datetime import datetime, timedelta, timezone
print((datetime.now(timezone.utc)+timedelta(days=30)).isoformat().replace('+00:00','Z'))
PY
)"
curl -fsS -X POST "$WORKER_URL/admin/create-code" \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d "$(python3 - <<PY
import json
print(json.dumps({'email':'$BUYER_EMAIL','plan':'pro-test','source':'manual-staging-test','expiresAt':'$EXPIRES_AT'}))
PY
)" > "$CODE_FILE"
chmod 600 "$CODE_FILE"

echo "[7/7] Verifying code and content endpoint"
CODE="$(python3 - <<'PY'
import json
from pathlib import Path
print(json.loads(Path('../.protected-content/staging-test-code.json').read_text())['code'])
PY
)"
VERIFY_JSON="$(curl -fsS -X POST "$WORKER_URL/verify-code" -H 'Content-Type: application/json' -d "{\"code\":\"$CODE\"}")"
TOKEN="$(python3 - <<PY
import json
print(json.loads('''$VERIFY_JSON''')['accessToken'])
PY
)"
curl -fsS "$WORKER_URL/content/tasks" -H "Authorization: Bearer $TOKEN" >/dev/null

cat <<MSG
staging_worker_setup=PASS
worker_url=$WORKER_URL
test_code_file=$CODE_FILE
next:
  python3 scripts/send-test-access-email.py --code "\$(python3 - <<'PY'
import json
from pathlib import Path
print(json.loads(Path('.protected-content/staging-test-code.json').read_text())['code'])
PY
)" --platform-url "https://selected0401.github.io/pruefungskern-public-shell/login.html"
MSG
