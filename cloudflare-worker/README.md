# IHK Access Worker

Cloudflare Worker für Zugangscode-Prüfung, kurzlebige Zugriffstokens, geschützte Contentauslieferung und Digistore24 Generic IPN.

## Endpoints

- `GET /health` — Statuscheck
- `POST /verify-code` — Code prüfen
- `GET /content/tasks` — geschützte Aufgaben-Metadaten, Bearer Token erforderlich
- `GET /content/tasks/:id` — geschützte vollständige Aufgabe, Bearer Token erforderlich
- `POST /admin/create-code` — manuellen Code erstellen, geschützt mit `ADMIN_SECRET`
- `POST /digistore/ipn` — signierte Test-IPNs verarbeiten; `license_key` nur als SHA-256 speichern

Der alte Alias `/digistore24-webhook` bleibt absichtlich geschlossen (`404`).

## Setup

```bash
npm create cloudflare@latest ihk-access-worker
cd ihk-access-worker
# Dateien aus diesem Ordner übernehmen
wrangler kv namespace create ACCESS_CODES
wrangler kv namespace create PROTECTED_CONTENT
# KV-IDs in wrangler.toml eintragen
wrangler secret put ADMIN_SECRET
wrangler secret put DIGISTORE_IPN_PASSPHRASE_TEST
wrangler secret put JWT_SECRET
# Kein Deployment ohne separate Staging-Freigabe.
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

Staging-Postback-URL:

```text
https://DEIN-STAGING-WORKER.workers.dev/digistore/ipn
```

Der Endpoint akzeptiert ausschließlich `application/x-www-form-urlencoded` mit der offiziellen SHA-512-Signatur. Staging-Werte werden extern gesetzt: `DIGISTORE_PRODUCT_IDS`, `DIGISTORE_PRODUCT_PLANS` (`product_id=pro|plus`) und das Secret `DIGISTORE_IPN_PASSPHRASE_TEST`. Fehlendes Mapping ergibt fail-closed `503 product_plan_not_configured`; `product_name` autorisiert niemals. `api_mode=live` bleibt mit `403 live_ipn_disabled` gesperrt.

`on_payment` aktiviert den von Digistore24 gelieferten, case-sensitiven Lizenzschlüssel hash-only. Replay ist idempotent. Refund und Chargeback widerrufen den Zugang und erhöhen `sessionVersion`, wodurch bestehende Zugriffstokens ungültig werden. Erfolgreiche IPNs antworten exakt mit `Content-Type: text/plain` und Body `OK`. Klartextschlüssel, Käufer-E-Mail und rohe Order-ID werden weder persistiert noch geloggt.

Die beispielhafte Binding-Konfiguration steht in `wrangler.staging.example.toml`. Sie enthält keine echten Namespace-IDs, Produkt-IDs oder Secrets und ist keine Deployment-Freigabe.

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
