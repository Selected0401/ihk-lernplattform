# AGB/Nutzungsbedingungen Skill

> Stand/Abrufdatum: 2026-07-08. Keine Rechtsberatung. Arbeitsentwurf für die IHK-Lernplattform; finale Prüfung durch Anwalt/ZFU/Datenschutz-/Payment-Fachstellen nötig.

## Zweck
Lizenz, Nutzungsrechte, Support-Grenzen, Haftung, digitale Inhalte. Ziel ist ein konservativer, dokumentierter, anwaltlich/ZFU-freigabefähiger Prüfrahmen vor jedem Launch.

## Anwendungsbereich für diese IHK-Lernplattform
Gilt für ein bezahltes oder potentiell bezahltes digitales Selbstlern-/Übungsmaterial für kaufmännische IHK-Prüfungsvorbereitung. GitHub Pages darf nur öffentliche Schale sein; geschützter Content muss serverseitig ausgeliefert werden.

## Betroffene Dateien/Flows
agb.html, landing.html, login.html, DIGISTORE24_COPY.md.

## Offizielle Quellenbasis mit Abrufdatum
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

## Prüfkriterien
- Entgeltlichkeit, räumliche Trennung, Lernerfolgskontrolle, Support-Grenzen, Payment-/Widerrufs-Flow und Datenschutzflüsse prüfen.
- Public Repo/Pages darf keine paid Aufgaben/Musterlösungen als abrufbare Assets enthalten.
- Rechtstexte müssen tatsächliche Datenflüsse spiegeln und Platzhalter klar markieren.
- Checkout darf nicht live gehen, solange FernUSG/ZFU, Datenschutz, Widerruf, Payment/IPN und Content-Schutz rot/offen sind.

## Technische Anforderungen
- Serverseitige Lizenzprüfung über Worker/Backend; keine Freischaltcodes im Frontend.
- Secrets nur als Worker-/Hosting-Secrets; keine Secrets/Käuferdaten in Git, Logs oder öffentlichen Issues.
- Rate-Limits, kurze Tokens/Sessions, Revocation/Refund und Idempotenz vorbereiten.
- Service Worker cached nur Public Shell; protected Content/API network-only/no-store/private.
- CORS strikt, keine Wildcards mit Credentials, Security Header/CSP/HSTS/Referrer/Permissions prüfen.

## Erlaubte Formulierungen
- „Unabhängiges digitales Selbstlern- und Übungsmaterial. Keine Verbindung zur IHK.“
- „Eigene prüfungsnahe Übungsaufgaben im Stil typischer Anforderungen.“
- „Musterlösungen zur eigenständigen Selbstkontrolle.“
- „Technischer Support zu Zugang, Zahlung und Bedienung.“
- „Keine Erfolgsgarantie, kein offizielles IHK-Material, kein Zertifikat.“

## Verbotene Formulierungen
- „offiziell“, „IHK-zertifiziert“, „staatlich/IHK anerkannt“, „Original-IHK-Aufgaben“.
- „garantiert bestehen“, „Bestehensgarantie“, „100% Erfolgsquote“.
- „persönliche Betreuung“, „Coaching“, „Tutor“, „wir korrigieren deine Lösungen“, „fachliche Fragen jederzeit“.
- „rechtssicher“, „hacker-sicher“, „0-Tage-Rückgabe“ ohne externe Freigabe.

## Rote Risiken
- Paid Content liegt in `data/`, `www/data/`, App-JS oder HTML öffentlich abrufbar.
- Lernstoff-Q&A, individuelle Bewertung/Korrektur oder Fortschrittsauswertung durch Anbieter/KI.
- Live-Digistore24 ohne IPN-Signaturprüfung, Idempotenz und Refund-Revocation.
- Platzhalter-Impressum/Datenschutz/AGB/Widerruf in öffentlichem Verkaufsfunnel.
- Käuferdaten, Codes, Tokens oder raw IPN payloads in Logs/Git.

## Launch-Blocker
- Ungelöstes FernUSG/ZFU-Risiko bei bezahltem Angebot.
- Geschützter Content im öffentlichen GitHub-Pages-Bundle.
- Keine serverseitige Lizenzprüfung und kein Content Backend.
- Nicht final geprüfte Rechtstexte und fehlende Anbieter-/VSBG-/Widerrufs-/Datenschutzdaten.
- Payment/IPN nur MVP oder Testmodus.

## Benötigte Alex-Daten
- Unternehmens-/Impressumsdaten, Rechtsform, Adresse, E-Mail, USt-ID/Register falls vorhanden.
- Digistore24 Rolle/Produkt-/Checkout-/Refund-/Widerrufseinstellungen.
- Preis, Zugangsdauer, Supportumfang, Mitarbeiterzahl/VSBG-Status.
- Hosting-/Cloudflare-/E-Mail-/KI-Anbieter und AVV/Datentransfer-Status.

## Benötigte externe Prüfung
- Anwaltliche Prüfung von FernUSG/ZFU, Verbraucherrecht, Rechtstexten, Widerruf, AGB, UWG/Claims.
- ZFU-Clearing vor bezahltem Launch, sofern Entgelt + asynchron + irgendeine Lernkontrolle/Betreuung möglich ist.
- Datenschutzprüfung inkl. AVV/Transfer/Logging und ggf. BFSG-/Accessibility-Fachprüfung.
- Digistore24/Payment-Freigabe inkl. IPN-Signatur und Widerrufsprozess.

## Status
Kritisch/offen: kein bezahlter Launch. Anwalt prüfen und ZFU prüfen. Technische Staging-Arbeiten erlaubt, wenn sie keine Live-Zahlung, keine Käuferdaten und keinen geschützten Content veröffentlichen.

## Multi-Agent-Prüfprotokoll
- Legal-Drafter erstellt Entwurf und Annahmen.
- Legal-Critic sucht Lücken und Widersprüche.
- Legal-Red-Team prüft aus Sicht ZFU, Datenschutzbehörde, Verbraucherzentrale, Abmahner, Käufer, Wettbewerber, IHK und Zahlungsanbieter.
- Security-Red-Team prüft Missbrauch, Hacks, Zahlungsbetrug, Content-Leaks, Logs und Secrets.
- Orchestrator markiert externe Rechtsfragen und blockiert Launch bei rot.

## Hinweis
Keine Rechtsberatung, keine Garantie auf Rechtssicherheit. Finale Prüfung durch Anwalt/ZFU nötig.
