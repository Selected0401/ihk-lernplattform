# Subprocessor List Draft

> Stand: 2026-07-08. Entwurf; Rollen/AVV/Transfer vor Launch prüfen.

| Anbieter | Rolle | Daten | Transfer/Land | AVV/DPA | Status |
|---|---|---|---|---|---|
| GitHub Pages | Public Shell Hosting | öffentliche Seiten/Assets, keine Käuferdaten | USA/EU prüfen | prüfen | nur Public Shell erlaubt |
| Cloudflare Workers/KV/R2 | Auth/API/Content/Lizenz-Backend geplant | Lizenzstatus, IP, Logs, Content | prüfen | erforderlich | offen |
| Digistore24 | Checkout/Reseller/Payment | Käufer-/Zahlungsdaten, IPN | prüfen | Rolle/Vertrag prüfen | offen/rot |
| Google/Gmail/MCP | technischer Support/Code-Zustellung geplant | E-Mail, Supportinhalt | prüfen | erforderlich | Alex-Freigabe nötig |
| OpenAI/KI-Anbieter | optional/interne KI/Support | Prompts, ggf. keine PII | prüfen | erforderlich | nicht für Lernfeedback |
| Domain-/DNS-Anbieter | später Custom Domain | technische Daten | prüfen | offen | später |
