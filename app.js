/* Emilia's IHK Lernplattform - Main Application Logic */

// ============================================
// GLOBAL STATE
// ============================================

let currentTab = 'dashboard';
let currentSimulation = null;
let simulationTimer = null;
let simulationTimeLeft = 0;
let currentExercise = null;
let currentExerciseAnswers = {};
let chartInstances = {};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    registerServiceWorker();
});

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('🐰 Service Worker registriert:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.warn('Service Worker Registrierung fehlgeschlagen:', error);
        }
    }
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 1rem;
        left: 1rem;
        max-width: 400px;
        margin: 0 auto;
        background: var(--primary);
        color: white;
        padding: 1rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        z-index: 1001;
        display: flex;
        justify-content: space-between;
        align-items: center;
        animation: slideUp 0.3s ease;
    `;
    notification.innerHTML = `
        <span>🔄 Neue Version verfügbar!</span>
        <button onclick="window.location.reload()" style="background: white; color: var(--primary); border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer;">Aktualisieren</button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 10000);
}

function initializeApp() {
    // Load exercises into UI
    loadAllExercises();
    
    // Setup tab switching
    setupTabs();
    
    // Setup countdown timer
    updateCountdown();
    setInterval(updateCountdown, 60000);
    
    // Setup daily quote
    document.getElementById('daily-quote').textContent = getDailyQuote();
    
    // Setup progress charts
    setTimeout(() => initCharts(), 100);
    
    // Update progress display
    updateProgressDisplay();
    
    // Setup chat
    setupChat();
    
    // Load simulation history
    loadSimulationHistory();
    
    // Setup PWA install
    setupPWAInstall();
    
    console.log('🐰 Emilia\'s IHK Lernplattform geladen!');
}

// ============================================
// TAB MANAGEMENT
// ============================================

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    
    currentTab = tabName;
    
    // Special handling for progress tab
    if (tabName === 'progress') {
        setTimeout(() => updateCharts(), 100);
    }
}

// ============================================
// EXERCISE LOADING
// ============================================

function loadAllExercises() {
    // Word exercises
    loadExercisesIntoCategory('word-din-exercises', EXERCISES.word.din);
    loadExercisesIntoCategory('word-serienbrief-exercises', EXERCISES.word.serienbrief);
    loadExercisesIntoCategory('word-forms-exercises', EXERCISES.word.forms);
    
    // Excel exercises
    loadExercisesIntoCategory('excel-sverweis-exercises', EXERCISES.excel.sverweis);
    loadExercisesIntoCategory('excel-wenn-exercises', EXERCISES.excel.wenn);
    loadExercisesIntoCategory('excel-pivot-exercises', EXERCISES.excel.pivot);
    loadExercisesIntoCategory('excel-sumif-exercises', EXERCISES.excel.sumif);
    loadExercisesIntoCategory('excel-cf-exercises', EXERCISES.excel.cf);
    loadExercisesIntoCategory('excel-refs-exercises', EXERCISES.excel.refs);
    
    // PowerPoint exercises
    loadExercisesIntoCategory('ppt-master-exercises', EXERCISES.powerpoint.master);
    loadExercisesIntoCategory('ppt-anim-exercises', EXERCISES.powerpoint.anim);
    loadExercisesIntoCategory('ppt-charts-exercises', EXERCISES.powerpoint.charts);
    
    // Outlook exercises
    loadExercisesIntoCategory('outlook-rules-exercises', EXERCISES.outlook.rules);
    loadExercisesIntoCategory('outlook-cal-exercises', EXERCISES.outlook.calendar);
    loadExercisesIntoCategory('outlook-tasks-exercises', EXERCISES.outlook.tasks);
    
    // Update completed states
    updateExerciseCompletionStates();
}

function loadExercisesIntoCategory(containerId, exercises) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = exercises.map(ex => createExerciseItem(ex)).join('');
    
    // Add click handlers
    container.querySelectorAll('.exercise-item').forEach(item => {
        item.addEventListener('click', () => openExerciseModal(item.dataset.exerciseId));
    });
}

function createExerciseItem(ex) {
    const progress = getProgress();
    const isCompleted = progress.completedExercises[ex.id];
    const score = progress.exerciseScores[ex.id] || 0;
    
    return `
        <div class="exercise-item ${isCompleted ? 'completed' : ''}" data-exercise-id="${ex.id}">
            <div class="exercise-info">
                <span class="exercise-title">${ex.title}</span>
                <span class="exercise-meta">${ex.description}</span>
            </div>
            <div class="exercise-meta-right">
                <span class="exercise-difficulty diff-${ex.difficulty}">${ex.difficulty.toUpperCase()}</span>
                <span class="exercise-time">⏱️ ${ex.time} Min</span>
                ${isCompleted ? `<span class="exercise-score">✅ ${score}%</span>` : ''}
            </div>
        </div>
    `;
}

function updateExerciseCompletionStates() {
    const progress = getProgress();
    document.querySelectorAll('.exercise-item').forEach(item => {
        const id = item.dataset.exerciseId;
        if (progress.completedExercises[id]) {
            item.classList.add('completed');
            const scoreEl = item.querySelector('.exercise-score');
            if (scoreEl) {
                scoreEl.textContent = `✅ ${progress.exerciseScores[id] || 0}%`;
            } else {
                const metaRight = item.querySelector('.exercise-meta-right');
                if (metaRight) {
                    const scoreSpan = document.createElement('span');
                    scoreSpan.className = 'exercise-score';
                    scoreSpan.textContent = `✅ ${progress.exerciseScores[id] || 0}%`;
                    metaRight.appendChild(scoreSpan);
                }
            }
        }
    });
}

// ============================================
// EXERCISE MODAL
// ============================================

function openExerciseModal(exerciseId) {
    const exercise = findExerciseById(exerciseId);
    if (!exercise) return;
    
    currentExercise = exercise;
    currentExerciseAnswers = {};
    
    const modal = document.getElementById('exercise-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = exercise.title;
    body.innerHTML = createExerciseContent(exercise);
    
    // Reset buttons
    document.getElementById('check-answer-btn').style.display = 'inline-flex';
    document.getElementById('next-exercise-btn').style.display = 'none';
    
    modal.classList.add('active');
    
    // Focus first input
    const firstInput = body.querySelector('input, select, textarea');
    if (firstInput) firstInput.focus();
}

function createExerciseContent(ex) {
    let html = `
        <div class="exercise-header">
            <span class="exercise-difficulty diff-${ex.difficulty}">${ex.difficulty.toUpperCase()}</span>
            <span class="exercise-category">${getModuleName(ex.id)} / ${ex.category}</span>
            <span class="exercise-time">⏱️ ca. ${ex.time} Minuten</span>
        </div>
        <p class="exercise-description">${ex.description}</p>
    `;
    
    if (ex.type === 'quiz' && ex.questions) {
        html += '<div class="quiz-questions">';
        ex.questions.forEach((q, i) => {
            html += `
                <div class="quiz-question" data-q-index="${i}">
                    <p><strong>Frage ${i+1}:</strong> ${q.q}</p>
                    <div class="quiz-options">
                        ${q.options.map((opt, oi) => `
                            <label class="quiz-option">
                                <input type="radio" name="q${i}" value="${oi}" data-q="${i}" data-o="${oi}">
                                <span>${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else if (ex.type === 'practical') {
        if (ex.instructions) {
            html += '<div class="practical-steps"><h4>📋 Schritte:</h4><ol>';
            ex.instructions.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ol></div>';
        }
        if (ex.steps) {
            html += '<div class="practical-steps"><h4>📋 Schritte:</h4><ol>';
            ex.steps.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ol></div>';
        }
        if (ex.task) {
            html += `<div class="practical-task"><h4>🎯 Aufgabe:</h4><p>${ex.task}</p></div>`;
        }
        if (ex.formula) {
            html += `<div class="formula-box"><strong>Lösungsformel:</strong><br><code>${ex.formula}</code></div>`;
        }
        if (ex.data) {
            html += '<div class="data-table"><h4>📊 Beispieldaten:</h4>';
            if (ex.data.lookupTable) {
                html += arrayToTable(ex.data.lookupTable);
            } else if (ex.data.source) {
                html += arrayToTable(ex.data.source);
            }
            html += '</div>';
        }
        if (ex.testCases) {
            html += '<div class="test-cases"><h4>🧪 Testfälle:</h4><ul>';
            ex.testCases.forEach(tc => {
                html += `<li>Input: ${JSON.stringify(tc.input || tc)} → Erwartet: <strong>${tc.expected}</strong></li>`;
            });
            html += '</ul></div>';
        }
        // User answer input for practical exercises
        html += `
            <div class="answer-input">
                <h4>✍️ Deine Lösung:</h4>
                <textarea id="user-answer" placeholder="Formel, Beschreibung oder Lösungsschritte hier eingeben..." rows="4"></textarea>
            </div>
        `;
    }
    
    if (ex.solution) {
        html += `<div class="solution-box" style="display:none;"><h4>✅ Musterlösung:</h4><pre>${JSON.stringify(ex.solution, null, 2)}</pre></div>`;
    }
    
    return html;
}

function arrayToTable(arr) {
    if (!arr || !arr.length) return '';
    let html = '<table class="data-table">';
    arr.forEach((row, ri) => {
        html += '<tr>';
        row.forEach((cell, ci) => {
            const tag = ri === 0 ? 'th' : 'td';
            html += `<${tag}>${cell}</${tag}>`;
        });
        html += '</tr>';
    });
    html += '</table>';
    return html;
}

function getModuleName(exerciseId) {
    if (exerciseId.startsWith('w-')) return '📝 Word';
    if (exerciseId.startsWith('e-')) return '📊 Excel';
    if (exerciseId.startsWith('p-')) return '🎨 PowerPoint';
    if (exerciseId.startsWith('o-')) return '📧 Outlook';
    return '📚';
}

function closeModal() {
    document.getElementById('exercise-modal').classList.remove('active');
    currentExercise = null;
}

function checkAnswer() {
    if (!currentExercise) return;
    
    let score = 0;
    let total = 0;
    let feedback = '';
    
    if (currentExercise.type === 'quiz' && currentExercise.questions) {
        // Check quiz answers
        currentExercise.questions.forEach((q, i) => {
            total++;
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (selected && parseInt(selected.value) === q.correct) {
                score++;
                feedback += `✅ Frage ${i+1}: Richtig!\n`;
            } else {
                feedback += `❌ Frage ${i+1}: Falsch. Richtig: ${q.options[q.correct]}\n`;
            }
        });
        score = Math.round((score / total) * 100);
    } else {
        // Practical exercise - self assessment
        const userAnswer = document.getElementById('user-answer')?.value || '';
        if (currentExercise.formula && userAnswer.includes(currentExercise.formula.replace(/[;=]/g, ''))) {
            score = 100;
            feedback = '✅ Formel korrekt erkannt!';
        } else if (currentExercise.answer && userAnswer.toLowerCase().includes(currentExercise.answer.toLowerCase())) {
            score = 100;
            feedback = '✅ Antwort korrekt!';
        } else {
            // Self assessment for practical exercises
            score = 80; // Default for completing practical exercise
            feedback = '✅ Praktische Übung abgeschlossen! Übe die Schritte in Word/Excel/PowerPoint nach.';
        }
        
        // Show solution if available
        const solutionBox = document.querySelector('.solution-box');
        if (solutionBox) {
            solutionBox.style.display = 'block';
        }
    }
    
    // Save progress
    markExerciseComplete(currentExercise.id, score, currentExercise.time * 60);
    
    // Update UI
    updateProgressDisplay();
    updateExerciseCompletionStates();
    
    // Show result
    alert(`🎉 Ergebnis: ${score}%\n\n${feedback}`);
    
    // Update buttons
    document.getElementById('check-answer-btn').style.display = 'none';
    document.getElementById('next-exercise-btn').style.display = 'inline-flex';
}

function nextExercise() {
    if (!currentExercise) return;
    
    // Find next exercise in same category
    const module = getModuleName(currentExercise.id).toLowerCase().replace('📝 ', '').replace('📊 ', '').replace('🎨 ', '').replace('📧 ', '');
    const category = currentExercise.category;
    const exercises = EXERCISES[module]?.[category];
    
    if (exercises) {
        const currentIndex = exercises.findIndex(e => e.id === currentExercise.id);
        if (currentIndex < exercises.length - 1) {
            const nextEx = exercises[currentIndex + 1];
            closeModal();
            setTimeout(() => openExerciseModal(nextEx.id), 100);
            return;
        }
    }
    
    // No next exercise, close modal
    closeModal();
}

// ============================================
// SIMULATION
// ============================================

function startSimulation() {
    const select = document.getElementById('simulation-select');
    const simId = select.value;
    
    if (!simId) {
        alert('Bitte wähle eine Simulation aus!');
        return;
    }
    
    const sim = SIMULATIONS[simId];
    if (!sim) return;
    
    currentSimulation = {
        id: simId,
        ...sim,
        startTime: Date.now(),
        completedTasks: {},
        taskStates: {}
    };
    
    simulationTimeLeft = sim.duration * 60; // seconds
    
    // Show active simulation
    document.getElementById('simulation-setup').style.display = 'none';
    document.getElementById('active-simulation').style.display = 'block';
    
    // Render tasks
    renderSimulationTasks(sim);
    
    // Start timer
    startSimulationTimer();
    
    // Notify via Telegram (if enabled)
    notifyTelegram(`🎯 Prüfungssimulation gestartet: ${sim.name}\n⏱️ 120 Minuten Timer läuft...`);
}

function renderSimulationTasks(sim) {
    const container = document.getElementById('sim-tasks');
    container.innerHTML = sim.tasks.map((task, i) => `
        <div class="sim-task" data-task-id="${task.id}">
            <div class="sim-task-header">
                <span class="sim-task-module">${getModuleIcon(task.module)} ${task.module.toUpperCase()}</span>
                <span class="sim-task-points">${task.points} Pkt</span>
            </div>
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <div class="sim-task-meta">
                <span>⏱️ ca. ${task.timeEstimate} Min</span>
                ${task.files.length ? `<span>📁 ${task.files.join(', ')}</span>` : ''}
            </div>
            <div class="sim-task-actions">
                <button class="btn btn-secondary btn-sm" onclick="markSimTaskComplete('${task.id}')">
                    ✅ Erledigt
                </button>
                <button class="btn btn-primary btn-sm" onclick="openSimTaskHelp('${task.id}')">
                    💡 Hilfe
                </button>
            </div>
        </div>
    `).join('');
}

function getModuleIcon(module) {
    const icons = { word: '📝', excel: '📊', powerpoint: '🎨', outlook: '📧' };
    return icons[module] || '📄';
}

function startSimulationTimer() {
    updateTimerDisplay();
    
    simulationTimer = setInterval(() => {
        simulationTimeLeft--;
        updateTimerDisplay();
        
        // Warning at 15, 5, 1 minutes
        if (simulationTimeLeft === 900 || simulationTimeLeft === 300 || simulationTimeLeft === 60) {
            const mins = simulationTimeLeft / 60;
            notifyTelegram(`⚠️ Simulation: Noch ${mins} Minute${mins > 1 ? 'n' : ''}!`);
            playNotificationSound();
        }
        
        if (simulationTimeLeft <= 0) {
            endSimulation(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(simulationTimeLeft / 60);
    const secs = simulationTimeLeft % 60;
    const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    document.getElementById('timer-display').textContent = display;
    
    // Progress bar
    const total = currentSimulation?.duration * 60 || 7200;
    const progress = ((total - simulationTimeLeft) / total) * 100;
    document.getElementById('sim-progress-fill').style.width = `${progress}%`;
    document.getElementById('sim-progress-text').textContent = `${Math.round(progress)}% der Zeit verstrichen`;
    
    // Color coding
    const timerEl = document.getElementById('timer-display');
    if (simulationTimeLeft < 300) {
        timerEl.style.color = 'var(--secondary)';
        timerEl.style.animation = 'pulse 1s infinite';
    } else if (simulationTimeLeft < 900) {
        timerEl.style.color = 'var(--warning)';
    }
}

function markSimTaskComplete(taskId) {
    if (!currentSimulation) return;
    
    currentSimulation.completedTasks[taskId] = true;
    currentSimulation.taskStates[taskId] = 'completed';
    
    const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskEl) {
        taskEl.classList.add('completed');
        taskEl.querySelector('.sim-task-actions').innerHTML = '<span class="completed-badge">✅ Erledigt</span>';
    }
    
    // Check if all tasks done
    const allDone = currentSimulation.tasks.every(t => currentSimulation.completedTasks[t.id]);
    if (allDone) {
        endSimulation(false);
    }
}

function openSimTaskHelp(taskId) {
    const task = currentSimulation?.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Find relevant exercises for help
    const moduleExercises = EXERCISES[task.module];
    if (moduleExercises) {
        // Show first exercise of that module as reference
        const firstCat = Object.values(moduleExercises)[0];
        if (firstCat && firstCat.length) {
            openExerciseModal(firstCat[0].id);
        }
    }
}

function endSimulation(timeUp = false) {
    if (simulationTimer) {
        clearInterval(simulationTimer);
        simulationTimer = null;
    }
    
    const sim = currentSimulation;
    if (!sim) return;
    
    const timeUsed = Math.floor((Date.now() - sim.startTime) / 1000);
    const completedCount = Object.keys(sim.completedTasks).length;
    const totalPoints = sim.tasks.reduce((sum, t) => sum + t.points, 0);
    const earnedPoints = sim.tasks
        .filter(t => sim.completedTasks[t.id])
        .reduce((sum, t) => sum + t.points, 0);
    
    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    
    // Save result
    const result = {
        simId: sim.id,
        simName: sim.name,
        date: new Date().toISOString(),
        timeUsed,
        timeUp,
        completedTasks: completedCount,
        totalTasks: sim.tasks.length,
        earnedPoints,
        totalPoints,
        percentage,
        taskDetails: sim.tasks.map(t => ({
            id: t.id,
            title: t.title,
            points: t.points,
            completed: !!sim.completedTasks[t.id]
        }))
    };
    
    saveSimulationResult(sim.id, result);
    
    // Show result modal
    showSimulationResult(result);
    
    // Reset UI
    document.getElementById('simulation-setup').style.display = 'block';
    document.getElementById('active-simulation').style.display = 'none';
    document.getElementById('simulation-select').value = '';
    
    loadSimulationHistory();
    updateProgressDisplay();
    
    currentSimulation = null;
    
    // Notify
    notifyTelegram(`🏁 Simulation beendet!\n📊 ${earnedPoints}/${totalPoints} Punkte (${percentage}%)\n${timeUp ? '⏰ Zeit abgelaufen' : '✅ Alle Aufgaben erledigt'}`);
}

function showSimulationResult(result) {
    const msg = `
🎯 <strong>Simulations-Ergebnis</strong>
📋 ${result.simName}
📊 ${result.earnedPoints}/${result.totalPoints} Punkte (${result.percentage}%)
⏱️ Zeit: ${Math.floor(result.timeUsed/60)}:${(result.timeUsed%60).toString().padStart(2,'0')} ${result.timeUp ? '(Zeit abgelaufen)' : ''}
✅ ${result.completedTasks}/${result.totalTasks} Aufgaben

${result.percentage >= 80 ? '🌟 Sehr gut! Prüfungsreif!' : result.percentage >= 60 ? '👍 Gut, aber noch Übung nötig' : '📚 Weiter üben!'}
    `;
    
    // Create a nice result display
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>🏁 Simulation beendet</h3>
            </div>
            <div class="modal-body" style="text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; font-weight: 700; color: ${result.percentage >= 80 ? 'var(--success)' : result.percentage >= 60 ? 'var(--warning)' : 'var(--secondary)'};">
                    ${result.percentage}%
                </div>
                <p style="margin: 1rem 0;">${result.earnedPoints} von ${result.totalPoints} Punkten</p>
                <p>✅ ${result.completedTasks}/${result.totalTasks} Aufgaben</p>
                <p>⏱️ ${Math.floor(result.timeUsed/60)}:${(result.timeUsed%60).toString().padStart(2,'0')} ${result.timeUp ? '(Zeit abgelaufen)' : ''}</p>
                <div style="margin: 1.5rem 0; padding: 1rem; background: var(--bg); border-radius: var(--radius);">
                    ${result.taskDetails.map(t => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                            <span>${t.completed ? '✅' : '❌'} ${t.title}</span>
                            <span>${t.completed ? `+${t.points}` : '0'} Pkt</span>
                        </div>
                    `).join('')}
                </div>
                <p style="font-size: 1.25rem; font-weight: 600; color: ${result.percentage >= 80 ? 'var(--success)' : result.percentage >= 60 ? 'var(--warning)' : 'var(--secondary)'};">
                    ${result.percentage >= 80 ? '🌟 Prüfungsreif!' : result.percentage >= 60 ? '👍 Gut, weiter so!' : '📚 Schwachstellen gezielt üben!'}
                </p>
            </div>
            <div class="modal-footer" style="justify-content: center;">
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Schließen</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function loadSimulationHistory() {
    const progress = getProgress();
    const container = document.getElementById('past-simulations');
    
    if (!container) return;
    
    const results = Object.values(progress.simulationResults || {}).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (results.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Noch keine Simulationen durchgeführt</p>';
        return;
    }
    
    container.innerHTML = results.map(r => `
        <div class="past-sim">
            <div class="past-sim-info">
                <span class="past-sim-name">${r.simName}</span>
                <span class="past-sim-meta">${new Date(r.date).toLocaleDateString('de-DE')} • ${Math.floor(r.timeUsed/60)}:${(r.timeUsed%60).toString().padStart(2,'0')} • ${r.completedTasks}/${r.totalTasks} Aufgaben</span>
            </div>
            <span class="past-sim-score">${r.percentage}%</span>
        </div>
    `).join('');
}

// ============================================
// PROGRESS DISPLAY & CHARTS
// ============================================

function updateProgressDisplay() {
    const progress = getProgress();
    const overall = getOverallProgress();
    
    // Stats
    document.getElementById('total-exercises').textContent = overall.completed;
    document.getElementById('study-hours').textContent = `${Math.round(progress.totalStudyTime / 3600)}h`;
    document.getElementById('streak').textContent = progress.currentStreak || 0;
    document.getElementById('weak-areas').textContent = Object.keys(progress.weakAreas || {}).length;
    
    // Progress ring
    const circumference = 2 * Math.PI * 26;
    const offset = circumference - (overall.percentage / 100) * circumference;
    document.getElementById('progress-circle').style.strokeDashoffset = offset;
    document.getElementById('progress-text').textContent = `${overall.percentage}%`;
    
    // Task checkboxes
    updateTaskCheckboxes();
}

function updateTaskCheckboxes() {
    const progress = getProgress();
    document.querySelectorAll('.task-item input[type="checkbox"]').forEach((cb, i) => {
        // Could link to actual daily tasks
        cb.addEventListener('change', () => {
            const label = cb.nextElementSibling;
            if (cb.checked) {
                label.classList.add('completed');
            } else {
                label.classList.remove('completed');
            }
        });
    });
}

function initCharts() {
    initProgressChart();
    initWeeklyChart();
    updateWeaknessAnalysis();
    updateMilestones();
}

function initProgressChart() {
    const ctx = document.getElementById('progress-chart')?.getContext('2d');
    if (!ctx) return;
    
    const modules = ['word', 'excel', 'powerpoint', 'outlook'];
    const labels = ['Word', 'Excel', 'PowerPoint', 'Outlook'];
    const data = modules.map(m => getModuleProgress(m).percentage);
    const colors = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b'];
    
    if (chartInstances.progress) chartInstances.progress.destroy();
    
    chartInstances.progress = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 11 } }
                }
            }
        }
    });
}

function initWeeklyChart() {
    const ctx = document.getElementById('weekly-chart')?.getContext('2d');
    if (!ctx) return;
    
    // Generate last 7 days study time
    const labels = [];
    const data = [];
    const progress = getProgress();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        labels.push(new Date(date).toLocaleDateString('de-DE', { weekday: 'short' }));
        // Mock data - in real app would track daily study time
        data.push(Math.random() * 120); // minutes
    }
    
    if (chartInstances.weekly) chartInstances.weekly.destroy();
    
    chartInstances.weekly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Minuten',
                data,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'var(--primary)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                }
            }
        }
    });
}

function updateCharts() {
    if (chartInstances.progress) {
        const modules = ['word', 'excel', 'powerpoint', 'outlook'];
        const data = modules.map(m => getModuleProgress(m).percentage);
        chartInstances.progress.data.datasets[0].data = data;
        chartInstances.progress.update();
    }
    
    updateWeaknessAnalysis();
    updateMilestones();
}

function updateWeaknessAnalysis() {
    const container = document.getElementById('weakness-analysis');
    if (!container) return;
    
    const weakAreas = getWeakAreas();
    
    if (weakAreas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">Noch keine Schwachstellen erkannt - weiter so! 💪</p>';
        return;
    }
    
    const maxCount = Math.max(...weakAreas.map(w => w.count));
    
    container.innerHTML = weakAreas.map(w => {
        const percentage = (w.count / maxCount) * 100;
        const catNames = {
            'din': 'DIN 5008',
            'serienbrief': 'Serienbriefe',
            'forms': 'Formulare/Vorlagen',
            'sverweis': 'SVERWEIS/XVERWEIS',
            'wenn': 'WENN-Funktionen',
            'pivot': 'Pivot-Tabellen',
            'sumif': 'SUMMEWENN/S',
            'cf': 'Bedingte Formatierung',
            'refs': 'Bezugsarten',
            'master': 'Folienmaster',
            'anim': 'Animationen',
            'charts': 'Diagramme/SmartArt',
            'rules': 'Regeln/QuickSteps',
            'calendar': 'Kalender',
            'tasks': 'Aufgaben/To-Do'
        };
        
        return `
            <div class="weakness-item">
                <span class="weakness-label">${catNames[w.category] || w.category}</span>
                <div class="weakness-bar">
                    <div class="weakness-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="weakness-value">${w.count}x</span>
            </div>
        `;
    }).join('');
}

function updateMilestones() {
    const container = document.getElementById('milestones');
    if (!container) return;
    
    const progress = getProgress();
    const overall = getOverallProgress();
    
    const milestones = [
        { id: 'm1', title: 'Erste Schritte', desc: '5 Übungen abgeschlossen', target: 5, icon: '🌱' },
        { id: 'm2', title: 'Excel-Grundlagen', desc: 'SVERWEIS & WENN gemeistert', target: 15, icon: '📊' },
        { id: 'm3', title: 'Word-Profi', desc: 'DIN 5008 & Serienbriefe sicher', target: 25, icon: '📝' },
        { id: 'm4', title: 'Pivot-Meister', desc: 'Pivot-Tabellen & Diagramme', target: 35, icon: '📈' },
        { id: 'm5', title: 'Simulation bestanden', desc: 'Erste 80%+ Simulation', target: 1, icon: '🎯', type: 'simulation' },
        { id: 'm6', title: 'Prüfungsreif', desc: '90% Gesamtfortschritt', target: 90, icon: '🏆', type: 'overall' },
        { id: 'm7', title: 'Streak-König', desc: '14 Tage am Stück gelernt', target: 14, icon: '🔥', type: 'streak' }
    ];
    
    container.innerHTML = milestones.map(m => {
        let current = 0;
        let completed = false;
        
        if (m.type === 'simulation') {
            const sims = Object.values(progress.simulationResults || {});
            current = sims.filter(s => s.percentage >= 80).length;
            completed = current >= m.target;
        } else if (m.type === 'overall') {
            current = overall.percentage;
            completed = current >= m.target;
        } else if (m.type === 'streak') {
            current = progress.currentStreak || 0;
            completed = current >= m.target;
        } else {
            current = overall.completed;
            completed = current >= m.target;
        }
        
        return `
            <div class="milestone ${completed ? 'completed' : ''}">
                <div class="milestone-icon">${m.icon}</div>
                <div class="milestone-info">
                    <div class="milestone-title">${m.title}</div>
                    <div class="milestone-desc">${m.desc} (${current}/${m.target})</div>
                </div>
                ${completed ? '<span style="color: var(--success); font-size: 1.5rem;">✅</span>' : ''}
            </div>
        `;
    }).join('');
}

// ============================================
// COUNTDOWN
// ============================================

function updateCountdown() {
    const countdown = getCountdown();
    document.getElementById('countdown').textContent = countdown.text;
}

// ============================================
// MORNING COMMAND CENTER
// ============================================

function startMorningCheckin() {
    // This triggers the morning command center workflow
    switchTab('dashboard');
    
    // Show a prompt for today's priority
    const priority = prompt('☕ Morning Command Center\n\nWas ist deine NUMMER 1 Priorität heute?', 'Heute: Excel SVERWEIS/XVERWEIS 3 Übungen lösen');
    
    if (priority) {
        // Process with morning command center logic
        processMorningPriority(priority);
    }
}

function processMorningPriority(priority) {
    const lower = priority.toLowerCase();
    let suggestions = [];
    
    // Analyze priority and create suggestions
    if (lower.includes('excel') || lower.includes('sverweis') || lower.includes('pivot') || lower.includes('wenn')) {
        suggestions = [
            { label: '📊 3 SVERWEIS/XVERWEIS Übungen generieren', type: 'safe', action: () => switchTab('excel') },
            { label: '📈 Pivot-Tabelle Schritt-für-Schritt Anleitung', type: 'approval', action: () => openExerciseModal('e-pv-1') },
            { label: '🎯 Bedingte Formatierung für Lagerbestand', type: 'manual', action: () => openExerciseModal('e-cf-2') }
        ];
    } else if (lower.includes('word') || lower.includes('brief') || lower.includes('din') || lower.includes('serienbrief')) {
        suggestions = [
            { label: '📝 DIN 5008 Geschäftsbrief Vorlage laden', type: 'safe', action: () => openExerciseModal('w-din-1') },
            { label: '📨 Serienbrief mit bedingtem Text erstellen', type: 'approval', action: () => openExerciseModal('w-sb-2') },
            { label: '📋 Formular "Reisekosten" bauen', type: 'manual', action: () => openExerciseModal('w-fm-1') }
        ];
    } else if (lower.includes('powerpoint') || lower.includes('präsent') || lower.includes('animation')) {
        suggestions = [
            { label: '🎨 Folienmaster mit Firmenfarben erstellen', type: 'safe', action: () => openExerciseModal('p-ms-1') },
            { label: '✨ Pfadanimation für Logo einrichten', type: 'approval', action: () => openExerciseModal('p-an-2') },
            { label: '📊 Excel-Diagramm in PPT verknüpfen', type: 'manual', action: () => openExerciseModal('p-ch-1') }
        ];
    } else if (lower.includes('simulation') || lower.includes('prüfung') || lower.includes('test')) {
        suggestions = [
            { label: '🎯 AKA Musteraufgabe Herbst 2024 starten', type: 'safe', action: () => { switchTab('simulation'); document.getElementById('simulation-select').value = 'aka-2024-1'; } },
            { label: '⏱️ 120 Min Timer mit Pausen-Plan', type: 'approval', action: () => switchTab('simulation') },
            { label: '📊 Schwachstellen-Analyse anzeigen', type: 'manual', action: () => switchTab('progress') }
        ];
    } else {
        suggestions = [
            { label: '📊 Excel: SVERWEIS Übungen (Prüfungsschwerpunkt!)', type: 'safe', action: () => switchTab('excel') },
            { label: '📝 Word: DIN 5008 Brief wiederholen', type: 'approval', action: () => switchTab('word') },
            { label: '🎯 Tägliche 90 Min Lernblock planen', type: 'manual', action: () => switchTab('dashboard') }
        ];
    }
    
    // Show suggestions in modal
    showMorningSuggestions(priority, suggestions);
}

function showMorningSuggestions(priority, suggestions) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>☕ Morning Command Center</h3>
            </div>
            <div class="modal-body">
                <div style="background: var(--bg); padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem;">
                    <strong>Deine Priorität:</strong>
                    <p style="margin-top: 0.5rem;">${priority}</p>
                </div>
                <p><strong>Ich teile ein:</strong></p>
                <ul style="margin: 0.5rem 0 1rem 1.5rem; color: var(--text-muted);">
                    <li><strong>Dein Part:</strong> Strategie wählen, Pausen planen, in Word/Excel/PPT umsetzen</li>
                    <li><strong>Mein Part:</strong> Übungen bereitstellen, Lösungen prüfen, Fortschritt tracken, motivieren</li>
                </ul>
                <p><strong>3 Wege, wie ich dir helfen kann:</strong></p>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${suggestions.map((s, i) => `
                        <button class="btn ${s.type === 'safe' ? 'btn-success' : s.type === 'approval' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="this.closest('.modal').remove(); ${s.action.toString().match(/\{([\s\S]*)\}/)[1]}">
                            ${['①','②','③'][i]} ${s.label} <span style="font-size:0.75rem;opacity:0.8;">(${s.type})</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer" style="justify-content: center;">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Später entscheiden</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ============================================
// TELEGRAM INTEGRATION
// ============================================

function notifyTelegram(message) {
    const settings = getSettings();
    if (!settings.telegramEnabled) return;
    
    // In real implementation, this would call a webhook or API
    console.log('📱 Telegram notification:', message);
    
    // Store for later sync
    const notifications = getStorage('emilia_telegram_queue', []);
    notifications.push({ message, timestamp: Date.now() });
    setStorage('emilia_telegram_queue', notifications.slice(-50));
}

function playNotificationSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAA=');
        audio.volume = 0.3;
        audio.play().catch(() => {});
    } catch (e) {}
}

// ============================================
// COACH CHAT
// ============================================

function setupChat() {
    // Chat is already in HTML, just need handlers
}

function toggleChat() {
    document.getElementById('coach-chat').classList.toggle('collapsed');
}

function coachReply(action) {
    const responses = {
        lernplan: "📅 Ich erstelle dir einen individuellen Lernplan! Sag mir: Wie viele Stunden kannst du wöchentlich lernen? Wann ist deine Prüfung genau?",
        motivation: "💪 Du schaffst das! Jeder Tag zählt. Was brauchst du gerade? Eine Pause? Einen einfachen Start? Oder einen harten Push?",
        schwachstellen: "🎯 Lass uns deine Schwachstellen ansehen! Ich zeige dir die Top 3 Bereiche, wo du Punkte verlierst.",
        übung: "📝 Was möchtest du üben? Excel (SVERWEIS, Pivot, WENN), Word (DIN 5008, Serienbrief), PowerPoint, Outlook oder eine Simulation?"
    };
    
    addCoachMessage(responses[action] || "Wie kann ich helfen?");
    document.getElementById('chat-input').focus();
}

function addCoachMessage(text, quickReplies = null) {
    const chatBody = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = 'message coach';
    div.innerHTML = `
        <div class="message-avatar">🐰</div>
        <div class="message-content">
            <p>${text}</p>
            ${quickReplies ? `<div class="quick-replies">${quickReplies.map(r => `<button onclick="coachReply('${r.action}')">${r.label}</button>`).join('')}</div>` : ''}
        </div>
    `;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function addUserMessage(text) {
    const chatBody = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = 'message user';
    div.style.flexDirection = 'row-reverse';
    div.style.textAlign = 'right';
    div.innerHTML = `
        <div class="message-content" style="background: var(--primary); color: white; border-radius: 18px 18px 4px 18px;">
            <p>${text}</p>
        </div>
    `;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChat();
    }
}

function sendChat() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    addUserMessage(text);
    input.value = '';
    
    // Simple keyword-based responses
    const lower = text.toLowerCase();
    let response = "Verstehe! ";
    
    if (lower.includes('plan') || lower.includes('lernplan')) {
        response += "Für einen Lernplan brauche ich: Wöchentliche Stunden, Prüfungstermin, aktuelle Stärken/Schwächen. Sollen wir das durchgehen?";
    } else if (lower.includes('motivation') || lower.includes('müde') || lower.includes('schaff')) {
        response += "Du bist auf dem richtigen Weg! 💪 Was würde jetzt helfen? 5 Min Pause? Ein kleines Erfolgserlebnis? Ein konkretes Ziel für heute?";
    } else if (lower.includes('excel') || lower.includes('sverweis') || lower.includes('pivot')) {
        response += "Excel ist der Prüfungsschwerpunkt! Willst du: 1) SVERWEIS üben, 2) Pivot-Tabellen, 3) WENN-Funktionen, 4) Alles gemischt?";
    } else if (lower.includes('word') || lower.includes('din') || lower.includes('brief')) {
        response += "Word: DIN 5008 Geschäftsbrief, Serienbriefe, Formulare oder Vorlagen. Was brauchst du?";
    } else if (lower.includes('simulation') || lower.includes('prüfung')) {
        response += "Simulation starten? Wähle: AKA 2024 Herbst, AKA 2024 Frühjahr, oder Emilias Mix. 120 Min Timer läuft!";
    } else if (lower.includes('hilfe') || lower.includes('was kann')) {
        response += "Ich helfe dir bei: 📅 Lernplanung, 📝 Übungen (Word/Excel/PPT/Outlook), 🎯 Simulationen, 📊 Fortschritt, 💪 Motivation, 🧠 Schwachstellen-Analyse. Frag einfach!";
    } else {
        response += "Sag mir, was du brauchst: Lernplan, Übung, Motivation, Simulation, Fortschritt?";
    }
    
    setTimeout(() => addCoachMessage(response), 500);
}

// ============================================
// PWA INSTALL HANDLING
// ============================================

let deferredPrompt = null;

function setupPWAInstall() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install banner after a delay
        setTimeout(() => {
            const banner = document.getElementById('install-banner');
            if (banner && !getStorage('emilia_install_dismissed')) {
                banner.classList.add('show');
            }
        }, 5000);
    });
    
    // Handle install button
    document.getElementById('install-btn')?.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('PWA install outcome:', outcome);
            deferredPrompt = null;
            document.getElementById('install-banner')?.classList.remove('show');
        }
    });
    
    // Handle dismiss
    document.getElementById('install-dismiss')?.addEventListener('click', () => {
        document.getElementById('install-banner')?.classList.remove('show');
        setStorage('emilia_install_dismissed', true);
    });
    
    // Track if app is installed
    window.addEventListener('appinstalled', () => {
        console.log('🐰 PWA installed!');
        document.getElementById('install-banner')?.classList.remove('show');
        setStorage('emilia_install_dismissed', true);
        addCoachMessage('🎉 Danke fürs Installieren! Jetzt kannst du auch offline lernen und bekommst Push-Nachrichten! 📱');
    });
}

// Add to initializeApp

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + 1-7 for tabs
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        const tabs = ['dashboard', 'word', 'excel', 'powerpoint', 'outlook', 'simulation', 'progress'];
        switchTab(tabs[parseInt(e.key) - 1]);
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
        const chatModal = document.querySelector('.modal.active');
        if (chatModal) chatModal.remove();
    }
    
    // Ctrl/Cmd + M for morning checkin
    if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        startMorningCheckin();
    }
});

// ============================================
// EXPORT FOR GLOBAL ACCESS
// ============================================

window.switchTab = switchTab;
window.openExerciseModal = openExerciseModal;
window.closeModal = closeModal;
window.checkAnswer = checkAnswer;
window.nextExercise = nextExercise;
window.startSimulation = startSimulation;
window.endSimulation = endSimulation;
window.markSimTaskComplete = markSimTaskComplete;
window.openSimTaskHelp = openSimTaskHelp;
window.startMorningCheckin = startMorningCheckin;
window.coachReply = coachReply;
window.sendChat = sendChat;
window.handleChatEnter = handleChatEnter;
window.toggleChat = toggleChat;