const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((tabButton) => {
      tabButton.classList.toggle("active", tabButton === button);
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === button.dataset.tab);
    });
  });
});

const timerFace = document.querySelector(".timer-face");
const timerStart = document.querySelector(".timer-start");
const durationButtons = document.querySelectorAll(".duration-button");
let selectedDuration = 20;
let remainingSeconds = selectedDuration;
let timerId;

function renderTimer() {
  if (timerFace) {
    timerFace.textContent = String(remainingSeconds);
  }
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = undefined;

  if (timerStart) {
    timerStart.textContent = "Start pause";
  }
}

durationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stopTimer();
    selectedDuration = Number(button.dataset.duration || 20);
    remainingSeconds = selectedDuration;

    durationButtons.forEach((durationButton) => {
      durationButton.classList.toggle("active", durationButton === button);
    });

    renderTimer();
  });
});

if (timerStart) {
  timerStart.addEventListener("click", () => {
    if (timerId) {
      stopTimer();
      return;
    }

    remainingSeconds = selectedDuration;
    timerStart.textContent = "Pause running";
    renderTimer();

    timerId = window.setInterval(() => {
      remainingSeconds -= 1;
      renderTimer();

      if (remainingSeconds <= 0) {
        stopTimer();
        remainingSeconds = selectedDuration;
        renderTimer();
      }
    }, 1000);
  });
}

const heatInput = document.querySelector("#heat");
const heatResult = document.querySelector(".heat-result");
const heatPlans = [
  [
    "Low heat",
    "Use a 20-second pause and continue slowly. Your only job is not to speed up the emotion.",
  ],
  [
    "Low-medium heat",
    "Relax your hands, take three long exhales, and choose one small next step.",
  ],
  [
    "Medium heat",
    'Take 45 seconds, exhale slowly, and ask: "What outcome am I protecting?"',
  ],
  [
    "High heat",
    "Step away for 90 seconds if possible. Do not send, decide, or accuse until the body softens.",
  ],
  [
    "Very high heat",
    "Pause the conversation. Say you need a moment, drink water, and return with one clear sentence.",
  ],
];

if (heatInput && heatResult) {
  heatInput.addEventListener("input", () => {
    const plan = heatPlans[Number(heatInput.value) - 1] || heatPlans[2];
    heatResult.innerHTML = `<strong>${plan[0]}</strong><p>${plan[1]}</p>`;
  });
}

const workoutChecks = [...document.querySelectorAll(".workout-grid input")];
const workoutStatus = document.querySelector(".workout-status");
const storageKey = "sucha-patience-workout";

function updateWorkoutStatus() {
  const completed = workoutChecks.filter((input) => input.checked).length;

  if (workoutStatus) {
    workoutStatus.textContent = `${completed} of ${workoutChecks.length} complete`;
  }

  localStorage.setItem(
    storageKey,
    JSON.stringify(workoutChecks.map((input) => input.checked)),
  );
}

try {
  const savedState = JSON.parse(localStorage.getItem(storageKey) || "[]");

  workoutChecks.forEach((input, index) => {
    input.checked = Boolean(savedState[index]);
  });
} catch {
  localStorage.removeItem(storageKey);
}

workoutChecks.forEach((input) => {
  input.addEventListener("change", updateWorkoutStatus);
});

updateWorkoutStatus();
