const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    tabButtons.forEach((tabButton) => tabButton.classList.toggle("active", tabButton === button));
    tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
  });
});

const form = document.querySelector("#business-drama-form");
const output = document.querySelector("#drama-output");

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const situation = document.querySelector("#drama-situation").value.trim() || "the situation";
    const goal = document.querySelector("#drama-goal").value.trim() || "protect the work and keep the next step clear";
    const pattern = document.querySelector("#drama-pattern").value;
    const boundary = document.querySelector("#drama-boundary").value.trim() || "specific facts, respectful tone, and a clear next step";

    output.textContent =
      "Subject: Next step on this issue\n\n" +
      "Hi,\n\n" +
      "I want to keep this productive and fair. My understanding is: " + situation + ".\n\n" +
      "The pattern I want to avoid is " + pattern.toLowerCase() + ", so I am going to make the next step concrete.\n\n" +
      "My goal is to " + goal + ". For that reason, I need " + boundary + ".\n\n" +
      "Please send the specific facts, dates, and outcome you are requesting in writing. I will review and respond with the next decision by [time/date].\n\n" +
      "Thank you.";
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-business-drama-workout";

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
