# Digistore24 Testpay-Runbook

> Gesperrt bis zu einer separaten Staging-Deployment-Freigabe und bis alle vorherigen manuellen Einzelschritte bestätigt sind. Kein echter PayPal-Kauf.

## Voraussetzungen

- isolierter Staging-Commit und frische Testevidence
- getrennte Staging-KV- und Durable-Object-Bindings
- Produktallowlist und exaktes Planmapping im externen Store
- Testpassphrase ausschließlich im Cloudflare Secret Store
- `api_mode=live` weiterhin `403 live_ipn_disabled`
- Checkout, Paid Launch und Produktiv-IPN weiterhin gesperrt

## Späterer Testablauf

Jede Position wird einzeln freigegeben und dokumentiert:

1. Signierten Digistore24-Verbindungstest gegen die Staging-URL ausführen; Antwort exakt `OK` prüfen.
2. Testpay mit dem Digistore24-Testzahlweg ausführen; kein echtes PayPal verwenden.
3. Prüfen, dass Digistore24 den Lizenzschlüssel auf Bestätigungsseite und in seiner Mail ausliefert.
4. Mit genau diesem Schlüssel anmelden und einen geschützten Endpunkt abrufen.
5. Identische IPN erneut senden und Idempotenz prüfen.
6. Refund testen; bestehender Bearer-Token und erneuter Login müssen gesperrt sein.
7. Separat Chargeback testen; terminale Sperre prüfen.
8. `on_payment_missed` und Reaktivierung nur mit demselben Lizenzhash prüfen.
9. Staging-Logs auf Klartextschlüssel, Käufer-E-Mail, rohe Order-ID und Secretwerte prüfen.

## Abbruch

Bei abweichendem Content-Type/Body, unerwartetem HTTP-Status, Zustandskonflikt, Secret-/PII-Leak oder Liveannahme sofort stoppen. Kein Push, kein Produktionsdeployment und keine Livefreigabe ableiten.
