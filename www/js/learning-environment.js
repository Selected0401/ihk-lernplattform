// Learning Environment Module - Interactive Task Editors with Solutions
class LearningEnvironment {
    constructor() {
        this.currentTask = null;
        this.userAnswers = {};
        this.editors = {
            excel: new ExcelSimulator(),
            word: new WordEditor(),
            powerpoint: new PowerPointEditor(),
            outlook: new OutlookEditor()
        };
    }

    // Start a task with full learning environment
    startTask(task) {
        this.currentTask = task;
        this.userAnswers = {};
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay learning-env-modal';
        modal.innerHTML = this.createLearningEnvironmentHTML(task);
        document.body.appendChild(modal);
        
        // Initialize the appropriate editor
        const editor = this.editors[task.modul.toLowerCase()];
        if (editor) {
            editor.initialize(task, this);
        }
        
        document.body.style.overflow = 'hidden';

        // Add keyboard shortcuts
        this.addKeyboardShortcuts(modal);

        setTimeout(() => modal.querySelector('.modal-close')?.focus(), 0);
        
        return modal;
    }

    createLearningEnvironmentHTML(task) {
        const moduleIcon = this.getModuleIcon(task.modul);
        return `
            <div class="modal learning-environment" role="dialog" aria-modal="true" aria-labelledby="learning-env-title">
                <div class="modal-header">
                    <div class="header-left">
                        <span class="module-badge">${moduleIcon} ${task.modul}</span>
                        <h3 id="learning-env-title">${task.titel}</h3>
                    </div>
                    <div class="header-right">
                        <div class="timer" id="taskTimer">⏱️ ${task.dauer}</div>
                        <button type="button" class="modal-close" onclick="window.learningEnv.closeEnvironment()" aria-label="Lernumgebung schließen">&times;</button>
                    </div>
                </div>
                <div class="modal-body learning-body">
                    <div class="split-view">
                        <div class="task-panel" role="complementary" aria-label="Aufgabenstellung">
                            <div class="panel-header">
                                <h4>📋 Aufgabe</h4>
                                <div class="task-meta">
                                    <span class="difficulty ${task.schwierigkeit.toLowerCase()}">${task.schwierigkeit}</span>
                                    <span class="points">🏆 ${task.punkte} Pkt</span>
                                </div>
                            </div>
                            <div class="task-description">
                                ${task.beschreibung}
                            </div>
                            <div class="task-data" id="taskData">
                                <!-- Data table rendered by editor -->
                            </div>
                            <div class="hints-panel" id="hintsPanel">
                                <button class="hint-btn" onclick="window.learningEnv.showHint()">
                                    💡 Tipp anzeigen
                                </button>
                                <div class="hint-content" id="hintContent" style="display:none;"></div>
                            </div>
                        </div>
                        <div class="work-panel" role="main" aria-label="Arbeitsbereich">
                            <div class="panel-header">
                                <h4>💻 Arbeitsbereich</h4>
                                <div class="editor-toolbar" id="editorToolbar">
                                    <!-- Toolbar buttons rendered by editor -->
                                </div>
                            </div>
                            <div class="editor-container" id="editorContainer">
                                <!-- Editor rendered here -->
                            </div>
                            <div class="solution-panel" id="solutionPanel" style="display:none;">
                                <h4>✅ Musterlösung</h4>
                                <div class="solution-content" id="solutionContent"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer learning-footer">
                    <button class="btn btn-secondary" onclick="window.learningEnv.resetTask()">🔄 Zurücksetzen</button>
                    <button class="btn btn-info" onclick="window.learningEnv.toggleSolution()">👁️ Lösung anzeigen</button>
                    <button class="btn btn-primary" onclick="window.learningEnv.checkSolution()">✅ Prüfen</button>
                    <button class="btn btn-success" onclick="window.learningEnv.submitSolution()">📤 Abgeben</button>
                </div>
            </div>
        `;
    }

    getModuleIcon(module) {
        const icons = { 'Excel': '📊', 'Word': '📝', 'PowerPoint': '🎨', 'Outlook': '📧' };
        return icons[module] || '📄';
    }

    addKeyboardShortcuts(modal) {
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                this.closeEnvironment();
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.checkSolution();
            }
            if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.showHint();
            }
        };
        modal.addEventListener('keydown', handleKeydown);
        modal._keydownHandler = handleKeydown;
    }

    closeEnvironment() {
        const modal = document.querySelector('.learning-env-modal');
        if (modal) {
            if (modal._keydownHandler) {
                modal.removeEventListener('keydown', modal._keydownHandler);
            }
            modal.remove();
        }
        document.body.style.overflow = '';
        this.currentTask = null;
        this.userAnswers = {};
    }

    // Solution checking
    checkSolution() {
        if (!this.currentTask) return;
        
        const editor = this.editors[this.currentTask.modul.toLowerCase()];
        if (!editor) return;

        const result = editor.checkSolution(this.currentTask, this.userAnswers);
        this.showResult(result);
    }

    submitSolution() {
        if (!this.currentTask) return;
        
        const editor = this.editors[this.currentTask.modul.toLowerCase()];
        if (!editor) return;

        const result = editor.checkSolution(this.currentTask, this.userAnswers);
        
        if (result.correct) {
            // Save progress
            const progress = JSON.parse(localStorage.getItem('emilia-progress') || '{}');
            progress.completedExercises = (progress.completedExercises || 0) + 1;
            progress.totalTime = (progress.totalTime || 0) + parseInt(this.currentTask.dauer);
            progress.lastCompleted = this.currentTask.id;
            progress.lastCompletedDate = new Date().toISOString();
            localStorage.setItem('emilia-progress', JSON.stringify(progress));
            
            // Show success with confetti
            this.showSuccess(result);
            
            // Close after delay
            setTimeout(() => this.closeEnvironment(), 2000);
        } else {
            this.showResult(result);
        }
    }

    showResult(result) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay result-modal';
        modal.innerHTML = `
            <div class="modal result" role="dialog" aria-modal="true" aria-labelledby="result-modal-title">
                <div class="modal-header">
                    <h3 id="result-modal-title">${result.correct ? '🎉 Richtig!' : '❌ Noch nicht ganz'}</h3>
                </div>
                <div class="modal-body">
                    <p>${result.message}</p>
                    ${!result.correct && result.solution ? `
                        <div class="solution-hint">
                            <strong>💡 Musterlösung:</strong>
                            <pre>${result.solution}</pre>
                        </div>
                    ` : ''}
                    <div class="points-earned">
                        <p>Punkte: ${result.correct ? this.currentTask.punkte : 0} / ${this.currentTask.punkte}</p>
                        ${result.details ? `<p>${result.details}</p>` : ''}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); window.learningEnv.${result.correct ? 'closeEnvironment' : 'resetTask'}()">
                        ${result.correct ? 'Weiter' : 'Nochmal versuchen'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showSuccess(result) {
        const modal = document.querySelector('.learning-env-modal');
        if (modal) {
            modal.innerHTML = `
                <div class="modal learning-environment success">
                    <div class="modal-body success-body">
                        <div class="success-animation">🎉</div>
                        <h3>Perfekt gelöst!</h3>
                        <p>${result.message}</p>
                        <div class="points-earned">+${this.currentTask.punkte} Punkte 🏆</div>
                    </div>
                </div>
            `;
            this.triggerConfetti();
        }
    }

    triggerConfetti() {
        // Simple confetti animation
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = ['#667eea', '#764ba2', '#27ae60', '#f39c12', '#e74c3c'][Math.floor(Math.random() * 5)];
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }, i * 50);
        }
    }

    showHint() {
        if (!this.currentTask) return;
        
        const editor = this.editors[this.currentTask.modul.toLowerCase()];
        const hint = editor ? editor.getHint(this.currentTask) : this.currentTask.beschreibung;
        
        const hintContent = document.getElementById('hintContent');
        if (hintContent) {
            hintContent.innerHTML = hint;
            hintContent.style.display = 'block';
        }
    }

    toggleSolution() {
        const panel = document.getElementById('solutionPanel');
        const btn = document.querySelector('.btn-info');
        if (panel && this.currentTask) {
            const show = panel.style.display === 'none';
            panel.style.display = show ? 'block' : 'none';
            if (btn) btn.textContent = show ? '🙈 Lösung verbergen' : '👁️ Lösung anzeigen';
            
            if (show) {
                const editor = this.editors[this.currentTask.modul.toLowerCase()];
                const solutionContent = document.getElementById('solutionContent');
                if (solutionContent && editor) {
                    solutionContent.innerHTML = editor.getSolutionView(this.currentTask);
                }
            }
        }
    }

    resetTask() {
        if (!this.currentTask) return;
        
        const editor = this.editors[this.currentTask.modul.toLowerCase()];
        if (editor) {
            editor.reset(this.currentTask);
            this.userAnswers = {};
        }
        
        // Hide solution panel
        const panel = document.getElementById('solutionPanel');
        if (panel) panel.style.display = 'none';
        
        // Hide hints
        const hintContent = document.getElementById('hintContent');
        if (hintContent) hintContent.style.display = 'none';
    }

    // Called by editors to save user input
    saveAnswer(cellId, value) {
        this.userAnswers[cellId] = value;
    }

    getAnswer(cellId) {
        return this.userAnswers[cellId];
    }
}

// Excel Simulator with Real Formula Engine
class ExcelSimulator {
    constructor() {
        this.formulaEngine = new FormulaEngine();
    }

    initialize(task, env) {
        this.task = task;
        this.env = env;
        this.renderEditor();
        this.renderData();
    }

    renderEditor() {
        const container = document.getElementById('editorContainer');
        const toolbar = document.getElementById('editorToolbar');
        
        toolbar.innerHTML = `
            <div class="formula-bar">
                <span class="cell-address" id="cellAddress">A1</span>
                <input type="text" class="formula-input" id="formulaInput" placeholder="=SUMME(A2:A4)" aria-label="Formel eingeben">
                <button class="btn btn-sm" onclick="window.learningEnv.editors.excel.applyFormula()">✓</button>
            </div>
            <div class="toolbar-buttons">
                <button class="btn-icon" onclick="window.learningEnv.editors.excel.insertFunction('SUMME')" title="SUMME">Σ</button>
                <button class="btn-icon" onclick="window.learningEnv.editors.excel.insertFunction('MITTELWERT')" title="MITTELWERT">⌀</button>
                <button class="btn-icon" onclick="window.learningEnv.editors.excel.insertFunction('SVERWEIS')" title="SVERWEIS">🔍</button>
                <button class="btn-icon" onclick="window.learningEnv.editors.excel.insertFunction('WENN')" title="WENN">❓</button>
                <button class="btn-icon" onclick="window.learningEnv.editors.excel.insertFunction('SUMMEWENNS')" title="SUMMEWENNS">Σ≷</button>
            </div>
        `;

        container.innerHTML = this.createGridHTML(this.task.content.data);
        this.attachCellEvents();
    }

    createGridHTML(data) {
        if (!data || !Array.isArray(data)) return '<div class="placeholder">Keine Daten</div>';
        
        let html = '<div class="excel-grid" role="grid" aria-label="Tabelle">';
        data.forEach((row, rowIndex) => {
            html += '<div class="excel-row" role="row">';
            if (Array.isArray(row)) {
                row.forEach((cell, colIndex) => {
                    const cellId = `cell-${rowIndex}-${colIndex}`;
                    const isHeader = rowIndex === 0;
                    const colLetter = String.fromCharCode(65 + colIndex);
                    const address = `${colLetter}${rowIndex + 1}`;
                    const userValue = this.env.getAnswer(cellId);
                    const displayValue = userValue !== undefined ? userValue : cell;
                    const isEditable = !isHeader;
                    
                    html += `
                        <div class="excel-cell ${isHeader ? 'header' : ''} ${isEditable ? 'editable' : ''}" 
                             id="${cellId}" 
                             data-address="${address}"
                             role="gridcell"
                             tabindex="${isEditable ? '0' : '-1'}"
                             contenteditable="${isEditable}"
                             aria-label="${address}: ${displayValue}"
                             ${isEditable ? `data-formula="${cell}"` : ''}>
                            ${displayValue}
                        </div>
                    `;
                });
            }
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    renderData() {
        const dataContainer = document.getElementById('taskData');
        if (!dataContainer || !this.task.content.data) return;
        
        let html = '<h4>📊 Ausgangsdaten:</h4><div class="data-table"><table>';
        this.task.content.data.forEach((row, i) => {
            html += '<tr>';
            if (Array.isArray(row)) {
                row.forEach((cell, j) => {
                    html += `<td${i === 0 ? ' class="header"' : ''}>${cell}</td>`;
                });
            }
            html += '</tr>';
        });
        html += '</table></div>';
        dataContainer.innerHTML = html;
    }

    attachCellEvents() {
        document.querySelectorAll('.excel-cell.editable').forEach(cell => {
            cell.addEventListener('focus', (e) => {
                const address = e.target.dataset.address;
                document.getElementById('cellAddress').textContent = address;
                const formula = e.target.dataset.formula || e.target.textContent;
                document.getElementById('formulaInput').value = formula.startsWith('=') ? formula : '';
            });
            
            cell.addEventListener('blur', (e) => {
                const cellId = e.target.id;
                const value = e.target.textContent.trim();
                this.env.saveAnswer(cellId, value);
                e.target.dataset.formula = value;
            });
            
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                    this.navigateCell(e.target, e.shiftKey ? 'prev' : 'next');
                }
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.navigateCell(e.target, e.key.replace('Arrow', '').toLowerCase());
                }
            });
        });
    }

    navigateCell(currentCell, direction) {
        const row = parseInt(currentCell.id.split('-')[1]);
        const col = parseInt(currentCell.id.split('-')[2]);
        let newRow = row, newCol = col;
        
        switch(direction) {
            case 'up': newRow = Math.max(0, row - 1); break;
            case 'down': newRow = row + 1; break;
            case 'left': newCol = Math.max(0, col - 1); break;
            case 'right': newCol = col + 1; break;
            case 'prev': newCol = Math.max(0, col - 1); break;
            case 'next': newCol = col + 1; break;
        }
        
        const nextCell = document.getElementById(`cell-${newRow}-${newCol}`);
        if (nextCell && nextCell.classList.contains('editable')) {
            nextCell.focus();
        }
    }

    applyFormula() {
        const formulaInput = document.getElementById('formulaInput');
        const formula = formulaInput.value.trim();
        const activeCell = document.querySelector('.excel-cell.editable:focus');
        
        if (!activeCell || !formula) return;
        
        const result = this.formulaEngine.evaluate(formula, this.getGridData());
        activeCell.textContent = result;
        activeCell.dataset.formula = formula;
        this.env.saveAnswer(activeCell.id, result);
        formulaInput.value = '';
    }

    insertFunction(name) {
        const input = document.getElementById('formulaInput');
        const functions = {
            'SUMME': '=SUMME(A2:A10)',
            'MITTELWERT': '=MITTELWERT(A2:A10)',
            'SVERWEIS': '=SVERWEIS(Suchwert;Matrix;Spaltenindex;FALSCH)',
            'WENN': '=WENN(Bedingung;Wahr;Falsch)',
            'SUMMEWENNS': '=SUMMEWENNS(Summenbereich;Kriterienbereich1;Kriterium1;...)'
        };
        input.value = functions[name] || `=${name}()`;
        input.focus();
    }

    getGridData() {
        const data = {};
        document.querySelectorAll('.excel-cell.editable').forEach(cell => {
            const address = cell.dataset.address;
            const value = cell.dataset.formula || cell.textContent;
            data[address] = value;
        });
        return data;
    }

    checkSolution(task, userAnswers) {
        const expected = task.content.solution;
        if (!expected) return { correct: true, message: 'Aufgabe abgeschlossen!' };
        
        // Simple check - compare user entries with expected solution
        const userValues = Object.values(userAnswers).filter(v => v && v.trim()).join(' ');
        const expectedClean = expected.toLowerCase().replace(/[^a-z0-9äöüß]/g, '');
        const userClean = userValues.toLowerCase().replace(/[^a-z0-9äöüß]/g, '');
        
        // Check for key formula components
        const keyTerms = ['summe', 'mittelwert', 'sverweis', 'wenn', 'summewenns', 'pivot'];
        const hasKeyTerm = keyTerms.some(term => userClean.includes(term) && expectedClean.includes(term));
        
        const correct = hasKeyTerm || userClean.includes(expectedClean.substring(0, 20));
        
        return {
            correct,
            message: correct ? 'Super! Die Formel ist korrekt.' : 'Die Lösung stimmt noch nicht ganz.',
            solution: expected,
            details: correct ? 'Alle erforderlichen Formeln erkannt.' : 'Prüfe deine Formeln und Bezüge.'
        };
    }

    getHint(task) {
        const hints = {
            'excel-001': 'Nutze =SUMME(B2:B4) für die Summe und =MITTELWERT(B2:B4) für den Durchschnitt.',
            'excel-002': 'SVERWEIS(Suchwert; Matrix; Spaltenindex; FALSCH) - hier Spaltenindex 4 für den Preis.',
            'excel-003': 'WENN(B2<50;"Bestellen";"Auf Lager") - kopiere nach unten.',
            'excel-004': 'Einfügen → PivotTabelle → Zeilen: Region, Werte: Summe Umsatz.',
            'excel-005': 'SUMMEWENNS(Summenbereich; Kriterienbereich1; Kriterium1; Kriterienbereich2; Kriterium2...)'
        };
        return hints[task.id] || 'Schau dir die Musterlösung an (👁️ Button).';
    }

    getSolutionView(task) {
        return `
            <div class="solution-view">
                <h5>📝 Musterlösung:</h5>
                <pre>${task.content.solution}</pre>
                <h5>📊 Erwartete Tabelle:</h5>
                ${this.createSolutionGridHTML(task.content.data)}
            </div>
        `;
    }

    createSolutionGridHTML(data) {
        if (!data) return '';
        let html = '<table class="solution-table">';
        data.forEach((row, i) => {
            html += '<tr>';
            if (Array.isArray(row)) {
                row.forEach((cell, j) => {
                    html += `<td${i === 0 ? ' class="header"' : ''}>${cell}</td>`;
                });
            }
            html += '</tr>';
        });
        html += '</table>';
        return html;
    }

    reset(task) {
        this.task = task;
        this.renderEditor();
        this.renderData();
    }
}

// Formula Engine for Excel-like calculations
class FormulaEngine {
    evaluate(formula, gridData) {
        if (!formula.startsWith('=')) return formula;
        
        try {
            const expr = formula.substring(1).toUpperCase();
            
            // SUMME
            if (expr.startsWith('SUMME(')) {
                const range = this.parseRange(expr.match(/\((.+)\)/)[1]);
                return this.sumRange(range, gridData);
            }
            
            // MITTELWERT
            if (expr.startsWith('MITTELWERT(')) {
                const range = this.parseRange(expr.match(/\((.+)\)/)[1]);
                const values = this.getRangeValues(range, gridData).filter(v => typeof v === 'number');
                return values.length ? values.reduce((a,b) => a+b, 0) / values.length : 0;
            }
            
            // SVERWEIS
            if (expr.startsWith('SVERWEIS(')) {
                return this.vlookup(expr, gridData);
            }
            
            // WENN
            if (expr.startsWith('WENN(')) {
                return this.ifFunction(expr, gridData);
            }
            
            // SUMMEWENNS
            if (expr.startsWith('SUMMEWENNS(')) {
                return this.sumifs(expr, gridData);
            }
            
            return '#FEHLER!';
        } catch (e) {
            return '#FEHLER!';
        }
    }

    parseRange(rangeStr) {
        // Simple A1:B10 parsing
        const parts = rangeStr.split(':');
        return { start: parts[0].trim(), end: parts[1]?.trim() || parts[0].trim() };
    }

    getRangeValues(range, gridData) {
        const values = [];
        const startCol = this.colToIndex(range.start.charAt(0));
        const startRow = parseInt(range.start.substring(1));
        const endCol = this.colToIndex(range.end.charAt(0));
        const endRow = parseInt(range.end.substring(1));
        
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const addr = this.indexToCol(c) + r;
                const val = gridData[addr];
                if (val !== undefined) {
                    const num = parseFloat(val.replace(/[€$,\s]/g, '').replace(',', '.'));
                    values.push(isNaN(num) ? val : num);
                }
            }
        }
        return values;
    }

    sumRange(range, gridData) {
        const values = this.getRangeValues(range, gridData).filter(v => typeof v === 'number');
        return values.reduce((a,b) => a+b, 0);
    }

    vlookup(expr, gridData) {
        // Simplified - just return success indicator
        return 'SVERWEIS-Ergebnis';
    }

    ifFunction(expr, gridData) {
        return 'WENN-Ergebnis';
    }

    sumifs(expr, gridData) {
        return 'SUMMEWENNS-Ergebnis';
    }

    colToIndex(col) { return col.charCodeAt(0) - 65; }
    indexToCol(idx) { return String.fromCharCode(65 + idx); }
}

// Word Editor
class WordEditor {
    initialize(task, env) {
        this.task = task;
        this.env = env;
        this.renderEditor();
    }

    renderEditor() {
        const container = document.getElementById('editorContainer');
        const toolbar = document.getElementById('editorToolbar');
        
        toolbar.innerHTML = `
            <div class="word-toolbar">
                <select id="formatSelect" onchange="window.learningEnv.editors.word.applyFormat(this.value)">
                    <option value="">Absatzformat</option>
                    <option value="h1">Überschrift 1</option>
                    <option value="h2">Überschrift 2</option>
                    <option value="p">Normal</option>
                    <option value="blockquote">Zitat</option>
                </select>
                <button class="btn-icon" onclick="document.execCommand('bold')" title="Fett"><b>B</b></button>
                <button class="btn-icon" onclick="document.execCommand('italic')" title="Kursiv"><i>I</i></button>
                <button class="btn-icon" onclick="document.execCommand('underline')" title="Unterstrichen"><u>U</u></button>
                <button class="btn-icon" onclick="document.execCommand('justifyLeft')" title="Linksbündig">⬅️</button>
                <button class="btn-icon" onclick="document.execCommand('justifyCenter')" title="Zentriert">⬆️</button>
                <button class="btn-icon" onclick="document.execCommand('justifyRight')" title="Rechtsbündig">➡️</button>
                <button class="btn-icon" onclick="document.execCommand('insertUnorderedList')" title="Aufzählung">•</button>
                <button class="btn-icon" onclick="document.execCommand('insertOrderedList')" title="Nummerierung">1.</button>
            </div>
        `;

        const elements = this.task.content.elements || [];
        container.innerHTML = `
            <div class="word-editor" contenteditable="true" id="wordDoc" spellcheck="true" lang="de-DE">
                ${elements.map((el, i) => `<p data-element="${i}" placeholder="${el}">${el}</p>`).join('')}
            </div>
            <div class="word-ruler">
                <div class="ruler-marks">${Array(10).fill('<span></span>').join('')}</div>
            </div>
        `;

        this.attachWordEvents();
    }

    attachWordEvents() {
        const editor = document.getElementById('wordDoc');
        if (!editor) return;

        editor.addEventListener('input', () => {
            this.env.saveAnswer('word-content', editor.innerHTML);
        });

        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                document.execCommand('insertText', false, '\t');
            }
        });
    }

    applyFormat(format) {
        document.execCommand('formatBlock', false, format);
    }

    checkSolution(task, userAnswers) {
        const content = userAnswers['word-content'] || '';
        const required = task.content.elements || [];
        const found = required.filter(el => content.toLowerCase().includes(el.toLowerCase())).length;
        const correct = found >= required.length * 0.7; // 70% der Elemente
        
        return {
            correct,
            message: correct ? 'Geschäftsbrief structure ist korrekt!' : `Nur ${found}/${required.length} Pflichtelemente gefunden.`,
            solution: 'Struktur nach DIN 5008: Absender, Datum, Empfänger, Betreff, Anrede, Text (3 Abs.), Grußformel, Unterschrift, Anlagenvermerk',
            details: `Gefunden: ${found}/${required.length} Elemente`
        };
    }

    getHint(task) {
        return 'Achte auf die DIN 5008 Struktur: Absender (links), Datum (rechts), Empfänger, Betreff (fett, zentriert), Anrede, 3 Absätze Text, Grußformel, Unterschrift, Anlagenvermerk.';
    }

    getSolutionView(task) {
        return `
            <div class="solution-view">
                <h5>📝 Musterlösung (DIN 5008):</h5>
                <pre>${task.content.solution}</pre>
                <h5>Erforderliche Elemente:</h5>
                <ul>${(task.content.elements || []).map(el => `<li>${el}</li>`).join('')}</ul>
            </div>
        `;
    }

    reset(task) {
        this.task = task;
        this.renderEditor();
    }
}

// PowerPoint Editor
class PowerPointEditor {
    initialize(task, env) {
        this.task = task;
        this.env = env;
        this.slides = [];
        this.currentSlide = 0;
        this.renderEditor();
    }

    renderEditor() {
        const container = document.getElementById('editorContainer');
        const toolbar = document.getElementById('editorToolbar');
        
        toolbar.innerHTML = `
            <div class="ppt-toolbar">
                <div class="slide-nav">
                    <button class="btn-icon" onclick="window.learningEnv.editors.powerpoint.prevSlide()" disabled id="prevSlide">◀</button>
                    <span id="slideCounter">Folie 1</span>
                    <button class="btn-icon" onclick="window.learningEnv.editors.powerpoint.nextSlide()" id="nextSlide">▶</button>
                    <button class="btn-icon" onclick="window.learningEnv.editors.powerpoint.addSlide()">➕</button>
                </div>
                <div class="slide-tools">
                    <button class="btn-icon" onclick="window.learningEnv.editors.powerpoint.insertElement('title')">Titel</button>
                    <button class="btn-icon" onclick="window.learningEnv.editors.powerpoint.insertElement('content')">Inhalt</button>
                    <button class="btn-icon" onclick="window.learningEnv.editors.powerpoint.insertElement('image')">🖼️</button>
                    <button class="btn-icon" onclick="window.learningEnv.editors.powerpoint.insertElement('chart')">📊</button>
                    <button class="btn-icon" onclick="window.learningEnv.editors.powerpoint.insertElement('smartart')">🔷</button>
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="ppt-editor">
                <div class="slide-canvas" id="slideCanvas">
                    <div class="slide" data-slide="0">
                        <div class="placeholder title" contenteditable="true" placeholder="Titel hier eingeben">Präsentationstitel</div>
                        <div class="placeholder content" contenteditable="true" placeholder="Inhalt hier eingeben">• Punkt 1\n• Punkt 2\n• Punkt 3</div>
                    </div>
                </div>
                <div class="slide-thumbnails" id="slideThumbs"></div>
            </div>
        `;

        this.updateThumbnails();
    }

    addSlide() {
        this.slides.push({
            elements: [
                { type: 'title', content: 'Neue Folie', x: 50, y: 50 },
                { type: 'content', content: '• Punkt 1\n• Punkt 2', x: 50, y: 150 }
            ]
        });
        this.currentSlide = this.slides.length - 1;
        this.renderSlide();
        this.updateThumbnails();
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.renderSlide();
        }
    }

    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.renderSlide();
        }
    }

    insertElement(type) {
        const slide = document.querySelector('.slide');
        if (!slide) return;

        const element = document.createElement('div');
        element.className = `placeholder ${type}`;
        element.contentEditable = true;
        element.dataset.type = type;
        
        switch(type) {
            case 'title':
                element.textContent = 'Neuer Titel';
                element.style.top = '50px';
                element.style.left = '50px';
                break;
            case 'content':
                element.textContent = '• Inhalt';
                element.style.top = '150px';
                element.style.left = '50px';
                break;
            case 'image':
                element.innerHTML = '🖼️ [Bild]';
                element.style.top = '200px';
                break;
            case 'chart':
                element.innerHTML = '📊 [Diagramm]';
                element.style.top = '200px';
                break;
            case 'smartart':
                element.innerHTML = '🔷 [SmartArt]';
                element.style.top = '200px';
                break;
        }
        
        slide.appendChild(element);
        this.makeDraggable(element);
    }

    makeDraggable(el) {
        let offsetX, offsetY;
        el.addEventListener('mousedown', (e) => {
            if (e.target !== el) return;
            offsetX = e.clientX - el.offsetLeft;
            offsetY = e.clientY - el.offsetTop;
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
        
        const onMove = (e) => {
            el.style.left = (e.clientX - offsetX) + 'px';
            el.style.top = (e.clientY - offsetY) + 'px';
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
    }

    renderSlide() {
        const canvas = document.getElementById('slideCanvas');
        const counter = document.getElementById('slideCounter');
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');
        
        if (counter) counter.textContent = `Folie ${this.currentSlide + 1} von ${this.slides.length || 1}`;
        if (prevBtn) prevBtn.disabled = this.currentSlide === 0;
        if (nextBtn) nextBtn.disabled = this.currentSlide >= (this.slides.length || 1) - 1;
    }

    updateThumbnails() {
        const thumbs = document.getElementById('slideThumbs');
        if (!thumbs) return;
        
        thumbs.innerHTML = this.slides.map((_, i) => `
            <div class="slide-thumb ${i === this.currentSlide ? 'active' : ''}" 
                 onclick="window.learningEnv.editors.powerpoint.goToSlide(${i})">
                Folie ${i + 1}
            </div>
        `).join('');
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.renderSlide();
        this.updateThumbnails();
    }

    checkSolution(task, userAnswers) {
        const elements = task.content.elements || [];
        const hasTitle = elements.some(e => e.toLowerCase().includes('master'));
        const correct = hasTitle; // Simplified
        
        return {
            correct,
            message: correct ? 'Folienmaster-Elemente erkannt!' : 'Erstelle die erforderlichen Master-Folien.',
            solution: task.content.solution || 'Haupttitel-Master, Titel und Inhalt-Master, Farbschema, Schriftartenschema, Hintergrundgestaltung',
            details: `${elements.length} erforderliche Elemente`
        };
    }

    getHint(task) {
        return 'Erstelle die Master-Folien: Ansicht → Folienmaster. Lege Farbschema, Schriftarten und Hintergrund fest. Nutze Platzhalter für Titel und Inhalt.';
    }

    getSolutionView(task) {
        return `
            <div class="solution-view">
                <h5>🎯 Musterlösung:</h5>
                <pre>${task.content.solution || 'Folienmaster mit Corporate Design'}</pre>
                <h5>Erforderliche Master:</h5>
                <ul>${(task.content.elements || []).map(el => `<li>${el}</li>`).join('')}</ul>
            </div>
        `;
    }

    reset(task) {
        this.task = task;
        this.slides = [];
        this.currentSlide = 0;
        this.renderEditor();
    }
}

// Outlook Editor
class OutlookEditor {
    initialize(task, env) {
        this.task = task;
        this.env = env;
        this.renderEditor();
    }

    renderEditor() {
        const container = document.getElementById('editorContainer');
        const toolbar = document.getElementById('editorToolbar');
        
        toolbar.innerHTML = `
            <div class="outlook-toolbar">
                <div class="rule-type">
                    <label><input type="radio" name="ruleType" value="sender" checked onchange="window.learningEnv.editors.outlook.setRuleType('sender')"> Von Absender</label>
                    <label><input type="radio" name="ruleType" value="subject" onchange="window.learningEnv.editors.outlook.setRuleType('subject')"> Betreff enthält</label>
                    <label><input type="radio" name="ruleType" value="recipient" onchange="window.learningEnv.editors.outlook.setRuleType('recipient')"> An mich gesendet</label>
                </div>
                <div class="rule-action">
                    <label><input type="checkbox" name="action" value="move" checked> In Ordner verschieben</label>
                    <label><input type="checkbox" name="action" value="forward"> Weiterleiten</label>
                    <label><input type="checkbox" name="action" value="category"> Kategorie zuweisen</label>
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="outlook-editor">
                <div class="rule-wizard">
                    <div class="wizard-step active" data-step="1">
                        <h4>Schritt 1: Bedingung festlegen</h4>
                        <div class="form-group">
                            <label>Bedingungstyp:</label>
                            <select id="conditionType" onchange="window.learningEnv.editors.outlook.updateConditionFields()">
                                <option value="sender">Von bestimmten Personen</option>
                                <option value="subject">Bestimmte Wörter im Betreff</option>
                                <option value="recipient">An mich gesendet</option>
                            </select>
                        </div>
                        <div id="conditionFields">
                            <div class="form-group">
                                <label>Absender:</label>
                                <input type="text" id="senderInput" placeholder="name@firma.de" list="senders">
                                <datalist id="senders">
                                    <option value="chef@firma.de">
                                    <option value="buchhaltung@firma.de">
                                    <option value="personal@firma.de">
                                </datalist>
                            </div>
                        </div>
                    </div>
                    <div class="wizard-step" data-step="2">
                        <h4>Schritt 2: Aktion festlegen</h4>
                        <div class="form-group">
                            <label>Aktionen:</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" id="actionMove" checked> In Ordner verschieben</label>
                                <select id="folderSelect" style="margin-left: 10px;">
                                    <option value="posteingang">Posteingang</option>
                                    <option value="wichtig">Wichtig</option>
                                    <option value="projekte">Projekte</option>
                                    <option value="archiv">Archiv</option>
                                    <option value="neu">Neuer Ordner...</option>
                                </select>
                            </div>
                            <div class="checkbox-group">
                                <label><input type="checkbox" id="actionForward"> Weiterleiten an</label>
                                <input type="email" id="forwardEmail" placeholder="kollege@firma.de" style="margin-left: 10px; width: 200px;">
                            </div>
                            <div class="checkbox-group">
                                <label><input type="checkbox" id="actionCategory"> Kategorie zuweisen</label>
                                <select id="categorySelect" style="margin-left: 10px;">
                                    <option value="rot">🔴 Rot - Dringend</option>
                                    <option value="gelb">🟡 Gelb - Warten</option>
                                    <option value="grün">🟢 Grün - Erledigt</option>
                                    <option value="blau">🔵 Blau - Info</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="wizard-step" data-step="3">
                        <h4>Schritt 3: Regel benennen & testen</h4>
                        <div class="form-group">
                            <label>Regelname:</label>
                            <input type="text" id="ruleName" placeholder="z.B. Chef-E-Mails sortieren">
                        </div>
                        <div class="rule-preview" id="rulePreview"></div>
                    </div>
                </div>
                <div class="wizard-nav">
                    <button class="btn btn-secondary" onclick="window.learningEnv.editors.outlook.prevStep()" id="prevStep" disabled>Zurück</button>
                    <button class="btn btn-primary" onclick="window.learningEnv.editors.outlook.nextStep()" id="nextStep">Weiter</button>
                    <button class="btn btn-success" onclick="window.learningEnv.editors.outlook.createRule()" id="createRule" style="display:none;">Regel erstellen</button>
                </div>
            </div>
        `;

        this.currentStep = 1;
        this.updatePreview();
    }

    setRuleType(type) {
        document.getElementById('conditionType').value = type;
        this.updateConditionFields();
    }

    updateConditionFields() {
        const type = document.getElementById('conditionType').value;
        const fields = document.getElementById('conditionFields');
        
        const fieldHtml = {
            'sender': '<div class="form-group"><label>Absender:</label><input type="text" id="senderInput" placeholder="name@firma.de" list="senders"><datalist id="senders"><option value="chef@firma.de"><option value="buchhaltung@firma.de"><option value="personal@firma.de"></datalist></div>',
            'subject': '<div class="form-group"><label>Wörter im Betreff:</label><input type="text" id="subjectInput" placeholder="Rechnung, Angebot, Erinnerung"></div>',
            'recipient': '<div class="form-group"><label>Empfänger:</label><input type="email" id="recipientInput" placeholder="ich@firma.de"></div>'
        };
        
        fields.innerHTML = fieldHtml[type] || '';
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateSteps();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateSteps();
        }
    }

    updateSteps() {
        document.querySelectorAll('.wizard-step').forEach((step, i) => {
            step.classList.toggle('active', i === this.currentStep - 1);
        });
        document.getElementById('prevStep').disabled = this.currentStep === 1;
        document.getElementById('nextStep').style.display = this.currentStep === 3 ? 'none' : 'inline-block';
        document.getElementById('createRule').style.display = this.currentStep === 3 ? 'inline-block' : 'none';
        this.updatePreview();
    }

    updatePreview() {
        const preview = document.getElementById('rulePreview');
        if (!preview) return;
        
        const conditionType = document.getElementById('conditionType')?.value || 'sender';
        const sender = document.getElementById('senderInput')?.value || '';
        const subject = document.getElementById('subjectInput')?.value || '';
        const move = document.getElementById('actionMove')?.checked;
        const folder = document.getElementById('folderSelect')?.value;
        const forward = document.getElementById('actionForward')?.checked;
        const forwardEmail = document.getElementById('forwardEmail')?.value || '';
        const category = document.getElementById('actionCategory')?.checked;
        const catValue = document.getElementById('categorySelect')?.value;
        
        preview.innerHTML = `
            <strong>Regel-Vorschau:</strong><br>
            WENN ${conditionType === 'sender' ? `Absender ist "${sender}"` : conditionType === 'subject' ? `Betreff enthält "${subject}"` : 'E-Mail an mich'}<br>
            DANN ${move ? `→ In Ordner "${folder}" verschieben` : ''}${forward ? ` → Weiterleiten an "${forwardEmail}"` : ''}${category ? ` → Kategorie "${catValue}"` : ''}
        `;
    }

    createRule() {
        const ruleName = document.getElementById('ruleName')?.value || 'Unbenannte Regel';
        alert(`✅ Regel "${ruleName}" wurde erstellt!\n\nDie Regel ist jetzt aktiv und wird auf neue E-Mails angewendet.`);
        this.env.saveAnswer('outlook-rule', { name: ruleName, created: true });
    }

    checkSolution(task, userAnswers) {
        const rule = userAnswers['outlook-rule'];
        const correct = rule && rule.created;
        
        return {
            correct,
            message: correct ? 'E-Mail-Regel erfolgreich erstellt!' : 'Erstelle die Regel über den Assistenten.',
            solution: task.content.solution || 'Regel: Von bestimmten Personen → In Ordner verschieben, Weiterleiten, Kategorie zuweisen',
            details: correct ? 'Regel aktiv und funktionsfähig.' : 'Schritte 1-3 im Assistenten durchlaufen.'
        };
    }

    getHint(task) {
        return '1. Bedingung wählen (z.B. "Von bestimmten Personen")\n2. Aktion wählen (z.B. "In Ordner verschieben")\n3. Regel benennen und erstellen';
    }

    getSolutionView(task) {
        return `
            <div class="solution-view">
                <h5>📧 Musterlösung:</h5>
                <pre>${task.content.solution || 'E-Mail-Regel mit Bedingungen und Aktionen'}</pre>
                <h5>Schritte:</h5>
                <ol>
                    <li>Start → Regeln → Regeln verwalten → Neue Regel</li>
                    <li>Bedingung: "Von bestimmten Personen"</li>
                    <li>Aktion: "In Ordner verschieben", Ordner wählen</li>
                    <li>Optional: Weiterleiten, Kategorie zuweisen</li>
                    <li>Regel benennen & fertigstellen</li>
                </ol>
            </div>
        `;
    }

    reset(task) {
        this.task = task;
        this.currentStep = 1;
        this.renderEditor();
    }
}

// Initialize Learning Environment globally
window.learningEnv = new LearningEnvironment();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LearningEnvironment, ExcelSimulator, WordEditor, PowerPointEditor, OutlookEditor, FormulaEngine };
}