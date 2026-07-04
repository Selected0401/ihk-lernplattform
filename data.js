/* Emilia's IHK Lernplattform - Data & Exercises */

// ============================================
// PRÜFUNGS-DATEN & ÜBUNGEN
// ============================================

const EXERCISES = {
    word: {
        din: [
            {
                id: 'w-din-1',
                title: 'DIN 5008 Geschäftsbrief - Aufbau',
                description: 'Erstelle einen formellen Geschäftsbrief nach DIN 5008 mit allen Pflichtbestandteilen',
                difficulty: 'medium',
                category: 'din',
                type: 'practical',
                time: 15,
                instructions: [
                    'Absender: Müller GmbH, Hauptstraße 15, 10115 Berlin',
                    'Empfänger: Frau Dr. Schmidt, Meier AG, Bahnhofstraße 42, 80331 München',
                    'Datum: Heute (DIN 5008 Format)',
                    'Betreff: Angebot für Büromöbel - Ihre Anfrage vom 15.01.2025',
                    'Text: Sehr geehrte Frau Dr. Schmidt, ... (3 Absätze)',
                    'Grußformel: Mit freundlichen Grüßen',
                    'Unterschrift: Max Müller, Geschäftsführer',
                    'Anlagen: 1 Anlage'
                ],
                solution: {
                    keyPoints: [
                        'Absender links oben (4 Zeilen)',
                        'Empfänger mit Titel (Dr.)',
                        'Datum: 15.01.2025 oder 15. Januar 2025',
                        'Betreff fett, ohne "Betreff:"',
                        '2 Leerzeilen vor/an Betreff',
                        'Anrede: Sehr geehrte Frau Dr. Schmidt,',
                        '3 Absätze, Blocksatz',
                        'Grußformel ohne Komma',
                        'Anlagenvermerk unten links'
                    ]
                }
            },
            {
                id: 'w-din-2',
                title: 'DIN 5008 Zahlen & Datumsformat',
                description: 'Formatiere Zahlen und Datumsangaben korrekt nach DIN 5008',
                difficulty: 'easy',
                category: 'din',
                type: 'quiz',
                time: 10,
                questions: [
                    {
                        q: 'Wie wird das Datum 1. Januar 2025 korrekt geschrieben?',
                        options: ['01.01.2025', '1. Januar 2025', '01.01.25', '1.1.2025'],
                        correct: 1
                    },
                    {
                        q: 'Wie wird 1.500,50 € korrekt formatiert?',
                        options: ['1.500,50 €', '1500,50 €', '1 500,50 €', '1,500.50 €'],
                        correct: 0
                    },
                    {
                        q: 'Telefonnummer nach DIN 5008:',
                        options: ['+49 30 1234567', '+49 (0)30 1234567', '030/1234567', '030 1234567'],
                        correct: 1
                    }
                ]
            },
            {
                id: 'w-din-3',
                title: 'E-Mail nach DIN 5008',
                description: 'Struktur einer formellen E-Mail nach DIN 5008',
                difficulty: 'easy',
                category: 'din',
                type: 'practical',
                time: 10,
                instructions: [
                    'Betreffzeile: Prägnant, aussagekräftig',
                    'Anrede: Sehr geehrte Frau Müller,',
                    'Text: Kurz, strukturiert, höflich',
                    'Grußformel: Mit freundlichen Grüßen',
                    'Signatur: Vorname Name, Firma, Telefon, E-Mail',
                    'Keine leere Zeile vor Grußformel'
                ]
            }
        ],
        serienbrief: [
            {
                id: 'w-sb-1',
                title: 'Serienbrief - Datenquelle verbinden',
                description: 'Verbinde Word mit Excel-Datenquelle für Serienbrief',
                difficulty: 'medium',
                category: 'serienbrief',
                type: 'practical',
                time: 20,
                steps: [
                    '1. Word: Sendungen → Serienbrief starten → Briefe',
                    '2. Empfänger auswählen → Vorhandene Liste verwenden',
                    '3. Excel-Datei "Adressen.xlsx" auswählen',
                    '4. Tabelle/Blatt auswählen, Erste Zeile = Überschriften',
                    '5. Adressblock einfügen → Vorschau prüfen',
                    '6. Grußzeile einfügen (Format: Sehr geehrte Frau Müller)',
                    '7. Fertigstellen & Zusammenführen → Dokumente bearbeiten'
                ]
            },
            {
                id: 'w-sb-2',
                title: 'Serienbrief - Bedingter Text',
                description: 'Füge bedingten Text ein (z.B. "Herr/Frau" je nach Anrede)',
                difficulty: 'hard',
                category: 'serienbrief',
                type: 'practical',
                time: 15,
                steps: [
                    '1. Einfügen → Schnellbausteine → Feld',
                    '2. Feldname: Wenn...Dann...Sonst',
                    '3. Bedingung: { MERGEFIELD Anrede } = "Herr"',
                    '4. Dann: "Sehr geehrter Herr { MERGEFIELD Nachname }"',
                    '5. Sonst: "Sehr geehrte Frau { MERGEFIELD Nachname }"',
                    '6. OK → Vorschau testen'
                ]
            }
        ],
        forms: [
            {
                id: 'w-fm-1',
                title: 'Formular erstellen - Textfelder & Dropdown',
                description: 'Erstelle ein geschütztes Formular mit verschiedenen Feldtypen',
                difficulty: 'medium',
                category: 'forms',
                type: 'practical',
                time: 20,
                steps: [
                    '1. Entwicklertools aktivieren (Datei → Optionen → Menüband)',
                    '2. Entwicklertools → Steuerelemente → Textformularfeld',
                    '3. Eigenschaften: Standardtext, Max. Länge, Format',
                    '4. Dropdown-Listenfeld: Einträge hinzufügen (Herr/Frau/Firma)',
                    '5. Kontrollkästchen für "Newsletter abonnieren"',
                    '6. Dokument schützen: Entwicklertools → Schutz → Formulare',
                    '7. Kennwort optional, "Ja, Schutz aufheben" zulassen'
                ]
            },
            {
                id: 'w-fm-2',
                title: 'Dokumentvorlage (.dotx) erstellen',
                description: 'Erstelle eine Vorlage für wiederverwendbare Geschäftsbriefe',
                difficulty: 'medium',
                category: 'forms',
                type: 'practical',
                time: 15,
                steps: [
                    '1. Neues Dokument mit Firmendesign erstellen',
                    '2. Formatvorlagen definieren: Briefkopf, Betreff, Fließtext, Unterschrift',
                    '3. Platzhalter für variable Inhalte (Datum, Betreff, Empfänger)',
                    '4. Datei → Speichern unter → Word-Vorlage (*.dotx)',
                    '5. Name: "Geschaeftsbrief_Mueller.dotx"',
                    '6. Speicherort: Benutzerdefinierte Vorlagen'
                ]
            }
        ]
    },
    excel: {
        sverweis: [
            {
                id: 'e-sv-1',
                title: 'SVERWEIS - Grundlagen',
                description: 'Einfacher SVERWEIS mit exakter Übereinstimmung',
                difficulty: 'easy',
                category: 'sverweis',
                type: 'practical',
                time: 10,
                data: {
                    lookupTable: [
                        ['Artikelnummer', 'Artikelname', 'Preis', 'Lagerbestand'],
                        [1001, 'Bürostuhl Ergonomisch', 299.00, 15],
                        [1002, 'Schreibtisch Höhenverstellbar', 549.00, 8],
                        [1003, 'Monitor 27 Zoll', 329.00, 22],
                        [1004, 'Tastatur Mechanisch', 129.00, 30],
                        [1005, 'Maus Ergonomisch', 59.00, 45]
                    ]
                },
                task: 'Suche den Preis für Artikelnummer 1003',
                formula: '=SVERWEIS(1003; A2:D6; 3; FALSCH)',
                answer: 329.00
            },
            {
                id: 'e-sv-2',
                title: 'SVERWEIS mit WENNFEHLER',
                description: 'Fange #NV-Fehler ab und zeige "Nicht gefunden"',
                difficulty: 'medium',
                category: 'sverweis',
                type: 'practical',
                time: 10,
                task: 'Suche Artikel 9999 (existiert nicht) - zeige "Nicht verfügbar"',
                formula: '=WENNFEHLER(SVERWEIS(9999; A2:D6; 2; FALSCH); "Nicht verfügbar")',
                answer: 'Nicht verfügbar'
            },
            {
                id: 'e-sv-3',
                title: 'XVERWEIS - Moderner Ersatz',
                description: 'Nutze XVERWEIS (verfügbar in Office 365/2021+)',
                difficulty: 'medium',
                category: 'sverweis',
                type: 'practical',
                time: 10,
                task: 'Suche Artikelname zu Nr. 1002 mit XVERWEIS',
                formula: '=XVERWEIS(1002; A2:A6; B2:B6; "Nicht gefunden")',
                answer: 'Schreibtisch Höhenverstellbar'
            },
            {
                id: 'e-sv-4',
                title: 'SVERWEIS - Approximative Suche',
                description: 'Noten-Schema mit approximativer Suche (WAHR)',
                difficulty: 'hard',
                category: 'sverweis',
                type: 'practical',
                time: 15,
                data: {
                    lookupTable: [
                        ['Punkte', 'Note'],
                        [0, 'Nicht bestanden'],
                        [50, 'Ausreichend (4,0)'],
                        [60, 'Ausreichend (3,7)'],
                        [70, 'Befriedigend (3,0)'],
                        [80, 'Gut (2,0)'],
                        [90, 'Sehr gut (1,0)']
                    ]
                },
                task: 'Welche Note bei 75 Punkten?',
                formula: '=SVERWEIS(75; A2:B7; 2; WAHR)',
                answer: 'Befriedigend (3,0)'
            }
        ],
        wenn: [
            {
                id: 'e-w-1',
                title: 'WENN - Einfache Bedingung',
                description: 'Lagerbestand prüfen: "Bestellen" wenn < 10, sonst "OK"',
                difficulty: 'easy',
                category: 'wenn',
                type: 'practical',
                time: 8,
                task: 'Zelle D2 enthält Lagerbestand. Formel in E2:',
                formula: '=WENN(D2<10; "Bestellen"; "OK")',
                testCases: [
                    { input: 5, expected: 'Bestellen' },
                    { input: 15, expected: 'OK' },
                    { input: 10, expected: 'OK' }
                ]
            },
            {
                id: 'e-w-2',
                title: 'WENNS - Mehrere Bedingungen',
                description: 'Rabattstaffel: >1000€ = 10%, >500€ = 5%, sonst 0%',
                difficulty: 'medium',
                category: 'wenn',
                type: 'practical',
                time: 10,
                task: 'Umsatz in A2. Rabatt in B2:',
                formula: '=WENNS(A2>1000; 0,1; A2>500; 0,05; WAHR; 0)',
                testCases: [
                    { input: 1200, expected: 0.1 },
                    { input: 750, expected: 0.05 },
                    { input: 300, expected: 0 }
                ]
            },
            {
                id: 'e-w-3',
                title: 'Verschachtelte WENN mit UND/ODER',
                description: 'Mitarbeiter-Bonus: Abteilung "Verkauf" UND Umsatz >5000 = 500€',
                difficulty: 'hard',
                category: 'wenn',
                type: 'practical',
                time: 12,
                task: 'Abteilung in B2, Umsatz in C2. Bonus in D2:',
                formula: '=WENN(UND(B2="Verkauf"; C2>5000); 500; 0)',
                testCases: [
                    { dept: 'Verkauf', sales: 6000, expected: 500 },
                    { dept: 'Verkauf', sales: 4000, expected: 0 },
                    { dept: 'Einkauf', sales: 6000, expected: 0 }
                ]
            }
        ],
        pivot: [
            {
                id: 'e-pv-1',
                title: 'Pivot-Tabelle erstellen',
                description: 'Umsatz nach Region und Produktkategorie',
                difficulty: 'medium',
                category: 'pivot',
                type: 'practical',
                time: 15,
                data: {
                    source: [
                        ['Datum', 'Region', 'Kategorie', 'Produkt', 'Umsatz', 'Menge'],
                        ['01.01.2025', 'Nord', 'Büromöbel', 'Stuhl', 2990, 10],
                        ['01.01.2025', 'Süd', 'Technik', 'Monitor', 3290, 10],
                        ['02.01.2025', 'Nord', 'Büromöbel', 'Tisch', 5490, 10],
                        ['02.01.2025', 'Ost', 'Technik', 'Tastatur', 1290, 10],
                        ['03.01.2025', 'West', 'Büromöbel', 'Stuhl', 1794, 6],
                        ['03.01.2025', 'Süd', 'Technik', 'Maus', 1770, 30]
                    ]
                },
                steps: [
                    '1. Einfügen → PivotTable → Tabelle/Bereich auswählen',
                    '2. Neues Arbeitsblatt wählen',
                    '3. Zeilen: Region',
                    '4. Spalten: Kategorie',
                    '5. Werte: Summe von Umsatz',
                    '6. Design → Zwischensummen → Nicht anzeigen'
                ]
            },
            {
                id: 'e-pv-2',
                title: 'Pivot - Gruppieren & Berechnetes Feld',
                description: 'Datum nach Monat gruppieren, Marge berechnen',
                difficulty: 'hard',
                category: 'pivot',
                type: 'practical',
                time: 20,
                steps: [
                    '1. Rechtsklick auf Datum in Pivot → Gruppieren',
                    '2. Monate & Jahre auswählen',
                    '3. PivotTable analysieren → Felder, Elemente & Gruppen',
                    '4. Berechnetes Feld: Name "Marge", Formel = Umsatz - (Menge*EKPreis)',
                    '5. Zahlenformat: Währung',
                    '6. Slicer einfügen für Region'
                ]
            }
        ],
        sumif: [
            {
                id: 'e-si-1',
                title: 'SUMMEWENN - Ein Kriterium',
                description: 'Summe aller Umsätze für Region "Nord"',
                difficulty: 'easy',
                category: 'sumif',
                type: 'practical',
                time: 8,
                formula: '=SUMMEWENN(B:B; "Nord"; E:E)',
                explanation: 'Prüft Spalte B auf "Nord", sumiert entsprechende Werte aus Spalte E'
            },
            {
                id: 'e-si-2',
                title: 'SUMMEWENNS - Mehrere Kriterien',
                description: 'Umsatz für Region "Nord" UND Kategorie "Büromöbel"',
                difficulty: 'medium',
                category: 'sumif',
                type: 'practical',
                time: 10,
                formula: '=SUMMEWENNS(E:E; B:B; "Nord"; C:C; "Büromöbel")',
                explanation: 'Summe aus E, wo B="Nord" UND C="Büromöbel"'
            },
            {
                id: 'e-si-3',
                title: 'ZÄHLENWENNS - Anzahl zählen',
                description: 'Wie viele Aufträge aus "Süd" mit Umsatz > 2000?',
                difficulty: 'medium',
                category: 'sumif',
                type: 'practical',
                time: 8,
                formula: '=ZÄHLENWENNS(B:B; "Süd"; E:E; ">2000")',
                explanation: 'Zählt Zeilen, wo B="Süd" UND E>2000'
            }
        ],
        cf: [
            {
                id: 'e-cf-1',
                title: 'Bedingte Formatierung - Datensymbole',
                description: 'Pfeile für Umsatzentwicklung: grün ↑, gelb →, rot ↓',
                difficulty: 'easy',
                category: 'cf',
                type: 'practical',
                time: 10,
                steps: [
                    '1. Bereich markieren (z.B. E2:E100)',
                    '2. Start → Bedingte Formatierung → Datensymbole',
                    '3. "3 Pfeile (farbig)" auswählen',
                    '4. Regeln verwalten → Bearbeiten',
                    '5. Typ: Zahl, Werte: >0, =0, <0'
                ]
            },
            {
                id: 'e-cf-2',
                title: 'Bedingte Formatierung - Formel',
                description: 'Ganze Zeile rot markieren, wenn Lagerbestand < 5',
                difficulty: 'hard',
                category: 'cf',
                type: 'practical',
                time: 12,
                steps: [
                    '1. Ganze Tabelle markieren (A2:F100)',
                    '2. Bedingte Formatierung → Neue Regel → Formel',
                    '3. Formel: =$F2<5  (WICHTIG: $ vor Spalte!)',
                    '4. Format → Füllung: Rot, Schrift: Weiß',
                    '5. OK → OK'
                ]
            }
        ],
        refs: [
            {
                id: 'e-rf-1',
                title: 'Bezugsarten verstehen',
                description: 'Relativ (A1), Absolut ($A$1), Gemischt ($A1 / A$1)',
                difficulty: 'easy',
                category: 'refs',
                type: 'quiz',
                time: 10,
                questions: [
                    {
                        q: 'Formel in B2: =A1*2. Nach Kopieren nach C3 wird:',
                        options: ['=B2*2', '=A1*2', '=B2*2', '=$A$1*2'],
                        correct: 0
                    },
                    {
                        q: 'Was bewahrt den Spaltenbezug beim Kopieren nach rechts?',
                        options: ['$A1', 'A$1', '$A$1', 'A1'],
                        correct: 0
                    }
                ]
            },
            {
                id: 'e-rf-2',
                title: '3D-Bezug über mehrere Blätter',
                description: 'Summe aus Zelle B5 aller Monatsblätter (Jan bis Dez)',
                difficulty: 'medium',
                category: 'refs',
                type: 'practical',
                time: 10,
                formula: '=SUMME(Jan:Dez!B5)',
                explanation: 'Addiert B5 aus allen Blättern zwischen Jan und Dez'
            },
            {
                id: 'e-rf-3',
                title: 'Datentools - Text in Spalten',
                description: 'Namen "Müller, Max" trennen in Nachname & Vorname',
                difficulty: 'easy',
                category: 'refs',
                type: 'practical',
                time: 8,
                steps: [
                    '1. Spalte markieren',
                    '2. Daten → Text in Spalten',
                    '3. Getrennt → Weiter',
                    '4. Trennzeichen: Komma → Weiter',
                    '5. Fertigstellen'
                ]
            }
        ]
    },
    powerpoint: {
        master: [
            {
                id: 'p-ms-1',
                title: 'Folienmaster bearbeiten',
                description: 'Erstelle einheitliches Design für alle Folien',
                difficulty: 'medium',
                category: 'master',
                type: 'practical',
                time: 15,
                steps: [
                    '1. Ansicht → Folienmaster',
                    '2. Oberster Master: Schriftart, Farben, Hintergründe festlegen',
                    '3. Layouts anpassen: Platzhalter verschieben/größen',
                    '4. Fußzeile: Datum, Foliennummer, Text aktivieren',
                    '5. Masteransicht schließen → Änderungen gelten für alle Folien'
                ]
            },
            {
                id: 'p-ms-2',
                title: 'Eigenes Farbschema & Schriftart',
                description: 'Firmenfarben und -schriften als Design speichern',
                difficulty: 'medium',
                category: 'master',
                type: 'practical',
                time: 10,
                steps: [
                    '1. Entwurf → Variante → Farben → Farben anpassen',
                    '2. Akzent 1-6: Firmenfarben eintragen (HEX/RGB)',
                    '3. Name: "Firma Müller" → Speichern',
                    '4. Schriftarten → Anpassen → Überschrift/Fliesstext',
                    '5. Als Design speichern für Wiederverwendung'
                ]
            }
        ],
        anim: [
            {
                id: 'p-an-1',
                title: 'Animationen professionell einsetzen',
                description: 'Eintritt, Betonung, Austritt - zeitgesteuert',
                difficulty: 'medium',
                category: 'anim',
                type: 'practical',
                time: 15,
                steps: [
                    '1. Objekt markieren → Animationen → Effekt wählen',
                    '2. Animationsbereich öffnen (Rechts)',
                    '3. Start: "Mit vorherigem" / "Nach vorherigem"',
                    '4. Dauer & Verzögerung feinjustieren',
                    '5. Animationen kopieren (Animationsübertragung)'
                ]
            },
            {
                id: 'p-an-2',
                title: 'Pfadanimation & Bewegungsablauf',
                description: 'Objekt auf kurvem Pfad bewegen',
                difficulty: 'hard',
                category: 'anim',
                type: 'practical',
                time: 15,
                steps: [
                    '1. Animationen → Bewegungspfade → Benutzerdefiniert',
                    '2. Mit Maus Pfad zeichnen (Doppelklick = Ende)',
                    '3. Glätten: Rechtsklick → Punkte bearbeiten',
                    '4. Auto-Umkehr für Hin-/Rückbewegung',
                    '5. Auslöser: Bei Klick / Mit vorherigem'
                ]
            }
        ],
        charts: [
            {
                id: 'p-ch-1',
                title: 'Excel-Diagramm verknüpfen',
                description: 'Diagramm aus Excel einbinden & aktualisierbar machen',
                difficulty: 'medium',
                category: 'charts',
                type: 'practical',
                time: 10,
                steps: [
                    '1. Excel: Diagramm erstellen & kopieren (Strg+C)',
                    '2. PowerPoint: Start → Einfügen → Inhalte einfügen',
                    '3. "Verknüpfen" & "Microsoft Excel-Diagrammobjekt"',
                    '4. OK → Diagramm in PPT bearbeitbar',
                    '5. Excel-Änderung → PPT: Rechtsklick → Verknüpfung aktualisieren'
                ]
            },
            {
                id: 'p-ch-2',
                title: 'SmartArt für Prozesse',
                description: 'Prozessdarstellung mit SmartArt erstellen',
                difficulty: 'easy',
                category: 'charts',
                type: 'practical',
                time: 8,
                steps: [
                    '1. Einfügen → SmartArt → Prozess',
                    '2. "Stufenweise Prozess" oder "Kreislauf" wählen',
                    '3. Textbereich: Enter für neue Form, Tab für Ebene',
                    '4. SmartArt-Design → Farben & Stile anpassen',
                    '5. 3D-Drehung für Tiefe'
                ]
            }
        ]
    },
    outlook: {
        rules: [
            {
                id: 'o-rl-1',
                title: 'Regel erstellen - E-Mails automatisch sortieren',
                description: 'Alle Mails von "chef@firma.de" in Ordner "Wichtig" verschieben',
                difficulty: 'easy',
                category: 'rules',
                type: 'practical',
                time: 8,
                steps: [
                    '1. Start → Regeln → Regeln verwalten → Neu',
                    '2. Bedingung: "Von" → "chef@firma.de" eingeben',
                    '3. Aktion: "In Ordner verschieben" → "Wichtig" wählen',
                    '4. Weitere Aktionen: "Als gelesen markieren" optional',
                    '5. Ausnahmen: Keine → Fertigstellen'
                ]
            },
            {
                id: 'o-rl-2',
                title: 'QuickSteps für wiederkehrende Aktionen',
                description: 'Ein Klick: "An Chef weiterleiten & als erledigt markieren"',
                difficulty: 'medium',
                category: 'rules',
                type: 'practical',
                time: 10,
                steps: [
                    '1. Start → QuickSteps → Neu erstellen',
                    '2. Name: "An Chef weiterleiten"',
                    '3. Aktion: "Weiterleiten" → chef@firma.de',
                    '4. Weitere Aktion: "Als erledigt kennzeichnen"',
                    '5. Tastenkombination zuweisen (Strg+Umschalt+1)',
                    '6. Fertigstellen'
                ]
            }
        ],
        calendar: [
            {
                id: 'o-cl-1',
                title: 'Serientermine & Ressourcen',
                description: 'Wöchentliches Team-Meeting mit Raum buchen',
                difficulty: 'easy',
                category: 'calendar',
                type: 'practical',
                time: 8,
                steps: [
                    '1. Kalender → Neuer Termin → Serientermin',
                    '2. Jeden Montag, 09:00-10:00, Ende: nie',
                    '3. Raum hinzufügen: "Besprechungsraum 1"',
                    '4. Teilnehmer: Teamverteilerliste',
                    '5. Erinnerung: 15 Min vorher',
                    '6. Serie speichern'
                ]
            },
            {
                id: 'o-cl-2',
                title: 'Kalender freigeben & Anzeigen',
                description: 'Kollegen Kalender anzeigen & eigenen freigeben',
                difficulty: 'medium',
                category: 'calendar',
                type: 'practical',
                time: 10,
                steps: [
                    '1. Kalender → Start → Kalender freigeben',
                    '2. E-Mail an Kollegen senden mit Berechtigung',
                    '3. Berechtigungsstufen: Verfügbarkeit / Betreff / Details',
                    '4. Andere Kalender öffnen: Start → Kalender öffnen → Aus Adressbuch',
                    '5. Überlagerungsmodus für parallele Ansicht'
                ]
            }
        ],
        tasks: [
            {
                id: 'o-tk-1',
                title: 'Aufgaben zuweisen & nachverfolgen',
                description: 'Aufgabe an Kollegin delegieren, Status erhalten',
                difficulty: 'medium',
                category: 'tasks',
                type: 'practical',
                time: 10,
                steps: [
                    '1. Aufgaben → Neue Aufgabe',
                    '2. Betreff: "Quartalsbericht Q1 erstellen"',
                    '3. Start/Datum: Heute, Fällig: +2 Wochen',
                    '4. Aufgabe zuweisen → Kollegin auswählen',
                    '5. "Kopie meiner Aufgabe behalten" aktivieren',
                    '6. Senden → Status-Updates automatisch erhalten'
                ]
            },
            {
                id: 'o-tk-2',
                title: 'To-Do Liste mit Kategorien',
                description: 'Farbcodierte Kategorien für Prioritäten',
                difficulty: 'easy',
                category: 'tasks',
                type: 'practical',
                time: 8,
                steps: [
                    '1. Aufgabe → Kategorisieren → Alle Kategorien',
                    '2. Neu: "🔴 Dringend" (Rot), "🟡 Diese Woche" (Gelb), "🟢 Kann warten" (Grün)',
                    '3. Tastenkürzel zuweisen (Strg+F2 etc.)',
                    '4. Ansicht → Ansicht ändern → Nach Kategorien gruppieren',
                    '5. Schnellfilter: Nur "Dringend" anzeigen'
                ]
            }
        ]
    }
};

// ============================================
// PRÜFUNGSSIMULATIONEN (AKA Musteraufgaben)
// ============================================

const SIMULATIONS = {
    'aka-2024-1': {
        id: 'aka-2024-1',
        name: 'AKA Musteraufgabe Herbst 2024',
        date: '2024-Herbst',
        duration: 120,
        tasks: [
            {
                id: 't1',
                module: 'word',
                title: 'Geschäftsbrief nach DIN 5008 erstellen',
                description: 'Erstelle einen Angebotsbrief an die Musterfirma Nüra GmbH. Verwende die Vorlage aus der Datensammlung. Beachte alle DIN 5008 Regeln.',
                points: 25,
                timeEstimate: 30,
                files: ['Vorlage_Angebot.dotx', 'Adressen.xlsx']
            },
            {
                id: 't2',
                module: 'word',
                title: 'Serienbrief für Einladung',
                description: 'Erstelle einen Serienbrief für die Einladung zur Hausmesse. Datenquelle: Adressen.xlsx. Bedingter Text für Anrede.',
                points: 20,
                timeEstimate: 25,
                files: ['Einladung.docx', 'Adressen.xlsx']
            },
            {
                id: 't3',
                module: 'excel',
                title: 'Artikelliste mit SVERWEIS & Pivot',
                description: 'Vervollständige die Artikelliste mit Preisen aus der Preisliste (SVERWEIS). Erstelle Pivot: Umsatz pro Kategorie & Region.',
                points: 30,
                timeEstimate: 40,
                files: ['Artikelliste.xlsx', 'Preisliste.xlsx']
            },
            {
                id: 't4',
                module: 'excel',
                title: 'Bedingte Formatierung & WENN',
                description: 'Markiere Artikel mit Lagerbestand < 10 rot. Berechne Rabattstaffel mit WENNS. Summiere Umsatz Nord mit SUMMEWENN.',
                points: 15,
                timeEstimate: 15,
                files: ['Artikelliste.xlsx']
            },
            {
                id: 't5',
                module: 'powerpoint',
                title: 'Präsentation "Neue Produktlinie"',
                description: 'Erstelle 5 Folien mit Master, Animationen, Excel-Diagramm-Verknüpfung. Folien: Titel, Agenda, Produkte, Umsatzprognose, Kontakt.',
                points: 10,
                timeEstimate: 20,
                files: ['Umsatzdaten.xlsx']
            }
        ]
    },
    'aka-2024-2': {
        id: 'aka-2024-2',
        name: 'AKA Musteraufgabe Frühjahr 2024',
        date: '2024-Frühjahr',
        duration: 120,
        tasks: [
            {
                id: 't1',
                module: 'word',
                title: 'Protokoll einer Besprechung',
                description: 'Erstelle ein Protokoll nach Vorlage. Teilnehmer, Themen, Beschlüsse, Maßnahmen. Formatvorlagen nutzen.',
                points: 25,
                timeEstimate: 30,
                files: ['Vorlage_Protokoll.dotx']
            },
            {
                id: 't2',
                module: 'word',
                title: 'Formular "Reisekostenabrechnung"',
                description: 'Erstelle geschütztes Formular: Dropdown für Kostenart, Datumsfelder, Betragsfelder, Summe automatisch.',
                points: 20,
                timeEstimate: 25,
                files: []
            },
            {
                id: 't3',
                module: 'excel',
                title: 'Mitarbeiter-Auswertung mit Pivot & XVERWEIS',
                description: 'Stundenlohn aus Stammdaten per XVERWEIS holen. Pivot: Stunden pro Mitarbeiter/Monat. Bedingte Formatierung für Überstunden.',
                points: 30,
                timeEstimate: 40,
                files: ['Stammdaten.xlsx', 'Stundenzettel.xlsx']
            },
            {
                id: 't4',
                module: 'excel',
                title: 'Diagramm & 3D-Bezug',
                description: 'Kombiniertes Diagramm (Säule/Linie) für Umsatz/Gewinn. 3D-Summe über Quartalsblätter.',
                points: 15,
                timeEstimate: 15,
                files: ['Q1.xlsx', 'Q2.xlsx', 'Q3.xlsx', 'Q4.xlsx']
            },
            {
                id: 't5',
                module: 'powerpoint',
                title: 'Folienmaster & Animationen',
                description: 'Master mit Firmenfarben. 4 Folien: Titel, Prozess (SmartArt), Daten, Abschluss. Pfadanimation für Logo.',
                points: 10,
                timeEstimate: 20,
                files: []
            }
        ]
    },
    'custom-1': {
        id: 'custom-1',
        name: 'Emilia\'s Prüfungssimulation (Mix)',
        date: 'Custom',
        duration: 120,
        tasks: [
            {
                id: 't1',
                module: 'word',
                title: 'Brief + Serienbrief Kombi',
                description: 'Erstelle Geschäftsbrief (DIN 5008) UND Serienbrief aus derselben Datenquelle. Zeit: 40 Min.',
                points: 35,
                timeEstimate: 40,
                files: []
            },
            {
                id: 't2',
                module: 'excel',
                title: 'Excel Komplett: SVERWEIS, Pivot, WENN, CF',
                description: 'Datensatz vervollständigen, Pivot erstellen, Bedingte Formatierung, Rabattberechnung. Zeit: 50 Min.',
                points: 45,
                timeEstimate: 50,
                files: []
            },
            {
                id: 't3',
                module: 'powerpoint',
                title: 'Präsentation aus Excel-Daten',
                description: 'Master erstellen, 4 Folien, Excel-Diagramm verknüpft, Animationen. Zeit: 30 Min.',
                points: 20,
                timeEstimate: 30,
                files: []
            }
        ]
    }
};

// ============================================
// LERNFORTSCRITT & SPEICHERUNG
// ============================================

const STORAGE_KEYS = {
    PROGRESS: 'emilia_ihk_progress',
    SETTINGS: 'emilia_ihk_settings',
    STREAK: 'emilia_ihk_streak',
    DAILY_GOAL: 'emilia_ihk_daily_goal'
};

const DEFAULT_PROGRESS = {
    completedExercises: {},
    exerciseScores: {},
    exerciseAttempts: {},
    simulationResults: {},
    totalStudyTime: 0,
    currentStreak: 0,
    lastStudyDate: null,
    weeklyGoals: {},
    weakAreas: {},
    strengths: {}
};

const DEFAULT_SETTINGS = {
    dailyGoalMinutes: 90,
    reminderTimes: ['07:00', '12:00', '18:00', '20:30'],
    telegramEnabled: true,
    voiceEnabled: true,
    darkMode: true,
    language: 'de',
    examDate: '2027-02-26',
    preferredModules: ['excel', 'word', 'powerpoint', 'outlook']
};

// ============================================
// HILFSFUNKTIONEN
// ============================================

function getStorage(key, defaultValue = {}) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn('Storage read error:', e);
        return defaultValue;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Storage write error:', e);
    }
}

function getProgress() {
    return getStorage(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
}

function saveProgress(progress) {
    setStorage(STORAGE_KEYS.PROGRESS, progress);
}

function getSettings() {
    return getStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

function saveSettings(settings) {
    setStorage(STORAGE_KEYS.SETTINGS, settings);
}

// Exercise completion tracking
function markExerciseComplete(exerciseId, score = 100, timeSpent = 0) {
    const progress = getProgress();
    const today = new Date().toISOString().split('T')[0];
    
    if (!progress.completedExercises[exerciseId]) {
        progress.completedExercises[exerciseId] = today;
    }
    
    if (!progress.exerciseScores[exerciseId] || score > progress.exerciseScores[exerciseId]) {
        progress.exerciseScores[exerciseId] = score;
    }
    
    progress.exerciseAttempts[exerciseId] = (progress.exerciseAttempts[exerciseId] || 0) + 1;
    progress.totalStudyTime += timeSpent;
    
    // Streak tracking
    if (progress.lastStudyDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (progress.lastStudyDate === yesterday) {
            progress.currentStreak += 1;
        } else if (progress.lastStudyDate !== today) {
            progress.currentStreak = 1;
        }
        progress.lastStudyDate = today;
    }
    
    // Category tracking for weak areas
    const exercise = findExerciseById(exerciseId);
    if (exercise) {
        const cat = exercise.category;
        if (score < 70) {
            progress.weakAreas[cat] = (progress.weakAreas[cat] || 0) + 1;
        } else {
            progress.strengths[cat] = (progress.strengths[cat] || 0) + 1;
        }
    }
    
    saveProgress(progress);
    return progress;
}

function findExerciseById(id) {
    for (const module of Object.values(EXERCISES)) {
        for (const category of Object.values(module)) {
            const found = category.find(ex => ex.id === id);
            if (found) return found;
        }
    }
    return null;
}

function getModuleProgress(moduleName) {
    const progress = getProgress();
    const moduleExercises = EXERCISES[moduleName];
    if (!moduleExercises) return { completed: 0, total: 0, percentage: 0 };
    
    let total = 0, completed = 0;
    for (const category of Object.values(moduleExercises)) {
        for (const ex of category) {
            total++;
            if (progress.completedExercises[ex.id]) completed++;
        }
    }
    return { completed, total, percentage: total ? Math.round(completed/total*100) : 0 };
}

function getOverallProgress() {
    const modules = ['word', 'excel', 'powerpoint', 'outlook'];
    let total = 0, completed = 0;
    for (const m of modules) {
        const p = getModuleProgress(m);
        total += p.total;
        completed += p.completed;
    }
    return { completed, total, percentage: total ? Math.round(completed/total*100) : 0 };
}

function getWeakAreas() {
    const progress = getProgress();
    return Object.entries(progress.weakAreas || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, count]) => ({ category: cat, count }));
}

function getSimulationResult(simId) {
    const progress = getProgress();
    return progress.simulationResults[simId] || null;
}

function saveSimulationResult(simId, result) {
    const progress = getProgress();
    progress.simulationResults[simId] = {
        ...result,
        date: new Date().toISOString()
    };
    saveProgress(progress);
}

// ============================================
// TÄGLICHE ZIELE & MOTIVATION
// ============================================

const DAILY_QUOTES = [
    "Jeder Experte war einmal Anfänger. Fang heute an! 🌱",
    "Kleine Schritte täglich schlagen große Sprünge einmal pro Woche. 👣",
    "Deine Zukunft wird von dem gebaut, was du HEUTE tust. 💪",
    "Excel-Formeln sind wie Zaubersprüche - übe sie, bis sie fliegen! ✨",
    "DIN 5008 ist dein Freund, kein Feind. Lernt ihn lieben! 📐",
    "Pivot-Tabellen machen aus Daten Erkenntnisse. Werde zum Daten-Detektiv! 🔍",
    "120 Minuten Prüfung = 7200 Sekunden. Jede Sekunde zählt! ⏱️",
    "Serienbriefe: Einmal einrichten, tausendmal nutzen. Effizienz pur! 📬",
    "Bedingte Formatierung lässt Daten sprechen. Hör ihnen zu! 🎨",
    "Dein Ziel: Februar 2027. Heute ist der beste Tag zum Starten! 🎯"
];

function getDailyQuote() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

function getCountdown() {
    const settings = getSettings();
    const examDate = new Date(settings.examDate);
    const now = new Date();
    const diff = examDate - now;
    
    if (diff <= 0) return { text: 'Prüfung läuft! 🎉', days: 0, hours: 0, minutes: 0 };
    
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    return { days, hours, minutes, text: `${days}T ${hours}Std ${min}Min bis Prüfung` };
}

// Export for use in app.js
window.EXERCISES = EXERCISES;
window.SIMULATIONS = SIMULATIONS;
window.getProgress = getProgress;
window.saveProgress = saveProgress;
window.getSettings = getSettings;
window.saveSettings = saveSettings;
window.markExerciseComplete = markExerciseComplete;
window.getModuleProgress = getModuleProgress;
window.getOverallProgress = getOverallProgress;
window.getWeakAreas = getWeakAreas;
window.getSimulationResult = getSimulationResult;
window.saveSimulationResult = saveSimulationResult;
window.getDailyQuote = getDailyQuote;
window.getCountdown = getCountdown;
window.findExerciseById = findExerciseById;
window.STORAGE_KEYS = STORAGE_KEYS;