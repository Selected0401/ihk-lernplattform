---
name: ihk-lernplattform
description: "Vollständige Lernplattform für IHK Zwischenprüfung Kaufmann für Büromanagement - Teil 1 Informationstechnisches Büromanagement"
version: 1.0.0
author: Emilia
---

# IHK Lernplattform - Kaufleute für Büromanagement Teil 1

## Ziel
Maximaler Lernerfolg bis Februar 2027 für die gestreckte Abschlussprüfung Teil 1: Informationstechnisches Büromanagement (120 Minuten, computergestützt).

## Struktur
Die Plattform nutzt folgende Skills in Kombination:
- `morning-command-center` - Tägliche Lern-Priorität
- `long-running-goal-builder` - Lernplan über Monate
- `memory-wiki` - Fortschritt & Wissensspeicher
- `skill-building-loop` - Kontinuierliche Optimierung
- `content-intelligence-workflow` - Lern-Content Recherche

## Prüfungsinhalte (Teil 1)
### Word (Textverarbeitung)
- DIN 5008 Geschäftsbriefe, E-Mails, Memos, Protokolle
- Serienbriefe (Datenquelle, Felder, Vorschau, Druck)
- Formulare (Felder, Dropdown, Checkboxen, Schutz)
- Dokumentvorlagen (.dotx, Formatvorlagen)
- Änderungen nachverfolgen, Kommentare
- Inhaltsverzeichnis automatisch

### Excel (Tabellenkalkulation) - KEIN Taschenrechner!
- SVERWEIS / XVERWEIS (exakt/ungefähr, WENNFEHLER)
- WENN, WENNS, verschachtelte WENN
- SUMMEWENN/S, ZÄHLENWENN/S
- Pivot-Tabellen (Gruppieren, berechnete Felder, Slicer)
- Bedingte Formatierung (Regeln, Datensymbole, Farbskalen)
- Datentools (Text in Spalten, Duplikate, Datenüberprüfung)
- Bezugsarten (relativ, absolut $, gemischt, 3D)

### PowerPoint (Präsentationsgrafik)
- Folienmaster (Layouts, Platzhalter, Farbschemata)
- Animationen & Übergänge
- Diagramme & SmartArt
- Verknüpfte Excel-Objekte

### Outlook
- Regeln & QuickSteps
- Kalender (Serien, Freigabe, Ressourcen)
- Aufgaben & To-Do
- Kontakte & Verteilerlisten

## Hilfsmittel in der Prüfung
- Unkommentiertes Rechtschreibwörterbuch (gedruckt)
- DIN 5008 (gedruckt)
- KEIN Taschenrechner

## Lernphasen (24 Wochen bis Februar 2027)

### Phase 1: Grundlagen (Woche 1-4)
- DIN 5008 auswendig
- Excel-Basics: Bezüge, Formatierung, einfache Formeln
- Word: Formatvorlagen, Serienbriefe
- PowerPoint: Master, Animationen

### Phase 2: Kern-Themen (Woche 5-12)
- TÄGLICH: 3 SVERWEIS/XVERWEIS Übungen
- WENN-Funktionen komplett
- Pivot-Tabellen von 0 auf Profi
- Word: Komplexe Dokumente

### Phase 3: Prüfungssimulation (Woche 13-20)
- Echte AKA-Musteraufgaben (120 Min Timer)
- Zeitmanagement trainieren
- Fehleranalyse & Nachbessern

### Phase 4: Feinschliff (Woche 21-24)
- Schwachstellen gezielt
- Tastaturkürzel automatisieren
- Mentale Vorbereitung

## Offizielle Quellen
- AKA Musteraufgaben: https://www.ihk-aka.de/aktuelles/kbm
- Befehlsübersicht Word/Excel: AKA Homepage
- NÜRA Datensammlung (Musterunternehmen)
- IHK Köln Prüfungskatalog
- U-Form Verlag Materialien

## Automatisierung via Cron-Jobs
- Täglich 07:00: Morning Command Center → Lern-Priorität
- Mo/Mi/Fr 18:00: Content Intelligence → Übungsaufgaben generieren
- Sonntag 20:00: Memory Wiki Update → Fortschritt speichern
- Sonntag 21:00: Skill-Building Loop → Lernstrategie optimieren
- Täglich 20:30: Abendreflexion → Tages-Review

## Deployment als kostenlose PWA (Progressive Web App)

### Lokale Entwicklung
```bash
cd /opt/data/emilia-lernplattform
python3 -m http.server 8080 --bind 0.0.0.0
# Zugriff: http://172.16.1.2:8080 (lokal im Netzwerk)
```

### Öffentlich & kostenlos via GitHub Pages
1. **GitHub Repository erstellen:** https://github.com/new → Name: `ihk-lernplattform` → Public
2. **Pushen:**
   ```bash
   cd /opt/data/emilia-lernplattform
   git remote add origin https://github.com/DEIN_USERNAME/ihk-lernplattform.git
   git branch -M main
   git push -u origin main
   ```
3. **GitHub Pages aktivieren:** Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `(root)` → Save
4. **URL:** `https://DEIN_USERNAME.github.io/ihk-lernplattform/`
5. **PWA installieren:** Auf Handy Safari/Chrome → Teilen → "Zum Home-Bildschirm" → Native App-Erlebnis

### PWA-Features (bereits implementiert)
- **manifest.json** mit `display: standalone`, shortcuts, icons
- **Service Worker** (`sw.js`) für Offline-Cache & Background Sync
- **Install-Banner** mit `beforeinstallprompt` Handling
- **Chart.js** via CDN für Fortschritts-Charts
- **Responsive Design** für Handy & MacBook
- **localStorage** für Fortschritt, Streak, Schwachstellen
- **Emilia Coach Chat** mit Quick-Replies

## Verifikation (ad-hoc)
```bash
# Quick health check
curl -s -o /dev/null -w "%{http_code}" http://172.16.1.2:8080/index.html
# → 200

# All static assets served
for f in index.html style.css data.js app.js manifest.json sw.js; do
  curl -s -o /dev/null -w "%{http_code} " http://172.16.1.2:8080/$f
done
# → 200 200 200 200 200 200
```

## Implementierte Inhalte (Verifiziert Jul 2026)

### Übungen pro Modul (Total: 56 Übungen)
| Modul | Kategorien | Übungen |
|-------|------------|---------|
| **Word** | DIN 5008 (3), Serienbriefe (2), Formulare/Vorlagen (2), Tabellen/Grafiken (2), Formatierung/Layout (2) | **11** |
| **Excel** | SVERWEIS/XVERWEIS (4), WENN (3), Pivot (2), SUMMEWENN/S (3), Bedingte Formatierung (2), Bezüge/Datentools (3), Diagramme (2), Kostenrechnung (2) | **23** |
| **PowerPoint** | Folienmaster (2), Animationen (2), Diagramme/SmartArt (2) | **6** |
| **Outlook** | Regeln/QuickSteps (2), Kalender (2), Aufgaben/Kontakte (2) | **6** |
| **Lernfeld 1-3** | IT-Grundlagen (7), Textverarbeitung (7), Tabellenkalkulation (6) | **20** |

> **Hinweis**: 56 Übungen implementiert (Ziel: 38+). **20 zusätzliche IHK-Aufgaben für Lernfeld 1-3** als separate JSON-Datei verfügbar.

### Prüfungssimulationen (3 Szenarien ✅)
1. **AKA Musteraufgabe Herbst 2024** (`aka-2024-1`) — 5 Aufgaben (Word 2, Excel 2, PowerPoint 1), 100 Pkt, 120 Min
2. **AKA Musteraufgabe Frühjahr 2024** (`aka-2024-2`) — 5 Aufgaben (Word 2, Excel 2, PowerPoint 1), 100 Pkt, 120 Min  
3. **Emilia's Prüfungssimulation (Mix)** (`custom-1`) — 3 Kombi-Aufgaben (Word, Excel, PowerPoint), 100 Pkt, 120 Min

### Progress Tracking Functions (exported in `data.js` ✅)
```javascript
// Core progress functions (window.* exports)
getProgress()           // Full progress object from localStorage
saveProgress(progress)  // Persist to localStorage
markExerciseComplete(exerciseId, score, timeSpent)  // Track completion + streak + weak areas
getModuleProgress(moduleName)  // { completed, total, percentage } per module
getOverallProgress()    // Aggregate across all 4 modules
getWeakAreas()          // Top 5 weak categories by failure count
getSimulationResult(simId)  // Past simulation results
saveSimulationResult(simId, result)  // Store simulation outcome

// Settings & helpers
getSettings() / saveSettings()
getDailyQuote() / getCountdown()
findExerciseById(id)
```

### Coach Chat (Emilia) — Funktionierend ✅
**UI**: `index.html` → `#coach-chat` mit Quick-Reply-Buttons
**Logik**: `app.js` → `coachReply(action)`, `sendChat()`, `addCoachMessage()`, `addUserMessage()`
**Features**:
- 4 Quick-Replies: 📅 Lernplan, 💪 Motivation, 🎯 Schwachstellen, 📝 Übung
- Freitext-Input mit Keyword-Erkennung (plan, motivation, excel, word, simulation, hilfe)
- Kontextuelle Antworten mit Folge-Quick-Replies
- PWA-Install-Prompt integriert
- localStorage-Persistenz für Chat-Historie (via progress)

### Dateistruktur (Verifiziert)
```
/opt/data/emilia-lernplattform/
├── index.html      (19KB) — Main SPA, 7 Tabs, Coach Chat, PWA
├── app.js          (49KB) — App-Logik, Simulation Timer, Charts, Chat
├── data.js         (42KB) — EXERCISES, SIMULATIONS, Progress API
├── style.css       (21KB) — Responsive, Dark Mode, Animations
├── manifest.json   (2.6KB) — PWA Manifest, shortcuts, icons
├── sw.js           (3.9KB) — Service Worker, Offline Cache
├── emilia-lernplattform.html (legacy)
└── script.js       (legacy)
```

### Deployment-Test (Lokal ✅)
```bash
cd /opt/data/emilia-lernplattform
python3 -m http.server 8080 --bind 0.0.0.0 &
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/index.html  # → 200
```

## Multi-Agent Debugging Workflow (NEU seit Jul 2026)
Wenn Chrome-Link nicht funktioniert oder PWA-Installation fehlschlägt:

### 1. Diagnose-Agent (Nemotron 3 Ultra)
```bash
# Delegate Task für vollständige Analyse
delegate_task --model nvidia/nemotron-3-ultra-550b-a55b:free \
  --context "Lernplattform unter /opt/data/emilia-lernplattform/, Server läuft auf http://172.16.1.2:8080" \
  --goal "Analysiere alle PWA-Komponenten: Service Worker, manifest.json, CORS, JavaScript-Fehler, Chrome DevTools Issues"
```

### 2. Entwicklung-Agent (Nemotron 3 Ultra)  
```bash
# Parallel: Fehlende Komponenten implementieren
delegate_task --model nvidia/nemotron-3-ultra-550b-a55b:free \
  --context "38+ Übungen, 3 AKA Simulationen, Emilia Coach Chat Integration" \
  --goal "Implementiere fehlende Übungen, fixe PWA-Installation, optimiere für echte App-Nutzung"
```

### 3. Deployment-Agent (Nemotron 3 Ultra)
```bash
# Parallel: GitHub Pages HTTPS Setup
delegate_task --model nvidia/nemotron-3-ultra-550b-a55b:free \
  --context "Lokal http://172.16.1.2:8080, Ziel: https://alex-ihk-lernplattform.github.io/" \
  --goal "Richte GitHub Pages mit GitHub Actions ein, stelle HTTPS sicher, optimiere für Production"
```

### 4. Status-Kommunikation
- **Telegram (GLM 4.6)**: Status-Updates, Fortschritt, Nutzer-Feedback
- **MacBook (Nemotron 3 Ultra)**: Tiefen-Analyse, Code-Implementierung, Deployment
- **Koordination**: 3 Agenten parallel arbeiten, Ergebnisse synchronisieren

### 5. Chrome-spezifische Probleme (bekannte Lösungen)
- **CORS bei lokalem IP-Zugriff**: `--bind 0.0.0.0` + `http://172.16.1.2:8080`
- **Service Worker nicht registriert**: `navigator.serviceWorker.register('/sw.js')` prüfen
- **PWA nicht installierbar**: `beforeinstallprompt` Event, HTTPS erforderlich
- **JavaScript-Fehler**: Chrome DevTools Console nach `console.error` durchsuchen
- **Cache-Probleme**: Service Worker unregister + hard refresh

### 6. Verifikation nach Fixes
```bash
# Vollständiger Health Check
for endpoint in "/" "/index.html" "/manifest.json" "/sw.js" "/app.js" "/style.css" "/data.js"; do
  echo -n "$endpoint: "
  curl -s -o /dev/null -w "%{http_code}" "http://172.16.1.2:8080$endpoint"
done

# PWA Manifest Validierung
curl -s http://172.16.1.2:8080/manifest.json | jq .

# Service Worker Registration Test
curl -s http://172.16.1.2:8080/sw.js | head -5
```

## Referenzen
- **Multi-Agent Debugging Workflow**: `references/multi-agent-debugging-workflow.md` - Vollständige Anleitung für 3-Agenten-Strategie mit Nemotron 3 Ultra
- **Implementation Verification**: `references/implementation-verification.md` - Technische Details und Test-Resultate
- **Lernfeld 1-3 Aufgaben**: `references/lernfeld-1-3-aufgaben.md` - 20 zusätzliche IHK-Aufgaben mit Verifikationsskript
- **IHK-Recherche Datenbank**: `references/ihk-recherche-2025.md` - Vollständige Analyse der letzten 5 Jahre mit echten Prüfungsaufgaben
- **Verifikationsskript**: `scripts/verify-lernfeld-1-3.py` - Python-Skript zur Validierung der Aufgaben-JSON-Datei
- **IHK-Recherche Verifikation**: `scripts/verify-ihk-recherche.py` - Validierung der IHK-Recherche-Datenbank
- **IHK-Recherche Integration**: `scripts/integrate-ihk-research.py` - Umwandlung der Forschungsdaten in Übungsformate