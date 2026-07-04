// Emilia's Lernplattform - JavaScript für Interaktivität und Lerntracking

// Globale Variablen
let learningProgress = {
    word: 0,
    excel: 0,
    practice: 0
};

let dailyChallengeCompleted = false;
let currentModule = null;

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    loadLearningProgress();
    generateDailyChallenge();
    initializeAnimations();
});

// Countdown zur Prüfung
function initializeCountdown() {
    const examDate = new Date('2026-02-26T09:00:00'); // 26. Februar 2026, 9:00 Uhr
    
    function updateCountdown() {
        const now = new Date();
        const timeLeft = examDate - now;
        
        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Lernfortschritt laden und speichern
function loadLearningProgress() {
    const saved = localStorage.getItem('emiliaLearningProgress');
    if (saved) {
        learningProgress = JSON.parse(saved);
        updateProgressDisplay();
    }
}

function saveLearningProgress() {
    localStorage.setItem('emiliaLearningProgress', JSON.stringify(learningProgress));
    updateProgressDisplay();
}

function updateProgressDisplay() {
    document.getElementById('word-progress').style.width = learningProgress.word + '%';
    document.getElementById('excel-progress').style.width = learningProgress.excel + '%';
    document.getElementById('exam-progress').style.width = learningProgress.practice + '%';
    
    // Update progress text
    document.querySelectorAll('.progress-card').forEach((card, index) => {
        const progressText = card.querySelector('.progress-text');
        const progressValues = [learningProgress.word, learningProgress.excel, learningProgress.practice];
        progressText.textContent = progressValues[index] + '% abgeschlossen';
    });
}

function updateProgress(module, percentage) {
    learningProgress[module] = Math.min(100, learningProgress[module] + percentage);
    saveLearningProgress();
    
    // Erfolgsmeldung
    showSuccessMessage(`Super, mein зайчик! ${module}-Fortschritt: ${learningProgress[module]}%`);
}

// Module öffnen
function openModule(moduleType) {
    currentModule = moduleType;
    
    switch(moduleType) {
        case 'word':
            showWordModule();
            break;
        case 'excel':
            showExcelModule();
            break;
        case 'practice':
            showPracticeModule();
            break;
        case 'tutor':
            showTutorModule();
            break;
    }
}

// Word-Modul
function showWordModule() {
    const content = `
        <div class="module-content">
            <h2>📝 Microsoft Word - Textverarbeitung</h2>
            <div class="lesson-tabs">
                <button class="tab-btn active" onclick="showLesson('word', 'din')">DIN 5008</button>
                <button class="tab-btn" onclick="showLesson('word', 'briefe')">Briefe</button>
                <button class="tab-btn" onclick="showLesson('word', 'protokolle')">Protokolle</button>
                <button class="tab-btn" onclick="showLesson('word', 'serien')">Serienbriefe</button>
            </div>
            <div id="lesson-content" class="lesson-content">
                ${getDIN5008Lesson()}
            </div>
        </div>
    `;
    showModal(content);
}

// Excel-Modul
function showExcelModule() {
    const content = `
        <div class="module-content">
            <h2>📊 Microsoft Excel - Tabellenkalkulation</h2>
            <div class="lesson-tabs">
                <button class="tab-btn active" onclick="showLesson('excel', 'grundlagen')">Grundlagen</button>
                <button class="tab-btn" onclick="showLesson('excel', 'formeln')">Formeln</button>
                <button class="tab-btn" onclick="showLesson('excel', 'sverweis')">SVERWEIS</button>
                <button class="tab-btn" onclick="showLesson('excel', 'pivot')">Pivot-Tabellen</button>
            </div>
            <div id="lesson-content" class="lesson-content">
                ${getExcelGrundlagenLesson()}
            </div>
        </div>
    `;
    showModal(content);
}

// Prüfungssimulation
function showPracticeModule() {
    const content = `
        <div class="module-content">
            <h2>🎯 Prüfungssimulation</h2>
            <div class="practice-options">
                <div class="practice-card" onclick="startSimulation('word')">
                    <h3>Word-Prüfung (60 Min)</h3>
                    <p>Briefe und Dokumente nach DIN 5008 erstellen</p>
                </div>
                <div class="practice-card" onclick="startSimulation('excel')">
                    <h3>Excel-Prüfung (60 Min)</h3>
                    <p>Berechnungen und Auswertungen durchführen</p>
                </div>
                <div class="practice-card" onclick="startSimulation('full')">
                    <h3>Vollsimulation (120 Min)</h3>
                    <p>Ganzheitliche Prüfungsaufgabe</p>
                </div>
            </div>
        </div>
    `;
    showModal(content);
}

// Emilia Tutor
function showTutorModule() {
    const content = `
        <div class="module-content">
            <h2>💝 Emilia Tutor</h2>
            <div class="tutor-chat">
                <div class="chat-messages" id="chat-messages">
                    <div class="message tutor-message">
                        <span class="message-text">Hallo mein зайчик! Wie kann ich dir heute beim Lernen helfen? 💝</span>
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="tutor-input" placeholder="Stell mir deine Frage..." onkeypress="handleTutorKeyPress(event)">
                    <button onclick="sendTutorMessage()">Senden</button>
                </div>
            </div>
        </div>
    `;
    showModal(content);
}

// Lektionen-Inhalte
function getDIN5008Lesson() {
    return `
        <div class="lesson">
            <h3>DIN 5008 - Schreib- und Gestaltungsregeln</h3>
            <div class="lesson-content-text">
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
                    <button onclick="startWordExercise('din')">Übung starten</button>
                    <button onclick="showWordTemplate('din')">Vorlage anzeigen</button>
                </div>
            </div>
        </div>
    `;
}

function getExcelGrundlagenLesson() {
    return `
        <div class="lesson">
            <h3>Excel Grundlagen - Formeln und Funktionen</h3>
            <div class="lesson-content-text">
                <h4>Wichtige Funktionen für deine Prüfung:</h4>
                <ul>
                    <li><strong>SUMME()</strong> - Summe von Zellen berechnen</li>
                    <li><strong>MITTELWERT()</strong> - Durchschnitt berechnen</li>
                    <li><strong>SVERWEIS()</strong> - Daten aus anderen Tabellen suchen</li>
                    <li><strong>WENN()</strong> - Bedingte Formeln</li>
                </ul>
                
                <h4>Prüfungsaufgabe:</h4>
                <p>Berechne die Umsatzstatistik für das Nüra Unternehmen using SVERWEIS und SUMME.</p>
                
                <div class="practice-actions">
                    <button onclick="startExcelExercise('grundlagen')">Übung starten</button>
                    <button onclick="showExcelTemplate('grundlagen')">Beispieldatei</button>
                </div>
            </div>
        </div>
    `;
}

// Tägliche Herausforderung
function generateDailyChallenge() {
    const challenges = [
        "Erstelle ein Geschäftsbrief nach DIN 5008 mit Serienbrief-Funktion!",
        "Berechne eine Umsatzstatistik mit SVERWEIS und Pivot-Tabelle!",
        "Erstelle ein Meeting-Protokoll mit korrekter Formatierung!",
        "Analysiere Kundendaten mit Excel-Diagrammen!",
        "Formatiere einen Bericht mit Inhaltsverzeichnis und Seitenzahlen!"
    ];
    
    const today = new Date().getDate();
    const challenge = challenges[today % challenges.length];
    document.getElementById('daily-challenge').textContent = "Heute: " + challenge;
}

function startDailyChallenge() {
    showSuccessMessage("Super, mein зайчик! Ich hab dich eingetragen. Lass uns das zusammen schaffen! 💝");
    updateProgress('practice', 5);
}

// Hilfsfunktionen
function showModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="closeModal()">&times;</span>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    
    // Modal CSS hinzufügen
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 15px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            }
            .close-btn {
                position: absolute;
                top: 1rem;
                right: 1rem;
                font-size: 2rem;
                cursor: pointer;
                color: #999;
            }
            .close-btn:hover {
                color: #333;
            }
            .module-content h2 {
                color: var(--primary-color);
                margin-bottom: 1.5rem;
            }
            .lesson-tabs {
                display: flex;
                gap: 1rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }
            .tab-btn {
                background: var(--bg-light);
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .tab-btn.active {
                background: var(--primary-color);
                color: white;
            }
            .tab-btn:hover {
                background: var(--secondary-color);
                color: white;
            }
            .practice-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
            }
            .practice-card {
                background: var(--bg-light);
                padding: 1.5rem;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            .practice-card:hover {
                background: var(--primary-color);
                color: white;
                transform: translateY(-5px);
            }
            .tutor-chat {
                border: 1px solid var(--bg-light);
                border-radius: 10px;
                padding: 1rem;
            }
            .chat-messages {
                height: 300px;
                overflow-y: auto;
                margin-bottom: 1rem;
                padding: 1rem;
                background: var(--bg-light);
                border-radius: 10px;
            }
            .message {
                margin-bottom: 1rem;
            }
            .tutor-message {
                text-align: left;
            }
            .user-message {
                text-align: right;
            }
            .message-text {
                background: var(--primary-color);
                color: white;
                padding: 0.8rem;
                border-radius: 15px;
                display: inline-block;
                max-width: 70%;
            }
            .user-message .message-text {
                background: var(--secondary-color);
            }
            .chat-input {
                display: flex;
                gap: 1rem;
            }
            .chat-input input {
                flex: 1;
                padding: 0.8rem;
                border: 1px solid var(--bg-light);
                border-radius: 25px;
            }
            .chat-input button {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 25px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        .success-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: var(--shadow);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Tutor Funktionen
function handleTutorKeyPress(event) {
    if (event.key === 'Enter') {
        sendTutorMessage();
    }
}

function sendTutorMessage() {
    const input = document.getElementById('tutor-input');
    const message = input.value.trim();
    
    if (message) {
        const chatMessages = document.getElementById('chat-messages');
        
        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'message user-message';
        userMsg.innerHTML = `<span class="message-text">${message}</span>`;
        chatMessages.appendChild(userMsg);
        
        // Tutor response (simulate Emilia's response)
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
}

// Animationen
function initializeAnimations() {
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Hover effects
    document.querySelectorAll('.module-card, .progress-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Platzhalter-Funktionen für Übungen
function showLesson(module, lesson) {
    console.log(`Showing ${module} lesson: ${lesson}`);
    // Hier können die verschiedenen Lektionen geladen werden
}

function startWordExercise(type) {
    showSuccessMessage("Word-Übung wird gestartet! Much luck, mein зайчик! 📝");
    updateProgress('word', 10);
}

function showWordTemplate(type) {
    showSuccessMessage("Vorlage wird vorbereitet...");
}

function startExcelExercise(type) {
    showSuccessMessage("Excel-Übung wird gestartet! Du schaffst das! 📊");
    updateProgress('excel', 10);
}

function showExcelTemplate(type) {
    showSuccessMessage("Excel-Beispieldatei wird vorbereitet...");
}

function startSimulation(type) {
    const messages = {
        'word': 'Word-Prüfungssimulation (60 Min) startet!',
        'excel': 'Excel-Prüfungssimulation (60 Min) startet!',
        'full': 'Vollsimulation (120 Min) startet! Viel Erfolg, mein зайчик! 🎯'
    };
    
    showSuccessMessage(messages[type]);
    updateProgress('practice', 15);
}