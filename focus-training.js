const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];

tabs.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    tabs.forEach((tab) => tab.classList.toggle("active", tab === button));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
  });
});

const timerFace = document.querySelector(".timer-face");
const timerToggle = document.querySelector("#timer-toggle");
const minuteButtons = [...document.querySelectorAll("[data-minutes]")];
let timerSeconds = 25 * 60;
let selectedSeconds = timerSeconds;
let intervalId;

function renderTimer() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  if (timerFace) timerFace.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function stopTimer() {
  window.clearInterval(intervalId);
  intervalId = undefined;
  if (timerToggle) timerToggle.textContent = "Start";
}

minuteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stopTimer();
    selectedSeconds = Number(button.dataset.minutes || 25) * 60;
    timerSeconds = selectedSeconds;
    renderTimer();
  });
});

if (timerToggle) {
  timerToggle.addEventListener("click", () => {
    if (intervalId) {
      stopTimer();
      return;
    }

    timerToggle.textContent = "Pause";
    intervalId = window.setInterval(() => {
      timerSeconds -= 1;
      if (timerSeconds <= 0) {
        stopTimer();
        timerSeconds = selectedSeconds;
      }
      renderTimer();
    }, 1000);
  });
}

renderTimer();

const form = document.querySelector("#focus-form");
const output = document.querySelector("#focus-output");
const triggerMoves = {
  boredom: "Shrink the task to a visible first move and make it slightly more playful.",
  anxiety: "Define the next decision, not the whole outcome.",
  uncertainty: "Write the unknowns, then choose one question to answer first.",
  loneliness: "Schedule real connection later so checking does not have to fake it now.",
  resentment: "Reconnect the task to a value or renegotiate the ask cleanly.",
  fatigue: "Lower the block size and protect recovery before judging your discipline.",
};

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const distraction = document.querySelector("#distraction").value.trim() || "the distraction";
    const trigger = document.querySelector("#trigger").value;
    const traction = document.querySelector("#traction-input").value.trim() || "the intended action";
    const external = document.querySelector("#external").value.trim() || "one trigger in the environment";
    const move = triggerMoves[trigger] || triggerMoves.uncertainty;

    output.textContent = `Distraction: ${distraction}

Internal trigger: ${trigger}
Trigger move: ${move}

Traction: ${traction}
Timebox: protect 25 minutes for this before checking anything else.

Hack back: ${external}

Pact line: "For the next block, I choose traction before relief."`;
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-focus-training-workout";

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
