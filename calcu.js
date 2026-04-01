let displayValue = '0';
let historyValue = '';
let isResultDisplayed = false; // NEW: State flag to track if a result is on screen

function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function updateDisplay() {
    document.getElementById('result').innerText = displayValue;
    document.getElementById('history').innerText = historyValue;
}

function appendNumber(num) {
    // NEW: If a result is displayed, start a completely new equation
    if (displayValue === '0' || displayValue === 'Error' || isResultDisplayed) {
        displayValue = num;
        isResultDisplayed = false; 
    } else {
        displayValue += num;
    }
    updateDisplay();
}

function appendDecimal() {
    // NEW: If a result is displayed, wipe it and start with "0."
    if (displayValue === 'Error' || isResultDisplayed) {
        displayValue = '0.';
        isResultDisplayed = false;
    } else {
        let parts = displayValue.split(/[\s+\-*/()^PC]+/);
        let currentNumber = parts[parts.length - 1];
        
        if (!currentNumber.includes('.')) {
            displayValue += '.';
        }
    }
    updateDisplay();
}

function appendBracket(bracket) {
    // NEW: Reset if a result is displayed
    if (displayValue === 'Error' || isResultDisplayed) {
        displayValue = '0';
        isResultDisplayed = false;
    }
    
    if (bracket === '(') {
        if (displayValue === '0') displayValue = '(';
        else displayValue += '(';
    } else if (bracket === ')') {
        let openCount = (displayValue.match(/\(/g) || []).length;
        let closeCount = (displayValue.match(/\)/g) || []).length;
        
        if (openCount > closeCount) {
            displayValue += ')';
        }
    }
    updateDisplay();
}

function appendConstant(char) { 
    const val = char === 'π' ? Math.PI : Math.E;
    // NEW: Reset if a result is displayed
    if (displayValue === '0' || displayValue === 'Error' || isResultDisplayed) {
        displayValue = val.toFixed(4);
        isResultDisplayed = false;
    } else {
        displayValue += val.toFixed(4);
    }
    updateDisplay();
}

function setOperator(op) {
    if (displayValue === 'Error') return;
    
    // NEW: Allow chaining! If a result is displayed, keep it and add the operator
    isResultDisplayed = false; 
    
    if (displayValue.endsWith(' ') || displayValue.endsWith('(')) return; 
    displayValue += ` ${op} `;
    updateDisplay();
}

function toggleSign() {
    if (displayValue === '0' || displayValue === 'Error') return;
    
    isResultDisplayed = false; // Treat toggling a sign as continuing the current input
    
    if (displayValue.includes(' ')) {
         displayValue = `-(${displayValue})`;
    } else {
         displayValue = (parseFloat(displayValue) * -1).toString();
    }
    updateDisplay();
}

function clearAll() {
    displayValue = '0';
    historyValue = '';
    isResultDisplayed = false; // Reset flag
    updateDisplay();
}

function clearEntry() {
    displayValue = '0';
    isResultDisplayed = false; // Reset flag
    updateDisplay();
}

function backspace() {
    if (displayValue === 'Error') {
        displayValue = '0';
    } else {
        isResultDisplayed = false; // Reset flag so you can edit a result digit-by-digit
        
        if (displayValue.endsWith(' ')) {
            displayValue = displayValue.slice(0, -3);
        } else {
            displayValue = displayValue.slice(0, -1);
        }
        if (displayValue === '') displayValue = '0';
    }
    updateDisplay();
}

function fact(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function parseAndEvaluate(expr) {
    let parsed = expr
        .replace(/x/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');

    parsed = parsed.replace(/(?:\s*[+\-*/]\s*)+$/, '');

    parsed = parsed.replace(/(\d)\s*\(/g, '$1*(');
    parsed = parsed.replace(/\)\s*(\d)/g, ')*$1');
    parsed = parsed.replace(/\)\s*\(/g, ')*(');

    let openCount = (parsed.match(/\(/g) || []).length;
    let closeCount = (parsed.match(/\)/g) || []).length;
    while (openCount > closeCount) {
        parsed += ')';
        closeCount++;
    }

    while (parsed.includes('P') || parsed.includes('C')) {
        parsed = parsed.replace(/(\d+(?:\.\d+)?)\s*([PC])\s*(\d+(?:\.\d+)?)/g, (match, n, op, r) => {
            n = parseFloat(n);
            r = parseFloat(r);
            if (op === 'P') return fact(n) / fact(n - r);
            if (op === 'C') return fact(n) / (fact(r) * fact(n - r));
        });
    }
    return eval(parsed);
}

function calculate() {
    try {
        historyValue = displayValue;
        let result = parseAndEvaluate(displayValue);
        
        if (isNaN(result) || !isFinite(result)) throw new Error("Math Error");
        
        displayValue = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(10)).toString();
        
        isResultDisplayed = true; // NEW: Tell the app a final answer is on screen
        
    } catch (e) {
        displayValue = "Error";
        isResultDisplayed = true;
    }
    updateDisplay();
}

function scientific(func) {
    try {
        let val = parseAndEvaluate(displayValue);
        let rad = val * (Math.PI / 180);
        
        switch(func) {
            case 'sin': displayValue = Math.sin(rad).toString(); break;
            case 'cos': displayValue = Math.cos(rad).toString(); break;
            case 'tan': 
                if (val % 180 === 90 || val % 180 === -90) throw new Error("Math Error");
                displayValue = Math.tan(rad).toString(); 
                break;
            case 'asin': displayValue = (Math.asin(val) * (180 / Math.PI)).toString(); break;
            case 'acos': displayValue = (Math.acos(val) * (180 / Math.PI)).toString(); break;
            case 'atan': displayValue = (Math.atan(val) * (180 / Math.PI)).toString(); break;
            case 'log': displayValue = Math.log10(val).toString(); break;
            case 'ln':  displayValue = Math.log(val).toString(); break;
            case 'sqrt': displayValue = Math.sqrt(val).toString(); break;
            case 'sq':   displayValue = Math.pow(val, 2).toString(); break;
            case 'exp':  displayValue = Math.exp(val).toString(); break;
            case 'percent': displayValue = (val / 100).toString(); break;
            case 'fact': displayValue = fact(val).toString(); break;
        }
        
        let numResult = parseFloat(displayValue);
        if (!isNaN(numResult)) {
            displayValue = Number.isInteger(numResult) ? numResult.toString() : parseFloat(numResult.toFixed(8)).toString();
        }
        
        isResultDisplayed = true; // NEW: Tell the app a final answer is on screen
        
    } catch (e) {
        displayValue = "Error";
        isResultDisplayed = true;
    }
    updateDisplay();
}
