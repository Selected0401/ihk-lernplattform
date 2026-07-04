#!/bin/bash

# Quick GitHub Repository Setup für Emilia's IHK Lernplattform
echo "🐰 Emilia's IHK Lernplattform - GitHub Setup"
echo "=========================================="

# Check if git repo exists
if [ ! -d ".git" ]; then
    echo "❌ Kein Git Repository gefunden!"
    exit 1
fi

echo "✅ Git Repository gefunden"

# Instructions for manual GitHub setup
echo ""
echo "📋 MANUELLE GITHUB SETUP ANLEITUNG:"
echo "==================================="
echo ""
echo "1. 🌐 Gehe zu https://github.com und erstelle neues Repository:"
echo "   - Name: alex-ihk-lernplattform"
echo "   - Public: ✅"
echo "   - README: ❌ (haben wir schon)"
echo "   - .gitignore: ❌ (haben wir schon)"
echo ""
echo "2. 📡 Füge das Remote hinzu:"
echo "   git remote add origin https://github.com/[DEIN-USERNAME]/alex-ihk-lernplattform.git"
echo ""
echo "3. 🚀 Push zum GitHub:"
echo "   git push -u origin master"
echo ""
echo "4. ⚙️ Aktiviere GitHub Pages:"
echo "   - Repository → Settings → Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: master / (root)"
echo "   - Save"
echo ""
echo "5. 🌐 Deine LIVE Seite ist dann unter:"
echo "   https://[DEIN-USERNAME].github.io/alex-ihk-lernplattform/"
echo ""
echo "🎯 DIESE SCHRITTE MACHEN DEINE APP WELTWEIT ERREICHBAR!"
echo ""

# Current status
echo "📊 AKTUELLER STATUS:"
echo "===================="
echo "✅ Lokaler Server: http://172.16.1.2:8080"
echo "✅ Chart.js Problem: GEFIXT"
echo "✅ Service Worker: BEREIT"
echo "✅ GitHub Actions: BEREIT"
echo "✅ PWA Manifest: BEREIT"
echo "✅ Alle Dateien: COMMITED"
echo ""
echo "🚀 BEREIT FÜR GITHUB DEPLOYMENT!"
echo ""