import json
from pathlib import Path

ROOT = Path('/opt/data/ihk-lernplattform')
FILES = [ROOT / 'data/aufgaben-optimiert.json', ROOT / 'www/data/aufgaben-optimiert.json']

DATA_BY_ID = {
    'excel-004': [['Wochentag', 'Start', 'Ende', 'Pause', 'Arbeitszeit'], ['Montag', '08:00', '16:30', '00:30', ''], ['Dienstag', '08:15', '17:00', '00:45', ''], ['Mittwoch', '09:00', '15:30', '00:30', '']],
    'excel-005': [['Projekt', 'Verantwortlich', 'Status'], ['Website-Relaunch', 'Müller', 'Abgeschlossen'], ['CRM-Einführung', 'Schmidt', 'In Arbeit'], ['Inventur', 'Weber', 'Verzögert']],
    'excel-007': [['Kundennummer', 'Name roh', 'PLZ roh', 'Bereinigt'], ['1001', '  Müller GmbH  ', ' 50667 ', ''], ['1002', 'SCHMIDT AG', '10115', ''], ['1003', 'meier ohg ', ' 20095', '']],
    'excel-008': [['Monat', 'Umsatz', 'Kosten'], ['Januar', 12450, 8200], ['Februar', 15320, 9100], ['März', 18760, 10400]],
    'excel-010': [['Jahr', 'Monat', 'Erster Tag', 'Letzter Tag'], [2026, 'Januar', '', ''], [2026, 'Februar', '', ''], [2026, 'März', '', '']],
    'excel-011': [['Produkt-ID', 'Produkt', 'Preis'], ['P001', 'Notebook-Ständer', 39.90], ['P002', 'USB-C Dockingstation', 119.00], ['P003', 'Ergonomische Tastatur', 79.00]],
    'excel-013': [['Bestellnummer', 'Abteilung', 'Priorität'], ['B-1001', '', ''], ['B-1002', '', ''], ['B-1003', '', '']],
    'excel-014': [['Artikel', 'Menge', 'Einzelpreis', 'Gesamt'], ['Ordner A4', 20, 2.40, ''], ['Druckerpapier', 15, 4.80, ''], ['Briefumschläge', 8, 3.20, '']],
    'excel-015': [['Datum', 'Artikel', 'Menge', 'Preis'], ['01.03.', 'Ordner A4', 10, 2.40], ['01.03.', 'Ordner A4', 10, 2.40], ['02.03.', 'Druckerpapier', 5, 4.80]],
    'excel-019': [['Kostenstelle', 'Budget', 'Ist-Kosten', 'Auslastung'], ['Vertrieb', 50000, 47200, ''], ['Verwaltung', 32000, 35100, ''], ['IT', 68000, 62000, '']],
}

REPLACEMENTS = {
    'Wochen总计': 'Wochensumme',
    'various': 'verschiedene',
    'Mouse': 'Maus',
    'Keyboard': 'Tastatur',
    'vollständige': 'vollständige',
}

for path in FILES:
    data = json.loads(path.read_text())
    for task in data['aufgaben']:
        for key in ['titel', 'beschreibung', 'loesung']:
            if isinstance(task.get(key), str):
                for old, new in REPLACEMENTS.items():
                    task[key] = task[key].replace(old, new)
        task['hinweise'] = [str(h).replace('Wochen总计', 'Wochensumme').replace('various', 'verschiedene').replace('Mouse', 'Maus').replace('Keyboard', 'Tastatur') for h in task.get('hinweise', [])]
        content = task.setdefault('content', {})
        if task['id'] in DATA_BY_ID:
            content['data'] = DATA_BY_ID[task['id']]
        if task['kategorie'] == 'powerpoint':
            elements = content.setdefault('elements', [])
            content['elements'] = [e.replace('various', 'verschiedene') for e in elements]
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')

print('content cleanup complete')
