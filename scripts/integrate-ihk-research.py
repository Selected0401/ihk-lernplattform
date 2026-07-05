#!/usr/bin/env python3
"""
Integration script for IHK research data into the learning platform.
Converts JSON research data into JavaScript exercises for the Lernplattform.
"""

import json
import os
from pathlib import Path

def convert_research_to_exercises(research_file, output_file):
    """Convert IHK research JSON to platform exercises format."""
    
    # Load research data
    with open(research_file, 'r', encoding='utf-8') as f:
        research_data = json.load(f)
    
    exercises = []
    
    # Convert each Lernfeld to exercises
    for lernfeld in research_data['lernfelder']:
        field_name = lernfeld['feld']
        field_description = lernfeld['beschreibung']
        
        # Convert typical tasks to exercises
        for i, task in enumerate(lernfeld['typische_aufgaben']):
            exercise = {
                "id": f"{field_name.lower().replace(' ', '-').replace(':', '')}-task-{i+1}",
                "module": get_module_from_field(field_name),
                "category": get_category_from_field(field_name),
                "difficulty": "intermediate",
                "title": f"{field_name}: {task}",
                "description": f"Aufgabe aus {field_name}: {task}",
                "instructions": task,
                "solution": "Lösung basiert auf Forschungsdaten",
                "type": get_exercise_type_from_field(field_name),
                "timeEstimate": 15,
                "points": 10,
                "tags": [field_name, "typical-task"],
                "source": "IHK-Recherche 2025"
            }
            exercises.append(exercise)
        
        # Convert exam examples to exercises
        for j, beispiel in enumerate(lernfeld['pruefungsbeispiele']):
            exercise = {
                "id": f"{field_name.lower().replace(' ', '-').replace(':', '')}-exam-{j+1}",
                "module": get_module_from_field(field_name),
                "category": get_category_from_field(field_name),
                "difficulty": "advanced",
                "title": f"Prüfungsaufgabe {beispiel['jahr']}: {field_name}",
                "description": f"Echte IHK-Prüfungsaufgabe aus {beispiel['jahr']} für {field_name}",
                "instructions": beispiel['aufgabe'],
                "solution": beispiel['loesung'],
                "type": get_exercise_type_from_field(field_name),
                "timeEstimate": 25,
                "points": 20,
                "tags": [field_name, "exam", f"year-{beispiel['jahr']}"],
                "source": f"IHK-Prüfung {beispiel['jahr']}"
            }
            exercises.append(exercise)
    
    # Create exercise data structure
    exercise_data = {
        "exercises": exercises,
        "metadata": {
            "totalExercises": len(exercises),
            "modules": list(set(ex["module"] for ex in exercises)),
            "categories": list(set(ex["category"] for ex in exercises)),
            "sources": ["IHK-Recherche 2025", "IHK-Prüfungen 2021-2025"],
            "lastUpdated": "2025-07-04"
        }
    }
    
    # Write output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(exercise_data, f, indent=2, ensure_ascii=False)
    
    return len(exercises)

def get_module_from_field(field_name):
    """Map Lernfeld to platform module."""
    mapping = {
        "Lernfeld 1: Informationstechnische Grundlagen": "word",
        "Lernfeld 2: Textverarbeitung (Word)": "word", 
        "Lernfeld 3: Tabellenkalkulation (Excel)": "excel",
        "Lernfeld 4: Präsentation (PowerPoint)": "powerpoint",
        "Lernfeld 5: Datenbanken": "excel",
        "Lernfeld 6: Informations- und Telekommunikationstechnik": "word"
    }
    return mapping.get(field_name, "word")

def get_category_from_field(field_name):
    """Map Lernfeld to exercise category."""
    mapping = {
        "Lernfeld 1: Informationstechnische Grundlagen": "IT-Grundlagen",
        "Lernfeld 2: Textverarbeitung (Word)": "DIN 5008",
        "Lernfeld 3: Tabellenkalkulation (Excel)": "Formeln",
        "Lernfeld 4: Präsentation (PowerPoint)": "Masterfolien",
        "Lernfeld 5: Datenbanken": "Access",
        "Lernfeld 6: Informations- und Telekommunikationstechnik": "Outlook"
    }
    return mapping.get(field_name, "Allgemein")

def get_exercise_type_from_field(field_name):
    """Map Lernfeld to exercise type."""
    mapping = {
        "Lernfeld 1: Informationstechnische Grundlagen": "text",
        "Lernfeld 2: Textverarbeitung (Word)": "document",
        "Lernfeld 3: Tabellenkalkulation (Excel)": "spreadsheet",
        "Lernfeld 4: Präsentation (PowerPoint)": "presentation",
        "Lernfeld 5: Datenbanken": "database",
        "Lernfeld 6: Informations- und Telekommunikationstechnik": "text"
    }
    return mapping.get(field_name, "text")

def main():
    """Main integration process."""
    research_file = "/opt/data/emilia-lernplattform/data/ihk-recherche.json"
    output_file = "/opt/data/emilia-lernplattform/data/ihk-exercises-integrated.json"
    
    if not Path(research_file).exists():
        print(f"❌ Research file not found: {research_file}")
        return
    
    # Convert research data to exercises
    exercise_count = convert_research_to_exercises(research_file, output_file)
    
    print(f"✅ Integration completed!")
    print(f"📊 Generated {exercise_count} exercises from IHK research data")
    print(f"📁 Output file: {output_file}")
    
    # Show statistics
    with open(output_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"📈 Statistics:")
    print(f"   - Total exercises: {data['metadata']['totalExercises']}")
    print(f"   - Modules: {', '.join(data['metadata']['modules'])}")
    print(f"   - Categories: {', '.join(data['metadata']['categories'])}")
    print(f"   - Sources: {', '.join(data['metadata']['sources'])}")

if __name__ == "__main__":
    main()