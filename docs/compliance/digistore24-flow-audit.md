# Digistore24 Flow Audit — Phase 0

> Stand: 2026-07-08. Kein Live-Payment ohne Alex-Freigabe, FernUSG/ZFU-Clearing und IPN-Produktionshärtung.

| Flow | Aktueller Befund | Risiko | Maßnahme | Status |
|---|---|---|---|---|
| Checkout | `sales-config.js` hat Checkout deaktiviert/keine echte URL | sicher für Staging, nicht launchfähig | echte Digistore24 Test-/Live-URL erst nach Gates | rot für Launch |
| IPN/Webhook | Generic-IPN SHA-512, Duplicate-/Ambiguitätsprüfung, Replay und Konflikterkennung lokal implementiert | reale Staging- und Provider-Evidence fehlt | nur Testmodus verbinden und extern verifizieren | gelb |
| Lizenzcode | Digistore24 erzeugt `license_key`; Worker speichert ausschließlich den case-sensitiven SHA-256-Hash | echte Digistore24-Lizenzlieferung noch unbewiesen | Kontoeinstellung einzeln bestätigen, danach Testpay | gelb |
| Refund/Chargeback | terminale Zustände, Hash-Widerruf und `sessionVersion` lokal getestet | keine externe Staging-Evidence | Staging-Refund-/Chargeback-Test ohne Livefreigabe | gelb |
| Käuferdaten | Käufer-E-Mail, Klartextschlüssel und rohe Order-ID werden im Commerce-State und in Worker-Logs nicht benötigt | externe Providerlogs sind lokal nicht prüfbar | Staging-Logs technisch auf PII-Leaks prüfen | gelb |
| Widerruf | Digistore24 Rolle/Consent unklar | Verbraucherrechtsrisiko | Reseller-/Vendor-Flow prüfen | rot |
