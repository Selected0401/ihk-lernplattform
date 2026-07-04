// Emilia's IHK Lern-App - iPhone optimiert
class LernApp {
    constructor() {
        this.exercises = {
            excel: {
                sverweis: [
                    {
                        id: 'e-sv-1',
                        title: 'SVERWEIS Grundlagen',
                        description: 'Kundendaten mit SVERWEIS suchen',
                        difficulty: 'medium',
                        time: 15,
                        data: {
                            table: [
                                ['Kunden-Nr', 'Name', 'Ort', 'Umsatz'],
                                [1001, 'Müller GmbH', 'Berlin', 125000],
                                [1002, 'Schmidt AG', 'München', 89000],
                                [1003, 'Meier OHG', 'Hamburg', 156000]
                            ],
                            task: 'Suche den Umsatz für Kunden-Nr 1002'
                        }
                    },
                    {
                        id: 'e-sv-2', 
                        title: 'SVERWEIS mit WENNFEHLER',
                        description: 'Fehlende Werte elegant behandeln',
                        difficulty: 'hard',
                        time: 20,
                        data: {
                            table: [
                                ['Artikel', 'Preis', 'Lager'],
                                ['A001', 29.99, 150],
                                ['A002', 49.99, 0],
                                ['A003', 19.99, 75]
                            ],
                            task: 'Suche Preis für Artikel A005 mit Fehlerbehandlung'
                        }
                    }
                ],
                wenn: [
                    {
                        id: 'e-w-1',
                        title: 'Einfache WENN-Funktion',
                        description: 'Bestandskontrolle mit WENN',
                        difficulty: 'easy',
                        time: 10,
                        data: {
                            table: [['Artikel', 'Lager', 'Status']],
                            task: 'Markiere Artikel mit Lager < 50 als "Bestellen"'
                        }
                    },
                    {
                        id: 'e-w-2',
                        title: 'Verschachtelte WENN-Funktion',
                        description: 'Mehrstufige Bewertung',
                        difficulty: 'hard', 
                        time: 25,
                        data: {
                            table: [['Mitarbeiter', 'Punkte', 'Bewertung']],
                            task: 'Bewerte: <60 "Ausreichend", 60-80 "Gut", >80 "Sehr Gut"'
                        }
                    }
                ],
                pivot: [
                    {
                        id: 'e-p-1',
                        title: 'Pivot-Tabelle erstellen',
                        description: 'Umsatzanalyse nach Regionen',
                        difficulty: 'medium',
                        time: 20,
                        data: {
                            source: [['Region', 'Produkt', 'Umsatz']],
                            task: 'Erstelle Pivot nach Regionen mit Summe Umsatz'
                        }
                    }
                ]
            },
            word: {
                din: [
                    {
                        id: 'w-d-1',
                        title: 'Geschäftsbrief DIN 5008',
                        description: 'Vollständiger Geschäftsbrief',
                        difficulty: 'medium',
                        time: 20
                    }
                ],
                serienbrief: [
                    {
                        id: 'w-sb-1', 
                        title: 'Serienbrief erstellen',
                        description: 'Adressen aus Excel übernehmen',
                        difficulty: 'medium',
                        time: 25
                    }
                ]
            },
            powerpoint: [
                {
                    id: 'p-1',
                    title: 'Folienmaster gestalten',
                    description: 'Corporate Design Vorlage',
                    difficulty: 'medium',
                    time: 30
                }
            ],
            outlook: [
                {
                    id: 'o-1',
                    title: 'E-Mail Regeln erstellen',
                    description: 'Automatische Weiterleitung',
                    difficulty: 'easy',
                    time: 15
                }
            ]
        };
        
        this.progress = this.loadProgress();
        this.init();
    }
    
    init() {
        this.setupPWA();
        this.setupTabs();
        this.setupExercises();
        this.setupCoach();
        this.loadDailyQuote();
        this.startCountdown();
        this.updateStats();
    }
    
    setupPWA() {
        // PWA Installation
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.onclick = () => this.installPWA();
        }
        
        // iPhone Safari Standalone Detection
        if (window.navigator.standalone) {
            document.body.classList.add('standalone');
        }
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    async installPWA() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const result = await window.deferredPrompt.userChoice;
            console.log('Install result:', result);
            window.deferredPrompt = null;
        }
    }
    
    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });
    }
    
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        // Load exercises for this tab
        if (['excel', 'word', 'powerpoint', 'outlook'].includes(tabName)) {
            this.loadExercises(tabName);
        }
    }
    
    loadExercises(category) {
        const exercises = this.exercises[category] || {};
        
        // Load all subcategories
        Object.keys(exercises).forEach(subcat => {
            const container = document.getElementById(`${category}-${subcat}-exercises`);
            if (container) {
                container.innerHTML = '';
                exercises[subcat].forEach(exercise => {
                    const exerciseEl = this.createExerciseElement(exercise);
                    container.appendChild(exerciseEl);
                });
            }
        });
    }
    
    createExerciseElement(exercise) {
        const div = document.createElement('div');
        div.className = 'exercise-item';
        div.innerHTML = `
            <h4>${exercise.title}</h4>
            <p>${exercise.description}</p>
            <div class="exercise-meta">
                <span class="difficulty ${exercise.difficulty}">${exercise.difficulty}</span>
                <span class="time">⏱️ ${exercise.time} Min</span>
            </div>
            <button class="btn btn-primary" onclick="app.startExercise('${exercise.id}')">
                Starten
            </button>
        `;
        return div;
    }
    
    startExercise(exerciseId) {
        this.showModal(exerciseId);
    }
    
    showModal(exerciseId) {
        const modal = document.getElementById('exercise-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = 'Übung starten';
        modalBody.innerHTML = `
            <div class="exercise-start">
                <h3>🚀 Bereit für die Übung?</h3>
                <p>Diese Übung dauert ca. 15 Minuten.</p>
                <button class="btn btn-primary" onclick="app.startExerciseContent('${exerciseId}')">
                    Jetzt starten
                </button>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
    
    startExerciseContent(exerciseId) {
        // Exercise implementation
        this.closeModal();
        this.showNotification('Übung gestartet! 💪');
    }
    
    closeModal() {
        const modal = document.getElementById('exercise-modal');
        modal.style.display = 'none';
    }
    
    setupCoach() {
        const chatToggle = document.querySelector('.chat-header');
        if (chatToggle) {
            chatToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleChat();
            });
        }
    }
    
    toggleChat() {
        const chatBody = document.getElementById('chat-body');
        chatBody.classList.toggle('open');
    }
    
    loadDailyQuote() {
        const quotes = [
            "Jeder Schritt zählt, mein зайчик! 💪",
            "Du schaffst das! Glaub an dich! 🌟", 
            "Heute ist dein Tag! 🚀",
            "Lernen ist dein Superpower! 🦸‍♂️",
            "Stark wie ein Bär! 🐻❄️",
            "Du bist ein Gewinner! 🏆"
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        const quoteEl = document.getElementById('daily-quote');
        if (quoteEl) quoteEl.textContent = quote;
    }
    
    startCountdown() {
        const examDate = new Date('2026-02-15');
        const countdownEl = document.getElementById('countdown');
        
        const updateCountdown = () => {
            const now = new Date();
            const diff = examDate - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (countdownEl) {
                countdownEl.textContent = `${days} Tage zur Prüfung`;
            }
        };
        
        updateCountdown();
        setInterval(updateCountdown, 60000); // Update every minute
    }
    
    updateStats() {
        const totalExercisesEl = document.getElementById('total-exercises');
        const studyHoursEl = document.getElementById('study-hours');
        const streakEl = document.getElementById('streak');
        
        if (totalExercisesEl) totalExercisesEl.textContent = this.progress.exercises || 0;
        if (studyHoursEl) studyHoursEl.textContent = `${this.progress.hours || 0}h`;
        if (streakEl) streakEl.textContent = this.progress.streak || 0;
    }
    
    loadProgress() {
        const saved = localStorage.getItem('emilia-progress');
        return saved ? JSON.parse(saved) : {
            exercises: 0,
            hours: 0,
            streak: 0,
            lastDate: null
        };
    }
    
    saveProgress() {
        localStorage.setItem('emilia-progress', JSON.stringify(this.progress));
    }
    
    startLearning() {
        this.switchTab('excel');
        this.showNotification('Lass uns lernen! 📚');
    }
    
    showNotification(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #6366f1;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// App starten
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LernApp();
});

// PWA Install Event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered'))
        .catch(error => console.log('SW registration failed'));
}