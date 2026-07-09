# Phase 1 — Public Shell + Protected Content Backend

> Stand: 2026-07-09. Ziel: GitHub Pages liefert nur öffentliche Shell. Bezahl-/Lerncontent wird nur nach serverseitiger Lizenzprüfung über Cloudflare Worker ausgeliefert. Keine Rechtsberatung, kein Launch-Go.

## Entscheidung

- GitHub Pages bleibt für öffentliche Seiten: Landingpage, Login-UI, Rechtstexte, App-Shell, begrenzte Vorschau-Metadaten.
- Vollständige Aufgaben, Musterlösungen und Lernumgebungsdaten dürfen nicht in `data/`, `www/data/` oder iOS-Public-Bundles liegen.
- Geschützter Content liegt lokal nur temporär unter `.protected-content/` und ist per `.gitignore` vom Commit ausgeschlossen.
- Produktiver Speicher: Cloudflare `PROTECTED_CONTENT` KV oder später R2/D1.

## Implementierter lokaler Stand

- Public JSON-Dateien wurden aus `data/` und `www/data/` per `git rm` entfernt.
- Ignorierter iOS-Public-Content unter `ios/App/App/public/data/` wurde lokal entfernt.
- Vor Entfernung wurde ein lokaler Export nach `.protected-content/source/` erzeugt, inklusive `.protected-content/manifest.json` mit SHA-256-Hashes.
- `index.html`, `www/index.html` und iOS-Public-Index laden keine `data/aufgaben-optimiert.json` mehr.
- App zeigt ohne Backend nur gesperrte Modul-Platzhalter ohne konkrete Aufgabenstellungen und deaktiviert den Start vollständiger Aufgaben.
- Login akzeptiert nur serverseitige API-Ergebnisse mit `accessToken`; lokale `VALID_CODES` bleiben leer.
- Cloudflare Worker gibt nach Codeprüfung ein kurzlebiges HS256-JWT aus, limitiert Codeprüfungen grob per KV-Bucket und schützt `/content/tasks` sowie `/content/tasks/:id` per Bearer Token plus aktuellem serverseitigem Code-/Revocation-Status.
- Service Worker cached `/content/`, `/api/` und `/data/` nicht.

## Cloudflare Worker Routen

| Route | Methode | Schutz | Zweck |
|---|---:|---|---|
| `/health` | GET | öffentlich | Healthcheck |
| `/verify-code` | POST | Code in `ACCESS_CODES` KV | prüft Käufer-/Stagingcode und gibt `accessToken` aus |
| `/content/tasks` | GET | `Authorization: Bearer <JWT>` | liefert Aufgaben-Metadaten ohne Full Content |
| `/content/tasks/:id` | GET | `Authorization: Bearer <JWT>` | liefert vollständige Aufgabe für berechtigte Nutzer |
| `/admin/create-code` | POST | `ADMIN_SECRET` | manueller Staging-/Support-Code |
| `/digistore24-webhook` | POST | `DIGISTORE_WEBHOOK_SECRET` Staging-Guard | erzeugt Codes idempotent nur für erlaubte Payment-Events und widerruft bei Refund/Chargeback/Cancel; finale Digistore24-Signaturprüfung bleibt Launch-Blocker |

## KV Seeding Entwurf

Nach Cloudflare-Setup:

```bash
cd /opt/data/ihk-lernplattform/cloudflare-worker
wrangler kv namespace create ACCESS_CODES
wrangler kv namespace create PROTECTED_CONTENT
wrangler secret put ADMIN_SECRET
wrangler secret put DIGISTORE_WEBHOOK_SECRET
wrangler secret put JWT_SECRET
wrangler kv key put --binding=PROTECTED_CONTENT \
  tasks/aufgaben-optimiert.json \
  --path ../.protected-content/source/data/aufgaben-optimiert.json
```

Dann `wrangler.toml` Namespace-IDs ersetzen und erst im Staging deployen.

## Frontend-Konfiguration

Vor Staging-Test:

- `login.html`: `ACCESS_API_URL = 'https://DEIN-WORKER.workers.dev/verify-code'`
- `index.html`: `CONTENT_API_URL = 'https://DEIN-WORKER.workers.dev/content'`
- gleiche Werte in `www/`/Build-Bundle spiegeln.
- CSP erlaubt für Staging `https://*.workers.dev`; vor einem Custom-Domain-Launch nach Möglichkeit auf die exakte Worker-Origin verengen.

Solange diese Werte leer sind, bleibt die App fail-closed: keine lokalen Codes, keine vollständigen Aufgaben.

## Release-Gates

NO-GO bleibt, solange offen:

1. FernUSG/ZFU extern ungeklärt.
2. Digistore24 IPN-Signatur und echte End-to-End-Testkäufe nicht final; lokale Idempotenz/Refund/Revocation sind nur Worker-MVP.
3. Rechtstexte enthalten Platzhalter.
4. DSGVO/AVV/Subprocessor/Löschkonzept offen.
5. Git-History Secret-Scan mit gitleaks/trufflehog fehlt.
6. Cloudflare Worker/KV nicht im Staging deployed und live getestet.
7. GitHub Pages Live-URL liefert aktuell noch alten Stand bis Deploy.

## Verifikation lokal

Mindestbefehle:

```bash
node --check cloudflare-worker/src/worker.js
node --check sw.js
node --check www/sw.js
npm run build
npm test
npm audit --audit-level=high
git diff --check
```

Zusätzlich prüfen:

```bash
python3 - <<'PY'
from pathlib import Path
for d in ['data','www/data','ios/App/App/public/data']:
    assert not list(Path(d).glob('*.json')), d
for f in ['index.html','www/index.html']:
    assert 'data/aufgaben-optimiert.json' not in Path(f).read_text()
print('public-content-gate=PASS')
PY
```
