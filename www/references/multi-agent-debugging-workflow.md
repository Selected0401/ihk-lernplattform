# Multi-Agent Debugging Workflow für IHK Lernplattform

## Problem-Szenario (Juli 2026)
- **User**: Alex (30), MacBook Pro, Chrome
- **Issue**: Lernplattform-Link funktioniert nicht in Chrome
- **Server läuft**: `http://172.16.1.2:8080` (Python http.server)
- **Ziel**: Vollständige PWA mit HTTPS Deployment

## Multi-Agent Strategie

### Agent 1: DIAGNOSE & ANALYSE (Nemotron 3 Ultra)
**Ziel**: Systematische Fehlersuche
- Service Worker Registration prüfen
- PWA Manifest Validierung
- JavaScript Console Errors analysieren
- CORS/CSP Probleme identifizieren
- Chrome DevTools Issues

**Commands**:
```bash
# Service Worker Status
curl -s http://172.16.1.2:8080/sw.js

# Manifest Check
curl -s http://172.16.1.2:8080/manifest.json | jq .

# JavaScript Syntax Check
node -c /opt/data/emilia-lernplattform/app.js
node -c /opt/data/emilia-lernplattform/script.js
```

### Agent 2: KOMPONENTEN-ENTWICKLUNG (Nemotron 3 Ultra)
**Ziel**: Fehlende Features implementieren
- 38+ Excel/Word/PPT/Outlook Übungen
- 3 AKA Prüfungssimulationen
- Emilia Coach Chat Integration
- PWA Installation Fixes

**Key Files**:
- `data.js` - Übungsaufgaben erweitern
- `app.js` - Coach Chat implementieren
- `index.html` - PWA Install Banner
- `style.css` - Responsive Optimierung

### Agent 3: DEPLOYMENT & HTTPS (Nemotron 3 Ultra)
**Ziel**: Production Deployment
- GitHub Repository erstellen
- GitHub Actions für CI/CD
- GitHub Pages HTTPS Setup
- Custom Domain Konfiguration

**Deployment Pipeline**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## Koordinations-Protokoll

### Status-Synchronisation
- **Telegram (GLM 4.6)**: User-Interface, Fortschritt-Updates
- **MacBook (Nemotron 3 Ultra)**: Tiefen-Analyse, Code-Implementierung
- **Cross-Agent Results**: Ergebnisse über `process()` API teilen

### Prioritäten-Reihenfolge
1. **Diagnose komplett** → Alle Probleme identifiziert
2. **Critical Fixes** → Blocker beseitigen
3. **Feature-Vollständigkeit** → Alle Übungen implementieren
4. **Deployment** → HTTPS-Produktivbetrieb

## Chrome-spezifische Probleme & Lösungen

### CORS bei lokalem IP-Zugriff
**Problem**: Chrome blockiert `http://172.16.1.2:8080`
**Lösung**: 
```bash
python3 -m http.server 8080 --bind 0.0.0.0
# Oder: localhost forwarding via SSH tunnel
ssh -L 8080:localhost:8080 user@172.16.1.2
```

### Service Worker nicht registriert
**Problem**: `navigator.serviceWorker.register('/sw.js')` fehlschlägt
**Lösung**:
```javascript
// In app.js - Registration mit Error Handling
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('SW registered:', registration))
    .catch(error => console.error('SW registration failed:', error));
}
```

### PWA nicht installierbar
**Problem**: `beforeinstallprompt` Event nicht ausgelöst
**Lösung**:
```javascript
// HTTPS erforderlich für PWA Installation
// Service Worker muss erfolgreich registriert sein
// manifest.json muss valide sein
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install button
});
```

## Verifikations-Checklist

### Pre-Deployment Tests
- [ ] Alle 38+ Übungen implementiert
- [ ] 3 AKA Simulationen voll funktionsfähig
- [ ] Emilia Coach Chat reagiert auf alle Keywords
- [ ] PWA Manifest valid (`manifest.json`)
- [ ] Service Worker registriert (`sw.js`)
- [ ] Responsive Design (Mobile + Desktop)

### Deployment Tests
- [ ] GitHub Repository erstellt
- [ ] GitHub Actions konfiguriert
- [ ] GitHub Pages aktiviert
- [ ] HTTPS-Zugriff funktioniert
- [ ] Custom Domain (optional)

### Post-Deployment Tests
- [ ] PWA Installation auf Handy möglich
- [ ] Offline-Funktionalität gegeben
- [ ] Fortschritt wird localStorage gespeichert
- [ ] Charts via Chart.js geladen
- [ ] Alle Links funktionieren

## Fehler-Behebung Template

### JavaScript Console Errors
```bash
# Chrome DevTools Console检查
1. Öffne Chrome → Entwickler-Tools → Console
2. Lade http://172.16.1.2:8080
3. Suche nach roten Fehlern:
   - "Failed to load resource"
   - "Uncaught TypeError"
   - "ServiceWorker registration failed"
4. Kopiere Fehler in Analyse-Agent
```

### Network Issues
```bash
# Network Tab Analyse
1. Chrome DevTools → Network
2. Filter: "JS", "CSS", "XHR/Fetch"
3. Status Codes prüfen:
   - 200: OK
   - 404: Not Found (fehlende Dateien)
   - 403: Forbidden (CORS)
4. Failed Requests identifizieren
```

### Service Worker Debugging
```bash
# Application Tab → Service Workers
1. Registration Status prüfen
2. "Update on reload" aktivieren
3. "Unregister" → Hard Refresh → "Register"
4. Cache löschen: "Clear storage"
```

## Erfolgs-Kriterien

### Minimum Viable Product
- ✅ Lernplattform in Chrome ladbar
- ✅ Mindestens 20 Übungen funktionieren
- ✅ Eine Prüfungssimulation durchführbar
- ✅ PWA grundlegend installierbar

### Complete Product
- ✅ Alle 38+ Übungen implementiert
- ✅ 3 AKA Simulationen verfügbar
- ✅ Emilia Coach Chat voll funktionsfähig
- ✅ PWA als echte App nutzbar
- ✅ HTTPS Deployment weltweit erreichbar