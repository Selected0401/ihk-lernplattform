# IHK-Lernplattform Agent Rules — MASTERPROMPT V3.0 Phase 0

> Stand/Abrufdatum: 2026-07-08. Arbeits- und Prüfprotokoll zur Risikominimierung; keine Rechtsberatung, keine Garantie auf Rechtssicherheit. Finale Prüfung durch Anwalt/ZFU/Datenschutz-/Payment-Fachstellen und bewusste Alex-Freigabe nötig.

## Harte Priorität
Rechtliche Sicherheit, Datenschutz, FernUSG/ZFU, Content-Schutz, Zahlungssicherheit und Hacker-Schutz stehen über Geschwindigkeit, Optik und Launch.

## Absoluter Betriebsmodus
- Phase 0 bedeutet: nichts live schalten, nichts verkaufen, keine Payment-/IPN-Live-Verbindung.
- Entscheidungen werden dokumentiert, rote Risiken blockieren Launch.
- Bei Unsicherheit: STOPP, Risiko erklären, Alex-Frage formulieren.
- Keine finalen Rechtsaussagen; alles ist prüffähiger Entwurf.

## Stop-Regeln
- Kein Live-Payment, keine Digistore24-Live-Schaltung, keine IPN-Live-Verbindung und keine kostenpflichtigen Dienste ohne ausdrückliche Alex-Freigabe.
- Keine finalen Rechtstexte als verbindlich oder rechtssicher bezeichnen.
- Keine finale FernUSG-/ZFU-Einordnung behaupten.
- Keine IHK-Logos, Original-IHK-Aufgaben, Scans, offizielle Nähe oder Zertifizierungsclaims.
- Keine fachliche Betreuung, Lernstoff-Q&A, individuelle Korrektur, serverseitige Lernstandsauswertung, Zertifikate, Teilnahmebescheinigungen oder Kursabschluss live stellen, solange FernUSG/ZFU nicht extern geklärt ist.
- Keine Käuferdaten oder Lernfortschritte an Anbieter übermitteln, solange FernUSG/DSGVO nicht final geklärt ist.
- Keine geschützten Lerninhalte im öffentlichen GitHub-Pages-Bundle lassen, wenn ein bezahlter Launch geplant ist.
- Keine Secrets, API-Keys, Webhook-Secrets, Lizenzcodes oder Käuferdaten committen.
- Keine alten EU-ODR-/OS-Plattform-Links einbauen.
- Kein Analytics/Marketing-Tracking ohne Consent, sofern nicht technisch zwingend erforderlich.
- Kein Widerrufsverzicht/„0-Tage-Rückgabe“ blind aktivieren.

## Architektur-Gate
GitHub Pages ist nur öffentliche Schale. Bezahlte Inhalte müssen vor Verkauf aus Public Repo/Pages heraus und serverseitig nach Lizenzprüfung ausgeliefert werden.

## Erlaubtes Staging
Öffentliche Verkaufsseite mit Test-/Platzhalter-Checkout, Legal-Entwürfe mit Platzhaltern, Login-UI ohne lokale Freischaltcodes, technischer Support zu Zugang/Zahlung/Bedienung.

## FernUSG-/ZFU-Gate
Bis externe Freigabe: nur Selbstlernmaterial, eigene Übungsaufgaben, Musterlösungen, lokale Selbstkontrolle. Kein fachliches Q&A, kein Coaching, keine individuelle Lernstandsanalyse, keine Zertifikate, kein Anbieter-Dashboard zu Lernfortschritten.

## Multi-Agent-Prüfprotokoll
- Legal-Drafter erstellt Lösung/Entwurf und markiert Annahmen.
- Legal-Critic sucht Lücken, Abmahn-, Datenschutz-, FernUSG-, UWG-, Marken- und Verbraucherrechtsrisiken.
- Legal-Red-Team prüft aus Sicht ZFU, Datenschutzbehörde, Verbraucherzentrale, Abmahner, Käufer, Wettbewerber, IHK und Zahlungsanbieter.
- Security-Red-Team prüft Auth-Bypass, Payment-Betrug, Content-Leaks, Caches, Logs, Secrets und OWASP-Risiken.
- Orchestrator entscheidet nur technisch/organisatorisch und markiert Rechtsfragen als externe Freigabe.
- Bei Rot: kein Launch, kein Live-Payment.

## Projektbefehle
- `npm test`
- `npm run build`
- `npm audit --audit-level=high`
- `git diff --check`
- `node --check cloudflare-worker/src/worker.js`
- `node --check sw.js`
- `node --check www/sw.js`

## Phase-0 Pflichtartefakte
Siehe `docs/skills/legal/00-LEGAL-MASTER-INDEX.md`, `docs/compliance/launch-blockers.md`, `docs/compliance/phase-0-decision-brief.md` und `docs/compliance/production-readiness-checklist.md`.
