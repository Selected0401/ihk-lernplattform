#!/bin/bash

echo "🎯 IHK iPhone App Setup für Alex"
echo "================================"
echo ""

echo "📱 Schritt 1: Xcode öffnen"
echo "open /opt/data/emilia-lernplattform/IHK-Lernplattform/IHK_Lernplattform.xcodeproj"
echo ""

echo "🔌 Schritt 2: iPhone verbinden"
echo "- USB-Kabel an MacBook anschließen"
echo "- iPhone entsperren und 'Vertrauen' klicken"
echo ""

echo "⚡ Schritt 3: App starten"
echo "- In Xcode: Gerät oben auswählen (dein iPhone)"
echo "- Play-Button (▶️) klicken"
echo "- App startet sofort auf deinem iPhone"
echo ""

echo "✨ Schritt 4: App installieren"
echo "- App läuft direkt auf deinem iPhone"
echo -" Kein App Store nötig für Tests"
echo ""

echo "🎉 FERTIG! Deine IHK-App läuft auf deinem iPhone!"
echo ""

# Automatisch Xcode öffnen
if command -v open &> /dev/null; then
    echo "🚀 Öffne Xcode automatisch..."
    open /opt/data/emilia-lernplattform/IHK-Lernplattform/IHK_Lernplattform.xcodeproj
else
    echo "❌ Xcode nicht gefunden. Installiere Xcode vom Mac App Store."
fi