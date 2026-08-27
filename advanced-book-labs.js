const tabButtons = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll(".panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    tabButtons.forEach((tabButton) => tabButton.classList.toggle("active", tabButton === button));
    tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
  });
});

const labTitle = document.body.dataset.title || "Skill Lab";
const form = document.querySelector("#builder-form");
const output = document.querySelector("#builder-output");

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const one = document.querySelector("#field-one").value.trim() || "the situation";
    const two = document.querySelector("#field-two").value.trim() || "the likely pattern";
    const three = document.querySelector("#field-three").value.trim() || "one clean next step";
    output.textContent = labTitle + "\n\nSituation: " + one + "\nPattern or need: " + two + "\nPractical response: " + three + "\n\nPractice line: I can stay kind, clear, and reality-based while I choose my next move.";
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = `sucha-${location.pathname.replaceAll("/", "")}-workout`;

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
