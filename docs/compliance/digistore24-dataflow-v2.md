# Digistore24 Staging-Datenfluss

> Technischer Staging-Releasekandidat. Kein Liveverkauf und kein Produktionsdeployment.

## Aktivierung

1. Digistore24 erzeugt den `license_key` und sendet eine `application/x-www-form-urlencoded` Generic IPN an `POST /digistore/ipn`.
2. Der Worker prüft Bodygröße, eindeutige Parameternamen und die offizielle SHA-512-Signatur mit dem externen Secret `DIGISTORE_IPN_PASSPHRASE_TEST`.
3. Nur `api_mode=test` ist zulässig. `api_mode=live` endet immer mit `403 live_ipn_disabled`.
4. `product_id` muss in `DIGISTORE_PRODUCT_IDS` stehen und über `DIGISTORE_PRODUCT_PLANS` exakt auf `pro` oder `plus` abgebildet sein. `product_name` wird ignoriert.
5. `license_key`, `order_id`, `transaction_id` und `product_id` werden vor Persistenz gehasht. Rand-Whitespace am IPN-Lizenzschlüssel wird abgelehnt; Groß-/Kleinschreibung bleibt erhalten.
6. `CommerceCoordinator` serialisiert Event-, Order- und Lizenzclaims. `ACCESS_CODES` KV erhält nur die minimale Hash-/Statusprojektion; ein Retry nach einem partiellen KV-Write repariert den fehlenden Order-Index vor der Erfolgsquittung.
7. Erfolgreiche Verarbeitung antwortet exakt mit `Content-Type: text/plain` und Body `OK`.

## Persistenz

| Speicher | Schlüssel | Inhalt |
|---|---|---|
| KV | `code-hash:<SHA-256(license_key)>` | Plan, Orderhash, Status, `sessionVersion`, technische Zeitstempel |
| KV | `order:<SHA-256(order_id)>` | Lizenzhash und Plan |
| KV | `event:<SHA-256(transaction_id:event)>` | minimiertes hashiertes Ergebnis |
| Durable Object | `license:<licenseHash>` | exklusive Orderhash-Bindung |
| Durable Object | `order:<orderHash>` | Zustandsmaschinenstatus |
| Durable Object | `event:<eventHash>` | Fingerprint, HTTP-Status und minimiertes Ergebnis |

Klartext-Lizenzschlüssel, Käufer-E-Mail, rohe Order-ID und Signaturpassphrase werden nicht persistiert oder geloggt. Hashing ist Pseudonymisierung, keine Anonymisierung.

## Login und Widerruf

`POST /verify-code` hasht den case-sensitiven Digistore24-Schlüssel und gibt bei aktivem Datensatz einen kurzlebigen Bearer-Token mit `sessionVersion` aus. Geschützte Endpunkte vergleichen diese Version mit dem aktuellen KV-Datensatz. Refund, Chargeback und Payment-Missed erhöhen die Version und sperren vorhandene Tokens. Ein späteres gültiges Payment darf nur den nichtterminalen Payment-Missed-Zustand mit demselben Lizenzhash reaktivieren.
