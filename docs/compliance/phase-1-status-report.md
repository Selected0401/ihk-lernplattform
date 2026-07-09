# Phase 1 Status Report — Public Shell + Protected Content

> Stand: 2026-07-09. Keine Rechtsberatung. Lokale Public Shell ist gehärtet; Push/Live-Deploy scheitert aktuell an fehlender GitHub-SSH-Auth.

## Kurzfazit

- Lokal wurde Option A umgesetzt: GitHub Pages/Public Shell enthält keine vollständigen JSON-Lerninhalte und keine eingebetteten echten Aufgaben-Vorschauen mehr.
- Vollständiger Content wurde vor Entfernung lokal in `.protected-content/source/` gesichert und ist per `.gitignore` vom Commit ausgeschlossen.
- Cloudflare Worker hat ein geschütztes Content-API-Skeleton mit kurzlebigem Bearer-JWT, Code-Rate-Limit, Webhook-Idempotenz, Webhook-Event-Allowlist und Refund/Revocation, die auch bereits ausgestellte Tokens serverseitig blockiert.
- Öffentliche GitHub Pages Live-Version bleibt rot, bis die lokalen Commits gepusht und mit Cachebuster geprüft sind.
- Paid Launch bleibt NO-GO, bis Cloudflare-Staging, Digistore24-Testflow, ZFU/FernUSG, Rechtstexte, DSGVO/BFSG, Git-History-Entscheid und Live-Smoke grün sind.

## Erledigt

| Bereich | Ergebnis |
|---|---|
| Public Content | `data/*.json`, `www/data/*.json` per `git rm`; iOS public data lokal entfernt |
| Private Export | `.protected-content/source/` + Manifest mit SHA-256 erstellt; nicht committen |
| Frontend | `index.html`/`www/index.html` laden keine `data/aufgaben-optimiert.json` mehr und enthalten nur gesperrte Modul-Platzhalter |
| Login | `VALID_CODES=[]`; API muss `accessToken` liefern, sonst kein Zugang |
| Worker | `/verify-code` gibt JWT aus; `/content/tasks` und `/content/tasks/:id` geschützt; Codeformat/Rate-Limit/Webhook-Idempotenz/Event-Allowlist/Revocation inkl. alter JWTs lokal getestet |
| Service Worker | `/content/`, `/api/`, `/data/` network-only/no protected cache; Cache-Version Phase 1 |
| Tests | `npm test` kombiniert Public-Shell-Validator und Worker-Security-Smoke (`worker-security-smoke=PASS`) |
| Risky Legacy Docs | alte öffentliche `references/`/`www/references`/`www/scripts` gesichert und aus tracked public tree entfernt |

## Noch rot

1. Live GitHub Pages ist noch nicht deployed und liefert nach aktuellem Live-Smoke weiterhin alten Content/alte Marker weiter.
2. Cloudflare KV Namespace-IDs, Worker Secrets und Staging-Deployment fehlen.
3. Offizielle Digistore24-Signaturprüfung und echte Testkauf-/Refund-Smokes fehlen weiterhin; lokale Idempotenz/Refund/Revocation sind nur Mock-verifiziert.
4. FernUSG/ZFU externe Freigabe fehlt.
5. Rechtstexte/Impressum/DSGVO/BFSG/AI-Act sind nicht final.
6. Git-History-Entscheidung fehlt: öffentliche Repo-Historie enthält alte `data/`, `www/data`, `references/`-Pfade.
7. Push/Deploy blockiert: `git push --dry-run origin main` scheitert mit `Permission denied (publickey)`.

## Nächste technische Schritte

1. Cloudflare Worker Staging einrichten: `ACCESS_CODES`, `PROTECTED_CONTENT`, `ADMIN_SECRET`, `DIGISTORE_WEBHOOK_SECRET`, `JWT_SECRET`.
2. Protected Content in KV/R2 seeden.
3. `ACCESS_API_URL` und `CONTENT_API_URL` für Staging setzen.
4. Staging-Testcode erzeugen.
5. Smoke-Tests: falscher Code abgelehnt, richtiger Code akzeptiert, `/content/tasks` ohne Token 401, mit Token 200, Refund/Chargeback blockiert alte Tokens, Service Worker cached Content nicht.
6. GitHub SSH/PAT-Auth fixen, lokale Commits pushen und Live-Content-Leak mit Cache-Buster prüfen.
7. Git-History-Leak bewusst bereinigen oder Public-Shell in ein sauberes neues/privates Repo auslagern.

## Go/No-Go

- Lokaler Phase-1-Umbau: GO.
- Staging-Backend bauen: GO.
- Paid Launch / Live Payment: NO-GO.
- Google Drive als Build-Ort: nicht empfohlen; nur Backup/Compliance-Ablage nach OAuth.
