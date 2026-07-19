# Digistore24 Staging-Gap-Matrix

| Bereich | Lokal nachweisbar | Extern noch offen | Gate |
|---|---|---|---|
| SHA-512 Generic IPN | Known-Answer, Manipulation, Duplicate/Ambiguität | reale Digistore24-Verbindung | Staging |
| Lizenzgenerierung | Digistore24-Key wird hash-only übernommen | Kontoeinstellung „von Digistore24 generiert“ | manuell 1 |
| Produktplan | `product_id=pro|plus`, fail-closed | Testprodukt-ID im Staging-Store | manuell 2 |
| Passphrase | Variablenname und Missing-Secret-Gate | Secret direkt im Cloudflare Store | manuell 3 |
| Eventzustand | Replay, Konflikt, Refund, Chargeback, Payment-Missed | reale Staging-IPNs | Staging |
| Login | aktiv/revoked und `sessionVersion` lokal | Testpay-Lizenz in Staging | Staging |
| Protokolle | Klartext-/PII-Leaktests lokal | reale Staging-Providerlogs | Staging |
| Checkout | technisch nicht aktiviert | Produkt-/Checkout-Freigaben | Live |
| Live-IPN | hart `403 live_ipn_disabled` | gesonderter Produktionsentwurf | Live |

Technische PASS-Ergebnisse sind keine Live- oder Launchfreigabe. Push und Deployment gehören nicht zu diesem Releasekandidaten-Auftrag.
