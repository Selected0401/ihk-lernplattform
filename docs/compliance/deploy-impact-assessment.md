# Deploy Impact Assessment — Phase 0

> Stand: 2026-07-09. Zweck: Auswirkungen eines Commits/Pushes/Deployments der aktuellen lokalen Public-Shell-Härtung. Keine Rechtsberatung.

## Kurzfazit

Der aktuelle lokale Stand ist als **öffentliche Shell** deutlich sicherer als der bisherige Live-/Repo-Stand, aber ein normaler Commit/Push löst nur die sichtbare GitHub-Pages-Auslieferung. Er löst **nicht** das Git-History-Problem: Das Repository ist öffentlich und frühere Commits enthalten weiterhin `data/`, `www/data/` und `references/`-Inhalte.

## Nachgewiesene Ist-Lage

- Remote: `git@github.com:Selected0401/ihk-lernplattform.git`
- GitHub API: Repository ist öffentlich (`visibility=public`, `private=false`).
- Historische Pfade im Git-Verlauf vorhanden:
  - `data/aufgaben-optimiert.json`
  - `data/aufgaben.json`
  - `data/ihk-recherche.json`
  - `data/lernfeld-1-3.json`
  - `data/lernfeld-4-6.json`
  - `www/data/aufgaben-optimiert.json`
  - `www/data/aufgaben.json`
  - `www/data/ihk-recherche.json`
  - `www/data/lernfeld-1-3.json`
  - `www/data/lernfeld-4-6.json`
  - `references/*.md` und `www/references/*.md`

## Auswirkungen eines normalen Commits + Push auf `main`

### Positive Auswirkungen

- GitHub Pages würde nach Deploy nicht mehr direkt die entfernten `data/*.json` und `www/data/*.json` aus dem aktuellen HEAD ausliefern.
- Die Verkaufsseite bleibt sichtbar, aber Checkout bleibt deaktiviert (`checkoutActive=false`, leere `checkoutUrl`).
- `login.html` bleibt fail-closed (`ACCESS_API_URL=''`, `VALID_CODES=[]`): keine öffentlichen Testcodes.
- App-Zugang bleibt gesperrt, solange kein echtes Backend aktiv ist.
- Service Worker cached lokal keine geschützten Datenpfade vor.
- Nutzer mit neuem Cache sehen eine rechtlich defensivere öffentliche Shell statt paid content.

### Negative/gewollte Nebenwirkungen

- Echte Käufer könnten sich noch nicht einloggen, weil `ACCESS_API_URL` und `CONTENT_API_URL` leer sind.
- Die Lernplattform wirkt für Besucher wie eine gesperrte Vorschau/Sales-Shell, nicht wie ein nutzbares Produkt.
- Alte Direktlinks auf `data/*.json` liefern nach Deploy voraussichtlich 404 oder alte CDN-/Browser-Cache-Versionen bis Cache-Ablauf.
- Nutzer mit altem Service Worker/Browsercache können temporär alte Assets sehen, bis SW/Cache aktualisiert oder gelöscht wird.
- GitHub Pages ist nicht sofort atomar: CDN/Browser können alten Stand noch kurz ausliefern.

### Nicht gelöste Risiken

- Öffentliche Git-History bleibt abrufbar. Löschen in HEAD entfernt Inhalte nicht aus früheren Commits.
- Falls die alten Inhalte als paid/protected Content gewertet werden, reicht ein normaler Push nicht für Paid-Launch-Readiness.
- FernUSG/ZFU, finale Rechtstexte, Datenschutz/AVV, Digistore24-Signatur und echte Backend-Staging-Smokes bleiben offen.

## Empfohlener Entscheidungsbaum

### Option A — Sofort normal pushen, um Live-Pages-Leak zu reduzieren

Geeignet, wenn das wichtigste Sofortziel ist: GitHub Pages soll nicht mehr direkt `data/*.json` aus aktuellem HEAD ausliefern.

Bleibendes Risiko: Public Git-History ist weiterhin ein Content-Leak. Paid Launch bleibt NO-GO.

### Option B — Vor Paid Launch Git-History bereinigen oder neues Public-Shell-Repo aufsetzen

Geeignet, wenn Inhalte als geschützte/pflichtige/verkaufbare Lerninhalte behandelt werden sollen.

Varianten:
1. **History Rewrite mit `git-filter-repo`**: alte Content-Pfade aus kompletter Historie entfernen, danach Force-Push. Stark, aber riskant und muss bewusst freigegeben werden.
2. **Neues sauberes Public-Shell-Repo**: sicherer und einfacher zu auditieren; altes Repo privat/archivieren, Pages auf neues Repo umziehen.
3. **Repo privat machen** und nur Pages/Backend sauber ausliefern, falls GitHub-Plan/Setup das zulässt.

### Option C — Kein Push, weiter lokal härten

Sicher für Repo-History, aber Live-GitHub-Pages kann bis dahin weiter alten Stand ausliefern.

## Meine technische Empfehlung

1. Mehr-Agenten-Review abwarten.
2. Wenn keine kritischen neuen Findings: **normalen Public-Shell-Commit + Push** machen, um die aktuelle GitHub-Pages-Auslieferung schnell zu entschärfen.
3. Direkt danach Live-Smoke mit Cachebuster:
   - `landing.html`, `login.html`, `sales-config.js`, `index.html`, `sw.js` HTTP 200.
   - `data/*.json` und `www/data/*.json` dürfen nicht mehr öffentlich erreichbar sein.
   - Checkout bleibt deaktiviert.
   - Login bleibt ohne lokale Codes.
4. Vor jedem Paid Launch zusätzlich eine bewusste Entscheidung zu Git-History treffen: History rewrite, neues sauberes Repo oder Repo privat.

## Hard Stop für Paid Launch

Paid Launch bleibt NO-GO, solange eines davon offen ist:

- Public Git-History enthält paid/protected Content.
- Live-GitHub-Pages nicht mit Cachebuster geprüft.
- `ACCESS_API_URL`/`CONTENT_API_URL` nicht auf getesteten Worker gesetzt.
- Offizielle Digistore24-IPN-/Webhook-Verifikation nicht implementiert und testgekauft.
- FernUSG/ZFU/Rechtstexte/Datenschutz nicht extern geklärt.
