# Phase 0 Decision Brief — MASTERPROMPT V3.0

> Stand: 2026-07-08. Kurzfassung für Alex. Keine Rechtsberatung. Paid Launch aktuell NO-GO.

## A) Sync-/Deploy-Status
- Lokal ist `main` vor `origin/main`; es gibt uncommitted Phase-0-Hardening/Docs.
- Live GitHub Pages ist erreichbar, kann aber alten Stand ausliefern, solange nicht deployed und cachebuster-verifiziert.
- Kein Push/Deploy/Live-Payment ohne Alex-Freigabe.

## B) Secret-Scan Ergebnis
- `.env*` darf nicht ins Repo; gefundene Secret-Indikatoren müssen redaktiert geprüft werden.
- Kein Secret, Code oder Käuferdatum darf im Chat, Git, Logs oder Docs offen liegen.
- Bei echtem Fund: sofort rotieren und History prüfen.

## C) Public-Content-Leak Ergebnis
- Kritisch: `data/` und `www/data/` enthalten vollständige Lerninhalte und wären auf GitHub Pages öffentlich abrufbar.
- Für paid Produkt ist Option A Pflicht: Public Shell + private Content API.

## D) FernUSG-/ZFU-Risikostatus
- Rot/offen: entgeltlich + asynchron/räumlich getrennt liegt nahe; jede Anbieter-Lernerfolgskontrolle ist kritisch.
- Bis Freigabe: kein fachlicher Bot, kein Feedback, keine Korrektur, keine Zertifikate, keine serverseitige Lernstandsauswertung.

## E) Content-Schutz-Empfehlung
- Option A: GitHub Pages nur Sales/Legal/Login-Shell, Content nach Lizenzprüfung via Worker/R2/KV/D1.
- Option B public Content ist nicht 10/10 und nicht für bezahlten Launch empfohlen.

## F) Digistore24-/Checkout-Risiken
- Checkout deaktiviert/Platzhalter ist sicher für Staging, aber nicht launchfähig.
- IPN braucht offizielle Signatur/IPN password/SHA, Idempotenz, Refund/Revocation, Rate-Limits, PII-minimierte Logs.

## G) Datenschutz-/Cookie-Risiken
- Privacy Map/AVV/Subprocessor final offen.
- Kein Analytics/Marketing-Tracking vor Consent.
- localStorage/Service Worker dokumentieren; Käufer-/Supportdaten nicht an KI ohne Prüfung.

## H) IHK-/Urheberrechtsrisiken
- Keine Logos, keine Originalaufgaben, keine offizielle Nähe.
- Sichere Sprache: unabhängiges digitales Selbstlern- und Übungsmaterial, eigene prüfungsnahe Aufgaben.

## I) Salespage-Status
- Salespage darf als Staging/Demo existieren, aber muss Claims defensiv halten.
- CTA darf keinen echten Checkout auslösen, solange Gates rot sind.

## J) Launch-Blocker
Siehe `docs/compliance/launch-blockers.md`: FernUSG/ZFU, public content, fehlendes Backend, Payment/IPN, Rechtstexte, Datenschutz, BFSG, Live-Deploy/Cache.

## K) Konkrete Freigaben, die Alex geben muss
1. Option A bestätigen: paid Content raus aus Public Repo/Pages.
2. Erlaubnis für Cloudflare Worker/KV/R2 oder anderes Backend.
3. Unternehmens-/Rechtstextdaten liefern.
4. ZFU/Anwalt-Clearing anstoßen.
5. Digistore24 Testmodus + IPN-Details bereitstellen.
6. Erst nach grünen Gates bewusstes Go/No-Go.

## Score 0–10
- FernUSG/ZFU: 2/10 (Dokumentiert, aber extern ungeklärt)
- Datenschutz/DSGVO/TDDDG: 4/10 (Map erstellt, echte Daten/AVV offen)
- E-Commerce/Checkout/Widerruf: 3/10 (Staging sicher, nicht launchfähig)
- Content-Schutz: 2/10 (lokale Cache-Härtung, aber Public Content im Repo)
- Security: 5/10 (erste Fixes, Backend/IPN/Rate-Limit offen)
- Payment/IPN: 2/10
- Accessibility/BFSG: 3/10
- AI Act/KI: 4/10
- IHK/Urheberrecht: 5/10
- Salespage: 5/10
- QA/Tests: 7/10 lokal, live noch alt/offen
- DevOps/Deployment: 4/10

## Go/No-Go
NO-GO für bezahlten Launch. Staging/Audit/Backend-Bau erlaubt.
