const primaryOutput = document.querySelector<HTMLOutputElement>(".calculator__output--primary")!;
const secondaryOutput = document.querySelector<HTMLOutputElement>(".calculator__output--secondary")!;
const calculatorControls = document.querySelector<HTMLDivElement>(".calculator__controls")!;

type Operator = "add" | "subtract" | "multiply" | "divide";

const state = {
  firstOperand: "",
  operator: null as Operator | null,
};

const operatorMap: Record<Operator, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷"
};

function appendOperand(operand: string) {
  
  state.firstOperand += operand;
  primaryOutput.value = state.firstOperand;

  console.log(state);
}

function setOperator(operator: Operator) {
  if (state.firstOperand === "") return;

  state.operator = operator;
  secondaryOutput.value = `${state.firstOperand} ${operatorMap[operator]}`;
  
  console.log(state);
}

function handleCalculatorInput(e: Event) {
  if (!(e.target instanceof HTMLButtonElement)) return;

  // console.log(e.target.dataset);
  const { action, operand, operator, separator } = e.target.dataset;

  if (operand) appendOperand(operand);
  if (operator) setOperator(operator as Operator);

}

calculatorControls.addEventListener("click", handleCalculatorInput);
