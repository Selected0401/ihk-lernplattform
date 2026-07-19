# Digistore24 Staging-Setup-Runbook

> Noch nicht ausführen, außer dem jeweils ausdrücklich freigegebenen Einzelschritt. Keine geheimen Werte in Chat, Git, Screenshots oder Handoffs übertragen.

## Aktuell einzige manuelle Aufgabe

Digistore24 öffnen:

`Meine Produkte → Produktliste → gewünschtes Testprodukt → Ausliefern → Lizenzschlüssel`

Dann „von Digistore24 generiert“ auswählen.

Danach ausschließlich bestätigen:

`DIGISTORE-LIZENZSCHLÜSSEL VON DIGISTORE24 GENERIERT AUSGEWÄHLT`

Falls das Menü anders heißt, nur die sichtbaren Optionsbezeichnungen nennen. Keine Produkt-ID, Passphrase, API-Keys, Käuferdaten oder Screenshots mit Secrets senden.

## Gesperrte Folgeschritte

Diese Schritte werden später einzeln freigegeben, niemals gebündelt:

1. Testprodukt-ID in den Staging-Variablenstore eintragen.
2. `DIGISTORE_PRODUCT_PLANS` setzen.
3. `DIGISTORE_IPN_PASSPHRASE_TEST` direkt im Cloudflare Secret Store setzen.
4. Generic-IPN-Verbindung in Digistore24 erstellen.
5. Staging-Postback-URL `/digistore/ipn` eintragen.
6. Verbindungstest.
7. Testpay-Kauf, kein echtes PayPal.
8. Lizenzcode auf Bestätigungsseite und in Mail prüfen.
9. Login testen.
10. Refund-/Chargeback-Widerruf testen.

Keiner dieser Folgeschritte ist durch den lokalen Commit oder lokale Tests freigegeben.
