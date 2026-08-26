const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;

    tabButtons.forEach((tabButton) => {
      tabButton.classList.toggle("active", tabButton === button);
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === target);
    });
  });
});

const form = document.querySelector("#move-builder");
const output = document.querySelector("#builder-output");
const situationPrompts = {
  price: "What about the price feels hardest to justify right now?",
  deadline: "How would we make this realistic without breaking the quality bar?",
  relationship: "What would help this feel safer to discuss?",
  decision: "What would need to be true for this decision to move forward?",
};

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const situation = document.querySelector("#situation").value;
    const concern = document.querySelector("#concern").value.trim() || "this feels risky";
    const goal = document.querySelector("#goal").value.trim() || "find a workable next step";
    const mirroredWord = concern.split(/\s+/).slice(-3).join(" ");
    const question = situationPrompts[situation] || "What is the biggest obstacle from your side?";

    output.textContent = `Mirror: "${mirroredWord}?"

Label: "It sounds like ${concern}."

Calibrated question: "${question}"

Close: "My goal is to ${goal}. What would be a realistic next step from here?"`;
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-negotiation-workout";

function updateStatus() {
  const completed = checks.filter((input) => input.checked).length;

  if (status) {
    status.textContent = `${completed} of ${checks.length} complete`;
  }

  localStorage.setItem(
    storageKey,
    JSON.stringify(checks.map((input) => input.checked)),
  );
}

try {
  const savedState = JSON.parse(localStorage.getItem(storageKey) || "[]");

  checks.forEach((input, index) => {
    input.checked = Boolean(savedState[index]);
  });
} catch {
  localStorage.removeItem(storageKey);
}

checks.forEach((input) => {
  input.addEventListener("change", updateStatus);
});

updateStatus();
