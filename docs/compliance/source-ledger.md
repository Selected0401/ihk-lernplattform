# Source Ledger — IHK-Lernplattform Phase 0

> Stand/Abrufdatum: 2026-07-08. Quellenledger für Risikoanalyse, keine Rechtsberatung. Bei Widerspruch gilt die konservativste risikominimierende Auslegung bis zur externen Freigabe.

| Bereich | Quelle | Abrufdatum | Relevanz/Status |
|---|---|---:|---|
| FernUSG § 1, § 7, § 12, § 16, § 21 | https://www.gesetze-im-internet.de/fernusg/BJNR025250976.html | 2026-07-08 | Begriff Fernunterricht, Zulassung, Nichtigkeit/Bußgeld; für finale Einordnung Anwalt/ZFU nötig. |
| ZFU FAQ | https://zfu.de/veranstaltende/faq | 2026-07-08 | ZFU-Auslegung zu Fernunterricht/Zulassung; einzelne FAQ-Inhalte teils in Bearbeitung, daher konservativ prüfen. |
| BGH Online-Coaching/FernUSG III ZR 109/24 | https://dejure.org/dienste/vernetzung/rechtsprechung?Gericht=BGH&Datum=12.06.2025&Aktenzeichen=III%20ZR%20109%2F24 | 2026-07-08 | Rechtsprechungsbezug zu Online-Coaching/FernUSG; genaue Urteilsgründe extern prüfen. |
| DDG § 5 | https://www.gesetze-im-internet.de/ddg/__5.html | 2026-07-08 | Anbieterkennzeichnung: leicht erkennbar, unmittelbar erreichbar, ständig verfügbar. |
| BGB § 312j | https://www.gesetze-im-internet.de/bgb/__312j.html | 2026-07-08 | Button-Lösung und Pflichtinformationen vor zahlungspflichtiger Bestellung. |
| BGB § 356 | https://www.gesetze-im-internet.de/bgb/__356.html | 2026-07-08 | Widerruf digitale Inhalte; Erlöschen nur unter strengen Voraussetzungen. |
| PAngV 2022 | https://www.gesetze-im-internet.de/pangv_2022/ | 2026-07-08 | Gesamtpreise/Preisangaben/Zusatzkosten. |
| VSBG § 36/37 | https://www.gesetze-im-internet.de/vsbg/__36.html / https://www.gesetze-im-internet.de/vsbg/__37.html | 2026-07-08 | Verbraucherstreitbeilegung; Mitarbeiter-/Teilnahme-Status als Alex-Daten nötig. |
| EU ODR eingestellt | https://consumer-redress.ec.europa.eu/site-relocation_en | 2026-07-08 | ODR-Plattform seit 20.07.2025 geschlossen; alte ODR-Links nicht einbauen. |
| DSGVO | https://eur-lex.europa.eu/eli/reg/2016/679/oj | 2026-07-08 | Rechtsgrundlagen, Informationspflichten, Betroffenenrechte, AVV/Transfers. |
| TDDDG § 25 | https://www.gesetze-im-internet.de/ttdsg/__25.html | 2026-07-08 | Endgerätezugriff/localStorage/Cookies; Consent vs. technisch erforderlich. |
| BFSG | https://www.gesetze-im-internet.de/bfsg/ | 2026-07-08 | Barrierefreiheit elektronischer Dienstleistungen/Online-Shop prüfen. |
| EU AI Act | https://eur-lex.europa.eu/eli/reg/2024/1689/oj | 2026-07-08 | KI-Inventar, Transparenz/AI-Literacy, Risikoklassen prüfen. |
| Digistore24 IPN | https://help.digistore24.com/hc/en-us/articles/23704756592785-IPN-What-is-it-and-how-does-it-work-at-Digistore24 | 2026-07-08 | IPN meldet Payment/Refund/Chargeback; PII-Minimierung und Idempotenz nötig. |
| Digistore24 Quick Integration | https://dev.digistore24.com/hc/en-us/articles/32480217565969-Quick-Integration-Guide | 2026-07-08 | IPN password/SHA_PASSPHRASE/Test connection; Signatur/Passphrase produktionsrelevant. |
| Cloudflare Workers Secrets | https://developers.cloudflare.com/workers/configuration/secrets/ | 2026-07-08 | Secrets als verschlüsselte Worker-Bindings, nicht im Repo. |
| Cloudflare KV/R2 | https://developers.cloudflare.com/kv/ / https://developers.cloudflare.com/r2/ | 2026-07-08 | Geschützte Lizenz-/Content-Speicherung; R2 public buckets vermeiden. |
| OWASP Web Top 10 | https://owasp.org/www-project-top-ten/ | 2026-07-08 | Security-Risiken Web-App. |
| OWASP API Top 10 2023 | https://owasp.org/API-Security/editions/2023/en/0x11-t10/ | 2026-07-08 | BOLA, Auth, Resource Consumption, Unsafe API Consumption. |
| GitHub Pages | https://docs.github.com/en/pages | 2026-07-08 | Static public hosting; kein Schutz für paid content im Repository/Pages-Bundle. |

## Quellenhierarchie
1. Amtliche Gesetzestexte und EU-Verordnungen.
2. ZFU, BGH/Rechtsprechung, EU-Kommission, Datenschutz-/Barrierefreiheits-Fachstellen.
3. Offizielle Anbieter-Dokumentationen: Digistore24, Cloudflare, GitHub.
4. Seriöse Kanzlei-/IHK-/Fachartikel nur ergänzend.
5. Bei Widerspruch: STOPP, konservativ prüfen, Anwalt/ZFU fragen.

## Nicht abschließend geklärt
- Genaue FernUSG-/ZFU-Einordnung dieses konkreten Produkts und Supportumfangs.
- Digistore24-Reseller-/Vendor-Rolle, Widerrufsflow und finale IPN-Signaturdetails im Account.
- BFSG-Anwendbarkeit/Kleinstunternehmer-Ausnahme und notwendige Umsetzungsdetails.
- AI-Act-Pflichten, falls Emilia/KI später Nutzerkontakt oder Lernfeedback erhält.
