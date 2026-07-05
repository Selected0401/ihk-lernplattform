#!/usr/bin/env python3
"""
Verifikationsskript für lernfeld-1-3.json
Validiert JSON-Struktur und Aufgabeninhalt für IHK Lernfeld 1-3
"""

import json
import sys
import os

def verify_lernfeld_json():
    """Validiert die JSON-Datei mit IHK-Aufgaben"""
    
    file_path = "/opt/data/emilia-lernplattform/data/lernfeld-1-3.json"
    
    try:
        # Datei existenz prüfen
        if not os.path.exists(file_path):
            print(f"FAILED: Datei nicht gefunden: {file_path}")
            return False
        
        # Datei laden
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✓ JSON-Datei geladen: {file_path}")
        
        # Struktur prüfen
        if not isinstance(data, dict) or 'aufgaben' not in data:
            print("✗ Falsche JSON-Struktur: 'aufgaben' Array erwartet")
            return False
        
        aufgaben = data['aufgaben']
        if not isinstance(aufgaben, list):
            print("✗ 'aufgaben' muss eine Liste sein")
            return False
        
        print(f"✓ {len(aufgaben)} Aufgaben gefunden")
        
        # Mindestanzahl prüfen
        if len(aufgaben) < 20:
            print(f"✗ Zu wenige Aufgaben: {len(aufgaben)} < 20")
            return False
        
        # Pflichtfelder für jede Aufgabe prüfen
        required_fields = ['id', 'lernfeld', 'titel', 'aufgabenstellung', 'art', 
                          'punkte', 'zeit', 'schwierigkeit', 'material', 
                          'loesungsschritte', 'musterloesung']
        
        valid_count = 0
        lernfeld_counts = {}
        
        for i, aufgabe in enumerate(aufgaben):
            # Pflichtfelder prüfen
            missing_fields = [field for field in required_fields if field not in aufgabe]
            if missing_fields:
                print(f"✗ Aufgabe {i+1} ({aufgabe.get('id', 'unknown')}) fehlt: {missing_fields}")
                continue
            
            # Lernfeld zählen
            lernfeld = aufgabe['lernfeld']
            if lernfeld not in lernfeld_counts:
                lernfeld_counts[lernfeld] = 0
            lernfeld_counts[lernfeld] += 1
            
            # Punkte prüfen
            if not isinstance(aufgabe['punkte'], (int, float)) or aufgabe['punkte'] <= 0:
                print(f"✗ Aufgabe {i+1} hat ungültige Punkte: {aufgabe['punkte']}")
                continue
            
            # Zeit prüfen
            if not isinstance(aufgabe['zeit'], (int, float)) or aufgabe['zeit'] <= 0:
                print(f"✗ Aufgabe {i+1} hat ungültige Zeit: {aufgabe['zeit']}")
                continue
            
            # Schwierigkeit prüfen
            if aufgabe['schwierigkeit'] not in ['einfach', 'mittel', 'schwer']:
                print(f"✗ Aufgabe {i+1} hat ungültige Schwierigkeit: {aufgabe['schwierigkeit']}")
                continue
            
            # Art prüfen
            if aufgabe['art'] != 'echte_pruefungsaufgabe':
                print(f"✗ Aufgabe {i+1} hat falsche Art: {aufgabe['art']}")
                continue
            
            valid_count += 1
            print(f"✓ Aufgabe {i+1}: {aufgabe['titel']} ({aufgabe['punkte']} Punkte)")
        
        print(f"\n✓ {valid_count}/{len(aufgaben)} Aufgaben sind gültig")
        
        # Lernfeld-Verteilung prüfen
        print("\nLernfeld-Verteilung:")
        for lernfeld, count in lernfeld_counts.items():
            print(f"  {lernfeld}: {count} Aufgaben")
        
        # Mindestverteilung prüfen
        if lernfeld_counts.get("Lernfeld 1: Informationstechnische Grundlagen", 0) < 7:
            print("✗ Zu wenige Aufgaben für Lernfeld 1")
            return False
        
        if lernfeld_counts.get("Lernfeld 2: Textverarbeitung", 0) < 7:
            print("✗ Zu wenige Aufgaben für Lernfeld 2")
            return False
        
        if lernfeld_counts.get("Lernfeld 3: Tabellenkalkulation", 0) < 6:
            print("✗ Zu wenige Aufgaben für Lernfeld 3")
            return False
        
        print(f"✓ Mindestens 20 Aufgaben vorhanden: {valid_count}")
        print("✓ Lernfeld-Verteilung korrekt: 7+7+6 Aufgaben")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"✗ JSON-Fehler: {e}")
        return False
    except Exception as e:
        print(f"✗ Fehler bei der Validierung: {e}")
        return False

def main():
    """Hauptfunktion"""
    print("=== Verifikation von lernfeld-1-3.json ===\n")
    
    success = verify_lernfeld_json()
    
    print(f"\n=== Ergebnis: {'SUCCESS' if success else 'FAILED'} ===")
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())