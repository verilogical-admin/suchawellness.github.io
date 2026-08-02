const empathyLabAccessKey = "suchaEmpathyLabAccess.v1";
const empathyLabProgressKey = "suchaEmpathyLabProgress.v1";
const empathyLabPlanId = "empathy_lab_yearly_1000";
const empathyLabProduct = "SuchaEmpathyLabPremium";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const modes = {
  cognitive: {
    label: "Cognitive empathy",
    lenses: [
      ["Facts", "What do we know without guessing?"],
      ["Thoughts", "What might they be thinking or assuming?"],
      ["Beliefs", "What rule or story may be guiding them?"],
      ["Check", "What question would test the read?"]
    ]
  },
  emotional: {
    label: "Emotional empathy",
    lenses: [
      ["Emotion cue", "What feeling is visible in words or behavior?"],
      ["Body clue", "What might posture, pace, or silence suggest?"],
      ["Intensity", "How strong might the feeling be?"],
      ["Careful mirror", "How can you reflect without claiming certainty?"]
    ]
  },
  compassionate: {
    label: "Compassionate empathy",
    lenses: [
      ["Need", "What support might be wanted?"],
      ["Consent", "Should you ask before helping?"],
      ["Boundary", "What help is yours to offer?"],
      ["Action", "What small next step is kind and realistic?"]
    ]
  },
  synchrony: {
    label: "Synchrony empathy",
    lenses: [
      ["Timing", "Are they fast, slow, delayed, or avoidant?"],
      ["Tone", "Does tone match the words?"],
      ["Rhythm", "Do they move toward, away, or around the issue?"],
      ["Adjustment", "Should you slow down, soften, clarify, or pause?"]
    ]
  }
};

const scenarios = [
  {
    title: "Late reply",
    text: "A friend replies after two days: \"Sorry, just busy.\" You feel brushed off.",
    model: {
      cognitive: "They may be overwhelmed, avoidant, unsure what to say, or genuinely busy. The fact is only that the reply was delayed.",
      emotional: "Possible feelings: guilt, tiredness, pressure, distance, or embarrassment.",
      compassionate: "A helpful response asks whether they need space or support without demanding immediate closeness.",
      synchrony: "The timing is delayed and the wording is short. That mismatch invites a gentle check, not a verdict."
    }
  },
  {
    title: "Quiet manager",
    text: "Your manager says, \"Fine, send it,\" but their tone is flat and they stop making eye contact.",
    model: {
      cognitive: "They may disagree, feel rushed, be thinking through risk, or be distracted by another pressure.",
      emotional: "Possible feelings: concern, irritation, fatigue, or guardedness.",
      compassionate: "You can offer a low-pressure check: \"I sense there may be a concern. Want me to revise anything before sending?\"",
      synchrony: "Words say yes, tone and eye contact suggest hesitation. The useful cue is mismatch."
    }
  },
  {
    title: "Partner says nothing",
    text: "Your partner says, \"Do whatever you want,\" then becomes quiet.",
    model: {
      cognitive: "They may feel unheard, may not want conflict, or may be testing whether their preference matters.",
      emotional: "Possible feelings: hurt, resignation, anger, fear of being too much.",
      compassionate: "Pause the decision and invite the hidden preference: \"I do care what you want. Can we slow down?\"",
      synchrony: "The phrase closes the topic, but silence keeps the emotion active."
    }
  },
  {
    title: "Client keeps changing details",
    text: "A client keeps adding small changes and says, \"This should only take a minute.\"",
    model: {
      cognitive: "They may underestimate effort, feel anxious about quality, or be avoiding a bigger revision conversation.",
      emotional: "Possible feelings: urgency, uncertainty, perfectionism, or pressure from someone else.",
      compassionate: "Help by creating clarity: \"I can do these changes. Let us group them and confirm scope.\"",
      synchrony: "Repeated small asks suggest the real need may be reassurance or control."
    }
  }
];

const roomScenarios = [
  {
    text: "In a meeting, someone says \"great idea\" quickly, looks down, and changes the subject.",
    cues: ["tone", "timing", "mismatch", "check"],
    explanation: "The words are positive, but speed, looking down, and topic change create a mismatch. A good read stays tentative."
  },
  {
    text: "A teammate asks many detailed questions after a new plan is announced by a senior leader.",
    cues: ["words", "context", "power", "need"],
    explanation: "Questions may signal resistance, but the power context matters. They may need safety, clarity, or permission to raise risk."
  },
  {
    text: "A friend laughs while describing something painful, then says, \"Anyway, it's stupid.\"",
    cues: ["tone", "mismatch", "need", "check"],
    explanation: "Humor and dismissal can protect vulnerability. Check gently instead of pushing."
  }
];

let currentMode = "cognitive";
let scenarioIndex = 0;
let roomIndex = 0;

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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function activeAccess() {
  const access = loadJson(empathyLabAccessKey, null);
  if (!access) return null;
  if (access.expiresAt && Number(access.expiresAt) < Date.now()) return null;
  return access;
}

function hasAccess() {
  return Boolean(activeAccess());
}

function setStatus(message) {
  const status = $("#empathy-lab-status");
  if (status) status.textContent = message;
}

function updateGate() {
  const access = activeAccess();
  $$("[data-premium-required]").forEach((section) => {
    section.classList.toggle("premium-locked", !access);
    section.querySelectorAll("input, textarea, select, button").forEach((control) => {
      control.disabled = !access;
    });
  });
  if (!access) {
    setStatus("Premium unlocks the interactive tools below.");
    return;
  }
  const date = access.expiresAt ? new Date(access.expiresAt).toLocaleDateString() : "";
  setStatus(`Empathy Lab Premium active${access.email ? ` for ${access.email}` : ""}${date ? ` until ${date}` : ""}.`);
  const checkout = $("#empathy-lab-checkout-button");
  if (checkout) {
    checkout.textContent = "Premium active";
    checkout.disabled = true;
  }
}

async function redeemCoupon() {
  const email = normalizeEmail($("#empathy-lab-email")?.value);
  const code = String($("#empathy-lab-coupon")?.value || "").trim().toUpperCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid billing email.");
  if (!code) throw new Error("Enter an Empathy Lab premium coupon code.");
  const button = $("#empathy-lab-coupon-button");
  button.disabled = true;
  setStatus("Checking Empathy Lab coupon...");
  try {
    const response = await fetch("/api/empathy-lab/redeem-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email, product: empathyLabProduct })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || "Coupon could not be redeemed.");
    saveJson(empathyLabAccessKey, {
      source: data.source || "admin_coupon",
      product: data.product || empathyLabProduct,
      planId: data.planId || empathyLabPlanId,
      email: data.email || email,
      couponHash: data.couponHash,
      redeemedAt: data.redeemedAt || Date.now(),
      expiresAt: data.expiresAt,
      accessDays: data.accessDays,
      price: "Coupon"
    });
    $("#empathy-lab-coupon").value = "";
    updateGate();
  } finally {
    button.disabled = false;
  }
}

async function ensureRazorpayLoaded() {
  if (typeof Razorpay !== "undefined") return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(typeof Razorpay !== "undefined");
    script.onerror = () => resolve(false);
    document.head.append(script);
    window.setTimeout(() => resolve(typeof Razorpay !== "undefined"), 7000);
  });
}

async function startCheckout() {
  if (location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    throw new Error("Open the live site to use Razorpay Checkout.");
  }
  const email = normalizeEmail($("#empathy-lab-email")?.value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid billing email.");
  const ready = await ensureRazorpayLoaded();
  if (!ready) throw new Error("Razorpay Checkout could not load.");
  const button = $("#empathy-lab-checkout-button");
  button.disabled = true;
  setStatus("Opening secure Razorpay checkout...");
  try {
    const orderResponse = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: empathyLabPlanId, product: empathyLabProduct, email, amountUsd: 1000 })
    });
    const checkout = await orderResponse.json().catch(() => ({}));
    if (!orderResponse.ok) throw new Error(checkout.error || "Could not create checkout.");
    const rz = new Razorpay({
      key: checkout.keyId,
      name: "Sucha™ Wellness",
      description: "Empathy Lab Premium - $1000/year",
      amount: checkout.amount,
      currency: checkout.currency || "USD",
      order_id: checkout.orderId,
      prefill: { email },
      theme: { color: "#2f7d70" },
      handler: async (response) => {
        const verifyResponse = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: empathyLabPlanId,
            product: empathyLabProduct,
            email,
            checkoutMode: checkout.mode || "order",
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        const verified = await verifyResponse.json().catch(() => ({}));
        if (!verifyResponse.ok || verified.ok === false) throw new Error(verified.error || "Payment verification failed.");
        saveJson(empathyLabAccessKey, {
          source: verified.source || "razorpay_order",
          product: verified.product || empathyLabProduct,
          planId: verified.planId || empathyLabPlanId,
          email: verified.email || email,
          paymentId: verified.razorpayPaymentId || response.razorpay_payment_id,
          orderId: verified.razorpayOrderId || response.razorpay_order_id,
          purchasedAt: verified.purchasedAt || Date.now(),
          expiresAt: verified.expiresAt || checkout.expiresAt,
          guaranteeEndsAt: verified.guaranteeEndsAt || checkout.guaranteeEndsAt,
          price: verified.price || "$1000/year"
        });
        updateGate();
      },
      modal: { ondismiss: () => { button.disabled = false; updateGate(); } }
    });
    rz.on("payment.failed", (event) => {
      button.disabled = false;
      setStatus(`Razorpay payment failed: ${event.error?.description || "Try again."}`);
    });
    rz.open();
  } catch (error) {
    button.disabled = false;
    throw error;
  }
}

function renderScenario() {
  const scenario = scenarios[scenarioIndex % scenarios.length];
  const mode = modes[currentMode];
  $("#mode-label").textContent = mode.label;
  $("#scenario-title").textContent = scenario.title;
  $("#scenario-text").textContent = scenario.text;
  $("#lens-grid").innerHTML = mode.lenses.map(([title, copy]) => `
    <article class="lens-card"><b>${title}</b><span>${copy}</span></article>
  `).join("");
  $("#practice-result").textContent = "Write your read, then score it.";
}

function revealModelRead() {
  const scenario = scenarios[scenarioIndex % scenarios.length];
  $("#practice-result").innerHTML = `<strong>Model ${modes[currentMode].label.toLowerCase()} read:</strong> ${escapeHtml(scenario.model[currentMode])}`;
}

function scorePractice() {
  const first = $("#first-read").value.trim();
  const alternatives = $("#alt-reads").value.trim();
  const question = $("#check-question").value.trim();
  const altCount = alternatives.split(/\n+/).filter(Boolean).length;
  let score = 0;
  if (first.length > 12) score += 1;
  if (altCount >= 2) score += 2;
  if (/\?|wonder|might|could|maybe|may be|possible/i.test(question)) score += 2;
  if (/\b(always|never|obvious|clearly|definitely|they are|he is|she is)\b/i.test(first)) score -= 1;
  score = Math.max(0, Math.min(5, score));
  const message = score >= 4
    ? "Strong practice. You created alternatives and used a check-it question instead of certainty."
    : score >= 2
      ? "Good start. Add more alternative hypotheses and make your checking question gentler."
      : "Slow down the first read. Separate facts from assumptions, then create at least three possibilities.";
  const progress = loadJson(empathyLabProgressKey, []);
  progress.push({ mode: currentMode, score, createdAt: new Date().toISOString() });
  saveJson(empathyLabProgressKey, progress.slice(-100));
  $("#practice-result").innerHTML = `<strong>Practice score: ${score}/5.</strong> ${message}`;
}

function renderRoom() {
  const room = roomScenarios[roomIndex % roomScenarios.length];
  $("#room-scenario").textContent = room.text;
  const cues = ["words", "tone", "timing", "mismatch", "context", "power", "need", "check"];
  $("#cue-options").innerHTML = cues.map((cue) => (
    `<button class="choice" type="button" data-cue="${cue}">${cue[0].toUpperCase()}${cue.slice(1)}</button>`
  )).join("");
  $$(".cue-pill").forEach((pill) => pill.classList.remove("active"));
  $("#cue-result").textContent = "Select the cues you would pay attention to.";
}

function checkCues() {
  const room = roomScenarios[roomIndex % roomScenarios.length];
  const selected = $$("[data-cue].selected").map((button) => button.dataset.cue);
  const hits = selected.filter((cue) => room.cues.includes(cue)).length;
  const misses = room.cues.filter((cue) => !selected.includes(cue));
  $$(".cue-pill").forEach((pill) => {
    pill.classList.toggle("active", room.cues.includes(pill.dataset.cuePill));
  });
  $("#cue-result").innerHTML = `<strong>${hits}/${room.cues.length} key cues noticed.</strong> ${escapeHtml(room.explanation)} ${misses.length ? `Also look for: ${misses.join(", ")}.` : "You caught the main cue pattern."}`;
}

function scoreText(text) {
  const fields = {
    cognitive: ["think", "assume", "believe", "expect", "mean", "intend", "because", "maybe", "might", "possible"],
    emotional: ["feel", "hurt", "sad", "angry", "anxious", "afraid", "shame", "guilt", "tired", "overwhelmed"],
    compassionate: ["help", "support", "need", "care", "offer", "ask", "boundary", "space", "safe", "next step"],
    synchrony: ["tone", "timing", "pause", "silence", "eye", "body", "fast", "slow", "short", "mismatch"]
  };
  const lower = text.toLowerCase();
  return Object.fromEntries(Object.entries(fields).map(([key, words]) => [
    key,
    words.reduce((sum, word) => sum + (lower.match(new RegExp(`\\b${word}\\b`, "g"))?.length || 0), 0)
  ]));
}

function analyzeRealSituation() {
  const text = $("#real-text").value.trim();
  const scores = scoreText(text);
  const max = Math.max(1, ...Object.values(scores));
  Object.entries(scores).forEach(([key, value]) => {
    $(`#score-${key}`).textContent = value;
    $(`#meter-${key}`).style.width = `${Math.round((value / max) * 100)}%`;
  });
  const hasCertainty = /\b(always|never|obvious|clearly|definitely|I know they|they just)\b/i.test(text);
  const hasMismatch = /\b(but|however|although|tone|silence|paused|looked away|short reply)\b/i.test(text);
  const likelyFocus = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "cognitive";
  const check = hasMismatch
    ? "I may be reading this wrong, but I noticed the words and tone did not fully match. Is there something you are hesitant about?"
    : "I may be wrong, but I want to understand your side better. What is most important for you here?";
  $("#real-result").innerHTML = `
    <p><strong>Likely training focus:</strong> ${modes[likelyFocus].label}.</p>
    <p><strong>Reading risk:</strong> ${hasCertainty ? "Your wording contains high-certainty assumptions. Convert them into hypotheses before responding." : "Your read leaves room for uncertainty, which is good empathy practice."}</p>
    <p><strong>Cue note:</strong> ${hasMismatch ? "There may be a mismatch cue. Notice tone/timing alongside the words." : "Add more context, tone, timing, or body cues for a stronger read."}</p>
    <p><strong>Check-it response:</strong> ${check}</p>
  `;
}

function boot() {
  updateGate();
  renderScenario();
  renderRoom();

  $$(".tool-tab").forEach((button) => button.addEventListener("click", () => {
    currentMode = button.dataset.mode;
    $$(".tool-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    renderScenario();
  }));
  $("#next-scenario").addEventListener("click", () => {
    scenarioIndex += 1;
    renderScenario();
  });
  $("#reveal-model").addEventListener("click", revealModelRead);
  $("#score-practice").addEventListener("click", scorePractice);
  $("#cue-options").addEventListener("click", (event) => {
    const button = event.target.closest("[data-cue]");
    if (button) button.classList.toggle("selected");
  });
  $("#check-cues").addEventListener("click", checkCues);
  $("#next-room").addEventListener("click", () => {
    roomIndex += 1;
    renderRoom();
  });
  $("#analyze-real").addEventListener("click", analyzeRealSituation);
  $("#empathy-lab-coupon-button").addEventListener("click", () => {
    redeemCoupon().catch((error) => setStatus(error.message || "Coupon could not be redeemed."));
  });
  $("#empathy-lab-checkout-button").addEventListener("click", () => {
    startCheckout().catch((error) => setStatus(error.message || "Could not start checkout."));
  });
}

document.addEventListener("DOMContentLoaded", boot);
