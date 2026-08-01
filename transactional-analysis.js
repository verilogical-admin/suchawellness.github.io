const storageKey = "suchaTaEntries.v1";
const strokeKey = "suchaTaStrokes.v1";
const positionKey = "suchaTaLifePosition.v1";
const taAccessKey = "suchaTaSupporterAccess.v1";
const quizHistoryKey = "suchaTaQuizHistory.v1";
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

const practiceBanks = {
  ego: {
    title: "Spot the ego state",
    prompt: "Choose the state that best fits the sentence.",
    options: ["Parent", "Adult", "Child"],
    items: [
      { text: "You always do this. You should know better by now.", answer: "Parent", why: "The sentence leans on judgment, absolutes, and rule enforcement." },
      { text: "What deadline did we agree on, and what changed this week?", answer: "Adult", why: "It asks for observable facts and shared reality." },
      { text: "I hate this. Nobody listens to me anyway.", answer: "Child", why: "The sentence carries hurt, protest, and global feeling." },
      { text: "Let's pause for five minutes and come back with two options.", answer: "Adult", why: "It creates structure, timing, and options." },
      { text: "Fine, I'll just do everything myself.", answer: "Child", why: "It sounds like adaptation, resentment, and indirect protest." },
      { text: "What do you need from me before Friday?", answer: "Adult", why: "It asks a specific present-focused question without blame." },
      { text: "A good team member would not question this.", answer: "Parent", why: "It uses a rule and moral pressure instead of shared evidence." },
      { text: "Can we separate the facts from the frustration for a minute?", answer: "Adult", why: "It invites reality testing while acknowledging emotion." },
      { text: "Please don't be angry. I'll do whatever you want.", answer: "Child", why: "It carries compliance, fear, and a wish to avoid disapproval." },
      { text: "That is unacceptable. This is the standard here.", answer: "Parent", why: "It speaks from authority, rules, and evaluation." },
      { text: "I want to say no, and I am nervous about your reaction.", answer: "Child", why: "It directly names desire and feeling from the Child state." },
      { text: "Let's define the next action, owner, and time.", answer: "Adult", why: "It converts tension into observable agreements." },
      { text: "You are being dramatic again.", answer: "Parent", why: "It labels and judges the other person from a one-up position." },
      { text: "This feels unfair, and I need a minute.", answer: "Child", why: "It expresses feeling and need without yet moving into problem solving." },
      { text: "What would make this conversation useful for both of us?", answer: "Adult", why: "It checks purpose and mutual usefulness in the present." },
      { text: "When I was your age, we did not complain like this.", answer: "Parent", why: "It borrows tradition and comparison as authority." },
      { text: "I forgot the attachment. I can send it now or at 3 pm.", answer: "Adult", why: "It owns a fact and offers practical options." },
      { text: "Nobody ever chooses me for the important work.", answer: "Child", why: "It carries hurt, globalizing language, and a wish to be seen." },
      { text: "You must apologize before we continue.", answer: "Parent", why: "It sets a rule from authority rather than negotiating a process." }
    ]
  },
  transactions: {
    title: "Spot the transaction",
    prompt: "Choose the transaction pattern in this exchange.",
    options: ["Complementary", "Crossed", "Ulterior"],
    items: [
      { text: "A: What time is the client call?\nB: It starts at 3:00, and the notes are in the drive.", answer: "Complementary", why: "The Adult question receives an Adult factual answer, so the channel stays open." },
      { text: "A: Did you send the invoice?\nB: Why are you always checking on me?", answer: "Crossed", why: "An Adult request for information receives a defensive Child or Parent response, crossing the expected channel." },
      { text: "A: Nice of you to finally join us.\nB: I was only five minutes late.", answer: "Ulterior", why: "The surface message sounds polite, but the psychological message carries criticism." },
      { text: "A: Can we agree on one next step?\nB: Yes. I will draft it and send it by 6.", answer: "Complementary", why: "Both people stay in Adult: specific request, specific agreement." },
      { text: "A: The report has two missing numbers.\nB: You think I am useless, don't you?", answer: "Crossed", why: "A specific Adult observation is received as a global emotional judgment." },
      { text: "A: If you really cared about the team, you would stay late.\nB: I can stay thirty minutes, not two hours.", answer: "Ulterior", why: "The social request is about staying late, while the hidden psychological message pressures loyalty." },
      { text: "A: Please close the door.\nB: Sure, closing it now.", answer: "Complementary", why: "A simple request gets the expected simple response." },
      { text: "A: What changed since yesterday?\nB: Stop acting like my parent.", answer: "Crossed", why: "A fact-finding Adult prompt receives a reactive response to perceived authority." },
      { text: "A: I suppose some people need reminders.\nB: I saw the reminder and will finish by noon.", answer: "Ulterior", why: "The wording carries a hidden one-up criticism beneath a practical reminder." },
      { text: "A: I need quiet for ten minutes.\nB: Okay. I will come back at 2:10.", answer: "Complementary", why: "A clear need receives a clear agreement without escalation." }
    ]
  },
  games: {
    title: "Spot the game",
    prompt: "Choose the likely game pattern.",
    options: ["Why Don't You, Yes But", "Now I've Got You", "If It Weren't For You", "See What You Made Me Do"],
    items: [
      { text: "Someone asks for advice, then rejects every option: too expensive, too hard, too late, too risky.", answer: "Why Don't You, Yes But", why: "The invitation looks like problem solving, but each solution is defeated to preserve the stuck position." },
      { text: "A small typo becomes proof that the whole project and the person behind it are careless.", answer: "Now I've Got You", why: "A minor error is used as a character trial or emotional victory." },
      { text: "I could have built my career, but my partner needed too much from me.", answer: "If It Weren't For You", why: "A life limitation is placed entirely on another person instead of separating constraints from choices." },
      { text: "I shouted because you made me so angry.", answer: "See What You Made Me Do", why: "Responsibility for one's action is shifted onto the other person." },
      { text: "Every suggestion is met with, yes, but my situation is different.", answer: "Why Don't You, Yes But", why: "The payoff is often proving there is no workable help while still receiving attention." },
      { text: "The person waits for a mistake, then pounces: I knew you could not be trusted.", answer: "Now I've Got You", why: "The emotional prize is catching the other person out." },
      { text: "If my boss were not so demanding, I would finally start the course I keep postponing.", answer: "If It Weren't For You", why: "The obstacle may be real, but the pattern gives all agency to the obstacle." },
      { text: "I missed the deadline because you kept asking questions.", answer: "See What You Made Me Do", why: "It avoids ownership by making another person's behavior the cause of one's choice." }
    ]
  },
  strokes: {
    title: "Spot the stroke",
    prompt: "Choose the type of recognition being given.",
    options: ["Positive conditional", "Positive unconditional", "Negative conditional", "Negative unconditional"],
    items: [
      { text: "Your summary was clear and useful.", answer: "Positive conditional", why: "The recognition is positive and tied to a specific behavior or output." },
      { text: "I am glad you are here.", answer: "Positive unconditional", why: "The recognition is positive and offered to the person, not earned by performance." },
      { text: "This draft missed the agreed format.", answer: "Negative conditional", why: "The feedback is negative but focused on a specific behavior or result." },
      { text: "You are hopeless.", answer: "Negative unconditional", why: "The negative recognition targets the person's worth, not a specific action." },
      { text: "Thanks for staying calm in that meeting.", answer: "Positive conditional", why: "It appreciates a specific response in a specific context." },
      { text: "You matter to me, even when the day is messy.", answer: "Positive unconditional", why: "It offers warm recognition independent of performance." },
      { text: "The numbers in section two need correction.", answer: "Negative conditional", why: "It names a problem in the work without making the person bad." },
      { text: "Nobody can rely on you.", answer: "Negative unconditional", why: "It globalizes the person as unreliable instead of naming one missed agreement." },
      { text: "I like how you asked before deciding.", answer: "Positive conditional", why: "The positive stroke is connected to an observable behavior." },
      { text: "You are welcome here.", answer: "Positive unconditional", why: "It recognizes belonging without a task attached." }
    ]
  }
};

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

let currentLesson = "ego";
const quizIndexes = { ego: 0, transactions: 0, games: 0, strokes: 0 };
let selectedQuiz = "";
let quizAnswered = false;

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
  const lesson = lessons[name] || lessons.ego;
  currentLesson = lessons[name] ? name : "ego";
  $("#lesson-title").textContent = lesson.title;
  $("#lesson-body").innerHTML = lesson.body.map((item) => `<p>${item}</p>`).join("");
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.lesson === currentLesson));
  renderQuiz();
}

function renderQuiz() {
  const bank = practiceBanks[currentLesson] || practiceBanks.ego;
  const index = quizIndexes[currentLesson] || 0;
  const item = bank.items[index % bank.items.length];
  selectedQuiz = "";
  quizAnswered = false;
  $("#quiz-title").textContent = bank.title;
  $("#quiz-line").textContent = item.text;
  $("#quiz-result").textContent = bank.prompt;
  $("#quiz-next").disabled = true;
  $("#quiz-options").innerHTML = bank.options.map((state) => (
    `<button class="choice" type="button" data-quiz-choice="${escapeHtml(state)}">${escapeHtml(state)}</button>`
  )).join("");
}

function chooseQuiz(state) {
  if (quizAnswered) return;
  const bank = practiceBanks[currentLesson] || practiceBanks.ego;
  const index = quizIndexes[currentLesson] || 0;
  const item = bank.items[index % bank.items.length];
  selectedQuiz = state;
  const correct = state === item.answer;
  quizAnswered = true;
  $$("[data-quiz-choice]").forEach((button) => button.classList.toggle("selected", button.dataset.quizChoice === state));
  $$("[data-quiz-choice]").forEach((button) => {
    button.disabled = true;
    if (button.dataset.quizChoice === item.answer) button.classList.add("selected");
  });
  $("#quiz-result").innerHTML = correct
    ? `<strong>Correct: ${item.answer}.</strong> ${item.why}`
    : `<strong>Your answer: ${state}. Correct answer: ${item.answer}.</strong> ${item.why}`;
  $("#quiz-next").disabled = false;
  saveQuizAttempt({
    topic: bank.title,
    question: item.text,
    selected: state,
    correctAnswer: item.answer,
    correct,
    explanation: item.why
  });
}

function saveQuizAttempt(attempt) {
  const history = loadJson(quizHistoryKey, []);
  history.push({ ...attempt, answeredAt: new Date().toISOString() });
  saveJson(quizHistoryKey, history.slice(-200));
}

const reportTopics = [
  { topic: "Spot the ego state", heading: "Ego States" },
  { topic: "Spot the transaction", heading: "Transactions" },
  { topic: "Spot the game", heading: "Games" },
  { topic: "Spot the stroke", heading: "Strokes" }
];

function scoreSummary(items) {
  const total = items.length;
  const correct = items.filter((item) => item.correct).length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  return { total, correct, percent };
}

function reportDonut(percent) {
  const review = 100 - percent;
  return `
    <svg class="donut" viewBox="0 0 120 120" role="img" aria-label="${percent}% correct">
      <circle class="donut-bg" cx="60" cy="60" r="44"></circle>
      <circle class="donut-ring" cx="60" cy="60" r="44" pathLength="100" stroke-dasharray="${percent} ${review}"></circle>
      <text x="60" y="65" text-anchor="middle">${percent}%</text>
    </svg>
  `;
}

function renderReportRows(items, emptyText) {
  if (!items.length) return `<p class="empty-report">${emptyText}</p>`;
  return items.map((item, index) => `
    <article class="qa-card ${item.correct ? "is-correct" : "is-review"}">
      <div class="qa-number">${index + 1}</div>
      <div>
        <h3>${escapeHtml(item.question)}</h3>
        <dl>
          <div><dt>Your answer</dt><dd>${escapeHtml(item.selected)}</dd></div>
          <div><dt>Correct answer</dt><dd>${escapeHtml(item.correctAnswer)}</dd></div>
          <div><dt>Result</dt><dd><span class="result-chip">${item.correct ? "Correct" : "Review"}</span></dd></div>
          <div><dt>Answered</dt><dd>${escapeHtml(new Date(item.answeredAt).toLocaleString())}</dd></div>
        </dl>
        <div class="explanation"><span>Explanation</span><p>${escapeHtml(item.explanation)}</p></div>
      </div>
    </article>
  `).join("");
}

function downloadQuizHistory() {
  if (!hasTaAccess()) {
    $("#quiz-result").innerHTML = "<strong>Premium feature.</strong> Start a trial, redeem a coupon, or upgrade to download your TA quiz Q&A.";
    return;
  }
  const history = loadJson(quizHistoryKey, []);
  if (!history.length) {
    $("#quiz-result").innerHTML = "<strong>No answers yet.</strong> Answer a few questions, then download your Q&A reflection file.";
    return;
  }
  const overall = scoreSummary(history);
  const groupedSections = reportTopics.map((group) => {
    const items = history.filter((item) => (item.topic || "Spot the ego state") === group.topic);
    const summary = scoreSummary(items);
    return `
      <section class="topic-section">
        <div class="topic-heading">
          <div>
            <p class="eyebrow">Core learning</p>
            <h2>${group.heading}</h2>
          </div>
          <div class="topic-score">
            ${reportDonut(summary.percent)}
            <div><strong>${summary.correct}/${summary.total}</strong><span>correct</span></div>
          </div>
        </div>
        ${renderReportRows(items, `No ${group.heading.toLowerCase()} answers yet.`)}
      </section>
    `;
  }).join("");
  const logoMark = `
    <svg class="brand-mark" viewBox="0 0 72 72" role="img" aria-label="Sucha Wellness logo">
      <defs>
        <linearGradient id="logoGradient" x1="12" x2="62" y1="10" y2="64" gradientUnits="userSpaceOnUse">
          <stop stop-color="#2f7d70"></stop>
          <stop offset="1" stop-color="#c79a4b"></stop>
        </linearGradient>
      </defs>
      <circle cx="36" cy="36" r="34" fill="#fffdfa" stroke="url(#logoGradient)" stroke-width="3"></circle>
      <path d="M22 42c7 10 23 10 29-1 4-8-2-15-11-14-8 1-13-2-12-7" fill="none" stroke="#2f7d70" stroke-width="5" stroke-linecap="round"></path>
      <path d="M25 50c8 4 18 4 25-2" fill="none" stroke="#c79a4b" stroke-width="3" stroke-linecap="round"></path>
    </svg>
  `;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TA Lab Q&A Reflection | Sucha™ Wellness</title>
<style>
  * { box-sizing: border-box; }
  body { background: #f7f2e8; color: #18231f; font-family: Inter, Arial, sans-serif; line-height: 1.55; margin: 0; padding: 32px; }
  .document { background: #fffdfa; border: 1px solid rgba(33,91,79,.18); margin: 0 auto; max-width: 920px; padding: 34px; }
  .brand { align-items: center; border-bottom: 1px solid rgba(33,91,79,.18); display: flex; gap: 14px; padding-bottom: 22px; }
  .brand-mark { flex: 0 0 auto; height: 62px; width: 62px; }
  .brand-title { color: #163f35; font-family: Georgia, serif; font-size: 30px; line-height: 1; }
  .brand-subtitle { color: #657067; font-size: 13px; letter-spacing: .12em; margin-top: 5px; text-transform: uppercase; }
  h1 { color: #163f35; font-family: Georgia, serif; font-size: 46px; font-weight: 400; line-height: 1; margin: 32px 0 8px; }
  .meta { color: #657067; margin: 0 0 22px; }
  .website { color: #3a5049; display: flex; flex-wrap: wrap; gap: 8px 18px; margin: 0 0 22px; }
  .website a { color: #1f6b5e; font-weight: 700; text-decoration: none; }
  .score { background: #dcefe9; border: 1px solid rgba(47,125,112,.2); display: grid; gap: 14px; grid-template-columns: 120px repeat(3, 1fr); margin: 24px 0; padding: 18px; }
  .score span { color: #4d5a54; display: block; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
  .score strong { color: #163f35; display: block; font-family: Georgia, serif; font-size: 28px; font-weight: 400; }
  .donut { height: 104px; overflow: visible; width: 104px; }
  .donut-bg { fill: none; stroke: #edf7f3; stroke-width: 16; }
  .donut-ring { fill: none; stroke: #2f7d70; stroke-linecap: round; stroke-width: 16; transform: rotate(-90deg); transform-origin: 60px 60px; }
  .donut text { fill: #163f35; font-family: Georgia, serif; font-size: 22px; }
  .topic-section { border-top: 1px solid rgba(33,91,79,.2); padding: 30px 0 4px; }
  .topic-heading { align-items: center; display: flex; gap: 18px; justify-content: space-between; margin-bottom: 8px; }
  .topic-heading h2 { color: #163f35; font-family: Georgia, serif; font-size: 34px; font-weight: 400; margin: 0; }
  .eyebrow { color: #657067; font-size: 12px; font-weight: 700; letter-spacing: .12em; margin: 0 0 4px; text-transform: uppercase; }
  .topic-score { align-items: center; display: flex; gap: 12px; }
  .topic-score strong { color: #163f35; display: block; font-family: Georgia, serif; font-size: 28px; font-weight: 400; }
  .topic-score span { color: #657067; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
  .qa-card { background: linear-gradient(135deg, rgba(220,239,233,.95), rgba(255,250,239,.96)); border: 1px solid rgba(33,91,79,.14); border-left: 7px solid #2f7d70; box-shadow: 0 14px 34px rgba(22,63,53,.08); display: grid; gap: 18px; grid-template-columns: 44px 1fr; margin: 18px 0; overflow: hidden; padding: 22px; position: relative; }
  .qa-card::before { background: radial-gradient(circle at 14px 14px, rgba(199,154,75,.16) 0 2px, transparent 3px); background-size: 22px 22px; content: ""; inset: 0; opacity: .55; pointer-events: none; position: absolute; }
  .qa-card > * { position: relative; }
  .qa-card.is-review { background: linear-gradient(135deg, rgba(255,241,219,.98), rgba(255,250,239,.96)); border-left-color: #c79a4b; }
  .qa-number { align-items: center; background: #2f7d70; border-radius: 50%; box-shadow: 0 8px 18px rgba(22,63,53,.16); color: #fff; display: flex; font-weight: 700; height: 38px; justify-content: center; width: 38px; }
  .is-review .qa-number { background: #b9812f; }
  h3 { color: #18231f; font-size: 20px; margin: 0 0 12px; }
  dl { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0 0 14px; }
  dl div { background: rgba(255,253,250,.72); border: 1px solid rgba(33,91,79,.1); padding: 10px 12px; }
  dt { color: #657067; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
  dd { margin: 2px 0 0; }
  .result-chip { background: #2f7d70; color: #fff; display: inline-block; font-size: 12px; font-weight: 800; letter-spacing: .08em; padding: 4px 9px; text-transform: uppercase; }
  .is-review .result-chip { background: #b9812f; }
  .explanation { background: linear-gradient(135deg, rgba(255,253,250,.9), rgba(236,247,243,.92)); border: 1px solid rgba(47,125,112,.18); padding: 14px 16px; }
  .explanation span { color: #1f6b5e; display: block; font-size: 12px; font-weight: 800; letter-spacing: .12em; margin-bottom: 5px; text-transform: uppercase; }
  .explanation p { margin: 0; }
  .is-review .explanation { background: linear-gradient(135deg, rgba(255,253,250,.92), rgba(255,243,223,.94)); border-color: rgba(199,154,75,.24); }
  .is-review .explanation span { color: #986a27; }
  .empty-report { color: #657067; margin: 12px 0 24px; }
  .signature { border-top: 1px solid rgba(33,91,79,.18); margin-top: 28px; padding-top: 22px; }
  .signature-name { color: #163f35; font-family: Georgia, serif; font-size: 26px; }
  .disclaimer { color: #657067; font-size: 13px; margin-top: 18px; }
  @media (max-width: 720px) { body { padding: 16px; } .document { padding: 22px; } .score { grid-template-columns: 1fr; } .topic-heading { align-items: flex-start; flex-direction: column; } dl { grid-template-columns: 1fr; } }
  @media print { body { background: #fff; padding: 0; } .document { border: 0; } }
</style>
</head>
<body>
<main class="document">
  <header class="brand">
    ${logoMark}
    <div>
      <div class="brand-title">Sucha™ Wellness</div>
      <div class="brand-subtitle">TA Lab Premium Reflection</div>
    </div>
  </header>
  <h1>TA Lab Q&amp;A Reflection</h1>
  <p class="meta">Downloaded ${escapeHtml(new Date().toLocaleString())}. This report captures your local quiz answers and the learning explanations shown in TA Lab.</p>
  <p class="website"><span>Website: <a href="https://www.suchawellness.com">www.suchawellness.com</a></span><span>TA Lab: <a href="https://www.suchawellness.com/transactional-analysis">suchawellness.com/transactional-analysis</a></span><span>Support: support@suchawellness.com</span></p>
  <section class="score">
    <div>${reportDonut(overall.percent)}</div>
    <div><span>Overall score</span><strong>${overall.correct}/${overall.total}</strong></div>
    <div><span>Accuracy</span><strong>${overall.percent}%</strong></div>
    <div><span>Questions</span><strong>${overall.total}</strong></div>
  </section>
  ${groupedSections}
  <footer class="signature">
    <div class="signature-name">Sucha™ Wellness</div>
    <p>Digitally prepared by TA Lab Premium</p>
    <p class="disclaimer">Educational reflection only. This document is not therapy, diagnosis, medical advice, or a substitute for care from a qualified professional.</p>
  </footer>
</main>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sucha-ta-lab-qa-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
  $("#quiz-next").addEventListener("click", () => {
    quizIndexes[currentLesson] = (quizIndexes[currentLesson] || 0) + 1;
    renderQuiz();
  });
  $("#quiz-download").addEventListener("click", downloadQuizHistory);
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
