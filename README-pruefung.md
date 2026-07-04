# Prüfungssimulation - IHK Lernplattform

## Übersicht
Eine interaktive Prüfungssimulation mit Zeitlimit, Punktesystem und detaillierter Auswertung für die IHK Zwischenprüfung Informationstechnisches Büromanagement.

## Features

### 🎯 Prüfungsmodus
- **Zeitlimit**: 60 Minuten für die komplette Prüfung
- **Zufällige Aufgaben**: 10 Aufgaben aus verschiedenen Kategorien
- **Punktesystem**: Maximal 500 Punkte, Bestanden ab 60% (300 Punkte)
- **Kategorien**: Textverarbeitung, Tabellenkalkulation, IT-Grundlagen, Büromanagement

### 🖥️ Prüfungs-Interface
- **Countdown-Timer**: Optische Warnung bei geringer Restzeit
- **Fortschrittsanzeige**: Visuelle Fortschrittsleiste und Prozentanzeige
- **Aufgaben-Navigation**: Direkter Sprung zu jeder Aufgabe
- **Antworttypen**: Multiple Choice, Textantworten, Drag & Drop

### 📊 Ergebnis-Anzeige
- **Gesamtpunkte**: Übersicht der erreichten Punkte
- **Bestanden/Nicht bestanden**: Klare Statusanzeige
- **Detaillierte Auswertung**: Ergebnisse pro Kategorie
- **Falsche Antworten mit Korrekturen**: Lernorientiertes Feedback

### 💾 Speicherfunktionen
- **localStorage**: Automatische Speicherung der Prüfungshistorie
- **PDF Export**: Herunterladen der Ergebnisse als PDF-Dokument

## Dateien

### Hauptdateien
- `pruefung.html` - Hauptseite der Prüfungssimulation
- `js/pruefung.js` - JavaScript-Logik der Anwendung
- `css/pruefung.css` - Stylesheet für das moderne Design

### Technische Details

#### JavaScript-Architektur
- **ExamSimulation Klasse**: Zentrale Verwaltung der Prüfung
- **Fragenpool**: Strukturierte Fragen nach Kategorien
- **Timer-Management**: Präzise Zeitverfolgung mit Warnungen
- **Evaluationslogik**: Automatische Bewertung aller Antworttypen

#### CSS-Features
- **Responsive Design**: Optimiert für Desktop, Tablet und Mobile
- **Modernes UI**: Gradient-Farben, Animationen, Hover-Effekte
- **Accessibility**: Focus-States, Keyboard-Navigation
- **Print-Styles**: Optimierte Darstellung für Ausdrucke

#### Antworttypen
1. **Multiple Choice**: Einfache Auswahlmöglichkeiten
2. **Textantworten**: Freitext mit Schlüsselwort-Bewertung
3. **Drag & Drop**: Zuordnungsaufgaben mit visuellem Feedback

## Installation und Nutzung

1. **Voraussetzungen**: Moderner Webbrowser mit JavaScript-Unterstützung
2. **Start**: `pruefung.html` im Browser öffnen
3. **Durchführung**: Prüfung starten und Aufgaben bearbeiten
4. **Auswertung**: Automatische Anzeige der Ergebnisse nach Abschluss

## Integration

Die Prüfungssimulation ist vollständig in die bestehende IHK Lernplattform integriert:
- Konsistentes Design mit der Hauptplattform
- Gleiche Farbpalette und UI-Elemente
- Nahtlose Navigation zwischen den Modulen

## Erweiterbarkeit

Das System ist leicht erweiterbar:
- Neue Fragen können im `questionPool` hinzugefügt werden
- Zusätzliche Kategorien sind implementierbar
- Weitere Antworttypen können integriert werden
- Bestehende Fragen können angepasst werden

## Qualitätssicherung

- **Cross-Browser-Kompatibilität**: Funktioniert in allen modernen Browsern
- **Mobile-Optimierung**: Touch-optimierte Bedienung
- **Performance**: Schnelle Ladezeiten durch optimierten Code
- **Sicherheit**: Client-seitige Validierung und Datenintegrität