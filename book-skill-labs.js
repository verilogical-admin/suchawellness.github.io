const tabButtons = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll(".panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    tabButtons.forEach((tabButton) => tabButton.classList.toggle("active", tabButton === button));
    tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
  });
});

const form = document.querySelector("#builder-form");
const output = document.querySelector("#builder-output");

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const path = location.pathname;

    if (path.includes("persuasion")) {
      const value = document.querySelector("#value").value.trim() || "a smoother outcome";
      const request = document.querySelector("#request").value.trim() || "consider this next step";
      const choice = document.querySelector("#choice").value.trim() || "choose the timing that works best";
      output.textContent = `I know ${value} matters to you. Would you be open to ${request}? We can keep it simple: ${choice}.`;
    } else if (path.includes("human-nature")) {
      const behavior = document.querySelector("#behavior").value.trim() || "the repeated behavior";
      const drive = document.querySelector("#drive").value;
      output.textContent = `Observed pattern: ${behavior}\n\nPossible drive: ${drive}\n\nGrounded response: slow down, verify the pattern across time, manage your own emotion, and choose a response that protects your long-term values.`;
    } else {
      const situation = document.querySelector("#situation").value.trim() || "this situation";
      const mine = document.querySelector("#mine").value.trim() || "my honest effort and boundary";
      const theirs = document.querySelector("#theirs").value.trim() || "their reaction and interpretation";
      output.textContent = `Situation: ${situation}\n\nMy task: ${mine}\n\nTheir task: ${theirs}\n\nPractice line: "I will do my task cleanly and let their task belong to them."`;
    }
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
