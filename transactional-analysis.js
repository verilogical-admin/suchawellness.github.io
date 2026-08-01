const storageKey = "suchaTaEntries.v1";
const strokeKey = "suchaTaStrokes.v1";
const positionKey = "suchaTaLifePosition.v1";
const taAccessKey = "suchaTaSupporterAccess.v1";
const taPlanId = "ta_lab_yearly_60";
const taProduct = "SuchaTALabPremium";
const taTrialDays = 7;

const lessons = {
  ego: {
    title: "Ego states",
    body: [
      "Parent is borrowed rule, care, criticism, or protection. It often sounds certain and inherited.",
      "Adult is present-moment reality testing: facts, options, agreements, timing, and consent.",
      "Child is felt experience: play, protest, fear, compliance, desire, shame, and spontaneity."
    ]
  },
  transactions: {
    title: "Transactions",
    body: [
      "A complementary transaction keeps the expected channel open: Adult to Adult, or Parent to Child with a matching Child response.",
      "A crossed transaction breaks the expected channel. A factual Adult question may receive a Critical Parent reply.",
      "An ulterior transaction carries two messages at once: the social message on the surface and a psychological message underneath."
    ]
  },
  games: {
    title: "Games",
    body: [
      "In TA, a game is a repeated conflict pattern with a predictable emotional payoff.",
      "The aim is not to accuse anyone of playing a game. The aim is to notice the invitation and choose a cleaner transaction.",
      "Adult exits often sound specific, bounded, and present-focused."
    ]
  },
  strokes: {
    title: "Strokes",
    body: [
      "A stroke is a unit of recognition: positive, negative, conditional, or unconditional.",
      "A healthier stroke economy makes appreciation easier to give and receive, without needing conflict to feel seen.",
      "Track both what you give and what you receive. Patterns become visible quickly."
    ]
  }
};

const quizItems = [
  { text: "You always do this. You should know better by now.", answer: "Parent", why: "The sentence leans on judgment, absolutes, and rule enforcement." },
  { text: "What deadline did we agree on, and what changed this week?", answer: "Adult", why: "It asks for observable facts and shared reality." },
  { text: "I hate this. Nobody listens to me anyway.", answer: "Child", why: "The sentence carries hurt, protest, and global feeling." },
  { text: "Let's pause for five minutes and come back with two options.", answer: "Adult", why: "It creates structure, timing, and options." },
  { text: "Fine, I'll just do everything myself.", answer: "Child", why: "It sounds like adaptation, resentment, and indirect protest." }
];

const games = [
  {
    name: "Why Don't You, Yes But",
    cue: "One person asks for help, then defeats every suggestion.",
    exit: "Ask what kind of help is wanted: ideas, listening, or a decision."
  },
  {
    name: "Now I've Got You",
    cue: "A small mistake becomes proof that the other person is bad.",
    exit: "Name the specific issue and refuse the character trial."
  },
  {
    name: "Kick Me",
    cue: "Someone behaves in a way that invites rejection, then feels confirmed.",
    exit: "Respond to the need without accepting the invitation to punish."
  },
  {
    name: "If It Weren't For You",
    cue: "A limitation is placed entirely on another person's existence.",
    exit: "Separate real constraints from chosen postponements."
  },
  {
    name: "See What You Made Me Do",
    cue: "Responsibility for one's action is shifted to another person.",
    exit: "Return agency gently: what will each person own next?"
  },
  {
    name: "Poor Me",
    cue: "Distress is repeated but change is avoided because sympathy is the payoff.",
    exit: "Offer care and one concrete next step, not endless rescue."
  }
];

const prompts = [
  "Before responding, what observable fact can I name without blame?",
  "What would an Adult-to-Adult reply sound like in one sentence?",
  "What am I assuming, and what can I verify?",
  "What boundary would be clear without being punitive?",
  "What feeling is real, and what action is optional?"
];

const lexicon = {
  Parent: ["always", "never", "should", "must", "obviously", "ridiculous", "wrong", "fault", "lazy", "careless", "respect", "rule"],
  Adult: ["what", "when", "where", "how", "which", "option", "evidence", "deadline", "agree", "confirm", "specific", "next", "data", "plan"],
  Child: ["want", "hate", "unfair", "scared", "please", "fine", "whatever", "can't", "nobody", "everyone", "sorry", "alone", "mad"]
};

let quizIndex = 0;
let selectedQuiz = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function setPaymentStatus(message) {
  const status = $("#ta-payment-status");
  if (status) status.textContent = message;
}

function activeTaAccess() {
  const access = loadJson(taAccessKey, null);
  if (!access) return null;
  if (access.expiresAt && Number(access.expiresAt) < Date.now()) return null;
  return access;
}

function hasTaAccess() {
  return Boolean(activeTaAccess());
}

async function ensureRazorpayLoaded() {
  if (typeof Razorpay !== "undefined") return true;
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(typeof Razorpay !== "undefined"), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      window.setTimeout(() => resolve(typeof Razorpay !== "undefined"), 7000);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(typeof Razorpay !== "undefined");
    script.onerror = () => resolve(false);
    document.head.append(script);
    window.setTimeout(() => resolve(typeof Razorpay !== "undefined"), 7000);
  });
}

async function createTaCheckout(email) {
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId: taPlanId,
      product: taProduct,
      email,
      amountUsd: 60
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not create Razorpay checkout.");
  return data;
}

async function verifyTaCheckout(email, checkout, response) {
  const verifyResponse = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId: taPlanId,
      product: taProduct,
      email,
      checkoutMode: checkout.mode || "order",
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    })
  });
  const data = await verifyResponse.json().catch(() => ({}));
  if (!verifyResponse.ok || data.ok === false) throw new Error(data.error || "Could not verify Razorpay payment.");
  return data;
}

async function redeemTaCoupon() {
  const email = normalizeEmail($("#ta-billing-email")?.value);
  const code = String($("#ta-coupon-code")?.value || "").trim().toUpperCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid billing email.");
  if (!code) throw new Error("Enter a TA Lab premium coupon code.");
  const button = $("#ta-coupon-button");
  button.disabled = true;
  setPaymentStatus("Checking TA Lab coupon...");
  try {
    const response = await fetch("/api/ta-lab/redeem-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email, product: taProduct })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || "Coupon could not be redeemed.");
    saveJson(taAccessKey, {
      source: data.source || "admin_coupon",
      product: data.product || taProduct,
      planId: data.planId || taPlanId,
      email: data.email || email,
      couponHash: data.couponHash,
      redeemedAt: data.redeemedAt || Date.now(),
      expiresAt: data.expiresAt,
      accessDays: data.accessDays,
      price: "Coupon"
    });
    if ($("#ta-coupon-code")) $("#ta-coupon-code").value = "";
    renderTaAccess();
  } finally {
    button.disabled = false;
  }
}

async function startTaCheckout() {
  if (location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    throw new Error("Open the live site to use Razorpay Checkout.");
  }
  const email = normalizeEmail($("#ta-billing-email")?.value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid billing email.");
  const ready = await ensureRazorpayLoaded();
  if (!ready) throw new Error("Razorpay Checkout could not load. Check the connection and try again.");

  const button = $("#ta-checkout-button");
  button.disabled = true;
  setPaymentStatus("Opening secure Razorpay checkout...");
  try {
    const checkout = await createTaCheckout(email);
    const rz = new Razorpay({
      key: checkout.keyId,
      name: "Sucha™ Wellness",
    description: "TA Lab Premium - $60/year",
      amount: checkout.amount,
      currency: checkout.currency || "USD",
      order_id: checkout.orderId,
      prefill: { email },
      theme: { color: "#2f7d70" },
      handler: async (response) => {
        try {
          setPaymentStatus("Verifying Razorpay payment...");
          const verified = await verifyTaCheckout(email, checkout, response);
          saveJson(taAccessKey, {
            source: verified.source || "razorpay_order",
            product: verified.product || taProduct,
            planId: verified.planId || taPlanId,
            email: verified.email || email,
            paymentId: verified.razorpayPaymentId || response.razorpay_payment_id,
            orderId: verified.razorpayOrderId || response.razorpay_order_id,
            purchasedAt: verified.purchasedAt || Date.now(),
            expiresAt: verified.expiresAt || checkout.expiresAt || (Date.now() + 365 * 24 * 60 * 60 * 1000),
            guaranteeEndsAt: verified.guaranteeEndsAt || checkout.guaranteeEndsAt,
            price: verified.price || "$60/year"
          });
          renderTaAccess();
        } catch (error) {
          setPaymentStatus(error.message || "Payment verification failed.");
        } finally {
          button.disabled = false;
        }
      },
      modal: {
        ondismiss: () => {
          button.disabled = false;
          renderTaAccess();
        }
      }
    });
    rz.on("payment.failed", (event) => {
      button.disabled = false;
      setPaymentStatus(`Razorpay payment failed: ${event.error?.description || "Try again."}`);
    });
    rz.open();
  } catch (error) {
    button.disabled = false;
    throw error;
  }
}

function renderTaAccess() {
  const access = activeTaAccess();
  const button = $("#ta-checkout-button");
  const trialButton = $("#ta-trial-button");
  if (!access) {
    setPaymentStatus("Free preview is ready. Trial or premium unlocks the application tools.");
    if (button) {
      button.textContent = "Upgrade with Razorpay";
      button.disabled = false;
    }
    if (trialButton) trialButton.disabled = false;
    updatePremiumGate(false);
    return;
  }
  const kind = access.source === "trial" ? "Trial" : "Premium";
  const date = access.expiresAt ? new Date(access.expiresAt).toLocaleDateString() : "";
  setPaymentStatus(`${kind} active${access.email ? ` for ${access.email}` : ""}${date ? ` until ${date}` : ""}.`);
  if (button) button.textContent = access.source === "trial" ? "Upgrade with Razorpay" : "Premium active";
  if (button && access.source !== "trial") button.disabled = true;
  if (trialButton) trialButton.disabled = true;
  updatePremiumGate(true);
}

function startTaTrial() {
  const email = normalizeEmail($("#ta-billing-email")?.value);
  saveJson(taAccessKey, {
    source: "trial",
    product: taProduct,
    planId: "ta_lab_trial_7",
    email,
    purchasedAt: Date.now(),
    expiresAt: Date.now() + taTrialDays * 24 * 60 * 60 * 1000,
    price: "7-day trial"
  });
  renderTaAccess();
}

function updatePremiumGate(unlocked) {
  $$("[data-premium-required]").forEach((section) => {
    section.classList.toggle("premium-locked", !unlocked);
    section.querySelectorAll("input, textarea, select, button").forEach((control) => {
      control.disabled = !unlocked;
    });
  });
}

function scoreText(text) {
  const lower = text.toLowerCase();
  const scores = { Parent: 0, Adult: 0, Child: 0 };
  Object.entries(lexicon).forEach(([state, words]) => {
    words.forEach((word) => {
      const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      const matches = lower.match(pattern);
      scores[state] += matches ? matches.length : 0;
    });
  });
  if (/\?/.test(text)) scores.Adult += 1;
  if (/[!]{1,}/.test(text)) scores.Child += 1;
  if (/\b(you|your)\b.*\b(always|never|should|must|fault)\b/i.test(text)) scores.Parent += 2;
  return scores;
}

function dominant(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function classifyTransaction(text, scores) {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const first = dominant(scoreText(lines[0] || text));
  const second = dominant(scoreText(lines[1] || ""));
  const hasHiddenCue = /\b(just joking|obviously|after all|if you cared|everyone knows|no offense)\b/i.test(text);
  const hasBlameThenFacts = /\b(always|never|should|fault|lazy|careless)\b/i.test(lines[0] || "") && /\b(what|when|deadline|specific|agree|option)\b/i.test(lines[1] || "");
  if (hasHiddenCue) return { type: "Ulterior", first, second, diagram: "ulterior" };
  if (hasBlameThenFacts || (first !== "Adult" && second === "Adult") || (first === "Adult" && second !== "Adult" && lines.length > 1)) {
    return { type: "Crossed", first, second, diagram: "crossed" };
  }
  if (scores.Adult >= scores.Parent && scores.Adult >= scores.Child) return { type: "Complementary", first, second: second || "Adult", diagram: "" };
  return { type: "Unclear", first, second, diagram: "ulterior" };
}

function renderLesson(name) {
  const lesson = lessons[name];
  $("#lesson-title").textContent = lesson.title;
  $("#lesson-body").innerHTML = lesson.body.map((item) => `<p>${item}</p>`).join("");
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.lesson === name));
}

function renderQuiz() {
  const item = quizItems[quizIndex % quizItems.length];
  selectedQuiz = "";
  $("#quiz-line").textContent = item.text;
  $("#quiz-result").textContent = "Choose the state that best fits the sentence.";
  $("#quiz-options").innerHTML = ["Parent", "Adult", "Child"].map((state) => (
    `<button class="choice" type="button" data-quiz-choice="${state}">${state}</button>`
  )).join("");
}

function chooseQuiz(state) {
  selectedQuiz = state;
  const item = quizItems[quizIndex % quizItems.length];
  $$("[data-quiz-choice]").forEach((button) => button.classList.toggle("selected", button.dataset.quizChoice === state));
  $("#quiz-result").innerHTML = state === item.answer
    ? `<strong>Correct: ${item.answer}.</strong> ${item.why} Next sentence loaded.`
    : `<strong>Try again.</strong> This is closer to ${item.answer}. ${item.why}`;
  if (state === item.answer) {
    window.setTimeout(() => {
      quizIndex += 1;
      renderQuiz();
    }, 1100);
  }
}

function renderScores(scores) {
  const max = Math.max(1, scores.Parent, scores.Adult, scores.Child);
  ["Parent", "Adult", "Child"].forEach((state) => {
    const value = scores[state];
    $(`#score-${state.toLowerCase()}`).textContent = value;
    $(`#bar-${state.toLowerCase()}`).style.width = `${Math.round((value / max) * 100)}%`;
  });
}

function analyzeConversation(text) {
  const scores = scoreText(text);
  const tx = classifyTransaction(text, scores);
  renderScores(scores);
  const diagram = $("#transaction-diagram");
  diagram.classList.remove("crossed", "ulterior");
  if (tx.diagram) diagram.classList.add(tx.diagram);
  const adultSuggestion = tx.type === "Crossed"
    ? "Adult shift: name one fact, ask one clear question, and avoid defending your whole character."
    : tx.type === "Ulterior"
      ? "Adult shift: surface the hidden message gently. Try: I want to check what you need from me directly."
      : "Keep it Adult by staying specific, time-bound, and open to correction.";
  $("#analysis-result").innerHTML = `<strong>${tx.type} transaction likely.</strong> Opening signal: ${tx.first}. Reply signal: ${tx.second || "not enough data"}. ${adultSuggestion}`;
}

function getEntries() {
  return loadJson(storageKey, []);
}

function setEntries(entries) {
  saveJson(storageKey, entries);
}

function renderEntries() {
  const entries = getEntries();
  const list = $("#entry-list");
  if (!entries.length) {
    list.innerHTML = `<p class="empty">No TA entries yet. Log one small moment today.</p>`;
  } else {
    list.innerHTML = entries.slice(0, 8).map((entry) => `
      <article class="entry">
        <div class="entry-top">
          <strong>${escapeHtml(entry.relationship || "Relationship")}</strong>
          <button class="link-button" type="button" data-delete-entry="${entry.id}">Delete</button>
        </div>
        <div><span class="pill">${entry.mine}</span> <span class="pill">${entry.theirs}</span> <span class="pill">${entry.outcome}</span></div>
        <p class="micro">${escapeHtml(entry.moment || "No note added.")}</p>
        <span class="micro">${new Date(entry.createdAt).toLocaleString()}</span>
      </article>
    `).join("");
  }
  renderMetrics();
}

function renderMetrics() {
  const entries = getEntries();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = entries.filter((entry) => new Date(entry.createdAt).getTime() >= weekAgo);
  const states = recent.reduce((acc, entry) => {
    acc[entry.mine] = (acc[entry.mine] || 0) + 1;
    return acc;
  }, {});
  const outcomes = recent.reduce((acc, entry) => {
    acc[entry.outcome] = (acc[entry.outcome] || 0) + 1;
    return acc;
  }, {});
  const relationships = recent.reduce((acc, entry) => {
    const key = entry.relationship || "Unspecified";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const commonState = topKey(states) || "-";
  const commonOutcome = topKey(outcomes) || "-";
  const commonRelationship = topKey(relationships) || "-";
  $("#metrics").innerHTML = [
    ["Entries", recent.length],
    ["Common state", commonState],
    ["Pattern", commonOutcome],
    ["Relationship", commonRelationship]
  ].map(([label, value]) => `<article class="metric"><span>${label}</span><strong>${value}</strong></article>`).join("");
}

function topKey(object) {
  return Object.entries(object).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function renderGames() {
  $("#game-list").innerHTML = games.map((game) => `
    <article class="game">
      <b>${game.name}</b>
      <p class="micro">${game.cue}</p>
      <p>${game.exit}</p>
    </article>
  `).join("");
}

function updateStrokeResult() {
  const positive = Number($("#positive-strokes").value || 0);
  const negative = Number($("#negative-strokes").value || 0);
  const balance = positive - negative;
  const message = balance >= 2
    ? "Your balance is strongly positive. Notice what kind of recognition felt most nourishing."
    : balance >= 0
      ? "Your balance is currently positive. Add one specific appreciation today."
      : "Your balance is negative today. Look for one safe, honest positive stroke to give or request.";
  $("#stroke-result").textContent = message;
}

function boot() {
  $("#daily-prompt").textContent = prompts[new Date().getDay() % prompts.length];
  renderLesson("ego");
  renderQuiz();
  renderEntries();
  renderGames();
  renderTaAccess();

  const strokes = loadJson(strokeKey, { positive: 3, negative: 1 });
  $("#positive-strokes").value = strokes.positive;
  $("#negative-strokes").value = strokes.negative;
  updateStrokeResult();

  const position = localStorage.getItem(positionKey) || "I'm OK - You're OK";
  setPosition(position);

  $$(".tab").forEach((tab) => tab.addEventListener("click", () => renderLesson(tab.dataset.lesson)));
  $("#quiz-options").addEventListener("click", (event) => {
    const button = event.target.closest("[data-quiz-choice]");
    if (button) chooseQuiz(button.dataset.quizChoice);
  });
  $("#load-example").addEventListener("click", () => {
    $("#conversation").value = "Manager: You never send the report on time.\nMe: I sent it at 4:45. What deadline should I use next week?";
    analyzeConversation($("#conversation").value);
  });
  $("#analyzer-form").addEventListener("submit", (event) => {
    event.preventDefault();
    analyzeConversation($("#conversation").value.trim());
  });
  $("#log-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const entries = getEntries();
    entries.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      relationship: $("#relationship").value.trim(),
      mine: $("#my-state").value,
      theirs: $("#their-state").value,
      outcome: $("#outcome").value,
      moment: $("#moment").value.trim(),
      createdAt: new Date().toISOString()
    });
    setEntries(entries);
    event.target.reset();
    $("#my-state").value = "Adult";
    $("#their-state").value = "Parent";
    $("#outcome").value = "Complementary";
    renderEntries();
  });
  $("#entry-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-entry]");
    if (!button) return;
    setEntries(getEntries().filter((entry) => entry.id !== button.dataset.deleteEntry));
    renderEntries();
  });
  $("#clear-log").addEventListener("click", () => {
    if (getEntries().length && window.confirm("Clear all local TA log entries from this browser?")) {
      setEntries([]);
      renderEntries();
    }
  });
  $("#life-quadrant").addEventListener("click", (event) => {
    const button = event.target.closest("[data-position]");
    if (button) setPosition(button.dataset.position);
  });
  ["positive-strokes", "negative-strokes"].forEach((id) => {
    $(`#${id}`).addEventListener("input", updateStrokeResult);
  });
  $("#save-strokes").addEventListener("click", () => {
    saveJson(strokeKey, {
      positive: Number($("#positive-strokes").value || 0),
      negative: Number($("#negative-strokes").value || 0),
      savedAt: new Date().toISOString()
    });
    updateStrokeResult();
  });
  $("#ta-checkout-button")?.addEventListener("click", async () => {
    try {
      await startTaCheckout();
    } catch (error) {
      setPaymentStatus(error.message || "Could not start Razorpay checkout.");
    }
  });
  $("#ta-trial-button")?.addEventListener("click", startTaTrial);
  $("#ta-coupon-button")?.addEventListener("click", async () => {
    try {
      await redeemTaCoupon();
    } catch (error) {
      setPaymentStatus(error.message || "Coupon could not be redeemed.");
    }
  });
}

function setPosition(position) {
  localStorage.setItem(positionKey, position);
  $$(".quad").forEach((button) => button.classList.toggle("active", button.dataset.position === position));
  const suggestion = position === "I'm OK - You're OK"
    ? "This is the strongest learning stance: clear about self, respectful toward the other."
    : "Adult practice: look for one fact that protects your dignity and one fact that preserves the other person's dignity.";
  $("#position-result").textContent = `Current position: ${position}. ${suggestion}`;
}

document.addEventListener("DOMContentLoaded", boot);
