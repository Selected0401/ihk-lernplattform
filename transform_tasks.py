import json
from pathlib import Path

ROOT = Path('/opt/data/ihk-lernplattform')
SOURCE = ROOT / 'data' / 'aufgaben-optimiert.json'
TARGETS = [
    ROOT / 'data' / 'aufgaben-optimiert.json',
    ROOT / 'www' / 'data' / 'aufgaben-optimiert.json',
]


def excel_data(task):
    text = f"{task.get('titel', '')} {task.get('beschreibung', '')} {task.get('loesung', '')}".upper()
    if 'SVERWEIS' in text:
        return [['Artikel-Nr', 'Bezeichnung', 'Preis'], ['A-4711', 'Schraube M6', 0.15], ['A-4712', 'Mutter M6', 0.08], ['A-4713', 'Unterlegscheibe', 0.03]]
    if 'WENN' in text or 'BONUS' in text:
        return [['Mitarbeiter', 'Umsatz', 'Bonus'], ['Müller', 65000, ''], ['Schmidt', 42000, ''], ['Meier', 78000, ''], ['Weber', 35000, ''], ['Huber', 55000, '']]
    if 'PIVOT' in text:
        return [['Region', 'Produkt', 'Umsatz'], ['Nord', 'A', 15000], ['Nord', 'B', 22000], ['Süd', 'A', 18000], ['Süd', 'B', 25000], ['West', 'A', 12000], ['West', 'B', 19000]]
    if 'SUMMEWENNS' in text:
        return [['Region', 'Quartal', 'Umsatz'], ['Nord', 'Q1', 45000], ['Nord', 'Q2', 52000], ['Süd', 'Q1', 38000], ['Süd', 'Q2', 41000]]
    if 'STATUS' in text or 'FORMATIERUNG' in text:
        return [['Projekt', 'Status'], ['Projekt A', 'Abgeschlossen'], ['Projekt B', 'In Arbeit'], ['Projekt C', 'Verzögert']]
    return [['Monat', 'Umsatz'], ['Januar', 12450], ['Februar', 15320], ['März', 18760]]


def elements_for(task):
    hints = task.get('hinweise') or []
    solution = task.get('loesung') or ''
    title = task.get('titel') or ''
    category = task.get('kategorie') or ''
    base = [item for item in hints if isinstance(item, str)]

    if category == 'word':
        defaults = ['Absender', 'Empfänger', 'Datum', 'Betreff', 'Anrede', 'Brieftext', 'Grußformel', 'Unterschrift']
    elif category == 'powerpoint':
        defaults = ['Titel', 'Inhalt', 'Corporate Design', 'Folienmaster', 'Farbschema']
    elif category == 'outlook':
        defaults = ['Regel', 'Ordner', 'Bedingung', 'Aktion', 'Speichern']
    else:
        defaults = []

    parts = base + [solution, title] + defaults
    seen = set()
    result = []
    for part in parts:
        for chunk in str(part).replace(';', ',').split(','):
            item = chunk.strip()
            if len(item) < 3:
                continue
            key = item.lower()
            if key not in seen:
                seen.add(key)
                result.append(item)
    return result[:10]


def enrich(task):
    category = task.get('kategorie') or task.get('modul', '').lower()
    content = dict(task.get('content') or {})
    content['solution'] = content.get('solution') or task.get('loesung') or ''
    if category == 'excel':
        content['data'] = content.get('data') or excel_data(task)
    else:
        content['elements'] = content.get('elements') or elements_for(task)
    task['content'] = content
    return task


data = json.loads(SOURCE.read_text())
for task in data['aufgaben']:
    enrich(task)

for target in TARGETS:
    target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')

print(f"Updated {len(data['aufgaben'])} tasks in {', '.join(str(t) for t in TARGETS)}")
