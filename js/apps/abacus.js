// Abacus - Mystical Calculator App
class AbacusApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.memory = 0;
        this.history = [];
        this.maxHistoryItems = 10;
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const contentElement = document.getElementById(`${this.windowId}-content`);
        if (!contentElement) return;

        contentElement.innerHTML = `
            <div class="abacus-content">
                <div class="abacus-header">
                    <div class="abacus-logo abacus-icon"></div>
                    <div class="abacus-title">Abacus</div>
                    <div class="abacus-subtitle">Mystical Calculator</div>
                </div>
                
                <div class="abacus-main">
                    <div class="abacus-display-container">
                        <div class="abacus-history" id="abacus-history"></div>
                        <div class="abacus-display" id="abacus-display">0</div>
                        <div class="abacus-memory-indicator" id="abacus-memory-indicator"></div>
                    </div>
                    
                    <div class="abacus-buttons">
                        <div class="abacus-row">
                            <button class="abacus-btn abacus-btn-function" data-action="memory-clear">MC</button>
                            <button class="abacus-btn abacus-btn-function" data-action="memory-recall">MR</button>
                            <button class="abacus-btn abacus-btn-function" data-action="memory-add">M+</button>
                            <button class="abacus-btn abacus-btn-function" data-action="memory-subtract">M-</button>
                        </div>
                        
                        <div class="abacus-row">
                            <button class="abacus-btn abacus-btn-function" data-action="clear">C</button>
                            <button class="abacus-btn abacus-btn-function" data-action="clear-entry">CE</button>
                            <button class="abacus-btn abacus-btn-function" data-action="backspace">←</button>
                            <button class="abacus-btn abacus-btn-operator" data-operation="divide">÷</button>
                        </div>
                        
                        <div class="abacus-row">
                            <button class="abacus-btn abacus-btn-number" data-number="7">7</button>
                            <button class="abacus-btn abacus-btn-number" data-number="8">8</button>
                            <button class="abacus-btn abacus-btn-number" data-number="9">9</button>
                            <button class="abacus-btn abacus-btn-operator" data-operation="multiply">×</button>
                        </div>
                        
                        <div class="abacus-row">
                            <button class="abacus-btn abacus-btn-number" data-number="4">4</button>
                            <button class="abacus-btn abacus-btn-number" data-number="5">5</button>
                            <button class="abacus-btn abacus-btn-number" data-number="6">6</button>
                            <button class="abacus-btn abacus-btn-operator" data-operation="subtract">−</button>
                        </div>
                        
                        <div class="abacus-row">
                            <button class="abacus-btn abacus-btn-number" data-number="1">1</button>
                            <button class="abacus-btn abacus-btn-number" data-number="2">2</button>
                            <button class="abacus-btn abacus-btn-number" data-number="3">3</button>
                            <button class="abacus-btn abacus-btn-operator" data-operation="add">+</button>
                        </div>
                        
                        <div class="abacus-row">
                            <button class="abacus-btn abacus-btn-function" data-action="negate">±</button>
                            <button class="abacus-btn abacus-btn-number" data-number="0">0</button>
                            <button class="abacus-btn abacus-btn-function" data-action="decimal">.</button>
                            <button class="abacus-btn abacus-btn-equals" data-action="equals">=</button>
                        </div>
                        
                        <div class="abacus-row">
                            <button class="abacus-btn abacus-btn-function" data-action="square-root">√</button>
                            <button class="abacus-btn abacus-btn-function" data-action="square">x²</button>
                            <button class="abacus-btn abacus-btn-function" data-action="reciprocal">1/x</button>
                            <button class="abacus-btn abacus-btn-function" data-action="percent">%</button>
                        </div>
                    </div>
                    
                    <div class="abacus-lore">
                        <p>"The ancient abacus counts not just numbers, but the very threads of fate woven by the Divines."</p>
                    </div>
                </div>
            </div>
        `;
        
        this.updateDisplay();
        this.updateMemoryIndicator();
    }

    setupEventListeners() {
        const contentElement = document.getElementById(`${this.windowId}-content`);
        if (!contentElement) return;

        // Number buttons
        contentElement.querySelectorAll('.abacus-btn-number').forEach(btn => {
            btn.addEventListener('click', () => {
                this.inputNumber(btn.dataset.number);
            });
        });

        // Operator buttons
        contentElement.querySelectorAll('.abacus-btn-operator').forEach(btn => {
            btn.addEventListener('click', () => {
                this.inputOperation(btn.dataset.operation);
            });
        });

        // Function buttons
        contentElement.querySelectorAll('.abacus-btn-function').forEach(btn => {
            btn.addEventListener('click', () => {
                this.executeFunction(btn.dataset.action);
            });
        });

        // Equals button
        contentElement.querySelectorAll('.abacus-btn-equals').forEach(btn => {
            btn.addEventListener('click', () => {
                this.calculate();
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (document.getElementById(`${this.windowId}-content`)) {
                this.handleKeyPress(e);
            }
        });
    }

    handleKeyPress(e) {
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        } else if (e.key === '.') {
            this.executeFunction('decimal');
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            const operationMap = {
                '+': 'add',
                '-': 'subtract',
                '*': 'multiply',
                '/': 'divide'
            };
            this.inputOperation(operationMap[e.key]);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (e.key === 'Escape') {
            this.executeFunction('clear');
        } else if (e.key === 'Backspace') {
            this.executeFunction('backspace');
        }
    }

    inputNumber(num) {
        if (this.shouldResetDisplay) {
            this.currentValue = '0';
            this.shouldResetDisplay = false;
        }

        if (this.currentValue === '0' && num !== '.') {
            this.currentValue = num;
        } else if (num === '.' && !this.currentValue.includes('.')) {
            this.currentValue += num;
        } else if (num !== '.') {
            // Limit the length of the number
            if (this.currentValue.length < 15) {
                this.currentValue += num;
            }
        }

        this.updateDisplay();
    }

    inputOperation(op) {
        if (this.operation && !this.shouldResetDisplay) {
            this.calculate();
        }

        this.previousValue = this.currentValue;
        this.operation = op;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    calculate() {
        if (!this.operation || !this.previousValue) return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        switch (this.operation) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.showError("Cannot divide by zero");
                    return;
                }
                result = prev / current;
                break;
        }

        // Add to history
        const operationSymbol = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷'
        }[this.operation];

        this.addToHistory(`${this.previousValue} ${operationSymbol} ${this.currentValue} = ${result}`);

        this.currentValue = this.formatNumber(result);
        this.operation = null;
        this.previousValue = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    executeFunction(action) {
        switch (action) {
            case 'clear':
                this.currentValue = '0';
                this.previousValue = '';
                this.operation = null;
                this.shouldResetDisplay = false;
                break;
                
            case 'clear-entry':
                this.currentValue = '0';
                break;
                
            case 'backspace':
                if (this.currentValue.length > 1) {
                    this.currentValue = this.currentValue.slice(0, -1);
                } else {
                    this.currentValue = '0';
                }
                break;
                
            case 'negate':
                this.currentValue = (parseFloat(this.currentValue) * -1).toString();
                break;
                
            case 'decimal':
                if (!this.currentValue.includes('.')) {
                    this.currentValue += '.';
                }
                break;
                
            case 'square-root':
                const sqrtValue = parseFloat(this.currentValue);
                if (sqrtValue < 0) {
                    this.showError("Cannot calculate square root of negative number");
                    return;
                }
                this.addToHistory(`√${this.currentValue} = ${Math.sqrt(sqrtValue)}`);
                this.currentValue = this.formatNumber(Math.sqrt(sqrtValue));
                this.shouldResetDisplay = true;
                break;
                
            case 'square':
                const squareValue = parseFloat(this.currentValue);
                this.addToHistory(`${this.currentValue}² = ${squareValue * squareValue}`);
                this.currentValue = this.formatNumber(squareValue * squareValue);
                this.shouldResetDisplay = true;
                break;
                
            case 'reciprocal':
                const reciprocalValue = parseFloat(this.currentValue);
                if (reciprocalValue === 0) {
                    this.showError("Cannot calculate reciprocal of zero");
                    return;
                }
                this.addToHistory(`1/${this.currentValue} = ${1 / reciprocalValue}`);
                this.currentValue = this.formatNumber(1 / reciprocalValue);
                this.shouldResetDisplay = true;
                break;
                
            case 'percent':
                this.currentValue = this.formatNumber(parseFloat(this.currentValue) / 100);
                this.shouldResetDisplay = true;
                break;
                
            case 'memory-clear':
                this.memory = 0;
                break;
                
            case 'memory-recall':
                this.currentValue = this.formatNumber(this.memory);
                this.shouldResetDisplay = true;
                break;
                
            case 'memory-add':
                this.memory += parseFloat(this.currentValue);
                break;
                
            case 'memory-subtract':
                this.memory -= parseFloat(this.currentValue);
                break;
        }

        this.updateDisplay();
        this.updateMemoryIndicator();
    }

    formatNumber(num) {
        // Handle very large or small numbers with scientific notation
        if (Math.abs(num) > 999999999 || (Math.abs(num) < 0.000001 && num !== 0)) {
            return num.toExponential(6);
        }
        
        // Round to avoid floating point precision issues
        const rounded = Math.round(num * 100000000) / 100000000;
        
        // Convert to string and remove trailing zeros after decimal point
        let str = rounded.toString();
        if (str.includes('.')) {
            str = str.replace(/\.?0+$/, '');
        }
        
        return str;
    }

    updateDisplay() {
        const displayElement = document.getElementById('abacus-display');
        if (displayElement) {
            displayElement.textContent = this.currentValue;
        }
    }

    updateMemoryIndicator() {
        const indicatorElement = document.getElementById('abacus-memory-indicator');
        if (indicatorElement) {
            if (this.memory !== 0) {
                indicatorElement.textContent = `M: ${this.formatNumber(this.memory)}`;
                indicatorElement.style.display = 'block';
            } else {
                indicatorElement.style.display = 'none';
            }
        }
    }

    addToHistory(calculation) {
        this.history.unshift(calculation);
        if (this.history.length > this.maxHistoryItems) {
            this.history.pop();
        }
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyElement = document.getElementById('abacus-history');
        if (historyElement) {
            historyElement.innerHTML = this.history.map(item => 
                `<div class="abacus-history-item">${item}</div>`
            ).join('');
        }
    }

    showError(message) {
        const displayElement = document.getElementById('abacus-display');
        if (displayElement) {
            displayElement.textContent = message;
            this.shouldResetDisplay = true;
        }
    }

    cleanup() {
        // Clean up any event listeners or resources
        console.log('Abacus app cleaned up');
    }
}

// Initialize function for the app
function initAbacusApp(windowId) {
    window.abacusApp = new AbacusApp(windowId);
}

// Register the app
window.MorrowindOS = window.MorrowindOS || {};
window.MorrowindOS.apps = window.MorrowindOS.apps || {};
window.MorrowindOS.apps.abacus = initAbacusApp;

// Cleanup function
function cleanupAbacusApp(appName, windowId) {
    if (appName === 'abacus' && window.abacusApp) {
        window.abacusApp.cleanup();
        window.abacusApp = null;
    }
}

// Load app content function
function loadAbacusAppContent(appName, windowId) {
    if (appName === 'abacus') {
        // Content is already loaded by the AbacusApp constructor
        console.log('Abacus content loaded');
    }
}