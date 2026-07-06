# Zugangscode- und Zahlungs-Setup für die IHK Lernplattform

## Ziel

Käufer zahlen einmalig 99€ als Launch-Angebot über Digistore24 und erhalten danach automatisch einen individuellen Zugangscode per E-Mail. Zahlungsarten wie PayPal werden im Digistore24-Checkout aktiviert. Mit dem Code öffnen sie `login.html` und werden zur Lernplattform freigeschaltet.

## Aktueller Sicherheitsstand

Öffentliche Frontend-Testcodes sind deaktiviert. `login.html` akzeptiert ohne konfigurierte Server-API keine lokalen Demo-Codes. Für echten Verkauf muss die Codeprüfung serverseitig laufen.

## Empfohlener Launch-Flow

1. Digistore24 Produkt anlegen.
2. Cloudflare Worker oder Supabase/API für Lizenzcodes deployen.
3. Digistore24 Webhook/IPN mit dem Backend verbinden.
4. In `login.html` und `www/login.html` `ACCESS_API_URL` auf den Verify-Endpunkt setzen.
5. In `sales-config.js` und `www/sales-config.js` den echten Digistore24-Bestellformular-Link eintragen und `checkoutActive: true` setzen.
6. Testkauf durchführen: Checkout → Danke-Seite → E-Mail/Code → Login → Plattformzugang.

## Digistore24 Setup

1. Digistore24 Account erstellen.
2. Produkt anlegen:
   - Name: IHK 80/20 Prüfungstrainer Büromanagement
   - Preis Launch: 99€ einmalig
   - Regulärer Wert/Ankerpreis nur verwenden, wenn rechtlich sauber belegbar: 399€ einmalig
   - Produkttyp: digitales Produkt / Online-Zugang
3. Danke-/Return-URL setzen:
   - `https://selected0401.github.io/ihk-lernplattform/danke.html`
4. Auslieferungs-E-Mail einrichten:
   - Betreff: Dein Zugangscode zum IHK 80/20 Prüfungstrainer
   - Login-Link: `https://selected0401.github.io/ihk-lernplattform/login.html`
   - Zugangscode aus Backend/Webhook einfügen
   - Supportkontakt und Widerrufs-/Refund-Hinweis ergänzen
5. Checkout-URL aus Digistore24 kopieren.
6. Checkout-URL in `sales-config.js` eintragen, nicht direkt in `landing.html`.

## PayPal Setup

PayPal nicht als separaten Button einbauen. PayPal soll als Zahlungsart im Digistore24-Produkt aktiv sein, damit Checkout, Rechnung, Affiliate-Tracking und Auslieferungs-E-Mail an einer Stelle bleiben.

## Code-Backend Optionen

### Option A: Digistore24 + Make/Zapier + Google Sheet

- Digistore24 Kauf triggert Webhook.
- Make/Zapier erzeugt Code.
- Code wird gespeichert.
- Login fragt einen kleinen Server/Worker ab.

### Option B: Digistore24 + Cloudflare Worker + KV/Supabase

- Digistore24 Webhook an Cloudflare Worker.
- Worker erzeugt individuellen Code, z. B. `IHK-ABCD-1234`.
- Code wird in KV/Supabase gespeichert.
- Login fragt Worker API ab.
- Worker antwortet gültig/ungültig.

Empfohlen für echten Verkauf.

## Code-Format

Beispiele:
- `IHK-2027-8F3K`
- `BUERO-PRO-9X2A`
- `IHK-PLUS-L7Q4`

Regeln:
- groß schreiben
- Bindestriche
- keine Sonderzeichen
- jeder Käufer bekommt eigenen Code
- Code kann optional Ablaufdatum haben
- Code muss widerrufbar/sperrbar sein

## Rechtliche Hinweise

- Nicht mit „originale IHK-Prüfungen“, „IHK-Prüfungsaufgaben“, „offizielle IHK-App“, „IHK-zertifiziert“ oder „echte Prüfungen“ werben, solange keine Lizenz vorliegt.
- Sicher formulieren: „eigene prüfungsnahe Übungsaufgaben im Stil typischer IHK-Anforderungen für Kaufleute für Büromanagement“.
- Disclaimer nutzen: „Dieses Angebot steht in keiner Verbindung zur Industrie- und Handelskammer oder zu einer offiziellen Prüfungsstelle.“
- Impressum, Datenschutz, AGB und Widerrufsbelehrung vor Verkauf finalisieren lassen.
- Bei sofortigem digitalen Zugriff Widerrufsrecht/Verzicht sauber in Digistore24 und auf der Seite konsistent regeln.

## Mitgelieferte Dateien

- `landing.html` — öffentliche Verkaufsseite
- `sales-config.js` — Checkout-Konfiguration
- `login.html` — Zugangscode-Eingabe
- `danke.html` — Danke-/Nachkaufseite
- `DIGISTORE24_COPY.md` — Produktbeschreibung, Checkout-Bullets und E-Mail-Vorlagen
- `cloudflare-worker/` — Worker-MVP für serverseitige Codeprüfung und Digistore24-Webhook

## Vor öffentlichem Verkauf zwingend erledigen

1. Echte Anbieterangaben in Impressum/Datenschutz/AGB/Widerruf eintragen.
2. Checkout-Link und Backend-URL konfigurieren.
3. Öffentlichen Live-Smoke mit Testkauf durchführen.
4. Ungültigen Code testen: muss abgelehnt werden.
5. Gültigen Code testen: muss Zugang gewähren.
6. Digistore24-E-Mail, Rechnung, Danke-Seite und Login zusammen prüfen.
