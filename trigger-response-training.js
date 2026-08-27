const tabButtons = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll(".panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    tabButtons.forEach((tabButton) => tabButton.classList.toggle("active", tabButton === button));
    tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
  });
});

const form = document.querySelector("#trigger-form");
const output = document.querySelector("#trigger-output");
const intensity = document.querySelector("#trigger-intensity");
const intensityValue = document.querySelector("#trigger-intensity-value");

if (intensity && intensityValue) {
  intensity.addEventListener("input", () => {
    intensityValue.textContent = intensity.value;
  });
}

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const situation = document.querySelector("#trigger-situation").value.trim() || "this situation";
    const body = document.querySelector("#trigger-body").value.trim() || "activation in my body";
    const story = document.querySelector("#trigger-story").value.trim() || "a fast protective story";
    const response = document.querySelector("#trigger-response").value.trim() || "pause, regulate, and choose my next words";
    const level = intensity?.value || "5";

    output.textContent = `Situation: ${situation}

Intensity: ${level}/10
Body cue: ${body}
Trigger story: ${story}

Regulation move: exhale longer than you inhale, orient to the room, and soften your jaw/hands.

Wise response: ${response}

Practice line: "I can be activated and still choose the next right move."`;
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-trigger-response-workout";

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
