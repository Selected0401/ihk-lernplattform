// Prüfungskern Büro - Modern JavaScript mit Performance-Optimierung

// Globale Konstanten und Variablen
const APP_CONFIG = {
    examDate: new Date('2026-02-26T09:00:00'),
    storageKey: 'emiliaLearningProgress',
    themeKey: 'emiliaTheme',
    animationDuration: 300,
    toastDuration: 3000,
    modules: {
        word: { name: 'Textverarbeitung', icon: '📝', color: '#667eea' },
        excel: { name: 'Tabellenkalkulation', icon: '📊', color: '#f093fb' },
        practice: { name: 'Prüfungssimulation', icon: '🎯', color: '#ff6b9d' }
    }
};

// Application State
let appState = {
    learningProgress: {
        word: 0,
        excel: 0,
        practice: 0
    },
    currentModule: null,
    isDarkMode: false,
    dailyChallengeCompleted: false,
    isLoading: false
};

// DOM Elements Cache
const elements = {};

// Utility Functions
const utils = {
    // Debounce Funktion für Performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle Funktion für Scroll Events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Format Zeit für Countdown
    formatTime(milliseconds) {
        const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        
        return {
            days: days.toString().padStart(2, '0'),
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            total: milliseconds
        };
    },

    // Lokalen Speicher nutzen
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Storage read error:', error);
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('Storage write error:', error);
                return false;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Storage remove error:', error);
                return false;
            }
        }
    },

    // Animation Helper
    animate(element, keyframes, options = {}) {
        const defaultOptions = {
            duration: APP_CONFIG.animationDuration,
            easing: 'ease-out',
            fill: 'forwards'
        };
        
        return element.animate(keyframes, { ...defaultOptions, ...options });
    }
};

// Theme Management
const themeManager = {
    init() {
        this.loadTheme();
        this.setupThemeToggle();
        this.watchSystemTheme();
    },

    loadTheme() {
        const savedTheme = utils.storage.get(APP_CONFIG.themeKey, 'light');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        appState.isDarkMode = savedTheme === 'dark' || (savedTheme === 'system' && systemPrefersDark);
        this.applyTheme(appState.isDarkMode);
    },

    applyTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        const themeIcon = elements.themeToggle?.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = isDark ? '☀️' : '🌙';
        }
        appState.isDarkMode = isDark;
    },

    toggleTheme() {
        this.applyTheme(!appState.isDarkMode);
        utils.storage.set(APP_CONFIG.themeKey, appState.isDarkMode ? 'dark' : 'light');
        this.showToast('Theme gewechselt', 'success');
    },

    setupThemeToggle() {
        elements.themeToggle = document.getElementById('theme-toggle');
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    },

    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            const savedTheme = utils.storage.get(APP_CONFIG.themeKey, 'system');
            if (savedTheme === 'system') {
                this.applyTheme(e.matches);
            }
        });
    }
};

// Countdown Manager
const countdownManager = {
    interval: null,

    init() {
        this.updateCountdown();
        this.interval = setInterval(() => this.updateCountdown(), 1000);
    },

    updateCountdown() {
        const now = new Date();
        const timeLeft = APP_CONFIG.examDate - now;
        
        if (timeLeft > 0) {
            const time = utils.formatTime(timeLeft);
            
            Object.keys(time).forEach(unit => {
                const element = document.getElementById(unit);
                if (element && unit !== 'total') {
                    element.textContent = time[unit];
                }
            });
        } else {
            this.stopCountdown();
            this.showExamStarted();
        }
    },

    stopCountdown() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    showExamStarted() {
        ['days', 'hours', 'minutes', 'seconds'].forEach(unit => {
            const element = document.getElementById(unit);
            if (element) {
                element.textContent = '00';
            }
        });
        notificationManager.showToast('Die Prüfung hat begonnen! Viel Erfolg! 🎯', 'warning');
    }
};

// Progress Manager
const progressManager = {
    init() {
        this.loadProgress();
        this.updateProgressDisplay();
    },

    loadProgress() {
        const saved = utils.storage.get(APP_CONFIG.storageKey);
        if (saved) {
            appState.learningProgress = { ...appState.learningProgress, ...saved };
        }
    },

    saveProgress() {
        utils.storage.set(APP_CONFIG.storageKey, appState.learningProgress);
    },

    updateProgress(module, percentage) {
        appState.learningProgress[module] = Math.min(100, appState.learningProgress[module] + percentage);
        this.saveProgress();
        this.updateProgressDisplay();
        
        const moduleName = APP_CONFIG.modules[module]?.name || module;
        notificationManager.showToast(
            `Super, mein зайчик! ${moduleName}: ${appState.learningProgress[module]}%`,
            'success'
        );
    },

    updateProgressDisplay() {
        Object.keys(appState.learningProgress).forEach(module => {
            const progress = appState.learningProgress[module];
            const progressBar = document.getElementById(`${module}-progress`);
            const percentageText = document.getElementById(`${module}-percentage`);
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (percentageText) {
                percentageText.textContent = `${progress}%`;
            }
        });
    }
};

// Modal Manager
const modalManager = {
    modal: null,
    isVisible: false,

    init() {
        this.modal = document.getElementById('modal');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Close on outside click
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.close();
            }
        });
    },

    open(title, content) {
        if (!this.modal) return;
        
        const titleElement = document.getElementById('modal-title');
        const bodyElement = document.getElementById('modal-body');
        
        if (titleElement) titleElement.textContent = title;
        if (bodyElement) bodyElement.innerHTML = content;
        
        this.modal.classList.add('active');
        this.isVisible = true;
        document.body.style.overflow = 'hidden';
    },

    close() {
        if (!this.modal) return;
        
        this.modal.classList.remove('active');
        this.isVisible = false;
        document.body.style.overflow = '';
    }
};

// Notification Manager (Toast)
const notificationManager = {
    container: null,
    
    init() {
        this.container = document.getElementById('toast-container');
    },

    showToast(message, type = 'info', duration = APP_CONFIG.toastDuration) {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 2000;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;
        
        toast.style.cssText = `
            pointer-events: auto;
            margin-bottom: 10px;
            animation: slideIn 0.3s ease;
        `;
        
        this.container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
};

// Module Manager
const moduleManager = {
    init() {
        this.setupModuleCards();
    },

    setupModuleCards() {
        const cards = document.querySelectorAll('.module-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', this.addHoverEffect);
            card.addEventListener('mouseleave', this.removeHoverEffect);
            card.addEventListener('click', this.handleCardClick);
        });
    },

    addHoverEffect(e) {
        utils.animate(e.currentTarget, {
            transform: ['translateY(0)', 'translateY(-8px)'],
            boxShadow: ['0 4px 8px rgba(0,0,0,0.1)', '0 20px 40px rgba(0,0,0,0.15)']
        });
    },

    removeHoverEffect(e) {
        utils.animate(e.currentTarget, {
            transform: ['translateY(-8px)', 'translateY(0)'],
            boxShadow: ['0 20px 40px rgba(0,0,0,0.15)', '0 4px 8px rgba(0,0,0,0.1)']
        });
    },

    handleCardClick(e) {
        const card = e.currentTarget;
        const moduleType = this.getModuleType(card);
        if (moduleType) {
            this.openModule(moduleType);
        }
    },

    getModuleType(card) {
        const onclick = card.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/openModule\('(\w+)'\)/);
            return match ? match[1] : null;
        }
        return null;
    },

    openModule(moduleType) {
        appState.currentModule = moduleType;
        
        switch(moduleType) {
            case 'word':
                this.showWordModule();
                break;
            case 'excel':
                this.showExcelModule();
                break;
            case 'practice':
                this.showPracticeModule();
                break;
            case 'tutor':
                this.showTutorModule();
                break;
            default:
                notificationManager.showToast('Modul nicht gefunden', 'error');
        }
    },

    showWordModule() {
        const content = `
            <div class="tabs">
                <button class="tab-btn active" onclick="this.switchTab('din')">DIN 5008</button>
                <button class="tab-btn" onclick="this.switchTab('briefe')">Briefe</button>
                <button class="tab-btn" onclick="this.switchTab('protokolle')">Protokolle</button>
                <button class="tab-btn" onclick="this.switchTab('serien')">Serienbriefe</button>
            </div>
            <div class="tab-content active" id="din-tab">
                ${this.getDIN5008Content()}
            </div>
            <div class="tab-content" id="briefe-tab">
                ${this.getBriefeContent()}
            </div>
            <div class="tab-content" id="protokolle-tab">
                ${this.getProtokolleContent()}
            </div>
            <div class="tab-content" id="serien-tab">
                ${this.getSerienbriefeContent()}
            </div>
        `;
        
        modalManager.open('📝 Microsoft Word', content);
        this.setupTabs();
    },

    showExcelModule() {
        const content = `
            <div class="tabs">
                <button class="tab-btn active" onclick="this.switchTab('grundlagen')">Grundlagen</button>
                <button class="tab-btn" onclick="this.switchTab('formeln')">Formeln</button>
                <button class="tab-btn" onclick="this.switchTab('sverweis')">SVERWEIS</button>
                <button class="tab-btn" onclick="this.switchTab('pivot')">Pivot-Tabellen</button>
            </div>
            <div class="tab-content active" id="grundlagen-tab">
                ${this.getExcelGrundlagenContent()}
            </div>
            <div class="tab-content" id="formeln-tab">
                ${this.getExcelFormelnContent()}
            </div>
            <div class="tab-content" id="sverweis-tab">
                ${this.getExcelSverweisContent()}
            </div>
            <div class="tab-content" id="pivot-tab">
                ${this.getExcelPivotContent()}
            </div>
        `;
        
        modalManager.open('📊 Microsoft Excel', content);
        this.setupTabs();
    },

    showPracticeModule() {
        const content = `
            <div class="practice-options">
                <div class="practice-card" onclick="moduleManager.startSimulation('word')">
                    <h3>Word-Prüfung (60 Min)</h3>
                    <p>Briefe und Dokumente nach DIN 5008 erstellen</p>
                </div>
                <div class="practice-card" onclick="moduleManager.startSimulation('excel')">
                    <h3>Excel-Prüfung (60 Min)</h3>
                    <p>Berechnungen und Auswertungen durchführen</p>
                </div>
                <div class="practice-card" onclick="moduleManager.startSimulation('full')">
                    <h3>Vollsimulation (120 Min)</h3>
                    <p>Ganzheitliche Prüfungsaufgabe</p>
                </div>
            </div>
        `;
        
        modalManager.open('🎯 Prüfungssimulation', content);
    },

    showTutorModule() {
        const content = `
            <div class="tutor-chat">
                <div class="chat-messages" id="chat-messages">
                    <div class="message tutor-message">
                        <span class="message-text">Hallo mein зайчик! Wie kann ich dir heute beim Lernen helfen? 💝</span>
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="tutor-input" placeholder="Stell mir deine Frage..." onkeypress="moduleManager.handleTutorKeyPress(event)">
                    <button onclick="moduleManager.sendTutorMessage()">Senden</button>
                </div>
            </div>
        `;
        
        modalManager.open('💝 Emilia Tutor', content);
    },

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.textContent.toLowerCase();
                this.switchTab(tabName);
            });
        });
    },

    switchTab(tabName) {
        // Remove active class from all tabs and buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and button
        const targetTab = document.getElementById(`${tabName}-tab`);
        const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
            btn.textContent.toLowerCase().includes(tabName)
        );
        
        if (targetTab) targetTab.classList.add('active');
        if (targetBtn) targetBtn.classList.add('active');
    },

    startSimulation(type) {
        const messages = {
            word: 'Word-Prüfungssimulation (60 Min) startet!',
            excel: 'Excel-Prüfungssimulation (60 Min) startet!',
            full: 'Vollsimulation (120 Min) startet! Viel Erfolg, mein зайчик! 🎯'
        };
        
        notificationManager.showToast(messages[type], 'info');
        progressManager.updateProgress('practice', 15);
        modalManager.close();
    },

    handleTutorKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendTutorMessage();
        }
    },

    sendTutorMessage() {
        const input = document.getElementById('tutor-input');
        const message = input.value.trim();
        
        if (message) {
            const chatMessages = document.getElementById('chat-messages');
            
            // User message
            const userMsg = document.createElement('div');
            userMsg.className = 'message user-message';
            userMsg.innerHTML = `<span class="message-text">${message}</span>`;
            chatMessages.appendChild(userMsg);
            
            // Tutor response
            setTimeout(() => {
                const tutorMsg = document.createElement('div');
                tutorMsg.className = 'message tutor-message';
                tutorMsg.innerHTML = `<span class="message-text">Das ist eine gute Frage, mein зайчик! Lass uns das gemeinsam durchgehen... 💝</span>`;
                chatMessages.appendChild(tutorMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
            
            input.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    },

    // Content Generators
    getDIN5008Content() {
        return `
            <div class="lesson">
                <h3>DIN 5008 - Schreib- und Gestaltungsregeln</h3>
                <div class="lesson-content">
                    <h4>Wichtige Regeln für deine Prüfung:</h4>
                    <ul>
                        <li><strong>Zeichenabstand:</strong> 1 Zeile = 1,5 Zeilenabstand</li>
                        <li><strong>Schriftart:</strong> 12pt (oder 10pt bei engem Platz)</li>
                        <li><strong>Ränder:</strong> Links 2,5cm, Rechts 2cm, Oben/Unten 2cm</li>
                        <li><strong>Briefaufbau:</strong> Absender + Empfänger + Datum + Betreff + Anrede + Text + Grußformel + Unterschrift</li>
                    </ul>
                    
                    <h4>Prüfungsaufgabe:</h4>
                    <p>Erstelle einen Geschäftsbrief an die Firma Nüra GmbH bezüglich einer Lieferverzögerung.</p>
                    
                    <div class="practice-actions">
                        <button class="btn" onclick="progressManager.updateProgress('word', 10)">Übung abgeschlossen</button>
                        <button class="btn btn-outline">Vorlage anzeigen</button>
                    </div>
                </div>
            </div>
        `;
    },

    getBriefeContent() {
        return `
            <div class="lesson">
                <h3>Geschäftsbriefe</h3>
                <div class="lesson-content">
                    <h4>Bestandteile eines Geschäftsbriefes:</h4>
                    <ul>
                        <li>Briefkopf mit Absender</li>
                        <li>Datum und Ort</li>
                        <li>Empfängeradresse</li>
                        <li>Betreffzeile</li>
                        <li>Anrede</li>
                        <li>Brieftext</li>
                        <li>Grußformel</li>
                        <li>Unterschrift</li>
                    </ul>
                    
                    <div class="practice-actions">
                        <button class="btn" onclick="progressManager.updateProgress('word', 5)">Übung starten</button>
                    </div>
                </div>
            </div>
        `;
    },

    getProtokolleContent() {
        return `
            <div class="lesson">
                <h3>Meeting-Protokolle</h3>
                <div class="lesson-content">
                    <h4>Aufbau eines Protokolls:</h4>
                    <ul>
                        <li>Kopfdaten: Datum, Uhrzeit, Ort, Teilnehmer</li>
                        <li>Tagesordnung</li>
                        <li>Besprechungspunkte</li>
                        <li>Entscheidungen</li>
                        <li>Aufgabenverteilung</li>
                        <li>Nächster Termin</li>
                    </ul>
                    
                    <div class="practice-actions">
                        <button class="btn" onclick="progressManager.updateProgress('word', 5)">Übung starten</button>
                    </div>
                </div>
            </div>
        `;
    },

    getSerienbriefeContent() {
        return `
            <div class="lesson">
                <h3>Serienbriefe</h3>
                <div class="lesson-content">
                    <h4>Serienbrief-Funktion in Word:</h4>
                    <ul>
                        <li>Datenquelle erstellen (Excel/Tabelle)</li>
                        <li>Hauptdokument gestalten</li>
                        <li>Serienbrief-Assistent verwenden</li>
                        <li>Felder einfügen</li>
                        <li>Vorschau und drucken</li>
                    </ul>
                    
                    <div class="practice-actions">
                        <button class="btn" onclick="progressManager.updateProgress('word', 5)">Übung starten</button>
                    </div>
                </div>
            </div>
        `;
    },

    getExcelGrundlagenContent() {
        return `
            <div class="lesson">
                <h3>Excel Grundlagen</h3>
                <div class="lesson-content">
                    <h4>Wichtige Funktionen:</h4>
                    <ul>
                        <li><strong>SUMME()</strong> - Summe von Zellen berechnen</li>
                        <li><strong>MITTELWERT()</strong> - Durchschnitt berechnen</li>
                        <li><strong>MAX/MIN()</strong> - Größten/kleinsten Wert finden</li>
                        <li><strong>ZÄHLENWENN()</strong> - Zellen zählen</li>
                    </ul>
                    
                    <div class="practice-actions">
                        <button class="btn" onclick="progressManager.updateProgress('excel', 10)">Übung abgeschlossen</button>
                    </div>
                </div>
            </div>
        `;
    },

    getExcelFormelnContent() {
        return `
            <div class="lesson">
                <h3>Formeln und Funktionen</h3>
                <div class="lesson-content">
                    <h4>Fortgeschrittene Formeln:</h4>
                    <ul>
                        <li><strong>WENN()</strong> - Bedingte Formeln</li>
                        <li><strong>UND/ODER()</strong> - Logische Funktionen</li>
                        <li><strong>DATUM()</strong> - Datumsfunktionen</li>
                        <li><strong>TEXT()</strong> - Textformatierung</li>
                    </ul>
                    
                    <div class="practice-actions">
                        <button class="btn" onclick="progressManager.updateProgress('excel', 5)">Übung starten</button>
                    </div>
                </div>
            </div>
        `;
    },

    getExcelSverweisContent() {
        return `
            <div class="lesson">
                <h3>SVERWEIS Funktion</h3>
                <div class="lesson-content">
                    <h4>SVERWEIS Syntax:</h4>
                    <p><code>=SVERWEIS(Suchkriterium; Matrix; Spaltenindex; [Bereich_Verweis])</code></p>
                    
                    <h4>Anwendungsbeispiele:</h4>
                    <ul>
                        <li>Kundendaten suchen</li>
                        <li>Preise aus Preisliste</li>
                        <li>Mitarbeiterinformationen</li>
                    </ul>
                    
                    <div class="practice-actions">
                        <button class="btn" onclick="progressManager.updateProgress('excel', 10)">Übung abgeschlossen</button>
                    </div>
                </div>
            </div>
        `;
    },

    getExcelPivotContent() {
        return `
            <div class="lesson">
                <h3>Pivot-Tabellen</h3>
                <div class="lesson-content">
                    <h4>Pivot-Tabelle erstellen:</h4>
                    <ul>
                        <li>Daten auswählen</li>
                        <li>Einfügen → Pivot-Tabelle</li>
                        <li>Felder konfigurieren</li>
                        <li>Filter und Gruppierungen</li>
                        <li>Diagramme erstellen</li>
                    </ul>
                    
                    <div class="practice-actions">
                        <button class="btn" onclick="progressManager.updateProgress('excel', 5)">Übung starten</button>
                    </div>
                </div>
            </div>
        `;
    }
};

// Daily Challenge Manager
const dailyChallengeManager = {
    challenges: [
        "Erstelle ein Geschäftsbrief nach DIN 5008 mit Serienbrief-Funktion!",
        "Berechne eine Umsatzstatistik mit SVERWEIS und Pivot-Tabelle!",
        "Erstelle ein Meeting-Protokoll mit korrekter Formatierung!",
        "Analysiere Kundendaten mit Excel-Diagrammen!",
        "Formatiere einen Bericht mit Inhaltsverzeichnis und Seitenzahlen!"
    ],

    init() {
        this.generateDailyChallenge();
    },

    generateDailyChallenge() {
        const today = new Date().getDate();
        const challenge = this.challenges[today % this.challenges.length];
        const challengeElement = document.getElementById('daily-challenge');
        
        if (challengeElement) {
            challengeElement.textContent = `Heute: ${challenge}`;
        }
    },

    startChallenge() {
        notificationManager.showToast("Super, mein зайчик! Ich hab dich eingetragen. Lass uns das zusammen schaffen! 💝", 'success');
        progressManager.updateProgress('practice', 5);
        appState.dailyChallengeCompleted = true;
    }
};

// Navigation Manager
const navigationManager = {
    init() {
        this.setupSmoothScroll();
        this.setupMobileMenu();
        this.setupActiveNavigation();
    },

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    this.updateActiveNavigation(targetId);
                }
            });
        });
    },

    setupMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                menuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
            });
        }
    },

    setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveNavigation(entry.target.id);
                }
            });
        }, observerOptions);
        
        sections.forEach(section => observer.observe(section));
    },

    updateActiveNavigation(activeId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }
};

// Performance Manager
const performanceManager = {
    init() {
        this.setupLazyLoading();
        this.setupIntersectionObserver();
    },

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    setupIntersectionObserver() {
        // Animate elements on scroll
        const animateElements = document.querySelectorAll('.module-card, .progress-item, .time-block');
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    utils.animate(entry.target, {
                        opacity: [0, 1],
                        transform: ['translateY(20px)', 'translateY(0)']
                    });
                    animationObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animateElements.forEach(element => {
            element.style.opacity = '0';
            animationObserver.observe(element);
        });
    }
};

// Global Functions for backward compatibility
function openModule(moduleType) {
    moduleManager.openModule(moduleType);
}

function closeModal() {
    modalManager.close();
}

function startDailyChallenge() {
    dailyChallengeManager.startChallenge();
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    elements.modal = document.getElementById('modal');
    elements.themeToggle = document.getElementById('theme-toggle');
    
    // Initialize all managers
    themeManager.init();
    countdownManager.init();
    progressManager.init();
    modalManager.init();
    notificationManager.init();
    moduleManager.init();
    dailyChallengeManager.init();
    navigationManager.init();
    performanceManager.init();
    
    // Show welcome message
    setTimeout(() => {
        notificationManager.showToast('Willkommen zurück, mein зайчик! 💝', 'success');
    }, 1000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    countdownManager.stopCountdown();
});

// Export for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appState,
        utils,
        themeManager,
        countdownManager,
        progressManager,
        modalManager,
        notificationManager,
        moduleManager,
        dailyChallengeManager,
        navigationManager,
        performanceManager
    };
}