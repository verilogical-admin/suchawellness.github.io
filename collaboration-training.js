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

const form = document.querySelector("#ask-builder");
const output = document.querySelector("#builder-output");

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const outcome = document.querySelector("#outcome").value.trim() || "make this easier for everyone";
    const person = document.querySelector("#person").value.trim() || "you have useful judgment here";
    const request = document.querySelector("#request").value.trim() || "help with the next step";
    const choice = document.querySelector("#choice").value.trim() || "tell me what timing would be realistic";

    output.textContent = `I am trying to ${outcome}. Since ${person}, would you be willing to ${request}? ${choice}.`;
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-collaboration-workout";

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
