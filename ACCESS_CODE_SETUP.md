# Zugangscode- und Zahlungs-Setup für die IHK Lernplattform

## Ziel

- Käufer zahlen einmalig 99€ als Launch-Angebot statt 399€ regulärem Wert über Digistore24 und erhalten danach automatisch einen Zugangscode per E-Mail. Zahlungsarten wie PayPal werden im Digistore24-Checkout aktiviert. Mit diesem Code öffnen sie `login.html` und werden zur Lernplattform freigeschaltet.

## Wichtig: MVP vs. echte Verkaufsversion

Der aktuelle Code-Login in `login.html` ist ein MVP-Prototyp. Die Codes stehen im Frontend und sind daher nicht dauerhaft sicher. Für einen echten Verkauf mit vielen Kunden sollte die Codeprüfung serverseitig laufen.

## Empfohlene Startstrategie

### Phase 1: Sofort testbarer MVP
- Verkaufsseite: `landing.html`
- Login: `login.html`
- Demo-Codes:
  - `IHK-2027-PRO`
  - `BUERO-99-START`
  - `BUERO-149-PLUS`
- Checkout-Link aktuell Platzhalter zu Digistore24: `https://www.digistore24.com/product/DEIN-PRODUKT-ID`.

Gut für:
- Layout testen
- Freunde/Beta-Tester freischalten
- Funnel prüfen

Nicht gut für:
- große Verkäufe
- echte Lizenzsicherheit

## Digistore24 Setup

1. Digistore24 Account erstellen
2. Produkt anlegen:
   - Name: IHK 80/20 Prüfungstrainer Büromanagement
   - Preis Launch: 99€ einmalig
   - Regulärer Wert/Ankerpreis: 399€ einmalig
   - Produkttyp: digitales Produkt / Online-Zugang
3. Auslieferungs-E-Mail einrichten:
   - Betreff: Dein Zugangscode zum IHK 80/20 Prüfungstrainer
   - Inhalt:
     - Danke für deinen Kauf
     - Login-Link: `https://selected0401.github.io/ihk-lernplattform/login.html`
     - Zugangscode: zunächst manuell/fester Code oder später individueller Code
4. Checkout-URL aus Digistore24 kopieren
5. In `landing.html` die Konstante `DIGISTORE24_CHECKOUT_URL` ersetzen.

## PayPal Setup

PayPal sollte für den öffentlichen Funnel nicht als separater Button gepflegt werden, sondern als Zahlungsart im Digistore24-Produkt aktiv sein. Dadurch bleiben Checkout, Rechnung, Auslieferungs-E-Mail und Zugangscode-Prozess an einer Stelle.

## Solide Automation

### Option A: Digistore24 + Make/Zapier + Google Sheet
- Digistore24 Kauf triggert Webhook
- Make/Zapier erzeugt Code
- Code wird in Google Sheet gespeichert
- E-Mail mit Code wird versendet
- Login müsste dann über einen kleinen Server/Worker den Code prüfen

### Option B: Digistore24 + Cloudflare Worker + KV/Supabase
- Digistore24 Webhook an Cloudflare Worker
- Worker erzeugt individuellen Code, z.B. `IHK-ABCD-1234`
- Code wird in KV/Supabase gespeichert
- Login fragt Worker API ab
- Worker antwortet gültig/ungültig

Empfohlen für echten Verkauf.

## Empfohlener Webseiten-Stack

Für den schnellen, aber professionellen Verkaufsstart:

1. **WordPress** als öffentliche Webseite
2. **Bricks Builder** für eine schnelle, hochwertige Landingpage
   - Alternative: Elementor Pro, wenn einfache Bedienung wichtiger ist als Performance
3. **Digistore24** für Checkout, Rechnung, Zahlungsabwicklung, Zahlungsarten und Affiliate-Programm
4. **FluentCRM** oder **MailPoet** für Follow-up-E-Mails
5. **PWA/Lernplattform separat lassen** auf GitHub Pages, Netlify oder später eigener Domain
6. **MemberPress erst später**, falls WordPress selbst einen Mitgliederbereich hosten soll

Minimaler Flow:
WordPress Landingpage → Digistore24 Checkout → Käufer erhält E-Mail mit Zugangscode → Login auf der PWA.

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

## Rechtliche Hinweise

- Nicht mit „originale IHK-Prüfungen“, „IHK-Prüfungsaufgaben“, „offizielle IHK-App“, „IHK-zertifiziert“ oder „echte Prüfungen“ werben, solange keine Lizenz vorliegt.
- Sicher formulieren: „eigene prüfungsnahe Übungsaufgaben im Stil typischer IHK-Anforderungen für Kaufleute für Büromanagement“.
- Disclaimer nutzen: „Dieses Angebot steht in keiner Verbindung zur Industrie- und Handelskammer oder zu einer offiziellen Prüfungsstelle.“
- Impressum, Datenschutz, AGB und Widerrufsbelehrung vor Verkauf erstellen lassen.
- Bei sofortigem digitalen Zugriff Widerrufsrecht sauber regeln lassen.

## Mitgelieferte Dateien

- `landing.html` — öffentliche Verkaufsseite
- `login.html` — Zugangscode-Eingabe
- `danke.html` — Danke-/Nachkaufseite
- `DIGISTORE24_COPY.md` — Produktbeschreibung, Checkout-Bullets und E-Mail-Vorlagen
- `cloudflare-worker/` — Worker-MVP für serverseitige Codeprüfung und Digistore24-Webhook

## Nächste technische Schritte

1. Digistore24 Produkt anlegen
2. Checkout-Link in `landing.html` ersetzen
3. Danke-/Auslieferungs-E-Mail aus `DIGISTORE24_COPY.md` übernehmen
4. Cloudflare Worker deployen und `ACCESS_API_URL` in `login.html` setzen
5. MVP mit 5–10 Testkäufern prüfen
6. Danach Worker/Supabase Lizenzprüfung härten
