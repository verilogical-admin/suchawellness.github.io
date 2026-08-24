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

const workoutChecks = [...document.querySelectorAll(".workout-grid input")];
const workoutStatus = document.querySelector(".workout-status");
const storageKey = "sucha-sales-eq-lab-workout";

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
