# Production Readiness Checklist — Phase 0

> Stand: 2026-07-09. Alle roten/offenen Punkte blockieren paid launch. Lokale Checks sind kein Live-Deploy-Nachweis.

## Hosting/Domains/TLS
- [x] Lokal/Repo: GitHub Pages nur Public Shell vorbereitet (`data/`, `www/data/` leer/entfernt).
- [ ] Öffentliches Git-History-Leak entschieden/bereinigt: History rewrite, neues Public-Shell-Repo oder Repo privat.
- [ ] Custom Domain/TLS/HSTS geprüft.
- [ ] Live vs. local deploy status dokumentiert.

## Secrets/Auth/Content
- [x] Aktueller Public-Shell-Stand: keine Frontend-Lizenzcodes (`VALID_CODES=[]`) und keine Käuferdaten in Runtime-Dateien.
- [ ] Worker Secrets: IPN Secret/Passphrase, JWT Secret, Admin Secret.
- [ ] Content Storage privat: R2/KV/D1 oder Alternative.
- [x] Lokal: Worker-MVP mit serverseitiger Lizenzprüfung, kurzen JWTs, Codeformat-Fail-Closed und KV-Rate-Limits.
- [x] Lokal/Mock: Refund/Chargeback/Cancel-Revocation getestet; alte JWTs verlieren danach Zugriff über serverseitige Code-Statusprüfung.
- [x] Lokal/Mock: Webhook-Idempotenz und Codeformat-Fail-Closed getestet.
- [x] Lokal: Logout löscht Access-Tokens/Flags und API-/Dynamic-Caches.
- [ ] Worker-Staging mit echten Cloudflare-Bindings getestet.

## Digistore24/Payment
- [x] Lokal: Live-Checkout fail-closed (`checkoutActive=false`, keine Checkout-URL).
- [ ] Test-Checkout eingerichtet und extern verifiziert.
- [ ] IPN-Signatur/IPN password/SHA_PASSPHRASE validiert.
- [ ] Idempotenz für order/transaction/event IDs.
- [x] Lokal/Mock: Refund/Chargeback/Cancel-Events entziehen Codezugriff und bereits ausgestellte JWTs.
- [ ] Widerrufs-/Digital-Content-Flow extern geprüft.

## Legal/Compliance
- [ ] Impressum mit echten Daten nach DDG § 5.
- [ ] Datenschutz spiegelt echte Datenflüsse.
- [ ] AGB/Widerruf anwaltlich geprüft.
- [ ] VSBG-Status geprüft; keine alten ODR-Links.
- [ ] FernUSG/ZFU-Clearing abgeschlossen oder bewusstes No-Go.
- [ ] IHK-/Urheberrechts-/Claim-Audit abgeschlossen.
- [ ] BFSG/Accessibility geprüft.
- [ ] AI Act/KI-Inventar geprüft.

## QA/DevOps
- [x] Lokal 2026-07-09: `npm test` grün.
- [x] Lokal 2026-07-09: `npm run build` grün.
- [x] Lokal 2026-07-09: `npm audit --audit-level=high` grün.
- [x] Lokal 2026-07-09: `git diff --check` grün.
- [ ] Live HTTP 200 und cachebuster smoke.
- [ ] Keine Console Errors auf Sales/Login/App.
- [ ] Service Worker Cache-Policy live verifiziert.
- [x] Lokal: Public Content Leak Test grün.
- [ ] Live: Public Content Leak Test grün.
- [ ] Final Alex Go/No-Go dokumentiert.
