const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];

tabs.forEach((button) => {
  button.addEventListener("click", () => {
    tabs.forEach((tab) => tab.classList.toggle("active", tab === button));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === button.dataset.tab));
  });
});

const modelsForm = document.querySelector("#models-form");
const modelsOutput = document.querySelector("#models-output");
const prompts = {
  inversion: "How could this fail, and which failure path can you remove before starting?",
  "second-order thinking": "After the first result, what habit, reaction, or dependency does this create?",
  "opportunity cost": "What are you saying no to by saying yes to this?",
  probability: "What range feels honest, and what evidence would make you update it?",
  systems: "Which incentive or feedback loop will this choice strengthen?",
  "margin of safety": "What buffer protects you if your estimate is too optimistic?",
};

if (modelsForm && modelsOutput) {
  modelsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const decision = document.querySelector("#decision-input").value.trim() || "this decision";
    const model = document.querySelector("#model-choice").value;
    const risk = document.querySelector("#risk").value.trim() || "the main risk";
    modelsOutput.textContent = `Decision: ${decision}

Model: ${model}
Question: ${prompts[model]}

Known risk: ${risk}

Clean next step: reduce the risk before increasing commitment. Write one assumption, one test, and one stop condition.`;
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-mental-models-workout";

function updateStatus() {
  const completed = checks.filter((input) => input.checked).length;
  if (status) status.textContent = `${completed} of ${checks.length} complete`;
  localStorage.setItem(storageKey, JSON.stringify(checks.map((input) => input.checked)));
}

try {
  const savedState = JSON.parse(localStorage.getItem(storageKey) || "[]");
  checks.forEach((input, index) => {
    input.checked = Boolean(savedState[index]);
  });
} catch {
  localStorage.removeItem(storageKey);
}

checks.forEach((input) => input.addEventListener("change", updateStatus));
updateStatus();
