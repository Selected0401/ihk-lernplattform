# Phase 1 Status Report — Public Shell + Protected Content

> Stand: 2026-07-08. Keine Rechtsberatung. Kein Deploy/Push/Payment-Livegang erfolgt.

## Kurzfazit

- Lokal wurde Option A begonnen: GitHub Pages/Public Shell enthält keine vollständigen JSON-Lerninhalte mehr.
- Vollständiger Content wurde vor Entfernung lokal in `.protected-content/source/` gesichert und ist per `.gitignore` vom Commit ausgeschlossen.
- Cloudflare Worker hat ein erstes geschütztes Content-API-Skeleton mit kurzlebigem Bearer-JWT, Code-Rate-Limit, Webhook-Idempotenz und Refund/Revocation-MVP.
- Launch bleibt NO-GO, bis Cloudflare-Staging, Digistore24-Testflow, ZFU/FernUSG, Rechtstexte, DSGVO/BFSG und Live-Smoke grün sind.

## Erledigt

| Bereich | Ergebnis |
|---|---|
| Public Content | `data/*.json`, `www/data/*.json` per `git rm`; iOS public data lokal entfernt |
| Private Export | `.protected-content/source/` + Manifest mit SHA-256 erstellt; nicht committen |
| Frontend | `index.html`/`www/index.html` laden keine `data/aufgaben-optimiert.json` mehr |
| Login | `VALID_CODES=[]`; API muss `accessToken` liefern, sonst kein Zugang |
| Worker | `/verify-code` gibt JWT aus; `/content/tasks` und `/content/tasks/:id` geschützt; Codeformat/Rate-Limit/Webhook-Idempotenz/Revocation ergänzt |
| Service Worker | `/content/`, `/api/`, `/data/` network-only/no protected cache; Cache-Version Phase 1 |
| Tests | Validator prüft public-shell leak und optional lokalen protected export |
| Risky Legacy Docs | alte öffentliche `references/`/`www/references`/`www/scripts` gesichert und aus tracked public tree entfernt |

## Noch rot

1. Live GitHub Pages ist noch nicht deployed und liefert voraussichtlich alten Content weiter.
2. Cloudflare KV Namespace-IDs, Worker Secrets und Staging-Deployment fehlen.
3. Offizielle Digistore24-Signaturprüfung und echte Testkauf-/Refund-Smokes fehlen weiterhin; lokale Idempotenz/Refund/Revocation sind nur MVP.
4. FernUSG/ZFU externe Freigabe fehlt.
5. Rechtstexte/Impressum/DSGVO/BFSG/AI-Act sind nicht final.
6. Git-History-Secret-Scan mit gitleaks/trufflehog fehlt.

## Nächste technische Schritte

1. Cloudflare Worker Staging einrichten: `ACCESS_CODES`, `PROTECTED_CONTENT`, `ADMIN_SECRET`, `DIGISTORE_WEBHOOK_SECRET`, `JWT_SECRET`.
2. Protected Content in KV/R2 seeden.
3. `ACCESS_API_URL` und `CONTENT_API_URL` für Staging setzen.
4. Staging-Testcode erzeugen.
5. Smoke-Tests: falscher Code abgelehnt, richtiger Code akzeptiert, `/content/tasks` ohne Token 401, mit Token 200, Service Worker cached Content nicht.
6. Erst danach GitHub Pages deployen und Live-Content-Leak mit Cache-Buster prüfen.

## Go/No-Go

- Lokaler Phase-1-Umbau: GO.
- Staging-Backend bauen: GO.
- Paid Launch / Live Payment: NO-GO.
- Google Drive als Build-Ort: nicht empfohlen; nur Backup/Compliance-Ablage nach OAuth.
