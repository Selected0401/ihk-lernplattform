# Cookie-/Tracking-Inventar — Phase 0

> Stand: 2026-07-08. Keine Analytics/Marketing-Cookies ohne Consent aktivieren. TDDDG § 25 beachten.

| Speicherung/Zugriff | Typ | Zweck | Consent nötig? | Datei/Flow | Status |
|---|---|---|---|---|---|
| localStorage Fortschritt | Endgerätezugriff | vom Nutzer gewünschte lokale Selbstkontrolle | eher technisch/funktional, final prüfen | App JS | offen |
| localStorage Login/Session/Preview | Endgerätezugriff | Zugang/Session | technisch erforderlich prüfen | login.html/app | nur serverseitig finalisieren |
| Service Worker Cache | Cache | Public Shell/Offline | technisch erforderlich für PWA, final prüfen | sw.js/www/sw.js | protected Content ausgeschlossen |
| Analytics | Tracking | Conversion/Marketing | ja, vor Consent verboten | nicht aktiv | gesperrt |
| Third-party checkout cookies | Drittanbieter | Digistore24 Checkout | Digistore24/Datenschutz prüfen | externer Checkout | offen |
| Support/Gmail | keine Cookiefunktion im Produkt | technischer Support | Datenschutzinfos nötig | Gmail/MCP | offen |
