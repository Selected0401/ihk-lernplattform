# Launch Blockers — Phase 0

> Stand: 2026-07-09. Aktueller paid-launch Status: NO-GO.

## Kritische Blocker
1. FernUSG/ZFU nicht extern geklärt; bei bezahltem asynchronem Lernangebot ist das der dominierende Rechtsblocker.
2. Live GitHub Pages kann noch alten Stand mit öffentlichem Content liefern, bis Phase 1 committed, deployed und live mit Cachebuster verifiziert ist. Lokal sind `data/`, `www/data` und iOS-Public-Content entfernt.
3. Kein produktionsreifes serverseitiges Lizenz-/Content-Backend live aktiv (`ACCESS_API_URL`/`CONTENT_API_URL` leer, lokale Codes deaktiviert). Der Worker-MVP ist lokal/mock-getestet, aber nicht Staging-live verifiziert.
4. Digistore24 Checkout/IPN/Widerruf nicht produktionsreif: lokale Worker-Idempotenz, Event-Allowlist und Refund/Revocation inkl. alter JWTs sind mock-getestet, aber offizielle IPN-Signatur und echte Testkauf-/Refund-Smokes fehlen; Checkout bleibt fail-closed.
5. Rechtstexte sind Entwürfe/Platzhalter und brauchen echte Alex-Daten + Anwaltprüfung.
6. Datenschutz/AVV/Subprocessor/Support-Gmail/KI-Datenflüsse nicht final geklärt.
7. BFSG/Accessibility nicht final geprüft.
8. Live GitHub Pages kann alten Stand/alte Service-Worker-Caches ausliefern, solange nicht deployed und live verifiziert.
9. Öffentliches Git-Repository enthält die entfernten Content-Pfade weiterhin in der Historie (`data/`, `www/data/`, `references/`). Ein normaler Push entfernt diese Inhalte nur aus dem aktuellen HEAD/GitHub-Pages-Deploy, nicht aus alten Commits. Vor Paid Launch: History-Cleanup, neues sauberes Public-Shell-Repo oder Repo-Privatisierung bewusst entscheiden.
10. Git-History ist noch nicht forensisch mit gitleaks/trufflehog gescannt; Working-Tree-Scan ist grün, ersetzt aber keinen History-Scan.

## Gelbe Blocker
- Marketingtexte müssen weiter auf „Kurs/Coaching/Zertifikat/Betreuung/garantiert/offiziell“ geprüft werden.
- Asset-/Content-Rechte der 56 Aufgaben, Bilder, Icons und Fonts final dokumentieren.
- Security Header/CSP sind lokal gehärtet; Browser-/Live-Smoke ist noch nicht vollständig geprüft.
- iOS/Capacitor-Public-Ordner wurde lokal gehärtet und alter Public-Content entfernt, ist aber ignoriert/generated; vor App-Build erneut aus Root/www synchronisieren und prüfen.

## Ergebnis
Kein Live-Payment, kein öffentlicher Bezahl-Launch, kein fachlicher Bot/Support, kein Zertifikat, kein public paid content. Lokaler Stand ist QA-grün, aber Launch bleibt bis Live-Deploy/Backend/Recht NO-GO.
