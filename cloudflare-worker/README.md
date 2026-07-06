# IHK Access Worker

Cloudflare Worker für Zugangscode-Prüfung und Digistore24-Webhook.

## Endpoints

- `GET /health` — Statuscheck
- `POST /verify-code` — Code prüfen
- `POST /admin/create-code` — manuellen Code erstellen, geschützt mit `ADMIN_SECRET`
- `POST /digistore24-webhook` — Kaufdaten empfangen und Code erzeugen, geschützt mit `DIGISTORE_WEBHOOK_SECRET`

## Setup

```bash
npm create cloudflare@latest ihk-access-worker
cd ihk-access-worker
# Dateien aus diesem Ordner übernehmen
wrangler kv namespace create ACCESS_CODES
# KV-ID in wrangler.toml eintragen
wrangler secret put ADMIN_SECRET
wrangler secret put DIGISTORE_WEBHOOK_SECRET
wrangler deploy
```

## Manuellen Code erzeugen

```bash
curl -X POST https://DEIN-WORKER.workers.dev/admin/create-code \
  -H "Authorization: Bearer DEIN_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"kunde@example.com","plan":"pro","source":"manual"}'
```

## Code prüfen

```bash
curl -X POST https://DEIN-WORKER.workers.dev/verify-code \
  -H "Content-Type: application/json" \
  -d '{"code":"IHK-ABCD-1234"}'
```

## Digistore24

Webhook-URL:

```text
https://DEIN-WORKER.workers.dev/digistore24-webhook?secret=DEIN_DIGISTORE_WEBHOOK_SECRET
```

Für Produktion sollte die offizielle Digistore24-Signaturprüfung bzw. der von Digistore24 dokumentierte verifizierte IPN/Webhook-Flow ergänzt werden. Der Secret-Parameter ist nur ein pragmatischer MVP-Schutz.

## Login-Anbindung

In `login.html` die Variable `ACCESS_API_URL` auf deine Worker-URL setzen:

```js
const ACCESS_API_URL = 'https://DEIN-WORKER.workers.dev/verify-code';
```

Solange sie leer ist, lehnt `login.html` alle Codes ab. Öffentliche Frontend-Demo-Codes sind bewusst deaktiviert; für Tests zuerst den Worker deployen oder lokal eine API-URL setzen.
