#!/bin/bash

echo "🐰 Erstelle Apple Icons für iPhone App..."

# Erstelle einfache PNG Icons mit ImageMagick (falls installiert)
if command -v convert >/dev/null 2>&1; then
    # 192x192 Icon
    convert -size 192x192 xc:transparent -fill "#667eea" -draw "rectangle 0,0 191,191" \
            -fill white -pointsize 120 -gravity center -annotate 0 "🐰" \
            /opt/data/emilia-lernplattform/apple-touch-icon.png
    
    # 512x512 Icon
    convert -size 512x512 xc:transparent -fill "#667eea" -draw "rectangle 0,0 511,511" \
            -fill white -pointsize 320 -gravity center -annotate 0 "🐰" \
            /opt/data/emilia-lernplattform/icon-512x512.png
    
    echo "✅ PNG Icons erstellt!"
else
    echo "❌ ImageMagick nicht installiert - erstelle Platzhalter..."
    # Erstelle Platzhalter-Dateien
    echo "PNG Icon Platzhalter" > /opt/data/emilia-lernplattform/apple-touch-icon.png
    echo "512x512 Icon Platzhalter" > /opt/data/emilia-lernplattform/icon-512x512.png
fi

echo "📱 iPhone Icons bereit!"