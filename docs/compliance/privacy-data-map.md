# Privacy Data Map — DSGVO/TDDDG Phase 0

> Stand: 2026-07-08. Entwurf; tatsächliche Anbieter-/AVV-/Transferdaten fehlen. Keine personenbezogenen Daten in Git/Logs/Screenshots.

| Datenart | Zweck | Rechtsgrundlage Entwurf | Speicherort | Drittanbieter | Land/Transfer | AVV nötig? | Aufbewahrung | Löschung/Export | Schutzmaßnahme | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Käufer-E-Mail | Lizenzzustellung/Support | Vertrag Art. 6(1)(b) DSGVO | Digistore24/Worker KV geplant | Digistore24, Cloudflare, ggf. Gmail | zu prüfen | ja/prüfen | kauf-/steuerrechtlich prüfen | manuell/automatisiert planen | minimieren, keine Logs | offen |
| Lizenzcode/Hash | Zugangskontrolle | Vertrag/berechtigtes Interesse | Worker KV/D1 geplant | Cloudflare | zu prüfen | ja | Zugangsdauer + Missbrauchslogs | Revocation/Refund | Hash statt Klartext | offen |
| Zahlungsstatus/IPN | Freischaltung/Revocation | Vertrag/rechtliche Pflichten | Worker KV/D1 geplant | Digistore24/Cloudflare | zu prüfen | ja | steuer-/vertraglich prüfen | Ereignisprotokoll | Signatur/Idempotenz | rot bis Implementierung |
| IP-Adresse/Logs | Security/Rate Limit | berechtigtes Interesse | Cloudflare Logs | Cloudflare | zu prüfen | ja | kurz/minimal | Log-Rotation | keine PII-Exzesse | offen |
| localStorage Fortschritt | lokale Selbstkontrolle | Nutzerwunsch/technisch erforderlich | Nutzergerät | keiner | keiner | nein | bis Nutzer löscht | Export/Löschen in App | keine Anbieterübermittlung | gelb |
| Service Worker Cache | Offline/Public Shell | technisch erforderlich | Nutzergerät | keiner | keiner | nein | Cache-Version/Logout | Cache clear | protected Content nicht cachen | gelb |
| Analytics/Marketing | Conversion | Consent erforderlich | nicht aktivieren vor Consent | Anbieter offen | offen | ja | offen | Widerruf | Consent-Gate | gesperrt |
| Support-Anfragen | technischer Support | Vertrag/berechtigtes Interesse | Gmail/MCP geplant | Google | Drittland/AVV prüfen | ja | Supportfrist | manuell | keine Lernbewertung | offen |
| KI-Prompts | interne Erstellung/Support | je Zweck prüfen | Anbieter offen | OpenAI/o.ä. | Drittland/AVV prüfen | ja | minimal | Löschkonzept | keine Käufer-/Zahlungsdaten | gesperrt für Lernfeedback |
