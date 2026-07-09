# IHK Access Worker

Cloudflare Worker für Zugangscode-Prüfung, kurzlebige Zugriffstokens, geschützte Contentauslieferung und Digistore24-Webhook.

## Endpoints

- `GET /health` — Statuscheck
- `POST /verify-code` — Code prüfen
- `GET /content/tasks` — geschützte Aufgaben-Metadaten, Bearer Token erforderlich
- `GET /content/tasks/:id` — geschützte vollständige Aufgabe, Bearer Token erforderlich
- `POST /admin/create-code` — manuellen Code erstellen, geschützt mit `ADMIN_SECRET`
- `POST /digistore24-webhook` — Kauf-/Refund-Events empfangen, idempotent verarbeiten und Codes erzeugen oder widerrufen, geschützt mit `DIGISTORE_WEBHOOK_SECRET`

## Setup

```bash
npm create cloudflare@latest ihk-access-worker
cd ihk-access-worker
# Dateien aus diesem Ordner übernehmen
wrangler kv namespace create ACCESS_CODES
wrangler kv namespace create PROTECTED_CONTENT
# KV-IDs in wrangler.toml eintragen
wrangler secret put ADMIN_SECRET
wrangler secret put DIGISTORE_WEBHOOK_SECRET
wrangler secret put JWT_SECRET
wrangler deploy
```

Zugangscodes folgen dem Format `IHK-ABCD-2345` oder `PLUS-ABCD-2345`. Andere Formate werden serverseitig abgelehnt, damit interne KV-Schlüssel nicht versehentlich als Codes funktionieren.

## Geschützten Content in KV laden

Die lokalen Lerninhalte liegen nach Phase 1 nur noch im gitignorierten Export `.protected-content/source/`. Vor dem Upload prüfen, dass keine Secrets enthalten sind und dass der Content rechtlich/fachlich freigegeben ist.

```bash
cd cloudflare-worker
wrangler kv key put --binding=PROTECTED_CONTENT \
  tasks/aufgaben-optimiert.json \
  --path ../.protected-content/source/data/aufgaben-optimiert.json
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
  -d '{"code":"CODE-AUS-DER-KAEUFERMAIL"}'
```

Die Antwort enthält bei gültigem Code ein kurzlebiges `accessToken` für `/content/*`. Frontend und Logs dürfen den Token nicht veröffentlichen. `/verify-code` ist zusätzlich per KV-Bucket nach IP und Code limitiert; Cloudflare/WAF-Limits sollten vor Launch trotzdem davor geschaltet werden.

## Geschützten Content abrufen

```bash
curl https://DEIN-WORKER.workers.dev/content/tasks \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

curl https://DEIN-WORKER.workers.dev/content/tasks/excel-001 \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Alle Content-Antworten werden mit `Cache-Control: no-store` ausgeliefert. Der Service Worker darf `/content/`, `/api/` und `/data/` nicht cachen.

## Digistore24

Webhook-URL:

```text
https://DEIN-WORKER.workers.dev/digistore24-webhook
```

Für Staging muss der Aufruf mindestens einen `Authorization: Bearer ***`-Header mit dem Worker-Secret senden. Der Worker verarbeitet wiederholte Events idempotent über Event-/Order-Hashes und markiert Codes bei Refund-/Chargeback-/Cancel-Events als `revoked`. Für Produktion muss zusätzlich die offizielle Digistore24-Signaturprüfung bzw. der von Digistore24 dokumentierte verifizierte IPN/Webhook-Flow ergänzt und mit echten Testkäufen verifiziert werden. Query-String-Secrets sind nicht zulässig.

## Login-Anbindung

In `login.html` die Variable `ACCESS_API_URL` auf deine Worker-URL setzen:

```js
const ACCESS_API_URL = 'https://DEIN-WORKER.workers.dev/verify-code';
```

In `index.html` zusätzlich die geschützte Content-Basis setzen:

```js
const CONTENT_API_URL = 'https://DEIN-WORKER.workers.dev/content';
```

Solange sie leer ist, lehnt `login.html` alle Codes ab. Öffentliche Frontend-Demo-Codes sind bewusst deaktiviert; für Tests zuerst den Worker deployen oder lokal eine API-URL setzen.
