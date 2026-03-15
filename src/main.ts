const primaryOutput = document.querySelector<HTMLOutputElement>(".calculator__output--primary")!;
const secondaryOutput = document.querySelector<HTMLOutputElement>(".calculator__output--secondary")!;
const buttons = document.querySelector<HTMLDivElement>(".calculator__buttons")!;

const config = {
  digits: 12,
  fracDigits: 6,
  expDigits: 3,
  expMin: 1e-6,
  expMax: 1e9
};

type Operator = "add" | "subtract" | "multiply" | "divide";

const state = {
  firstOperand: "",
  operator: null as Operator | null,
  secondOperand: "",
  expression: "",
  error: false
};

const operatorMap: Record<Operator, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷"
};

function appendDigit(digit: string) {
  if (state.error) return;

  if (state.operator === null) {
    if (state.firstOperand.length >= config.digits) return;
    if (state.firstOperand === "0") state.firstOperand = "";

    state.firstOperand += digit;
    primaryOutput.value = state.firstOperand;
  } else {
    if (state.secondOperand.length >= config.digits) return;
    if (state.secondOperand === "0") state.secondOperand = "";

    state.secondOperand += digit;
    primaryOutput.value = state.secondOperand;
  }
}

function appendDecimalPoint() {
  if (state.error) return;

  if (state.operator === null) {
    if (state.firstOperand.includes(".")) return;

    state.firstOperand += state.firstOperand === "" ? "0." : ".";
    primaryOutput.value = state.firstOperand;
  } else {
    if (state.secondOperand.includes(".")) return;

    state.secondOperand += state.secondOperand === "" ? "0." : ".";
    primaryOutput.value = state.secondOperand;
  }
}

function setOperator(operator: Operator) {
  if (state.firstOperand === "" || state.error) return;

  state.firstOperand = normalizeOperand(state.firstOperand);
  primaryOutput.value = state.firstOperand;

  if (state.operator !== null && state.secondOperand === "") {
    state.expression = state.expression.slice(0, -1) + operatorMap[operator];
  } else if (state.operator !== null && state.secondOperand !== "") {
    state.expression += ` ${normalizeOperand(state.secondOperand)} ${operatorMap[operator]}`;
    chainOperation();
  } else {
    state.expression = `${state.firstOperand} ${operatorMap[operator]}`;
  }

  state.operator = operator;
  secondaryOutput.value = state.expression;
}

function chainOperation() {
  if (state.operator === null) return;

  const result = calculate(state.firstOperand, state.operator, state.secondOperand);
  const formatted = formatResult(result);

  primaryOutput.value = formatted;

  if (Number.isNaN(result)) {
    state.error = true;
    return;
  }

  state.firstOperand = formatted;
  state.secondOperand = "";
}

function finishOperation() {
  if (state.firstOperand === "" || state.operator === null || state.error) return;
  if (state.secondOperand === "") state.secondOperand = state.firstOperand;

  const result = calculate(state.firstOperand, state.operator, state.secondOperand);
  const formatted = formatResult(result);

  secondaryOutput.value = `${state.expression} ${normalizeOperand(state.secondOperand)} =`;
  primaryOutput.value = formatted;

  if (Number.isNaN(result)) {
    state.error = true;
    return;
  }

  state.firstOperand = formatted;
  state.operator = null;
  state.secondOperand = "";
  state.expression = "";
}

function calculate(firstOperand: string, operator: Operator, secondOperand: string): number {
  const a = Number(firstOperand);
  const b = Number(secondOperand);

  switch (operator) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      return a / b;
  }
}

function formatResult(result: number): string {
  const abs = Math.abs(result);

  if (abs === 0) return "0";
  if (abs < config.expMin || abs >= config.expMax) return result.toExponential(config.expDigits);

  const rounded = result.toFixed(config.fracDigits);
  const formatted = rounded.replace(/\.?0+$/, "");

  return formatted;
}

function normalizeOperand(operand: string): string {
  return operand.replace(/\.$/, "");
}

function clear() {
  state.firstOperand = "";
  state.operator = null;
  state.secondOperand = "";
  state.expression = "";
  state.error = false;
  secondaryOutput.value = "";
  primaryOutput.value = "0";
}

function del() {
  if (state.error) return;

  if (state.operator === null) {
    state.firstOperand = state.firstOperand.slice(0, -1) || "0";
    primaryOutput.value = state.firstOperand;
  } else {
    if (state.secondOperand === "") return;

    state.secondOperand = state.secondOperand.slice(0, -1);
    primaryOutput.value = state.secondOperand;
  }
}

function handleButtonInput(e: Event) {
  if (!(e.target instanceof HTMLButtonElement)) return;

  const { digit, operator, decimalPoint, action } = e.target.dataset;

  if (digit) appendDigit(digit);
  if (operator) setOperator(operator as Operator);
  if (decimalPoint) appendDecimalPoint();
  if (action === "clear") clear();
  if (action === "del") del();
  if (action === "equals") finishOperation();
}

function handleKeyboardInput(e: KeyboardEvent) {
  const key = e.key;

  if (key >= "0" && key <= "9") appendDigit(key);
  if (key === ".") appendDecimalPoint();
  if (key === "+") setOperator("add");
  if (key === "-") setOperator("subtract");
  if (key === "*") setOperator("multiply");
  if (key === "/") { e.preventDefault(); setOperator("divide"); }
  if (key === "=" || key === "Enter") { e.preventDefault(); finishOperation(); }
  if (key === "Escape") clear();
  if (key === "Backspace") del();
}

document.addEventListener("keydown", handleKeyboardInput);
buttons.addEventListener("click", handleButtonInput);
