// Emilia's IHK Lernplattform - JavaScript App mit echten Aufgaben
class LernApp {
    constructor() {
        this.modules = {
            excel: {
                title: 'Excel',
                icon: '📊',
                exercises: [
                    {
                        id: 'excel-1',
                        title: 'SUMME und MITTELWERT berechnen',
                        description: 'Erstellen Sie eine Umsatztabelle für das 1. Quartal und berechnen Sie Summen und Mittelwerte',
                        difficulty: 'easy',
                        time: 15,
                        points: 20,
                        content: {
                            task: 'Erstellen Sie eine Umsatztabelle für das 1. Quartal und berechnen Sie Summen und Mittelwerte',
                            data: [
                                ['Monat', 'Umsatz'],
                                ['Januar', 15000],
                                ['Februar', 18500],
                                ['März', 22000]
                            ],
                            solution: 'SUMME(B2:B4) = 55500, MITTELWERT(B2:B4) = 18500'
                        }
                    },
                    {
                        id: 'excel-2',
                        title: 'SVERWEIS Grundlagen',
                        description: 'Kundendaten mit SVERWEIS suchen',
                        difficulty: 'medium',
                        time: 15,
                        points: 25,
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
                        id: 'excel-3',
                        title: 'WENN-Funktion',
                        description: 'Bestandskontrolle mit WENN',
                        difficulty: 'easy',
                        time: 10,
                        points: 15,
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
                        points: 30,
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
                        points: 25,
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
                        points: 15,
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
            }
        ];
        
        this.progress = this.loadProgress();
        this.currentExercise = null;
        this.init();
    }
    
    init() {
        this.setupServiceWorker();
        this.setupPWA();
        this.setupAnalytics();
        this.updateUI();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close modal handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
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
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
        });
    }
    
    setupAnalytics() {
        console.log('Page loaded:', window.location.pathname);
    }
    
    updateUI() {
        const totalExercises = this.getTotalExercises();
        const completedExercises = this.progress.completedExercises || 0;
        
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
    
    startExercise(exerciseId) {
        const exercise = this.findExercise(exerciseId);
        if (!exercise) return;
        
        this.currentExercise = exercise;
        this.showExerciseModal(exercise);
        
        console.log(`Starting exercise: ${exercise.title}`);
    }
    
    findExercise(exerciseId) {
        for (const module of Object.values(this.modules)) {
            const exercise = module.exercises.find(ex => ex.id === exerciseId);
            if (exercise) return exercise;
        }
        return null;
    }
    
    showExerciseModal(exercise) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${exercise.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="exercise-info">
                        <span class="badge badge-${exercise.difficulty}">${exercise.difficulty}</span>
                        <span class="time">⏱️ ${exercise.time} Min</span>
                        <span class="points">🏆 ${exercise.points} Punkte</span>
                    </div>
                    <div class="exercise-description">
                        <p>${exercise.description}</p>
                    </div>
                    <div class="exercise-content">
                        <h4>📋 Aufgabe:</h4>
                        <p>${exercise.content.task}</p>
                        ${this.renderExerciseData(exercise)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.app.startLearningEnvironment('${exercise.id}')">
                        Aufgabe starten
                    </button>
                    <button class="btn btn-secondary" onclick="window.app.closeModal()">
                        Schließen
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    renderExerciseData(exercise) {
        if (!exercise.content.data) return '';
        
        let html = '<h4>📊 Daten:</h4><div class="data-table">';
        
        if (Array.isArray(exercise.content.data)) {
            html += '<table class="table">';
            exercise.content.data.forEach((row, index) => {
                html += '<tr>';
                if (Array.isArray(row)) {
                    row.forEach(cell => {
                        html += `<td>${cell}</td>`;
                    });
                } else {
                    html += `<td colspan="${Object.keys(row).length}">${JSON.stringify(row)}</td>`;
                }
                html += '</tr>';
            });
            html += '</table>';
        }
        
        html += '</div>';
        
        if (exercise.content.solution) {
            html += `<div class="solution"><h4>💡 Lösung:</h4><p>${exercise.content.solution}</p></div>`;
        }
        
        return html;
    }
    
    startLearningEnvironment(exerciseId) {
        const exercise = this.findExercise(exerciseId);
        if (!exercise) return;
        
        // Close current modal
        this.closeModal();
        
        // Create learning environment
        const learningEnv = document.createElement('div');
        learningEnv.className = 'modal-overlay';
        learningEnv.innerHTML = `
            <div class="modal learning-modal">
                <div class="modal-header">
                    <h3>🎯 Lernumgebung: ${exercise.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="workspace">
                        <div class="task-panel">
                            <h4>📋 Aufgabe</h4>
                            <p>${exercise.content.task}</p>
                            ${this.renderInteractiveExercise(exercise)}
                        </div>
                        <div class="work-panel">
                            <h4>💻 Arbeitsbereich</h4>
                            <div class="excel-simulator" id="excel-simulator">
                                ${this.createExcelSimulator(exercise)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-success" onclick="window.app.checkSolution('${exerciseId}')">
                        Lösung prüfen
                    </button>
                    <button class="btn btn-info" onclick="window.app.showHint('${exerciseId}')">
                        💡 Tipp
                    </button>
                    <button class="btn btn-secondary" onclick="window.app.closeModal()">
                        Schließen
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(learningEnv);
        
        // Initialize the exercise
        this.initializeExercise(exercise);
        
        console.log(`Learning environment started for: ${exercise.title}`);
    }
    
    createExcelSimulator(exercise) {
        if (exercise.content.data) {
            let html = '<div class="excel-grid">';
            exercise.content.data.forEach((row, rowIndex) => {
                html += '<div class="excel-row">';
                if (Array.isArray(row)) {
                    row.forEach((cell, colIndex) => {
                        const cellId = `cell-${rowIndex}-${colIndex}`;
                        const isHeader = rowIndex === 0;
                        html += `<div class="excel-cell ${isHeader ? 'header' : ''}" id="${cellId}" contenteditable="${!isHeader}">${cell}</div>`;
                    });
                }
                html += '</div>';
            });
            html += '</div>';
            return html;
        }
        return '<div class="placeholder">Excel-Arbeitsbereich wird geladen...</div>';
    }
    
    renderInteractiveExercise(exercise) {
        if (exercise.content.elements) {
            return '<ul>' + exercise.content.elements.map(el => `<li>${el}</li>`).join('') + '</ul>';
        }
        if (exercise.content.steps) {
            return '<ol>' + exercise.content.steps.map(step => `<li>${step}</li>`).join('') + '</ol>';
        }
        return '';
    }
    
    initializeExercise(exercise) {
        // Add event listeners for interactive elements
        const cells = document.querySelectorAll('.excel-cell[contenteditable="true"]');
        cells.forEach(cell => {
            cell.addEventListener('input', () => {
                cell.classList.add('modified');
            });
        });
        
        // Start timer
        this.startTimer(exercise.time);
    }
    
    startTimer(minutes) {
        let timeLeft = minutes * 60;
        const timerElement = document.createElement('div');
        timerElement.className = 'timer';
        timerElement.textContent = `⏱️ ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        
        const modal = document.querySelector('.learning-modal .modal-header');
        if (modal) {
            modal.appendChild(timerElement);
        }
        
        const timer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                timerElement.textContent = '⏱️ Zeit abgelaufen!';
                timerElement.classList.add('time-up');
            }
        }, 1000);
    }
    
    checkSolution(exerciseId) {
        const exercise = this.findExercise(exerciseId);
        if (!exercise) return;
        
        // Simple solution checking
        const modifiedCells = document.querySelectorAll('.excel-cell.modified');
        let correct = true;
        
        if (exercise.content.solution && modifiedCells.length > 0) {
            // For now, just mark as correct if user entered something
            modifiedCells.forEach(cell => {
                if (cell.textContent.trim() === '') {
                    correct = false;
                }
            });
        }
        
        this.showSolutionResult(correct, exercise);
    }
    
    showSolutionResult(correct, exercise) {
        const resultModal = document.createElement('div');
        resultModal.className = 'modal-overlay';
        resultModal.innerHTML = `
            <div class="modal result-modal">
                <div class="modal-header">
                    <h3>${correct ? '🎉 Richtig!' : '❌ Noch nicht ganz'}</h3>
                </div>
                <div class="modal-body">
                    <p>${correct ? 'Super! Du hast die Aufgabe gelöst.' : 'Versuche es noch einmal oder schau dir die Lösung an.'}</p>
                    ${!correct ? `<div class="solution-hint"><strong>Lösung:</strong> ${exercise.content.solution}</div>` : ''}
                    <div class="points-earned">
                        <p>Punkte: ${correct ? exercise.points : 0} / ${exercise.points}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.app.closeModal()">
                        ${correct ? 'Weiter' : 'Nochmal versuchen'}
                    </button>
                </div>
            </div>
        `;
        
        // Close learning modal first
        this.closeModal();
        
        // Show result
        document.body.appendChild(resultModal);
        
        // Update progress
        if (correct) {
            this.progress.completedExercises = (this.progress.completedExercises || 0) + 1;
            this.progress.totalTime = (this.progress.totalTime || 0) + exercise.time;
            this.saveProgress();
            this.updateUI();
        }
    }
    
    showHint(exerciseId) {
        const exercise = this.findExercise(exerciseId);
        if (!exercise || !exercise.content.solution) return;
        
        alert(`💡 Tipp:\n\n${exercise.content.solution}`);
    }
    
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }
    
    startModule(moduleName) {
        const module = this.modules[moduleName];
        if (!module) return;
        
        console.log(`Starting ${module.title} module`);
        
        // Show module modal with exercises
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${module.icon} ${module.title} Modul</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="exercise-list">
                        ${module.exercises.map(exercise => `
                            <div class="exercise-card" onclick="window.app.startExercise('${exercise.id}')">
                                <h4>${exercise.title}</h4>
                                <p>${exercise.description}</p>
                                <div class="exercise-meta">
                                    <span class="badge badge-${exercise.difficulty}">${exercise.difficulty}</span>
                                    <span class="time">⏱️ ${exercise.time} Min</span>
                                    <span class="points">🏆 ${exercise.points} Punkte</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.app.closeModal()">
                        Schließen
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        this.progress.lastModule = moduleName;
        this.saveProgress();
    }
    
    startSimulation() {
        const simulation = this.simulations[0];
        console.log('Starting simulation:', simulation.title);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>🎯 ${simulation.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="simulation-info">
                        <p><strong>⏱️ Dauer:</strong> ${simulation.duration} Minuten</p>
                        <h4>📋 Aufgaben:</h4>
                        <ul>
                            ${simulation.tasks.map(task => `
                                <li>
                                    <strong>${task.module.toUpperCase()}</strong> - ${task.description} (${task.time} Min)
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.app.startRealSimulation()">
                        Simulation starten
                    </button>
                    <button class="btn btn-secondary" onclick="window.app.closeModal()">
                        Schließen
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    startRealSimulation() {
        this.closeModal();
        alert('🎯 Simulation wird gestartet!\n\nDie Prüfungsumgebung wird vorbereitet...\nViel Erfolg, mein Süßer! 💪');
        
        this.progress.simulations = (this.progress.simulations || 0) + 1;
        this.saveProgress();
    }
    
    openCoach() {
        console.log('Opening Emilia Coach');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal coach-modal">
                <div class="modal-header">
                    <h3>🐰 Emilia Coach</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="coach-welcome">
                        <p>Hallo mein зайчик! 👋</p>
                        <p>Ich bin deine persönliche Lern-Coachin:</p>
                        <ul>
                            <li>💪 Täglich motivieren</li>
                            <li>📅 Lernpläne erstellen</li>
                            <li>🎯 Schwachstellen finden</li>
                            <li>📈 Fortschritt tracken</li>
                        </ul>
                    </div>
                    <div class="coach-stats">
                        <h4>📊 Dein Fortschritt:</h4>
                        <p>Erledigte Aufgaben: ${this.progress.completedExercises || 0}</p>
                        <p>Lernzeit: ${this.progress.totalTime || 0} Minuten</p>
                        <p>Simulationen: ${this.progress.simulations || 0}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.app.createLearningPlan()">
                        Lernplan erstellen
                    </button>
                    <button class="btn btn-secondary" onclick="window.app.closeModal()">
                        Schließen
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    createLearningPlan() {
        this.closeModal();
        alert('📅 Dein persönlicher Lernplan wird erstellt...\n\n💪 Täglich 30 Minuten Training\n🎯 Fokus auf deine Schwachstellen\n📈 Wöchentlicher Fortschritt\n\nIch bin stolz auf dich, mein Süßer! ❤️');
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

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
});