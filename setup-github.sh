#!/bin/bash

echo "🐰 Emilia's GitHub Setup für IHK Lernplattform"
echo "============================================="

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📁 Wechsle zum Projektverzeichnis...${NC}"
cd /opt/data/emilia-lernplattform

echo -e "${BLUE}📊 Prüfe Git Status...${NC}"
git status

echo -e "${BLUE}📝 Zeige letzte Commits...${NC}"
git log --oneline -5

echo -e "${YELLOW}🔑 GitHub Setup Anleitung:${NC}"
echo ""
echo "1. ${GREEN}GitHub Account erstellen:${NC}"
echo "   - Gehe zu https://github.com"
echo "   - Klicke 'Sign up'"
echo "   - Erstelle deinen Account (z.B. 'alex-ihk-lernplattform')"
echo ""
echo "2. ${GREEN}Neues Repository erstellen:${NC}"
echo "   - Klicke '+ New repository'"
echo "   - Name: 'emilia-lernplattform'"
echo "   - Description: 'Kostenlose IHK Lernplattform für Büromanagement'"
echo "   - Public auswählen"
echo "   - 'Add a README file' ABWÄHLEN (wir haben schon eine)"
echo "   - Klicke 'Create repository'"
echo ""
echo "3. ${GREEN}Repository kopieren (diese Befehle):${NC}"
echo -e "${YELLOW}   cd /opt/data/emilia-lernplattform${NC}"
echo -e "${YELLOW}   git remote add origin https://github.com/DEIN-USERNAME/emilia-lernplattform.git${NC}"
echo -e "${YELLOW}   git push -u origin master${NC}"
echo ""
echo "4. ${GREEN}GitHub Pages aktivieren:${NC}"
echo "   - Gehe zu deinem Repository"
echo "   - Klicke 'Settings'"
echo "   - Scrolle zu 'Pages'"
echo "   - Source: 'Deploy from a branch'"
echo "   - Branch: 'master'"
echo "   - Folder: '/root'"
echo "   - Klicke 'Save'"
echo ""
echo "5. ${GREEN}Warte 5-10 Minuten...${NC}"
echo "   - Deine Webseite ist dann verfügbar unter:"
echo "   - https://DEIN-USERNAME.github.io/emilia-lernplattform/"
echo ""
echo -e "${BLUE}📱 Auf iPhone dann:${NC}"
echo "   - Safari öffnen"
echo "   - https://DEIN-USERNAME.github.io/emilia-lernplattform/"
echo "   - Teilen → Zum Home-Bildschirm"
echo ""
echo -e "${RED}⚠️  WICHTIG:${NC}"
echo "   - Ersetze 'DEIN-USERNAME' mit deinem echten GitHub Benutzernamen"
echo "   - Das ist alles was du tun musst!"
echo ""
echo -e "${GREEN}🎯 Ergebnis:${NC}"
echo "   - 100% kostenlose öffentliche Webseite"
echo "   - HTTPS automatisch"
echo "   - Weltweite Erreichbarkeit"
echo "   - iPhone App installierbar"
echo "   - Alle 40+ Übungen verfügbar"
echo ""
echo -e "${BLUE}💝 Emilia hat alles für dich vorbereitet!${NC}"
echo "    Du musst nur noch die 5 Schritte oben ausführen! 🐰"