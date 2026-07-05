# Zugangscode- und Zahlungs-Setup für die IHK Lernplattform

## Ziel

Käufer zahlen einmalig 99€ oder 149€ über Digistore24 oder PayPal und erhalten danach automatisch einen Zugangscode per E-Mail. Mit diesem Code öffnen sie `login.html` und werden zur Lernplattform freigeschaltet.

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
- Checkout-Links aktuell Platzhalter zu Digistore24/PayPal.

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
   - Späterer Preis: 149€ einmalig
   - Produkttyp: digitales Produkt / Online-Zugang
3. Auslieferungs-E-Mail einrichten:
   - Betreff: Dein Zugangscode zum IHK 80/20 Prüfungstrainer
   - Inhalt:
     - Danke für deinen Kauf
     - Login-Link: `https://selected0401.github.io/ihk-lernplattform/login.html`
     - Zugangscode: zunächst manuell/fester Code oder später individueller Code
4. Checkout-URL aus Digistore24 kopieren
5. In `landing.html` die Platzhalter-Links `https://www.digistore24.com/` ersetzen.

## PayPal Setup

Einfacher Start:
1. PayPal Business Konto
2. PayPal Button oder Zahlungslink für 99€ erstellen
3. Käufer landet nach Zahlung auf einer Danke-Seite oder erhält manuell eine E-Mail

Nachteil:
- Zugangscode-Automation ist ohne Zusatztool schwächer als bei Digistore24.

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

- Nicht mit „originale IHK-Prüfungen“ werben, solange keine Lizenz vorliegt.
- Sicher formulieren: „eigene prüfungsnahe Übungsaufgaben im Stil typischer IHK-Anforderungen“.
- Impressum, Datenschutz, AGB und Widerrufsbelehrung vor Verkauf erstellen lassen.
- Bei sofortigem digitalen Zugriff Widerrufsrecht sauber regeln lassen.

## Nächste technische Schritte

1. Digistore24 Produkt anlegen
2. Checkout-Link in `landing.html` ersetzen
3. Danke-/Auslieferungs-E-Mail formulieren
4. MVP mit 5–10 Testkäufern prüfen
5. Danach Worker/Supabase Lizenzprüfung bauen
