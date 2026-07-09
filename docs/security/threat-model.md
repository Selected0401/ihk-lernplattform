# Threat Model — IHK-Lernplattform Phase 0

> Stand: 2026-07-08. Ziel: paid-content, Auth, Payment und PWA-Cache gegen Missbrauch absichern. Kein Live-Launch bei roten Risiken.

## Assets
- Geschützte Aufgaben/Musterlösungen/Module.
- Lizenzcodes/JWT/Sessions.
- Käufer-E-Mail/Zahlungsstatus/IPN Events.
- Worker Secrets/IPN Passphrase/JWT Secret.
- Public Shell, Legal-Seiten, Salespage.

## Trust Boundaries
- Browser/Public GitHub Pages: nicht vertrauenswürdig.
- Cloudflare Worker/API: Auth- und Policy-Grenze.
- KV/R2/D1: geschützter Speicher, nicht öffentlich konfigurieren.
- Digistore24 IPN/Checkout: extern, Signatur/Idempotenz nötig.
- Gmail/MCP/Support: personenbezogene Supportdaten, kein Lernfeedback.

## Hauptbedrohungen und Controls
| Bedrohung | Control |
|---|---|
| Content Scraping/Public Leak | Paid Content nicht in Repo/Pages; R2 private; JWT/licensed API; no-store. |
| Auth Bypass | keine Frontend-Codes; serverseitige Prüfung; Rate-Limits; kurze Tokens. |
| IPN-Fälschung | offizielle Digistore24 Signatur/IPN password/SHA_PASSPHRASE, Replay/Timestamp, Idempotenz. |
| Refund Abuse | Revocation-Flow, Statusprüfung beim Contentzugriff. |
| XSS/Injection | CSP, HTML escaping, keine untrusted HTML-Injection, dependency audit. |
| BOLA/IDOR | Content/API nie nur nach object id; Lizenzprüfung pro request. |
| Service Worker Cache Leak | protected Content network-only/no-store, Logout cache clear. |
| Secret Leak | Worker Secrets, `.env` ignorieren, secret scan, Rotation bei Fund. |
| Resource Exhaustion | Rate-Limits für Login/IPN/Content/API. |
| Prompt Injection/KI | KI nicht mit Käuferdaten/Lernfeedback; technische Support-Grenzen. |

## Produktions-Mindestkontrollen
- CORS allowlist, keine Wildcards mit Credentials.
- Security Header/CSP/HSTS soweit hostbar.
- Audit-Logs ohne PII-Exzess.
- Monitoring/Alerting für Auth/IPN Fehler.
- Backups/Export/Löschung für personenbezogene Daten.
