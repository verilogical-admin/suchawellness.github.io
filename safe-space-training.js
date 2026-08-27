const tabButtons = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll(".panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    tabButtons.forEach((tabButton) => tabButton.classList.toggle("active", tabButton === button));
    tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
  });
});

const form = document.querySelector("#safe-space-form");
const output = document.querySelector("#safe-space-output");

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const type = document.querySelector("#interaction-type").value;
    const need = document.querySelector("#person-need").value.trim() || "time, respect, and clarity";
    const signal = document.querySelector("#safety-signal").value.trim() || "listen first and ask before advising";
    const boundary = document.querySelector("#safe-boundary").value.trim() || "slow down if either person gets activated";

    output.textContent = `Interaction: ${type}

Possible need: ${need}
Safety signal: ${signal}
Boundary: ${boundary}

Opening line: "I want this to feel safe and useful. Would you like me to listen, ask questions, or help solve?"

Repair line: "I may have missed you there. Let me slow down and understand."`;
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-safe-space-workout";

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
