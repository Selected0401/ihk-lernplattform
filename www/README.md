# PrüfungsPilot 80/20

Digitale Lernplattform mit Zugangscode-Login für prüfungsnahe 80/20-Vorbereitung in Ausbildung, Umschulung und Quereinstieg.

Aktueller Pilot: **PrüfungsPilot Büro** für Kaufleute für Büromanagement mit Fokus auf typische Office-Kompetenzen: Excel, Word, PowerPoint und Outlook.

## Live

https://selected0401.github.io/ihk-lernplattform/

## Status

Staging/Vorbereitung — noch kein öffentlicher Verkaufsstart.

Öffentlicher Verkauf erst nach:
- finalem Impressum, Datenschutz, AGB und Widerruf
- FernUSG/ZFU-Prüfung
- echtem Digistore24-Checkout-Link
- serverseitiger Zugangscodeprüfung über Worker/API
- erfolgreichem Testkauf inklusive E-Mail-Code-Flow

## Positionierung

PrüfungsPilot 80/20 ist unabhängig erstellt. Es besteht keine Verbindung zur Industrie- und Handelskammer, DIHK, einer IHK-Prüfungsstelle oder einer offiziellen Prüfungsinstitution. Es werden keine originalen IHK-Prüfungen, offiziellen Prüfungsaufgaben, Logos, Scans oder geschützten Unterlagen bereitgestellt.

## Features

- 56 eigene prüfungsnahe Übungsaufgaben
- interaktive Lernumgebungen für Excel, Word, PowerPoint und Outlook
- Word-Arbeitsbereich mit A4-Seite, Lineal und 80/20-Strukturhilfe
- Musterlösungen mit AHA-Erklärung für schnelles Verständnis
- PWA-fähig für Desktop- und Smartphone-Browser
- Zugangscode-Login für Käuferzugang

## Recht/Launch-Dokumente

- `BUSINESS_MARKETING_LEGAL_PLAN.md`
- `ACCESS_CODE_SETUP.md`
- `DIGISTORE24_COPY.md`
- `cloudflare-worker/README.md`

## Technische Prüfung

```bash
node --check learning-environment.js
node --check www/js/learning-environment.js
node --check sw.js
node --check www/sw.js
python3 -m json.tool data/aufgaben-optimiert.json >/tmp/aufgaben-root.json
python3 -m json.tool www/data/aufgaben-optimiert.json >/tmp/aufgaben-www.json
npm run build
npm test
npm audit --audit-level=high
git diff --check
```
