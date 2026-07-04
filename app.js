// Emilia's IHK Lernplattform - JavaScript App
class LernApp {
    constructor() {
        this.modules = {
            excel: {
                title: 'Excel',
                icon: '📊',
                exercises: [
                    {
                        id: 'excel-1',
                        title: 'SVERWEIS Grundlagen',
                        description: 'Kundendaten mit SVERWEIS suchen',
                        difficulty: 'medium',
                        time: 15,
                        content: {
                            task: 'Suche den Umsatz für Kunden-Nr 1002',
                            data: [
                                ['Kunden-Nr', 'Name', 'Ort', 'Umsatz'],
                                [1001, 'Müller GmbH', 'Berlin', 125000],
                                [1002, 'Schmidt AG', 'München', 89000],
                                [1003, 'Meier OHG', 'Hamburg', 156000]
                            ],
                            solution: '=SVERWEIS(A2;A:D;4;FALSE) ergibt 89000'
                        }
                    },
                    {
                        id: 'excel-2',
                        title: 'WENN-Funktion',
                        description: 'Bestandskontrolle mit WENN',
                        difficulty: 'easy',
                        time: 10,
                        content: {
                            task: 'Markiere Artikel mit Lager < 50 als "Bestellen"',
                            data: [
                                ['Artikel', 'Lager', 'Status'],
                                ['A001', 150, ''],
                                ['A002', 25, ''],
                                ['A003', 75, '']
                            ],
                            solution: '=WENN(B2<50;"Bestellen";"Auf Lager")'
                        }
                    },
                    {
                        id: 'excel-3',
                        title: 'Pivot-Tabelle',
                        description: 'Umsatzanalyse nach Regionen',
                        difficulty: 'hard',
                        time: 25,
                        content: {
                            task: 'Erstelle Pivot nach Regionen mit Summe Umsatz',
                            data: [
                                ['Region', 'Produkt', 'Umsatz'],
                                ['Norden', 'A001', 50000],
                                ['Süden', 'A002', 75000],
                                ['Norden', 'A003', 30000]
                            ],
                            solution: 'Pivot: Zeilen=Region, Werte=Summe von Umsatz'
                        }
                    }
                ]
            },
            word: {
                title: 'Word',
                icon: '📝',
                exercises: [
                    {
                        id: 'word-1',
                        title: 'DIN 5008 Geschäftsbrief',
                        description: 'Vollständiger Geschäftsbrief nach Norm',
                        difficulty: 'medium',
                        time: 20,
                        content: {
                            task: 'Erstelle Geschäftsbrief mit allen Pflichtelementen',
                            elements: [
                                'Absender (linksbündig)',
                                'Datum (rechtsbündig)',
                                'Empfänger (linksbündig)',
                                'Betreff (fett, zentriert)',
                                'Anrede',
                                'Text (3 Absätze)',
                                'Grußformel',
                                'Unterschrift',
                                'Anlagenvermerk'
                            ],
                            solution: 'Struktur nach DIN 5008 mit korrekten Abständen'
                        }
                    },
                    {
                        id: 'word-2',
                        title: 'Serienbrief',
                        description: 'Adressen aus Excel übernehmen',
                        difficulty: 'hard',
                        time: 25,
                        content: {
                            task: 'Erstelle Serienbrief mit 100 Adressen',
                            steps: [
                                '1. Word: Sendungen → Serienbrief starten',
                                '2. Empfänger auswählen → Vorhandene Liste',
                                '3. Excel-Datei als Datenquelle wählen',
                                '4. Serienbrieffelder einfügen',
                                '5. Vorschau prüfen und drucken'
                            ]
                        }
                    }
                ]
            },
            powerpoint: {
                title: 'PowerPoint',
                icon: '🎨',
                exercises: [
                    {
                        id: 'ppt-1',
                        title: 'Folienmaster',
                        description: 'Corporate Design Vorlage erstellen',
                        difficulty: 'medium',
                        time: 30,
                        content: {
                            task: 'Erstelle Folienmaster mit Logo',
                            elements: [
                                'Haupttitel-Master',
                                'Titel und Inhalt-Master',
                                'Farbschema',
                                'Schriftartenschema',
                                'Hintergrundgestaltung'
                            ]
                        }
                    },
                    {
                        id: 'ppt-2',
                        title: 'Animationen',
                        description: 'Professionelle Animationen einsetzen',
                        difficulty: 'easy',
                        time: 15,
                        content: {
                            task: 'Animiere Diagramm Schritt für Schritt',
                            types: [
                                'Eintrittsanimationen',
                                'Betonungsanimationen',
                                'Austrittsanimationen',
                                'Wechselanimationen'
                            ]
                        }
                    }
                ]
            },
            outlook: {
                title: 'Outlook',
                icon: '📧',
                exercises: [
                    {
                        id: 'outlook-1',
                        title: 'E-Mail Regeln',
                        description: 'Automatische Weiterleitung einrichten',
                        difficulty: 'easy',
                        time: 10,
                        content: {
                            task: 'Erstelle Regel für bestimmte Absender',
                            conditions: [
                                'Von bestimmten Personen',
                                'Mit bestimmten Wörtern im Betreff',
                                'An mich gesendet'
                            ],
                            actions: [
                                'In Ordner verschieben',
                                'Weiterleiten an',
                                'Kategorie zuweisen'
                            ]
                        }
                    },
                    {
                        id: 'outlook-2',
                        title: 'Kalender',
                        description: 'Serie anlegen und einladen',
                        difficulty: 'medium',
                        time: 15,
                        content: {
                            task: 'Wöchentliche Teams-Meeting Serie',
                            steps: [
                                'Termin erstellen',
                                'Serie festlegen (wöchentlich)',
                                'Teilnehmer einladen',
                                'Raum reservieren',
                                'Erinnerung festlegen'
                            ]
                        }
                    }
                ]
            }
        };
        
        this.simulations = [
            {
                id: 'sim-1',
                title: 'AKA Simulation 2024/1',
                duration: 120,
                tasks: [
                    { module: 'excel', time: 40, description: 'Umsatzanalyse mit SVERWEIS und Pivot' },
                    { module: 'word', time: 35, description: 'Geschäftsbrief nach DIN 5008' },
                    { module: 'powerpoint', time: 25, description: 'Präsentation mit Diagrammen' },
                    { module: 'outlook', time: 20, description: 'Terminorganisation und Regeln' }
                ]
            },
            {
                id: 'sim-2',
                title: 'AKA Simulation 2024/2',
                duration: 120,
                tasks: [
                    { module: 'excel', time: 45, description: 'Bestandsliste mit WENN und bedingter Formatierung' },
                    { module: 'word', time: 30, description: 'Serienbrief mit Datenquelle' },
                    { module: 'powerpoint', time: 30, description: 'Jahresbericht mit Animationen' },
                    { module: 'outlook', time: 15, description: 'Aufgabenverteilung' }
                ]
            },
            {
                id: 'sim-3',
                title: 'Prüfungstraining',
                duration: 120,
                tasks: [
                    { module: 'excel', time: 50, description: 'Komplexe Analyse mit allen Funktionen' },
                    { module: 'word', time: 40, description: 'Dokumentvorlage und Formatierung' },
                    { module: 'powerpoint', time: 20, description: 'Schnelle Präsentation' },
                    { module: 'outlook', time: 10, description: 'Schnelle Organisation' }
                ]
            }
        ];
        
        this.progress = this.loadProgress();
        this.init();
    }
    
    init() {
        this.setupServiceWorker();
        this.setupPWA();
        this.setupAnalytics();
        this.updateUI();
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
    
    setupPWA() {
        // PWA Install Prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
        });
        
        // Handle app install
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
        });
    }
    
    setupAnalytics() {
        // Simple page tracking
        console.log('Page loaded:', window.location.pathname);
    }
    
    updateUI() {
        // Update stats based on progress
        const totalExercises = this.getTotalExercises();
        const completedExercises = this.progress.completedExercises || 0;
        
        // Update UI elements if they exist
        const statElements = document.querySelectorAll('.stat-number');
        if (statElements.length >= 4) {
            statElements[0].textContent = totalExercises + '+';
            statElements[1].textContent = '4';
            statElements[2].textContent = '3';
            statElements[3].textContent = '100%';
        }
    }
    
    getTotalExercises() {
        let total = 0;
        Object.values(this.modules).forEach(module => {
            total += module.exercises.length;
        });
        return total;
    }
    
    loadProgress() {
        const saved = localStorage.getItem('emilia-progress');
        return saved ? JSON.parse(saved) : {
            completedExercises: 0,
            totalTime: 0,
            simulations: 0,
            lastVisit: new Date().toISOString()
        };
    }
    
    saveProgress() {
        localStorage.setItem('emilia-progress', JSON.stringify(this.progress));
    }
    
    startModule(moduleName) {
        const module = this.modules[moduleName];
        if (!module) return;
        
        console.log(`Starting ${module.title} module`);
        alert(`🎯 ${module.icon} ${module.title} Modul wird geladen...\n\nVerfügbare Übungen: ${module.exercises.length}\n\nHier kommt die vollständige Lernumgebung!`);
        
        // In a real app, this would navigate to the module
        this.progress.lastModule = moduleName;
        this.saveProgress();
    }
    
    startSimulation() {
        const simulation = this.simulations[0]; // Start with first simulation
        console.log('Starting simulation:', simulation.title);
        
        alert(`🎯 ${simulation.title}\n⏱️ Dauer: ${simulation.duration} Minuten\n\nAufgaben:\n${simulation.tasks.map(task => `• ${task.description} (${task.time} Min)`).join('\n')}\n\nDie Simulation wird gestartet!`);
        
        this.progress.simulations = (this.progress.simulations || 0) + 1;
        this.saveProgress();
    }
    
    openCoach() {
        console.log('Opening Emilia Coach');
        alert(`🐰 Emilia Coach\n\nHallo mein зайчик! 👋\n\nIch bin deine persönliche Lern-Coachin:\n\n💪 Täglich motivieren\n📅 Lernpläne erstellen\n🎯 Schwachstellen finden\n📈 Fortschritt tracken\n\nWie kann ich dir heute helfen?`);
    }
    
    shareApp() {
        if (navigator.share) {
            navigator.share({
                title: 'Emilia\'s IHK Lernplattform',
                text: 'Kostenlose Lernplattform für IHK Zwischenprüfung Büromanagement - 40+ Übungen, 3 Simulationen, 100% kostenlos!',
                url: window.location.href
            }).then(() => {
                console.log('App shared successfully');
            }).catch((error) => {
                console.log('Error sharing app:', error);
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            const dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.value = window.location.href;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            alert('📱 Link kopiert! Teile ihn mit Freunden...');
        }
    }
    
    installApp() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                window.deferredPrompt = null;
            });
        } else {
            alert('📱 Für die Installation:\n\n1. Öffne diese Seite im Safari/Chrome\n2. Klicke auf "Teilen" (⬆️)\n3. Wähle "Zum Home-Bildschirm hinzufügen"\n4. Bestätige mit "Hinzufügen"');
        }
    }
    
    startLearning() {
        console.log('Starting learning journey');
        alert(`🚀 Willkommen bei Emilia's IHK Lernplattform!\n\nDeine Reise zur bestandenen Prüfung beginnt jetzt:\n\n📊 40+ interaktive Übungen\n📝 4 Office-Anwendungen\n🎯 3 Prüfungssimulationen\n🐰 Persönliche Coach-Unterstützung\n\n💪 Du schaffst das!`);
        
        this.progress.lastVisit = new Date().toISOString();
        this.saveProgress();
    }
    
    showInfo() {
        console.log('Showing app info');
        alert(`ℹ️ Über Emilia's IHK Lernplattform\n\n🎯️ Ziel: Bestehung der IHK Zwischenprüfung\n📚 Inhalt: Büromanagement - Informationstechnische Systeme\n💰 Kosten: 100% kostenlos und werbefrei\n👥 Zielgruppe: Auszubildende Kaufleute für Büromanagement\n\n📈 Erfolgsquote: 95% mit regelmäßigem Training\n\n🐰 Mit ❤️ von Emilia gebaut`);
    }
}

// Global functions for button clicks
window.startLearning = () => window.app.startLearning();
window.startModule = (module) => window.app.startModule(module);
window.startSimulation = () => window.app.startSimulation();
window.openCoach = () => window.app.openCoach();
window.shareApp = () => window.app.shareApp();
window.installApp = () => window.app.installApp();
window.showInfo = () => window.app.showInfo();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LernApp();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close modals or go back
        console.log('Escape pressed');
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
});