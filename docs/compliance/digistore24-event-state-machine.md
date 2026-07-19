# Digistore24 Event-Zustandsmaschine

> Test/Staging only. `api_mode=live` bleibt gesperrt.

## Zustände

- `NONE`: keine bekannte Order
- `ACTIVE`: Lizenzhash ist aktiv
- `PAYMENT_MISSED`: Zugang gesperrt, aber nichtterminal
- `REFUNDED`: terminal gesperrt
- `CHARGEBACK`: terminal gesperrt
- `MANUAL_REVIEW`: Konflikt, fail-closed

## Übergänge

| Ist | Event | Bedingung | Soll | HTTP |
|---|---|---|---|---:|
| `NONE` | `on_payment` | erlaubte Produkt-ID, Mapping, neuer Lizenzhash | `ACTIVE` | 200 |
| `ACTIVE` | identisches Replay | gleicher Eventfingerprint | `ACTIVE`, keine Mutation | ursprünglicher Status |
| `ACTIVE` | `on_payment` | gleiche Order, gleicher Lizenzhash | `ACTIVE`, idempotent | 200 |
| `ACTIVE` | `on_payment` | gleiche Order, anderer Lizenzhash | `MANUAL_REVIEW`, Zugang sperren | 409 |
| beliebig | `on_payment` | Lizenzhash ist an andere Order gebunden | unverändert, blockiert | 409 |
| `ACTIVE` | `on_payment_missed` | valide signierte Order | `PAYMENT_MISSED`, Version +1 | 200 |
| `PAYMENT_MISSED` | `on_payment` | derselbe Lizenzhash | `ACTIVE`, Version +1 | 200 |
| `PAYMENT_MISSED` | `on_payment` | anderer Lizenzhash | `MANUAL_REVIEW` | 409 |
| `NONE`/`ACTIVE`/`PAYMENT_MISSED` | `on_refund` | valide signierte Order | `REFUNDED`, Version +1 | 200 oder 202 ohne vorhandenen Zugang |
| `NONE`/`ACTIVE`/`PAYMENT_MISSED` | `on_chargeback` | valide signierte Order | `CHARGEBACK`, Version +1 | 200 oder 202 ohne vorhandenen Zugang |
| `REFUNDED`/`CHARGEBACK`/`MANUAL_REVIEW` | jedes Revocation-Event | bereits terminal oder fail-closed | unverändert, keine Mutation des Zugangs | 200 |
| `REFUNDED`/`CHARGEBACK` | späteres `on_payment` | gleicher Lizenzhash | terminal, keine Reaktivierung | 200 |
| `REFUNDED`/`CHARGEBACK` | späteres `on_payment` | anderer Lizenzhash | `MANUAL_REVIEW` | 409 |
| beliebig | gleiche Event-ID, anderer Fingerprint | Payload-Konflikt | keine Mutation | 409 |

## Invarianten

1. Eine Order bindet höchstens einen Lizenzhash.
2. Ein Lizenzhash bindet höchstens eine Order.
3. Exaktes Replay mutiert nicht und erhält den ursprünglichen HTTP-Status.
4. Refund, Chargeback und Manual Review können durch spätere Revocation-Events nicht herabgestuft werden.
5. Jeder Sperr-/Reaktivierungsvorgang invalidiert ältere Sessions.
6. `product_name` ist niemals autorisierend.
7. Kein Klartextschlüssel wird in KV oder Durable Object geschrieben.
8. Ein Kauf-Retry repariert nach partiellem KV-Write den Order-Index, bevor er Erfolg quittiert.
