// Prüfungssimulation JavaScript
class ExamSimulation {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.points = 0;
        this.maxPoints = 500;
        this.timeLimit = 60 * 60; // 60 Minuten in Sekunden
        this.timeRemaining = this.timeLimit;
        this.timer = null;
        this.examStarted = false;
        this.examFinished = false;
        
        // Fragenpool
        this.questionPool = {
            textverarbeitung: [
                {
                    id: 'tv1',
                    question: 'Welche Schriftgröße ist nach DIN 5008 für Geschäftsbriefe Standard?',
                    type: 'multiple-choice',
                    points: 50,
                    options: ['10pt', '11pt', '12pt', '14pt'],
                    correct: 2
                },
                {
                    id: 'tv2',
                    question: 'Beschreiben Sie den korrekten Aufbau eines Geschäftsbriefes nach DIN 5008.',
                    type: 'text',
                    points: 80,
                    keywords: ['Absender', 'Empfänger', 'Datum', 'Betreff', 'Anrede', 'Grußformel']
                },
                {
                    id: 'tv3',
                    question: 'Welche Ränder sind nach DIN 5008 für Briefe vorgeschrieben?',
                    type: 'multiple-choice',
                    points: 50,
                    options: ['Links 2cm, Rechts 2cm', 'Links 2,5cm, Rechts 2cm', 'Links 3cm, Rechts 2,5cm', 'Links 2cm, Rechts 1,5cm'],
                    correct: 1
                }
            ],
            tabellenkalkulation: [
                {
                    id: 'tk1',
                    question: 'Welche Funktion berechnet die Summe eines Bereichs in Excel?',
                    type: 'multiple-choice',
                    points: 40,
                    options: ['SUMME()', 'ADD()', 'TOTAL()', 'CALC()'],
                    correct: 0
                },
                {
                    id: 'tk2',
                    question: 'Erklären Sie die Funktion SVERWEIS und ihre Parameter.',
                    type: 'text',
                    points: 70,
                    keywords: ['Suchkriterium', 'Matrix', 'Spaltenindex', 'Bereich_Verweis']
                },
                {
                    id: 'tk3',
                    question: 'Ordnen Sie die Excel-Funktionen den richtigen Anwendungsgebieten zu.',
                    type: 'drag-drop',
                    points: 60,
                    items: ['SUMME', 'SVERWEIS', 'WENN', 'MITTELWERT'],
                    targets: ['Berechnungen', 'Datensuche', 'Bedingungen', 'Statistik'],
                    correct: [0, 1, 2, 3]
                }
            ],
            it_grundlagen: [
                {
                    id: 'it1',
                    question: 'Was bedeutet die Abkürzung "IT"?',
                    type: 'multiple-choice',
                    points: 30,
                    options: ['Informationstechnologie', 'Internet-Technik', 'Informations-Technik', 'Interface-Technologie'],
                    correct: 0
                },
                {
                    id: 'it2',
                    question: 'Nennen Sie 3 wichtige Sicherheitsmaßnahmen im Büroalltag.',
                    type: 'text',
                    points: 60,
                    keywords: ['Passwort', 'Backup', 'Virenschutz', 'Firewall', 'Verschlüsselung']
                }
            ],
            buero_management: [
                {
                    id: 'bm1',
                    question: 'Welche Aufgaben hat eine Bürokraft?',
                    type: 'multiple-choice',
                    points: 40,
                    options: ['Korrespondenz', 'Terminplanung', 'Beide', 'Keine'],
                    correct: 2
                },
                {
                    id: 'bm2',
                    question: 'Beschreiben Sie die wichtigsten Aufgaben im Büromanagement.',
                    type: 'text',
                    points: 80,
                    keywords: ['Terminplanung', 'Korrespondenz', 'Aktenführung', 'Telefon', 'Besprechungsprotokolle']
                }
            ]
        };
        
        this.initializeExam();
    }
    
    initializeExam() {
        this.loadQuestions();
        this.setupEventListeners();
    }
    
    loadQuestions() {
        // Zufällige Fragen aus jedem Bereich auswählen
        const categories = Object.keys(this.questionPool);
        const questionsPerCategory = Math.ceil(10 / categories.length);
        
        categories.forEach(category => {
            const categoryQuestions = this.questionPool[category];
            const selectedCount = Math.min(questionsPerCategory, categoryQuestions.length);
            const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, selectedCount);
            
            selected.forEach(question => {
                question.category = category;
                this.questions.push(question);
            });
        });
        
        // Sicherstellen, dass wir genau 10 Fragen haben
        while (this.questions.length < 10) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const remainingQuestions = this.questionPool[randomCategory].filter(
                q => !this.questions.some(existing => existing.id === q.id)
            );
            
            if (remainingQuestions.length > 0) {
                const randomQuestion = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
                randomQuestion.category = randomCategory;
                this.questions.push(randomQuestion);
            }
        }
        
        // Fragen mischen
        this.questions.sort(() => Math.random() - 0.5);
        
        // Navigation initialisieren
        this.initializeNavigation();
    }
    
    initializeNavigation() {
        const navContainer = document.getElementById('question-nav');
        navContainer.innerHTML = '';
        
        this.questions.forEach((question, index) => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            navItem.textContent = index + 1;
            navItem.onclick = () => this.goToQuestion(index);
            navContainer.appendChild(navItem);
        });
        
        document.getElementById('total-questions').textContent = this.questions.length;
    }
    
    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.examStarted || this.examFinished) return;
            
            if (e.key === 'ArrowLeft' && this.currentQuestionIndex > 0) {
                this.previousQuestion();
            } else if (e.key === 'ArrowRight' && this.currentQuestionIndex < this.questions.length - 1) {
                this.nextQuestion();
            }
        });
        
        // Prevent accidental page leave
        window.addEventListener('beforeunload', (e) => {
            if (this.examStarted && !this.examFinished) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
    
    startExam() {
        this.examStarted = true;
        this.examFinished = false;
        this.timeRemaining = this.timeLimit;
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.points = 0;
        
        // Start modal ausblenden
        document.getElementById('start-modal').style.display = 'none';
        
        // Timer starten
        this.startTimer();
        
        // Erste Frage anzeigen
        this.displayQuestion();
        
        // Navigation aktualisieren
        this.updateNavigation();
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.finishExam();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        const timerElement = document.getElementById('timer');
        
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        // Farbcodes basierend auf verbleibender Zeit
        timerElement.classList.remove('warning', 'danger');
        
        if (this.timeRemaining <= 300) { // 5 Minuten
            timerElement.classList.add('danger');
        } else if (this.timeRemaining <= 600) { // 10 Minuten
            timerElement.classList.add('warning');
        }
    }
    
    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const container = document.getElementById('question-container');
        
        let questionHTML = `
            <div class="question-header">
                <div class="question-number">Frage ${this.currentQuestionIndex + 1} von ${this.questions.length}</div>
                <div class="question-category">${this.getCategoryLabel(question.category)}</div>
                <div class="question-points">${question.points} Punkte</div>
            </div>
            <div class="question-text">${question.question}</div>
        `;
        
        // Antwort-Optionen basierend auf Typ
        switch (question.type) {
            case 'multiple-choice':
                questionHTML += this.createMultipleChoiceHTML(question);
                break;
            case 'text':
                questionHTML += this.createTextAnswerHTML(question);
                break;
            case 'drag-drop':
                questionHTML += this.createDragDropHTML(question);
                break;
        }
        
        container.innerHTML = questionHTML;
        
        // Event Listener für die Antworten
        this.setupAnswerListeners(question);
        
        // Aktuelle Antwort wiederherstellen
        this.restoreCurrentAnswer();
        
        // Navigation aktualisieren
        this.updateNavigation();
        
        // Buttons aktualisieren
        this.updateActionButtons();
    }
    
    createMultipleChoiceHTML(question) {
        let html = '<div class="answer-options">';
        
        question.options.forEach((option, index) => {
            html += `
                <div class="option-item" data-index="${index}">
                    <input type="radio" name="answer" value="${index}" class="option-input">
                    <span class="option-text">${option}</span>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    createTextAnswerHTML(question) {
        return `
            <div class="answer-options">
                <textarea class="text-answer" placeholder="Geben Sie Ihre Antwort hier ein..." rows="6"></textarea>
            </div>
        `;
    }
    
    createDragDropHTML(question) {
        let html = `
            <div class="drag-container">
                <div class="drag-source">
                    <h4>Zuordnungen</h4>
                    <div class="drag-items">
        `;
        
        // Items mischen
        const shuffledItems = [...question.items].sort(() => Math.random() - 0.5);
        shuffledItems.forEach((item, index) => {
            html += `<div class="drag-item" draggable="true" data-item="${item}">${item}</div>`;
        });
        
        html += `
                    </div>
                </div>
                <div class="drag-target">
                    <h4>Zielbereiche</h4>
                    <div class="drop-zones">
        `;
        
        question.targets.forEach((target, index) => {
            html += `
                <div class="drop-zone" data-target="${target}">
                    <div class="drop-label">${target}</div>
                    <div class="drop-items"></div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }
    
    setupAnswerListeners(question) {
        switch (question.type) {
            case 'multiple-choice':
                this.setupMultipleChoiceListeners();
                break;
            case 'text':
                this.setupTextAnswerListeners();
                break;
            case 'drag-drop':
                this.setupDragDropListeners();
                break;
        }
    }
    
    setupMultipleChoiceListeners() {
        const options = document.querySelectorAll('.option-item');
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Alle Optionen deselectieren
                options.forEach(opt => opt.classList.remove('selected'));
                
                // Aktuelle Option selectieren
                option.classList.add('selected');
                option.querySelector('.option-input').checked = true;
                
                // Antwort speichern
                this.saveCurrentAnswer();
            });
        });
    }
    
    setupTextAnswerListeners() {
        const textarea = document.querySelector('.text-answer');
        textarea.addEventListener('input', () => {
            this.saveCurrentAnswer();
        });
    }
    
    setupDragDropListeners() {
        const dragItems = document.querySelectorAll('.drag-item');
        const dropZones = document.querySelectorAll('.drop-zone');
        
        dragItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.item);
                e.target.classList.add('dragging');
            });
            
            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const itemText = e.dataTransfer.getData('text/plain');
                const draggedElement = document.querySelector(`[data-item="${itemText}"]`);
                
                if (draggedElement) {
                    const dropItems = zone.querySelector('.drop-items');
                    dropItems.appendChild(draggedElement);
                    this.saveCurrentAnswer();
                }
            });
        });
    }
    
    saveCurrentAnswer() {
        const question = this.questions[this.currentQuestionIndex];
        let answer = null;
        
        switch (question.type) {
            case 'multiple-choice':
                const selectedOption = document.querySelector('.option-item.selected');
                if (selectedOption) {
                    answer = parseInt(selectedOption.dataset.index);
                }
                break;
                
            case 'text':
                const textarea = document.querySelector('.text-answer');
                if (textarea && textarea.value.trim()) {
                    answer = textarea.value.trim();
                }
                break;
                
            case 'drag-drop':
                answer = {};
                const dropZones = document.querySelectorAll('.drop-zone');
                dropZones.forEach(zone => {
                    const target = zone.dataset.target;
                    const items = Array.from(zone.querySelectorAll('.drag-item')).map(item => item.dataset.item);
                    answer[target] = items;
                });
                break;
        }
        
        if (answer !== null) {
            this.answers[question.id] = answer;
            this.updateNavigation();
        }
    }
    
    restoreCurrentAnswer() {
        const question = this.questions[this.currentQuestionIndex];
        const answer = this.answers[question.id];
        
        if (!answer) return;
        
        switch (question.type) {
            case 'multiple-choice':
                const optionToSelect = document.querySelector(`.option-item[data-index="${answer}"]`);
                if (optionToSelect) {
                    optionToSelect.classList.add('selected');
                    optionToSelect.querySelector('.option-input').checked = true;
                }
                break;
                
            case 'text':
                const textarea = document.querySelector('.text-answer');
                if (textarea) {
                    textarea.value = answer;
                }
                break;
                
            case 'drag-drop':
                // Drag & Drop Antworten wiederherstellen
                Object.entries(answer).forEach(([target, items]) => {
                    const dropZone = document.querySelector(`[data-target="${target}"]`);
                    if (dropZone) {
                        const dropItems = dropZone.querySelector('.drop-items');
                        items.forEach(itemText => {
                            const item = document.querySelector(`[data-item="${itemText}"]`);
                            if (item) {
                                dropItems.appendChild(item);
                            }
                        });
                    }
                });
                break;
        }
    }
    
    updateNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach((item, index) => {
            item.classList.remove('current', 'answered', 'unanswered');
            
            if (index === this.currentQuestionIndex) {
                item.classList.add('current');
            } else if (this.answers[this.questions[index].id]) {
                item.classList.add('answered');
            } else {
                item.classList.add('unanswered');
            }
        });
        
        // Fortschritt aktualisieren
        const answeredCount = Object.keys(this.answers).length;
        const progressPercent = (answeredCount / this.questions.length) * 100;
        document.getElementById('progress-bar').style.width = progressPercent + '%';
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        
        // Punkte aktualisieren
        this.calculatePoints();
        document.getElementById('current-points').textContent = this.points;
    }
    
    calculatePoints() {
        this.points = 0;
        
        Object.entries(this.answers).forEach(([questionId, answer]) => {
            const question = this.questions.find(q => q.id === questionId);
            if (!question) return;
            
            let earnedPoints = 0;
            
            switch (question.type) {
                case 'multiple-choice':
                    if (answer === question.correct) {
                        earnedPoints = question.points;
                    }
                    break;
                    
                case 'text':
                    earnedPoints = this.evaluateTextAnswer(answer, question);
                    break;
                    
                case 'drag-drop':
                    earnedPoints = this.evaluateDragDropAnswer(answer, question);
                    break;
            }
            
            this.points += earnedPoints;
        });
    }
    
    evaluateTextAnswer(answer, question) {
        if (!answer || !question.keywords) return 0;
        
        const answerLower = answer.toLowerCase();
        const matchedKeywords = question.keywords.filter(keyword => 
            answerLower.includes(keyword.toLowerCase())
        );
        
        const keywordRatio = matchedKeywords.length / question.keywords.length;
        return Math.round(question.points * keywordRatio);
    }
    
    evaluateDragDropAnswer(answer, question) {
        if (!answer || !question.correct) return 0;
        
        let correctAssignments = 0;
        let totalAssignments = 0;
        
        Object.entries(answer).forEach(([target, items]) => {
            items.forEach(item => {
                totalAssignments++;
                const itemIndex = question.items.indexOf(item);
                if (itemIndex >= 0 && question.correct[itemIndex] === question.targets.indexOf(target)) {
                    correctAssignments++;
                }
            });
        });
        
        if (totalAssignments === 0) return 0;
        
        const correctRatio = correctAssignments / totalAssignments;
        return Math.round(question.points * correctRatio);
    }
    
    updateActionButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const finishBtn = document.getElementById('finish-btn');
        
        // Vorherige Button
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // Nächste/Beenden Button
        if (this.currentQuestionIndex === this.questions.length - 1) {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            finishBtn.style.display = 'none';
        }
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    }
    
    goToQuestion(index) {
        if (index >= 0 && index < this.questions.length) {
            this.currentQuestionIndex = index;
            this.displayQuestion();
        }
    }
    
    finishExam() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.examFinished = true;
        this.calculatePoints();
        
        // Ergebnisse speichern
        this.saveResults();
        
        // Ergebnisse anzeigen
        this.showResults();
    }
    
    saveResults() {
        const result = {
            date: new Date().toISOString(),
            timeSpent: this.timeLimit - this.timeRemaining,
            points: this.points,
            maxPoints: this.maxPoints,
            percentage: Math.round((this.points / this.maxPoints) * 100),
            passed: this.points >= (this.maxPoints * 0.6),
            answers: this.answers,
            questions: this.questions
        };
        
        // In localStorage speichern
        const existingResults = JSON.parse(localStorage.getItem('examResults') || '[]');
        existingResults.push(result);
        localStorage.setItem('examResults', JSON.stringify(existingResults));
    }
    
    showResults() {
        const percentage = Math.round((this.points / this.maxPoints) * 100);
        const passed = this.points >= (this.maxPoints * 0.6);
        
        const resultsHTML = `
            <div class="results-summary">
                <div class="result-card">
                    <div class="result-value ${passed ? 'success' : 'danger'}">${this.points}</div>
                    <div class="result-label">Punkte</div>
                </div>
                <div class="result-card">
                    <div class="result-value ${passed ? 'success' : 'danger'}">${percentage}%</div>
                    <div class="result-label">Ergebnis</div>
                </div>
                <div class="result-card">
                    <div class="result-value ${passed ? 'success' : 'danger'}">${passed ? 'BESTANDEN' : 'NICHT BESTANDEN'}</div>
                    <div class="result-label">Status</div>
                </div>
                <div class="result-card">
                    <div class="result-value">${this.formatTime(this.timeLimit - this.timeRemaining)}</div>
                    <div class="result-label">Benötigte Zeit</div>
                </div>
            </div>
            
            <div class="category-results">
                <h3>Ergebnisse nach Kategorie</h3>
                ${this.generateCategoryResults()}
            </div>
            
            <div class="answer-review">
                <h3>Detaillierte Auswertung</h3>
                ${this.generateAnswerReview()}
            </div>
        `;
        
        document.getElementById('results-body').innerHTML = resultsHTML;
        document.getElementById('results-modal').style.display = 'block';
    }
    
    generateCategoryResults() {
        const categories = {};
        
        this.questions.forEach(question => {
            if (!categories[question.category]) {
                categories[question.category] = {
                    total: 0,
                    earned: 0,
                    count: 0
                };
            }
            
            categories[question.category].total += question.points;
            categories[question.category].count++;
            
            const answer = this.answers[question.id];
            if (answer) {
                let earnedPoints = 0;
                
                switch (question.type) {
                    case 'multiple-choice':
                        if (answer === question.correct) {
                            earnedPoints = question.points;
                        }
                        break;
                    case 'text':
                        earnedPoints = this.evaluateTextAnswer(answer, question);
                        break;
                    case 'drag-drop':
                        earnedPoints = this.evaluateDragDropAnswer(answer, question);
                        break;
                }
                
                categories[question.category].earned += earnedPoints;
            }
        });
        
        let html = '';
        Object.entries(categories).forEach(([category, stats]) => {
            const percentage = Math.round((stats.earned / stats.total) * 100);
            html += `
                <div class="category-item">
                    <div class="category-name">${this.getCategoryLabel(category)}</div>
                    <div class="category-score">
                        <span class="category-points">${stats.earned}/${stats.total}</span>
                        <div class="category-bar">
                            <div class="category-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    generateAnswerReview() {
        let html = '';
        
        this.questions.forEach((question, index) => {
            const answer = this.answers[question.id];
            const isCorrect = this.isAnswerCorrect(question, answer);
            const earnedPoints = this.getEarnedPoints(question, answer);
            
            html += `
                <div class="answer-review ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-question">
                        Frage ${index + 1}: ${question.question}
                        <span class="review-points">${earnedPoints}/${question.points} Punkte</span>
                    </div>
                    <div class="review-answer">
                        <strong>Ihre Antwort:</strong> ${this.formatAnswer(question, answer)}
                    </div>
                    ${!isCorrect ? `
                        <div class="review-answer review-correct">
                            <strong>Korrekte Antwort:</strong> ${this.formatCorrectAnswer(question)}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        return html;
    }
    
    isAnswerCorrect(question, answer) {
        if (!answer) return false;
        
        switch (question.type) {
            case 'multiple-choice':
                return answer === question.correct;
            case 'text':
                const earnedPoints = this.evaluateTextAnswer(answer, question);
                return earnedPoints >= question.points * 0.8;
            case 'drag-drop':
                const earnedPointsDD = this.evaluateDragDropAnswer(answer, question);
                return earnedPointsDD >= question.points * 0.8;
            default:
                return false;
        }
    }
    
    getEarnedPoints(question, answer) {
        if (!answer) return 0;
        
        switch (question.type) {
            case 'multiple-choice':
                return answer === question.correct ? question.points : 0;
            case 'text':
                return this.evaluateTextAnswer(answer, question);
            case 'drag-drop':
                return this.evaluateDragDropAnswer(answer, question);
            default:
                return 0;
        }
    }
    
    formatAnswer(question, answer) {
        if (!answer) return 'Nicht beantwortet';
        
        switch (question.type) {
            case 'multiple-choice':
                return question.options[answer] || 'Ungültige Antwort';
            case 'text':
                return answer;
            case 'drag-drop':
                let formatted = '';
                Object.entries(answer).forEach(([target, items]) => {
                    formatted += `${target}: ${items.join(', ')}<br>`;
                });
                return formatted;
            default:
                return answer.toString();
        }
    }
    
    formatCorrectAnswer(question) {
        switch (question.type) {
            case 'multiple-choice':
                return question.options[question.correct];
            case 'text':
                return `Schlüsselwörter: ${question.keywords.join(', ')}`;
            case 'drag-drop':
                let formatted = '';
                question.items.forEach((item, index) => {
                    const targetIndex = question.correct[index];
                    formatted += `${item} → ${question.targets[targetIndex]}<br>`;
                });
                return formatted;
            default:
                return 'Nicht verfügbar';
        }
    }
    
    getCategoryLabel(category) {
        const labels = {
            textverarbeitung: '📄 Textverarbeitung',
            tabellenkalkulation: '📊 Tabellenkalkulation',
            it_grundlagen: '🖥️ IT-Grundlagen',
            buero_management: '💼 Büromanagement'
        };
        return labels[category] || category;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    closeResults() {
        document.getElementById('results-modal').style.display = 'none';
    }
    
    restartExam() {
        location.reload();
    }
    
    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Titel
        doc.setFontSize(20);
        doc.text('Prüfungsergebnis', 105, 20, { align: 'center' });
        
        // Datum
        doc.setFontSize(12);
        doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 20, 35);
        
        // Gesamtergebnis
        const percentage = Math.round((this.points / this.maxPoints) * 100);
        const passed = this.points >= (this.maxPoints * 0.6);
        
        doc.setFontSize(16);
        doc.text(`Gesamtpunkte: ${this.points}/${this.maxPoints}`, 20, 50);
        doc.text(`Ergebnis: ${percentage}%`, 20, 60);
        doc.text(`Status: ${passed ? 'BESTANDEN' : 'NICHT BESTANDEN'}`, 20, 70);
        
        // Kategorien
        doc.setFontSize(14);
        doc.text('Kategorie-Ergebnisse:', 20, 90);
        
        const categories = {};
        this.questions.forEach(question => {
            if (!categories[question.category]) {
                categories[question.category] = { total: 0, earned: 0 };
            }
            categories[question.category].total += question.points;
            
            const answer = this.answers[question.id];
            if (answer) {
                const earnedPoints = this.getEarnedPoints(question, answer);
                categories[question.category].earned += earnedPoints;
            }
        });
        
        let yPosition = 100;
        Object.entries(categories).forEach(([category, stats]) => {
            const categoryLabel = this.getCategoryLabel(category);
            const categoryPercentage = Math.round((stats.earned / stats.total) * 100);
            
            doc.setFontSize(12);
            doc.text(`${categoryLabel}: ${stats.earned}/${stats.total} (${categoryPercentage}%)`, 20, yPosition);
            yPosition += 10;
        });
        
        // PDF speichern
        doc.save(`pruefungsergebnis_${new Date().toISOString().split('T')[0]}.pdf`);
    }
}

// Globale Funktionen für Button-Handler
let examSimulation;

function startExam() {
    if (!examSimulation) {
        examSimulation = new ExamSimulation();
    }
    examSimulation.startExam();
}

function previousQuestion() {
    if (examSimulation) {
        examSimulation.previousQuestion();
    }
}

function nextQuestion() {
    if (examSimulation) {
        examSimulation.nextQuestion();
    }
}

function finishExam() {
    if (examSimulation) {
        examSimulation.finishExam();
    }
}

function closeResults() {
    if (examSimulation) {
        examSimulation.closeResults();
    }
}

function restartExam() {
    if (examSimulation) {
        examSimulation.restartExam();
    }
}

function exportPDF() {
    if (examSimulation) {
        examSimulation.exportPDF();
    }
}

// Initialisierung beim Seitenladen
document.addEventListener('DOMContentLoaded', function() {
    examSimulation = new ExamSimulation();
});