# Digistore24 Flow Audit — Phase 0

> Stand: 2026-07-08. Kein Live-Payment ohne Alex-Freigabe, FernUSG/ZFU-Clearing und IPN-Produktionshärtung.

| Flow | Aktueller Befund | Risiko | Maßnahme | Status |
|---|---|---|---|---|
| Checkout | `sales-config.js` hat Checkout deaktiviert/keine echte URL | sicher für Staging, nicht launchfähig | echte Digistore24 Test-/Live-URL erst nach Gates | rot für Launch |
| IPN/Webhook | Query-Secret entfernt; Bearer-Header MVP | keine offizielle Signatur/Replay/Idempotenz final | Digistore24 SHA_PASSPHRASE/IPN-Signatur, Event-ID, Test purchase | rot |
| Lizenzcode | Frontendcodes deaktiviert; Backend/KV nicht live konfiguriert | Käufer können nicht freigeschaltet werden | serverseitige Codegenerierung, Hash, Rate-Limit, Revocation | rot |
| Refund/Chargeback | nur vorbereitet/dokumentiert | bezahlter Nutzer behält ggf. Zugriff | Revocation-Flow implementieren/testen | rot |
| Käuferdaten | keine finalisierte Privacy Map/AVV | DSGVO-Risiko | Datenminimierung/Logs/AVV | offen |
| Widerruf | Digistore24 Rolle/Consent unklar | Verbraucherrechtsrisiko | Reseller-/Vendor-Flow prüfen | rot |
