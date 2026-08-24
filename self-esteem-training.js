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

const scoreInputs = [
  ["Conscious living", document.querySelector("#score-conscious"), "write three facts before deciding"],
  ["Self-acceptance", document.querySelector("#score-acceptance"), "describe one difficult part of yourself without insult"],
  ["Self-responsibility", document.querySelector("#score-responsibility"), "name the next action that is yours to take"],
  ["Self-assertiveness", document.querySelector("#score-assertiveness"), "practice one clean preference, request, or boundary"],
  ["Purposeful living", document.querySelector("#score-purpose"), "choose one aim and one 20-minute step"],
  ["Personal integrity", document.querySelector("#score-integrity"), "close one gap between value and behavior"],
];
const scoreResult = document.querySelector(".score-result");
const miniBars = document.querySelectorAll(".mini-bar i");

function updateScores() {
  const values = scoreInputs.map(([name, input, practice], index) => {
    const value = input ? Number(input.value) : 5;

    if (miniBars[index]) {
      miniBars[index].style.setProperty("--value", `${value * 10}%`);
    }

    return { name, practice, value };
  });
  const lowest = values.reduce((current, item) => (
    item.value < current.value ? item : current
  ));

  if (scoreResult) {
    scoreResult.textContent = `Start with ${lowest.name.toLowerCase()}: ${lowest.practice} today.`;
  }
}

scoreInputs.forEach(([, input]) => {
  if (input) {
    input.addEventListener("input", updateScores);
  }
});

updateScores();

const workoutChecks = [...document.querySelectorAll(".workout-grid input")];
const workoutStatus = document.querySelector(".workout-status");
const storageKey = "sucha-self-esteem-workout";

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
