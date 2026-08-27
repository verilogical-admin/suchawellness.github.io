const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];

tabs.forEach((button) => {
  button.addEventListener("click", () => {
    tabs.forEach((tab) => tab.classList.toggle("active", tab === button));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === button.dataset.tab));
  });
});

const form = document.querySelector("#conversation-form");
const output = document.querySelector("#conversation-output");

if (form && output) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const facts = document.querySelector("#facts").value.trim() || "what I observed";
    const story = document.querySelector("#story").value.trim() || "I may be missing something";
    const want = document.querySelector("#want").value.trim() || "clarity and a better path forward";
    const safety = document.querySelector("#safety-line").value.trim() || "I want us to solve this well, not blame each other";

    output.textContent = `${safety}.

Here are the facts I noticed: ${facts}.

The story I am starting to tell myself is: ${story}.

What I really want is ${want}.

How are you seeing it?`;
  });
}

const checks = [...document.querySelectorAll(".checks input")];
const status = document.querySelector(".status");
const storageKey = "sucha-crucial-conversations-workout";

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
