const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];

tabs.forEach((button) => {
  button.addEventListener("click", () => {
    tabs.forEach((tab) => tab.classList.toggle("active", tab === button));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === button.dataset.tab));
  });
});

const secondBrainForm = document.querySelector("#second-brain-form");
const secondBrainOutput = document.querySelector("#second-brain-output");
const destinations = {
  project: "Put this directly inside the active project where it can support a deliverable.",
  area: "Store it with the ongoing standard or responsibility it helps you maintain.",
  resource: "Save it as reference material with a clear future-use handle.",
  archive: "Move it out of your active view. Keep it searchable without letting it clutter today.",
};

if (secondBrainForm && secondBrainOutput) {
  secondBrainForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const idea = document.querySelector("#idea").value.trim() || "the captured idea";
    const place = document.querySelector("#place").value;
    const output = document.querySelector("#output").value.trim() || "a useful output";
    secondBrainOutput.textContent = `Captured idea: ${idea}

PARA home: ${place}
Why: ${destinations[place]}

Distilled handle: Use this when I need to create ${output}.

Next expression: turn this note into one small ${output} before saving more material.`;
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-second-brain-workout";

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
