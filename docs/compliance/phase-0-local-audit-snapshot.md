# Phase 0 Local Audit Snapshot — MASTERPROMPT V3.0

> Stand: 2026-07-08. Automatisch aktualisierter technischer Snapshot nach Subagent-Funden und lokalen Fixes. Keine Rechtsberatung; rote Befunde blockieren paid launch.

## A) Sync-/Deploy-Status
- live `/`: HTTP 200, 54244 bytes
- live `landing.html`: HTTP 200, 18385 bytes
- live `login.html`: HTTP 200, 5174 bytes
- live `sales-config.js`: HTTP 200, 446 bytes
- live `sw.js`: HTTP 200, 15721 bytes
- live `data/aufgaben-optimiert.json`: HTTP 200, 63411 bytes
- live `www/data/aufgaben-optimiert.json`: HTTP 200, 63411 bytes
- live `login.html`: frontend VALID_CODES_nonempty=True
- live `sw.js`: compliance_phase0=False, caches_data_json=True
- Subagent-Befund eingearbeitet: iOS public login drift lokal behoben; live bleibt alt bis Deploy.
- Browser live landing/login: 0 JS-Fehler; live Login enthält weiterhin alten Frontend-Code, weil lokale Fixes nicht deployed sind.

## B) Secret-Scan Ergebnis
- High-signal Treffer außerhalb `.git`/`node_modules`: 0
- Gitleaks/TruffleHog sind nicht installiert; Git-History ist noch nicht forensisch gescannt. Vor Release nachholen.

## C) Public-Content-Leak Ergebnis
- `data`: 5 Dateien, 200846 bytes — ROT für paid launch.
  - `data/aufgaben-optimiert.json` 73085 bytes
  - `data/lernfeld-4-6.json` 52374 bytes
  - `data/lernfeld-1-3.json` 40290 bytes
  - `data/aufgaben.json` 20166 bytes
  - `data/ihk-recherche.json` 14931 bytes
- `www/data`: 5 Dateien, 200846 bytes — ROT für paid launch.
  - `www/data/aufgaben-optimiert.json` 73085 bytes
  - `www/data/lernfeld-4-6.json` 52374 bytes
  - `www/data/lernfeld-1-3.json` 40290 bytes
  - `www/data/aufgaben.json` 20166 bytes
  - `www/data/ihk-recherche.json` 14931 bytes
- `ios/App/App/public/data`: 5 Dateien, 200846 bytes — ROT für paid launch.
  - `ios/App/App/public/data/aufgaben-optimiert.json` 73085 bytes
  - `ios/App/App/public/data/lernfeld-4-6.json` 52374 bytes
  - `ios/App/App/public/data/lernfeld-1-3.json` 40290 bytes
  - `ios/App/App/public/data/aufgaben.json` 20166 bytes
  - `ios/App/App/public/data/ihk-recherche.json` 14931 bytes
- live `data/aufgaben-optimiert.json`: HTTP 200 size=63411 — öffentlich abrufbar.
- live `www/data/aufgaben-optimiert.json`: HTTP 200 size=63411 — öffentlich abrufbar.

## D) Access/Checkout/Auth
- sales-config.js: checkoutActive=false, checkoutUrl_set=False
- login.html: ACCESS_API_URL_set=False, VALID_CODES_nonempty=False, error_a11y_alert=True
- www/login.html: ACCESS_API_URL_set=False, VALID_CODES_nonempty=False, error_a11y_alert=True
- ios/App/App/public/login.html: ACCESS_API_URL_set=False, VALID_CODES_nonempty=False, error_a11y_alert=True
- worker query_secret_removed: True
- worker raw_payload_removed: True
- worker cors_not_star: True
- worker authorization_header_present: True
- worker no_store_marker: False
- worker rate_limit_marker: True
- worker idempotency_marker: True

## E) Service Worker / PWA Cache
- sw.js: version=emilia-lernplattform-v2.0.7-compliance-phase0, precache_data_json=False, NETWORK_ONLY_marker=True, ignoreSearch=True
- www/sw.js: version=emilia-lernplattform-v2.0.7-compliance-phase0, precache_data_json=False, NETWORK_ONLY_marker=True, ignoreSearch=True

## F) Legal Pages / Platzhalter
- Platzhalter-/TODO-Treffer in Legal-Seiten: 16
- `impressum.html:14` <p class="notice">Platzhalter vor öffentlichem Verkauf ersetzen: Name, ladungsfähige Anschrift, Kontakt, ggf. USt-ID/Gewerbeangaben müssen v
- `impressum.html:16` <p>Alex [Nachname einfügen]<br>[Straße und Hausnummer]<br>[PLZ und Ort]<br>Deutschland</p>
- `impressum.html:18` <p>E-Mail: [Support-E-Mail einfügen]<br>Telefon: [optional einfügen]</p>
- `impressum.html:20` <p>Alex [Nachname einfügen], Anschrift wie oben.</p>
- `datenschutz.html:14` <p class="notice">Platzhalter vor öffentlichem Verkauf mit echten Anbieter- und Dienstleisterdaten prüfen lassen. Zahlungsdaten werden beim
- `datenschutz.html:16` <p>Alex [Nachname und Anschrift einfügen], E-Mail: [Datenschutz-E-Mail einfügen]</p>
- `agb.html:14` <p class="notice">Entwurf/Platzhalter. Vor echten Verkäufen rechtlich prüfen lassen und mit Digistore24-Produkteinstellungen abgleichen.</p>
- `widerruf.html:19` <p>[Support-E-Mail einfügen]</p>
- `www/impressum.html:14` <p class="notice">Platzhalter vor öffentlichem Verkauf ersetzen: Name, ladungsfähige Anschrift, Kontakt, ggf. USt-ID/Gewerbeangaben müssen v
- `www/impressum.html:16` <p>Alex [Nachname einfügen]<br>[Straße und Hausnummer]<br>[PLZ und Ort]<br>Deutschland</p>
- `www/impressum.html:18` <p>E-Mail: [Support-E-Mail einfügen]<br>Telefon: [optional einfügen]</p>
- `www/impressum.html:20` <p>Alex [Nachname einfügen], Anschrift wie oben.</p>
- `www/datenschutz.html:14` <p class="notice">Platzhalter vor öffentlichem Verkauf mit echten Anbieter- und Dienstleisterdaten prüfen lassen. Zahlungsdaten werden beim
- `www/datenschutz.html:16` <p>Alex [Nachname und Anschrift einfügen], E-Mail: [Datenschutz-E-Mail einfügen]</p>
- `www/agb.html:14` <p class="notice">Entwurf/Platzhalter. Vor echten Verkäufen rechtlich prüfen lassen und mit Digistore24-Produkteinstellungen abgleichen.</p>
- `www/widerruf.html:19` <p>[Support-E-Mail einfügen]</p>

## G) Risky Claim / Public Metadata Residuals
- Kritische Runtime-/Manifest-Treffer nach lokaler Härtung: 0
- Keine Treffer für `Erfolgsquote`, `100% kostenlos`, `Persönliche Coach`, `IHK Prüfungssimulation`, `IHK Lernplattform` in den geprüften Runtime-/Manifest-Dateien.

## H) Automatisches Fazit
- Verbessert: iOS-Testcode entfernt, Login-Fehler und Checkout-Warnung mit ARIA-Live versehen, Coach-/Erfolgs-/Kostenlos-Claims in App-Alerts entfernt, App-/Manifest-Metadaten defensiver benannt.
- NO-GO bleibt: FernUSG/ZFU ungeklärt, public content leak, kein produktives Lizenzbackend/IPN/Widerrufsflow, Rechtstexte/DSGVO/BFSG offen, live nicht deployed.
