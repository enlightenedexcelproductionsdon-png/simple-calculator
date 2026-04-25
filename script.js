const displayEl = document.getElementById('display');
let current = ''; // expression string

function updateDisplay() {
  displayEl.textContent = current === '' ? '0' : current;
}

function pushValue(val) {
  // Prevent multiple leading zeros
  if (current === '0' && val === '0') return;
  // Prevent starting with multiple operators
  if (current === '' && /[+\-*/]/.test(val)) return;
  // Prevent two operators in a row (except minus for negative numbers)
  if (/[+\-*/]$/.test(current) && /[+\-*/]/.test(val)) {
    // allow minus as unary if previous is operator (e.g. 5 * -3)
    if (val === '-' && !current.endsWith('-')) {
      current += val;
    }
    return;
  }
  current += val;
  updateDisplay();
}

function clearAll() {
  current = '';
  updateDisplay();
}

function backspace() {
  current = current.slice(0, -1);
  updateDisplay();
}

function percent() {
  // simple percent conversion: turn last number into number/100
  // find last number
  const m = current.match(/(\d+(\.\d+)?|\.\d+)$/);
  if (!m) return;
  const num = parseFloat(m[0]);
  const before = current.slice(0, -m[0].length);
  current = before + (num / 100);
  updateDisplay();
}

function safeEvaluate(expr) {
  // allow only digits, operators, parentheses, decimal and spaces
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
    throw new Error('Invalid characters');
  }
  // avoid double-operator errors like "**" or "*/"
  if (/[+\-*/]{2,}/.test(expr.replace(/\s+/g, ''))) {
    // allow sequences like "*-" handled earlier; catch others
    // but we'll let the parser catch real errors too.
  }
  // Use Function to evaluate in local scope
  // It's acceptable for a simple local calculator; this function validates allowed chars above.
  // Evaluate and round to avoid long floats
  // eslint-disable-next-line no-new-func
  const result = Function('"use strict"; return (' + expr + ')')();
  if (typeof result === 'number' && isFinite(result)) {
    // limit to reasonable precision
    return Math.round(result * 1e12) / 1e12;
  }
  throw new Error('Evaluation error');
}

function calculate() {
  if (current === '') return;
  try {
    const res = safeEvaluate(current);
    current = String(res);
    updateDisplay();
  } catch (err) {
    displayEl.textContent = 'Error';
    setTimeout(updateDisplay, 900);
    current = '';
  }
}

// Button clicks
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.value;
    const action = btn.dataset.action;
    if (action === 'clear') return clearAll();
    if (action === 'back') return backspace();
    if (action === 'percent') return percent();
    if (action === 'equals') return calculate();
    if (val) pushValue(val);
  });
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); return; }
  if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
  if (e.key.toLowerCase() === 'c') { clearAll(); return; }
  const allowed = '0123456789.+-*/()';
  if (allowed.includes(e.key)) {
    e.preventDefault();
    pushValue(e.key);
  }
});

// initialize
updateDisplay();
