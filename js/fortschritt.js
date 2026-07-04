/**
 * Lernfortschritt-System für IHK Lernplattform
 * Mit localStorage-Speicherung, Statistiken und Chart.js-Visualisierungen
 */

class LearningProgressSystem {
    constructor() {
        this.STORAGE_KEY = 'emiliaLernfortschritt';
        this.categories = ['excel', 'word', 'powerpoint', 'outlook'];
        this.progressData = this.loadProgress();
        this.charts = {};
    }

    // Standard-Datenstruktur initialisieren
    getDefaultData() {
        return {
            categories: {
                excel: {
                    completed: 0,
                    total: 50,
                    tasksSolved: 0,
                    totalTasks: 50,
                    averageScore: 0,
                    totalTime: 0,
                    history: []
                },
                word: {
                    completed: 0,
                    total: 50,
                    tasksSolved: 0,
                    totalTasks: 50,
                    averageScore: 0,
                    totalTime: 0,
                    history: []
                },
                powerpoint: {
                    completed: 0,
                    total: 30,
                    tasksSolved: 0,
                    totalTasks: 30,
                    averageScore: 0,
                    totalTime: 0,
                    history: []
                },
                outlook: {
                    completed: 0,
                    total: 20,
                    tasksSolved: 0,
                    totalTasks: 20,
                    averageScore: 0,
                    totalTime: 0,
                    history: []
                }
            },
            statistics: {
                totalTime: 0,
                totalTasksSolved: 0,
                totalTasks: 150,
                averageScore: 0,
                passRate: 0,
                streak: 0,
                lastStudyDate: null,
                studyDays: []
            },
            achievements: []
        };
    }

    // Daten aus localStorage laden
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                // Sicherstellen, dass alle Kategorien existieren
                const defaultData = this.getDefaultData();
                Object.keys(defaultData.categories).forEach(category => {
                    if (!data.categories[category]) {
                        data.categories[category] = defaultData.categories[category];
                    }
                });
                return data;
            }
        } catch (error) {
            console.error('Fehler beim Laden des Fortschritts:', error);
        }
        return this.getDefaultData();
    }

    // Daten in localStorage speichern
    saveProgress() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progressData));
            return true;
        } catch (error) {
            console.error('Fehler beim Speichern des Fortschritts:', error);
            return false;
        }
    }

    // Aufgabe abschließen
    completeTask(category, score, timeSpent) {
        const categoryData = this.progressData.categories[category];
        
        // Kategorie-Statistiken aktualisieren
        categoryData.tasksSolved++;
        categoryData.completed = Math.min(100, Math.round((categoryData.tasksSolved / categoryData.totalTasks) * 100));
        
        // Durchschnittspunkte berechnen
        const totalScore = categoryData.averageScore * (categoryData.tasksSolved - 1) + score;
        categoryData.averageScore = Math.round(totalScore / categoryData.tasksSolved);
        
        // Zeit hinzufügen
        categoryData.totalTime += timeSpent;
        
        // Historie eintragen
        categoryData.history.push({
            date: new Date().toISOString(),
            score: score,
            timeSpent: timeSpent
        });
        
        // Nur letzte 20 Einträge behalten
        if (categoryData.history.length > 20) {
            categoryData.history = categoryData.history.slice(-20);
        }
        
        // Gesamt-Statistiken aktualisieren
        this.updateGlobalStatistics();
        
        // Speichern
        this.saveProgress();
        
        return {
            category: category,
            completed: categoryData.completed,
            score: score,
            averageScore: categoryData.averageScore
        };
    }

    // Gesamt-Statistiken aktualisieren
    updateGlobalStatistics() {
        const stats = this.progressData.statistics;
        const categories = this.progressData.categories;
        
        // Gesamtzeit und Aufgaben
        stats.totalTime = 0;
        stats.totalTasksSolved = 0;
        let totalScore = 0;
        let totalTasksWithScore = 0;
        
        this.categories.forEach(category => {
            const cat = categories[category];
            stats.totalTime += cat.totalTime;
            stats.totalTasksSolved += cat.tasksSolved;
            
            if (cat.tasksSolved > 0) {
                totalScore += cat.averageScore * cat.tasksSolved;
                totalTasksWithScore += cat.tasksSolved;
            }
        });
        
        // Durchschnittspunkte
        stats.averageScore = totalTasksWithScore > 0 ? Math.round(totalScore / totalTasksWithScore) : 0;
        
        // Bestehensquote (≥50 Punkte = bestanden)
        stats.passRate = totalTasksWithScore > 0 ? Math.round((totalTasksWithScore / stats.totalTasks) * 100) : 0;
        
        // Streak berechnen
        this.updateStreak();
    }

    // Streak aktualisieren
    updateStreak() {
        const stats = this.progressData.statistics;
        const today = new Date().toDateString();
        const lastStudyDate = stats.lastStudyDate;
        
        if (lastStudyDate) {
            const lastDate = new Date(lastStudyDate);
            const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                // Heute schon gelernt, Streak bleibt
                return;
            } else if (diffDays === 1) {
                // Gestern gelernt, Streak erhöhen
                stats.streak++;
            } else {
                // Lücke im Lernen, Streak zurücksetzen
                stats.streak = 1;
            }
        } else {
            stats.streak = 1;
        }
        
        stats.lastStudyDate = today;
        
        // Lerntage speichern
        if (!stats.studyDays.includes(today)) {
            stats.studyDays.push(today);
            // Nur letzte 30 Tage behalten
            if (stats.studyDays.length > 30) {
                stats.studyDays = stats.studyDays.slice(-30);
            }
        }
    }

    // Kategorie-Fortschritt abrufen
    getCategoryProgress(category) {
        return this.progressData.categories[category] || this.getDefaultData().categories[category];
    }

    // Gesamt-Statistiken abrufen
    getGlobalStatistics() {
        return this.progressData.statistics;
    }

    // Fortschritt zurücksetzen
    resetProgress(category = null) {
        if (category) {
            this.progressData.categories[category] = this.getDefaultData().categories[category];
        } else {
            this.progressData = this.getDefaultData();
        }
        this.saveProgress();
    }

    // Zeit formatieren
    formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} Min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    // Chart.js Initialisierung
    initCharts() {
        this.initProgressBarsChart();
        this.initDistributionChart();
        this.initScoreHistoryChart();
    }

    // Fortschrittsbalken-Chart
    initProgressBarsChart() {
        const ctx = document.getElementById('progressBarsChart');
        if (!ctx) return;

        const data = this.categories.map(cat => this.progressData.categories[cat]);
        
        if (this.charts.progressBars) {
            this.charts.progressBars.destroy();
        }

        this.charts.progressBars = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Excel', 'Word', 'PowerPoint', 'Outlook'],
                datasets: [{
                    label: 'Fortschritt %',
                    data: data.map(d => d.completed),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const catData = data[context.dataIndex];
                                return [
                                    `Fortschritt: ${catData.completed}%`,
                                    `Aufgaben: ${catData.tasksSolved}/${catData.totalTasks}`,
                                    `Ø Punkte: ${catData.averageScore}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    }

    // Verteilungs-Kreisdiagramm
    initDistributionChart() {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;

        const data = this.categories.map(cat => this.progressData.categories[cat]);
        
        if (this.charts.distribution) {
            this.charts.distribution.destroy();
        }

        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Excel', 'Word', 'PowerPoint', 'Outlook'],
                datasets: [{
                    data: data.map(d => d.tasksSolved),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.raw;
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Punkte-Verlaufsdiagramm
    initScoreHistoryChart() {
        const ctx = document.getElementById('scoreHistoryChart');
        if (!ctx) return;

        // Historie aus allen Kategorien sammeln
        const allHistory = [];
        this.categories.forEach(cat => {
            const catData = this.progressData.categories[cat];
            catData.history.forEach(entry => {
                allHistory.push({
                    category: cat,
                    ...entry
                });
            });
        });

        // Nach Datum sortieren
        allHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Labels und Daten vorbereiten
        const labels = allHistory.map(entry => {
            const date = new Date(entry.date);
            return `${date.getDate()}.${date.getMonth() + 1}.`;
        });

        const datasets = {
            excel: { data: [], color: 'rgba(54, 162, 235, 1)' },
            word: { data: [], color: 'rgba(75, 192, 192, 1)' },
            powerpoint: { data: [], color: 'rgba(255, 159, 64, 1)' },
            outlook: { data: [], color: 'rgba(153, 102, 255, 1)' }
        };

        allHistory.forEach(entry => {
            if (datasets[entry.category]) {
                datasets[entry.category].data.push(entry.score);
            }
        });

        if (this.charts.scoreHistory) {
            this.charts.scoreHistory.destroy();
        }

        this.charts.scoreHistory = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: Object.entries(datasets).map(([name, data]) => ({
                    label: name.charAt(0).toUpperCase() + name.slice(1),
                    data: data.data,
                    borderColor: data.color,
                    backgroundColor: data.color.replace('1)', '0.1)'),
                    tension: 0.4,
                    fill: true
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + ' Pkt'
                        }
                    }
                }
            }
        });
    }

    // UI aktualisieren
    updateUI() {
        // Kategorie-Fortschritte
        this.categories.forEach(category => {
            const catData = this.progressData.categories[category];
            
            // Fortschrittsbalken
            const progressBar = document.getElementById(`${category}-progress-bar`);
            const progressText = document.getElementById(`${category}-progress-text`);
            
            if (progressBar) {
                progressBar.style.width = `${catData.completed}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${catData.completed}% abgeschlossen`;
            }
            
            // Statistiken
            const tasksEl = document.getElementById(`${category}-tasks`);
            const scoreEl = document.getElementById(`${category}-score`);
            const timeEl = document.getElementById(`${category}-time`);
            
            if (tasksEl) {
                tasksEl.textContent = `${catData.tasksSolved}/${catData.totalTasks}`;
            }
            
            if (scoreEl) {
                scoreEl.textContent = `Ø ${catData.averageScore} Pkt`;
            }
            
            if (timeEl) {
                timeEl.textContent = this.formatTime(catData.totalTime);
            }
        });

        // Gesamt-Statistiken
        const stats = this.progressData.statistics;
        
        const totalTimeEl = document.getElementById('total-time');
        const totalTasksEl = document.getElementById('total-tasks');
        const avgScoreEl = document.getElementById('average-score');
        const passRateEl = document.getElementById('pass-rate');
        const streakEl = document.getElementById('streak');

        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(stats.totalTime);
        }
        
        if (totalTasksEl) {
            totalTasksEl.textContent = `${stats.totalTasksSolved}/${stats.totalTasks}`;
        }
        
        if (avgScoreEl) {
            avgScoreEl.textContent = `${stats.averageScore} Pkt`;
        }
        
        if (passRateEl) {
            passRateEl.textContent = `${stats.passRate}%`;
        }
        
        if (streakEl) {
            streakEl.textContent = `${stats.streak} 🔥`;
        }

        // Charts aktualisieren
        this.initCharts();
    }

    // System initialisieren
    init() {
        this.updateUI();
        
        // Demo-Daten für Testzwecke (optional)
        if (this.progressData.statistics.totalTasksSolved === 0) {
            this.addDemoData();
        }
    }

    // Demo-Daten hinzufügen
    addDemoData() {
        // Ein paar Beispiel-Aufgaben für jede Kategorie
        const demoTasks = [
            { category: 'excel', score: 85, time: 15 },
            { category: 'excel', score: 92, time: 20 },
            { category: 'word', score: 78, time: 12 },
            { category: 'word', score: 88, time: 18 },
            { category: 'powerpoint', score: 95, time: 25 },
            { category: 'outlook', score: 82, time: 10 }
        ];

        demoTasks.forEach(task => {
            this.completeTask(task.category, task.score, task.time);
        });

        this.updateUI();
    }

    // Fortschritt exportieren
    exportProgress() {
        const dataStr = JSON.stringify(this.progressData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `lernfortschritt_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Fortschritt importieren
    importProgress(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validierung
            if (!data.categories || !data.statistics) {
                throw new Error('Ungültiges Format');
            }

            this.progressData = data;
            this.saveProgress();
            this.updateUI();
            
            return { success: true, message: 'Fortschritt erfolgreich importiert!' };
        } catch (error) {
            return { success: false, message: 'Import fehlgeschlagen: ' + error.message };
        }
    }
}

// Globale Instanz erstellen
let fortschrittSystem;

// Beim Laden initialisieren
document.addEventListener('DOMContentLoaded', function() {
    fortschrittSystem = new LearningProgressSystem();
    fortschrittSystem.init();
});

// Hilfsfunktionen für globale Verwendung
function completeTask(category, score, timeSpent) {
    if (fortschrittSystem) {
        return fortschrittSystem.completeTask(category, score, timeSpent);
    }
}

function updateFortschrittUI() {
    if (fortschrittSystem) {
        fortschrittSystem.updateUI();
    }
}

function resetFortschritt(category = null) {
    if (fortschrittSystem) {
        fortschrittSystem.resetProgress(category);
        fortschrittSystem.updateUI();
    }
}

function exportFortschritt() {
    if (fortschrittSystem) {
        fortschrittSystem.exportProgress();
    }
}

function importFortschritt(jsonString) {
    if (fortschrittSystem) {
        return fortschrittSystem.importProgress(jsonString);
    }
}