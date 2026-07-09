# Security Risk Register — Phase 0

> Stand: 2026-07-09. Grundlage: OWASP Web Top 10/API Top 10, Cloudflare/GitHub/Digistore-Dokumentation.

| ID | Risiko | Befund | Schwere | Mindestmaßnahme | Status |
|---|---|---|---|---|---|
| SEC-001 | Public Content Leak | Lokal Phase 1: `data/`, `www/data`, iOS public data und eingebettete echte Aufgaben-Vorschauen entfernt; Live GitHub Pages noch alt bis Deploy | kritisch | Deploy + Live-Content-Leak-Test; Content nur Worker/KV/R2 | lokal mitigiert, live rot |
| SEC-002 | Frontend Auth | `VALID_CODES=[]`, `ACCESS_API_URL` leer; Login verlangt API-Ergebnis mit `accessToken`; Frontend verwirft abgelaufene/malformed Sessions; Logout entfernt Tokens/Flags/API- und Dynamic-Caches | hoch | Worker/KV Lizenzprüfung + Staging-URL setzen | lokal gehärtet, rot für Launch |
| SEC-003 | Weak IPN Auth | Query-Secret entfernt, Bearer zeitkonstant verglichen; Idempotenz, Event-Allowlist und Refund/Revocation inkl. alter JWTs lokal/mock abgesichert; offizielle Digistore24-Signatur fehlt | kritisch | Digistore24 IPN password/SHA/HMAC + echte Testkäufe/Refunds | rot für Launch |
| SEC-004 | Brute Force Login | Worker limitiert `/verify-code` grob nach IP und Code per KV-Bucket; WAF/Turnstile/Monitoring nicht final | hoch | Cloudflare Rate Limits/WAF, Lockout/Backoff im Staging prüfen | teilweise mitigiert |
| SEC-005 | CORS | lokal enger, live noch alt möglich | hoch | allowlist Origin, Live-Deploy prüfen | offen |
| SEC-006 | Service Worker Cache Leak | lokal data-precache entfernt/network-only; Logout löscht API-/Dynamic-Caches; live alt möglich | hoch | deploy + cachebuster + SW unregister/update | lokal mitigiert, live offen |
| SEC-007 | Secret Leaks | keine Werte offenlegen; Indikatoren gefunden | hoch | secret-scan, falls real: rotieren | offen |
| SEC-008 | Logs/PII | rawPayload entfernt lokal; Logpolitik unklar | mittel/hoch | keine Käuferdaten/raw IPN logs | offen |
| SEC-009 | Security Headers | App/Login haben Meta-CSP mit Worker-Connect-Allowlist; GitHub Pages limitiert echte HTTP Header | mittel | CSP vor Launch auf exakte Worker-Origin verengen, Headers via Worker/host wo möglich | teilweise mitigiert |
| SEC-010 | Supply Chain | `npm audit --audit-level=high` am 2026-07-09 grün (`found 0 vulnerabilities`) | mittel | je Release erneut prüfen | aktuell grün |
| SEC-011 | Public Git History Leak | GitHub-Repo ist öffentlich; frühere Commits enthalten entfernte `data/`, `www/data/` und `references/`-Pfade weiterhin in der Historie | kritisch | Vor Paid Launch: `git-filter-repo`/neues Public-Shell-Repo/Repo privat; danach Force-Push bzw. Pages neu verifizieren | rot für Launch |
