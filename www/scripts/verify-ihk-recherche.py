#!/usr/bin/env python3
"""
Verification script for IHK research JSON file.
Validates JSON structure and content completeness.
"""

import json
import sys
from pathlib import Path

def verify_json_structure(file_path):
    """Verify the JSON structure and required fields."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check top-level structure
        required_top_keys = ['lernfelder', 'pruefungsinformationen']
        for key in required_top_keys:
            if key not in data:
                return False, f"Missing required top-level key: {key}"
        
        # Check lernfelder structure
        if not isinstance(data['lernfelder'], list) or len(data['lernfelder']) != 6:
            return False, "lernfelder should be a list with exactly 6 entries"
        
        required_lernfeld_keys = ['feld', 'beschreibung', 'typische_aufgaben', 'pruefungsbeispiele']
        for i, lernfeld in enumerate(data['lernfelder']):
            for key in required_lernfeld_keys:
                if key not in lernfeld:
                    return False, f"Missing key '{key}' in lernfeld {i+1}"
            
            # Check pruefungsbeispiele structure
            if not isinstance(lernfeld['pruefungsbeispiele'], list):
                return False, f"pruefungsbeispiele should be a list in lernfeld {i+1}"
            
            for j, beispiel in enumerate(lernfeld['pruefungsbeispiele']):
                required_beispiel_keys = ['jahr', 'aufgabe', 'loesung']
                for key in required_beispiel_keys:
                    if key not in beispiel:
                        return False, f"Missing key '{key}' in pruefungsbeispiel {j+1} of lernfeld {i+1}"
        
        # Check pruefungsinformationen structure
        required_info_keys = ['aufbau', 'hilfsmittel', 'bewertung']
        for key in required_info_keys:
            if key not in data['pruefungsinformationen']:
                return False, f"Missing key '{key}' in pruefungsinformationen"
        
        return True, "JSON structure is valid"
        
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"
    except Exception as e:
        return False, f"Error reading file: {e}"

def verify_content_quality(file_path):
    """Verify content quality and completeness."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check that all Lernfelder 1-6 are covered
        expected_lernfelder = [
            "Lernfeld 1: Informationstechnische Grundlagen",
            "Lernfeld 2: Textverarbeitung (Word)",
            "Lernfeld 3: Tabellenkalkulation (Excel)",
            "Lernfeld 4: Präsentation (PowerPoint)",
            "Lernfeld 5: Datenbanken",
            "Lernfeld 6: Informations- und Telekommunikationstechnik"
        ]
        
        actual_lernfelder = [lf['feld'] for lf in data['lernfelder']]
        
        for expected in expected_lernfelder:
            if expected not in actual_lernfelder:
                return False, f"Missing expected lernfeld: {expected}"
        
        # Check that each lernfeld has content
        for lernfeld in data['lernfelder']:
            if not lernfeld['beschreibung'].strip():
                return False, f"Empty description for {lernfeld['feld']}"
            
            if not lernfeld['typische_aufgaben']:
                return False, f"No typical tasks for {lernfeld['feld']}"
            
            if not lernfeld['pruefungsbeispiele']:
                return False, f"No exam examples for {lernfeld['feld']}"
        
        # Check that pruefungsinformationen has meaningful content
        aufbau = data['pruefungsinformationen']['aufbau']
        if 'teil_1' not in aufbau or 'teil_2' not in aufbau:
            return False, "Missing exam parts in aufbau"
        
        return True, "Content quality is good"
        
    except Exception as e:
        return False, f"Error verifying content: {e}"

def main():
    file_path = "/opt/data/emilia-lernplattform/data/ihk-recherche.json"
    
    if not Path(file_path).exists():
        print(f"❌ File does not exist: {file_path}")
        sys.exit(1)
    
    # Verify JSON structure
    structure_valid, structure_msg = verify_json_structure(file_path)
    if structure_valid:
        print(f"✅ Structure verification: {structure_msg}")
    else:
        print(f"❌ Structure verification failed: {structure_msg}")
        sys.exit(1)
    
    # Verify content quality
    content_valid, content_msg = verify_content_quality(file_path)
    if content_valid:
        print(f"✅ Content verification: {content_msg}")
    else:
        print(f"❌ Content verification failed: {content_msg}")
        sys.exit(1)
    
    # File size check
    file_size = Path(file_path).stat().st_size
    if file_size > 10000:  # More than 10KB indicates substantial content
        print(f"✅ File size check: {file_size} bytes (substantial content)")
    else:
        print(f"⚠️  File size check: {file_size} bytes (might be insufficient content)")
    
    print("🎉 All verifications passed!")

if __name__ == "__main__":
    main()