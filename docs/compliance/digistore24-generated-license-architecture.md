# Digistore24 Generated-License Architecture

## Verbindliche Entscheidung

Digistore24 erzeugt und versendet den Käufer-Lizenzschlüssel. Der Worker erzeugt im Commerce-Pfad keinen eigenen Käufercode und betreibt keinen eigenen produktiven Lizenzserver-Endpunkt.

Der einzige IPN-Endpunkt ist `POST /digistore/ipn`. Er akzeptiert ausschließlich signierte Test-IPNs. Der Klartextschlüssel wird case-sensitiv validiert, transient gehasht und nur als SHA-256-Referenz gespeichert. Käufer-E-Mail und `product_name` sind für die Autorisierung nicht erforderlich.

## Externe Staging-Konfiguration

- `DIGISTORE_PRODUCT_IDS`
- `DIGISTORE_PRODUCT_PLANS` im Format `product_id=pro|plus`
- `DIGISTORE_IPN_PASSPHRASE_TEST` als Cloudflare Secret

Es werden keine echten Werte committed. Fehlendes Planmapping liefert `503 product_plan_not_configured`. `DIGISTORE_API_MODE` ist in dieser Architektur nicht erforderlich; der signierte Payloadmodus `live` bleibt mit `403 live_ipn_disabled` gesperrt.

## Abgrenzung

Kein direkter PayPal-Webhook, kein echter Mailversand, kein produktiver Checkout, keine produktiven Käuferdaten und keine Live-IPN-Freigabe. Der getrennte Admin-Endpunkt für manuelle Stagingcodes ist nicht Teil des Digistore24-Käuferlizenzflusses.
