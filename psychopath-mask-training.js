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

const form = document.querySelector("#plan-builder");
const output = document.querySelector("#builder-output");
const patternActions = {
  lying: "move the conversation to writing and verify facts before any further commitment",
  charm: "slow the pace and make decisions from the pattern, not the current warmth",
  money: "pause delivery, send a written payment deadline, and require advance payment next time",
  threat: "prioritize safety, tell trusted support, preserve evidence, and avoid being alone with them",
  boundary: "repeat the boundary once, document the reaction, and reduce access if punishment continues",
};

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const pattern = document.querySelector("#pattern").value;
    const facts = document.querySelector("#facts").value.trim() || "I will write down the concrete facts, dates, messages, and witnesses before deciding.";
    const boundary = document.querySelector("#boundary").value.trim() || "I will limit access until behavior changes consistently.";
    const action = patternActions[pattern] || "slow down, document, and set a practical boundary";

    output.textContent = `Pattern response: ${action}.

Facts to preserve: ${facts}

Boundary: ${boundary}

Script: "I am making decisions based on repeated behavior and documented facts. I am not available for more access until this is resolved clearly."`;
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-psychopath-mask-workout";

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
