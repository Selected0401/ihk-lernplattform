# Accessibility/BFSG Audit — Phase 0

> Stand: 2026-07-08. Entwurf; BFSG-Anwendbarkeit/Kleinstunternehmer-Ausnahme extern prüfen. Ziel mindestens WCAG-nahe Qualität für Sales, Checkout, Login, App.

| Bereich | Prüfkriterien | Aktueller Status | Risiko | Maßnahme |
|---|---|---|---|---|
| Verkaufsseite | Semantik, Heading-Hierarchie, Kontrast, Zoom/Reflow, CTA-Fokus | nicht final geprüft | Conversion/Abmahnung | Browser/axe/Lighthouse Audit |
| Login | Labels, Fehlermeldungen, Tastatur, Screenreader | nicht final geprüft | Zugangshürde | Formular-A11y prüfen |
| App/Modals | Fokusfalle, aria-modal, close labels, Tastatur | bekanntes Audit-Thema | Nutzbarkeitsrisiko | Modal-A11y-Test |
| Rechtstexte | verständliche Sprache, Mobile Reflow | Entwurf | Verbraucherinfos schwer erreichbar | Legal-Seiten prüfen |
| Cookie-Einstellungen | zugänglich, widerrufbar | fehlt/Entwurf | Consent unwirksam | erst bei Tracking implementieren |
| Checkout | Digistore24 externer Flow | unbekannt | BFSG/Barrierefreiheit | Digistore24 prüfen |

## Fehlende Alex-Daten
- Unternehmensgröße/Mitarbeiterzahl, wirtschaftliche Rolle, BFSG-Ausnahme möglich?
- Geplanter Checkout-Anbieter und finaler Produktumfang.

## Launch-Gate
Kein bezahlter Launch ohne Accessibility-Smoke und kritische Fixes für Sales/Login/Checkout.
