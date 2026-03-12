const primaryOutput = document.querySelector<HTMLOutputElement>(".calculator__output--primary")!;
const secondaryOutput = document.querySelector<HTMLOutputElement>(".calculator__output--secondary")!;
const calculatorControls = document.querySelector<HTMLDivElement>(".calculator__controls")!;

type Operator = "add" | "subtract" | "multiply" | "divide";

const config = {
  maxDigits: 10,
  maxDecimals: 6,
  scientificMin: 1e-6,
  scientificMax: 1e9,
  scientificDigits: 3
};

const state = {
  firstOperand: "",
  operator: null as Operator | null,
  secondOperand: "",
  error: false,
};

const operatorMap: Record<Operator, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷"
};

function appendOperand(operand: string) {
  if (state.error) return;

  if (state.operator === null) {
    if (state.firstOperand.length >= config.maxDigits) return;
    if (state.firstOperand === "0") state.firstOperand = "";

    state.firstOperand += operand;
    primaryOutput.value = state.firstOperand;
  } else {
    if (state.secondOperand.length >= config.maxDigits) return;
    if (state.secondOperand === "0") state.secondOperand = "";
    
    state.secondOperand += operand;
    primaryOutput.value = state.secondOperand;
  }

  console.log(state);
}

function setOperator(operator: Operator) {
  if (state.firstOperand === "" || state.error) return;
  if (state.operator !== null && state.secondOperand !== "") handleEquals();

  state.operator = operator;
  secondaryOutput.value = `${state.firstOperand} ${operatorMap[operator]}`;

  console.log(state);
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

  console.log(state);
}

function handleEquals() {
  if (state.firstOperand === "" || state.operator === null) return;
  if (state.secondOperand === "") state.secondOperand = state.firstOperand;

  const a = Number(state.firstOperand);
  const b = Number(state.secondOperand);
  
  const result = calculate(a, state.operator, b);
  
  secondaryOutput.value = `${state.firstOperand} ${operatorMap[state.operator]} ${state.secondOperand} =`;
  
  if (result === null) {
    state.error = true;
    primaryOutput.value = "Cannot divide by zero";
    return;
  }

  const formatted = formatResult(result);
  
  primaryOutput.value = formatted;

  state.firstOperand = formatted;
  state.operator = null;
  state.secondOperand = "";

  console.log(state);
}

function calculate(a: number, operator: Operator, b: number): number | null {
  if (operator === "divide" && b === 0) return null;

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
  if (abs < config.scientificMin || abs >= config.scientificMax) {
    return result.toExponential(config.scientificDigits);
  }
  
  const rounded = result.toFixed(config.maxDecimals);
  const formatted = rounded.replace(/\.?0+$/, "");

  return formatted;
}

function clear() {
  state.firstOperand = "";
  state.operator = null;
  state.secondOperand = "";
  state.error = false;

  secondaryOutput.value = "";
  primaryOutput.value = "0";
}

function deleteOperand() {
  if (state.error) return;

  if (state.operator === null) {
    if (state.firstOperand.includes("e")) return;

    state.firstOperand = state.firstOperand.slice(0, -1) || "0";
    primaryOutput.value = state.firstOperand;
  } else {
    state.secondOperand = state.secondOperand.slice(0, -1) || "0";
    primaryOutput.value = state.secondOperand;
  }

  console.log(state);
}

function handleCalculatorInput(e: Event) {
  if (!(e.target instanceof HTMLButtonElement)) return;

  const { action, operand, operator, separator } = e.target.dataset;

  if (operand) appendOperand(operand);
  if (operator) setOperator(operator as Operator);
  if (separator) appendDecimalPoint();
  if (action === "clear") clear();
  if (action === "delete") deleteOperand();
  if (action === "equals") handleEquals();
}

function handleKeyboardInput(e: KeyboardEvent) {
  const key = e.key;

  if (key >= "0" && key <= "9") appendOperand(key);
  if (key === ".") appendDecimalPoint();
  if (key === "+") setOperator("add");
  if (key === "-") setOperator("subtract");
  if (key === "*") setOperator("multiply");
  if (key === "/") { e.preventDefault(); setOperator("divide") }
  if (key === "=" || key === "Enter") { e.preventDefault(); handleEquals() }
  if (key === "Backspace") deleteOperand();
  if (key === "Escape" || key === "Delete") clear();
}

document.addEventListener("keydown", handleKeyboardInput);
calculatorControls.addEventListener("click", handleCalculatorInput);
