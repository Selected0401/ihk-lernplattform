# FernUSG-/ZFU-Risikomatrix — Phase 0

> Stand: 2026-07-08. Grundlage: FernUSG § 1: entgeltliche Vermittlung von Kenntnissen/Fähigkeiten, überwiegend räumlich getrennt, Überwachung des Lernerfolgs. Finale Einordnung nur extern.

| Feature | FernUSG-Risiko | Grund | Sichere Änderung | Status | Externe Freigabe nötig? | Datei/Route | Entscheidung |
|---|---|---|---|---|---|---|---|
| Verkauf digitales Übungsmaterial | mittel/hoch | Entgelt + asynchron/räumlich getrennt liegen nahe; Lernerfolgskontrolle entscheidet. | als Selbstlernmaterial ohne Betreuung positionieren | offen | ja | landing.html, sales-config.js | kein Live-Payment |
| Musterlösungen/Selbstkontrolle lokal | niedrig/mittel | automatische lokale Selbstkontrolle kann zulässig sein, aber ZFU-Auslegung prüfen. | localStorage-only, keine Anbieter-Auswertung | zulässig als Staging | ja | index.html, data/*.json | nur lokal/offline beim Nutzer |
| Fachliche Fragen per Bot/Emilia/Telegram/E-Mail | hoch/kritisch | individuelle Lernhilfe/Überwachung möglich. | bis Freigabe nur technischer Support | gesperrt | ja | Support-Flows | No-Go |
| Individuelle Korrektur/Feedback | kritisch | Lernerfolgskontrolle durch Anbieter. | nicht anbieten | gesperrt | ja | keine | No-Go |
| Serverseitiger Lernfortschritt/Dashboard | kritisch | Anbieter kann Lernerfolg überwachen. | keine Übermittlung; nur localStorage | gesperrt | ja | app/worker | No-Go |
| Zertifikat/Teilnahmebescheinigung/Kursabschluss | kritisch | formalisierter Lernerfolg/Teilnahme. | nicht anbieten | gesperrt | ja | keine | No-Go |
| Technischer Support | niedrig | kein Lernstoff, nur Zugang/Zahlung/Bedienung. | Support-Scope schriftlich begrenzen | offen | anwaltlich prüfen | support/legal | erlaubt im Staging |
| Marketing „Kurs/Coaching/Tutor“ | hoch | suggeriert Betreuung/Lehrgang. | durch „Selbstlernmaterial/Übungsaufgaben“ ersetzen | laufend prüfen | ja | landing/docs | No-Go bei Fund |
