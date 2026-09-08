const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
  });
});

const form = document.querySelector("#character-form");
const output = document.querySelector("#character-output");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const context = document.querySelector("#context")?.value || "relationship";
  const pattern = document.querySelector("#pattern")?.value.trim();
  const cost = document.querySelector("#cost")?.value.trim();
  const concern = document.querySelector("#concern")?.value || "character";

  const patternLine = pattern || "Name the repeated behavior before drawing a conclusion.";
  const costLine = cost || "Look for what happened when fairness, honesty, repair, or restraint had a cost.";

  output.textContent = `Context: ${context}

Observed pattern:
${patternLine}

Cost or pressure evidence:
${costLine}

Main dimension to watch: ${concern}

Next wise move:
Do not decide from charm, status, or one emotional moment. Look for consistency across time, behavior toward people with less power, response to no, repair after mistakes, and what happens when their interests conflict with yours. If trust is high-stakes, slow the pace and keep a clear boundary until the pattern is stronger.`;
});

const checks = document.querySelectorAll(".checks input");
const status = document.querySelector(".status");

function updateStatus() {
  const done = [...checks].filter((check) => check.checked).length;
  if (status) status.textContent = `${done} of ${checks.length} complete`;
}

checks.forEach((check) => check.addEventListener("change", updateStatus));
updateStatus();
