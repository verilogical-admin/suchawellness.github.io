const skillAccessKey = "suchaEmpathyLabAccess.v1";
const skillPlanId = "empathy_lab_yearly_10000";
const skillProduct = "SuchaEmpathyLabPremium";

function readSkillAccess() {
  try {
    const access = JSON.parse(localStorage.getItem(skillAccessKey) || "null");
    if (!access) return null;
    if (access.expiresAt && Number(access.expiresAt) < Date.now()) return null;
    return access;
  } catch {
    localStorage.removeItem(skillAccessKey);
    return null;
  }
}

const hasSkillAccess = Boolean(readSkillAccess());
document.documentElement.classList.add(hasSkillAccess ? "sucha-skill-unlocked" : "sucha-skill-locked");

const lockStyle = document.createElement("style");
lockStyle.textContent = `
  html.sucha-skill-locked main > :not(.skill-access-gate) { display: none !important; }
  html.sucha-skill-locked .skill-access-gate { display: block; }
  .skill-access-gate {
    background: linear-gradient(180deg, #fffdf6 0%, #f5f2eb 100%);
    color: #17231f;
    min-height: calc(100svh - 72px);
    padding: clamp(2rem, 7vw, 5rem) clamp(1rem, 5vw, 4rem);
  }
  .skill-access-wrap { margin: 0 auto; max-width: 1080px; }
  .skill-access-grid { align-items: start; display: grid; gap: clamp(1rem, 4vw, 2.5rem); grid-template-columns: minmax(0, 1fr) minmax(280px, .72fr); }
  .skill-access-eyebrow { color: #2d7a6b; font-size: .78rem; font-weight: 950; letter-spacing: .14em; text-transform: uppercase; }
  .skill-access-gate h1 { color: #163f35; font-family: Georgia, "Times New Roman", serif; font-size: clamp(2.4rem, 7vw, 5.4rem); font-weight: 400; letter-spacing: 0; line-height: .98; margin: .55rem 0 1rem; }
  .skill-access-gate p { color: #58665f; font-size: clamp(1rem, 2vw, 1.16rem); line-height: 1.65; }
  .skill-teaser-list { display: grid; gap: .75rem; margin: 1.5rem 0 0; padding: 0; }
  .skill-teaser-list li { background: rgba(255,255,255,.78); border-left: 4px solid #2d7a6b; color: #3f4d48; display: block; font-weight: 850; line-height: 1.45; padding: .85rem 1rem; }
  .skill-access-panel { background: #173f36; box-shadow: 0 24px 70px rgba(22,63,53,.12); color: white; padding: clamp(1.2rem, 4vw, 2rem); }
  .skill-access-panel h2 { color: white; font-family: Georgia, "Times New Roman", serif; font-size: clamp(1.8rem, 4vw, 2.7rem); font-weight: 400; letter-spacing: 0; line-height: 1; margin: .5rem 0 1rem; }
  .skill-access-panel p { color: rgba(255,255,255,.78); font-size: .98rem; }
  .skill-access-field { display: grid; gap: .4rem; margin-top: .85rem; }
  .skill-access-field span { color: rgba(255,255,255,.78); font-size: .76rem; font-weight: 950; letter-spacing: .1em; text-transform: uppercase; }
  .skill-access-field input { background: rgba(255,255,255,.94); border: 1px solid rgba(255,255,255,.28); color: #17231f; font: inherit; min-height: 44px; padding: .75rem; width: 100%; }
  .skill-access-actions { display: grid; gap: .7rem; margin-top: 1rem; }
  .skill-access-button { background: #efc84a; border: 0; color: #173f36; cursor: pointer; font: inherit; font-weight: 950; min-height: 46px; padding: .8rem 1rem; text-transform: uppercase; }
  .skill-access-button.secondary { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.24); color: white; }
  .skill-access-status { color: rgba(255,255,255,.82) !important; font-size: .9rem !important; min-height: 1.4rem; }
  @media (max-width: 820px) { .skill-access-grid { grid-template-columns: 1fr; } .skill-access-button { width: 100%; } }
`;
document.head.append(lockStyle);

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function saveSkillAccess(access) {
  localStorage.setItem(skillAccessKey, JSON.stringify(access));
}

function labName() {
  const title = document.body?.dataset?.title || document.querySelector("h1")?.textContent || document.title || "Sucha Skill Lab";
  return title.replace(/\s*\|\s*Sucha.*$/i, "").trim();
}

function setSkillStatus(message) {
  const status = document.querySelector("#skill-access-status");
  if (status) status.textContent = message;
}

async function ensureSkillRazorpayLoaded() {
  if (typeof Razorpay !== "undefined") return true;
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(typeof Razorpay !== "undefined"), { once: true });
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

async function redeemSkillCoupon() {
  const email = normalizeEmail(document.querySelector("#skill-access-email")?.value);
  const code = String(document.querySelector("#skill-access-coupon")?.value || "").trim().toUpperCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid billing email.");
  if (!code) throw new Error("Enter a premium coupon code.");
  const button = document.querySelector("#skill-access-coupon-button");
  if (button) button.disabled = true;
  setSkillStatus("Checking coupon...");
  try {
    const response = await fetch("/api/empathy-lab/redeem-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email, product: skillProduct })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || "Coupon could not be redeemed.");
    saveSkillAccess({
      source: data.source || "admin_coupon",
      product: data.product || skillProduct,
      planId: data.planId || skillPlanId,
      email: data.email || email,
      couponHash: data.couponHash,
      redeemedAt: data.redeemedAt || Date.now(),
      expiresAt: data.expiresAt,
      accessDays: data.accessDays,
      price: "Coupon"
    });
    setSkillStatus("Coupon accepted. Opening the full Skill Lab module...");
    location.reload();
  } finally {
    if (button) button.disabled = false;
  }
}

async function startSkillCheckout() {
  if (location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    throw new Error("Open the live site to use Razorpay Checkout.");
  }
  const email = normalizeEmail(document.querySelector("#skill-access-email")?.value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid billing email.");
  const ready = await ensureSkillRazorpayLoaded();
  if (!ready) throw new Error("Razorpay Checkout could not load.");
  const button = document.querySelector("#skill-access-checkout-button");
  if (button) button.disabled = true;
  setSkillStatus("Opening secure checkout...");
  try {
    const orderResponse = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: skillPlanId, product: skillProduct, email, amountUsd: 10000 })
    });
    const checkout = await orderResponse.json().catch(() => ({}));
    if (!orderResponse.ok) throw new Error(checkout.error || "Could not create checkout.");
    const rz = new Razorpay({
      key: checkout.keyId,
      name: "Sucha Wellness",
      description: "Empathy + EQ Labs Premium - $10,000/year",
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
            planId: skillPlanId,
            product: skillProduct,
            email,
            checkoutMode: checkout.mode || "order",
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        const verified = await verifyResponse.json().catch(() => ({}));
        if (!verifyResponse.ok || verified.ok === false) throw new Error(verified.error || "Payment verification failed.");
        saveSkillAccess({
          source: verified.source || "razorpay_order",
          product: verified.product || skillProduct,
          planId: verified.planId || skillPlanId,
          email: verified.email || email,
          paymentId: verified.razorpayPaymentId || response.razorpay_payment_id,
          orderId: verified.razorpayOrderId || response.razorpay_order_id,
          purchasedAt: verified.purchasedAt || Date.now(),
          expiresAt: verified.expiresAt || checkout.expiresAt,
          guaranteeEndsAt: verified.guaranteeEndsAt || checkout.guaranteeEndsAt,
          price: verified.price || "$10,000/year"
        });
        location.reload();
      },
      modal: { ondismiss: () => { if (button) button.disabled = false; } }
    });
    rz.on("payment.failed", (event) => {
      if (button) button.disabled = false;
      setSkillStatus(`Razorpay payment failed: ${event.error?.description || "Try again."}`);
    });
    rz.open();
  } catch (error) {
    if (button) button.disabled = false;
    throw error;
  }
}

function renderSkillGate() {
  if (readSkillAccess()) {
    document.documentElement.classList.remove("sucha-skill-locked");
    document.documentElement.classList.add("sucha-skill-unlocked");
    return;
  }
  const main = document.querySelector("main");
  if (!main) return;
  const name = labName();
  const gate = document.createElement("section");
  gate.className = "skill-access-gate";
  gate.innerHTML = `
    <div class="skill-access-wrap">
      <div class="skill-access-grid">
        <div>
          <div class="skill-access-eyebrow">Premium Skill Lab teaser</div>
          <h1>${name}</h1>
          <p>This premium module is part of the Sucha Skill Lab. Visitors can see the outline, but the full lessons, scripts, builders, tabs, and saved practice tools require Empathy + EQ Labs Premium access.</p>
          <ul class="skill-teaser-list">
            <li>Outline preview: key topic, learning direction, and daily-practice promise.</li>
            <li>Premium unlock: full interactive lesson sections, scripts, builders, and practice reps.</li>
            <li>Access options: pay for Empathy + EQ Labs Premium or redeem a valid admin coupon.</li>
          </ul>
        </div>
        <aside class="skill-access-panel">
          <div class="skill-access-eyebrow">Unlock full module</div>
          <h2>Use premium access or coupon.</h2>
          <p>One Empathy + EQ Labs Premium unlock opens Empathy Lab, EQ Lab, and all premium Skill Lab modules in this browser.</p>
          <label class="skill-access-field"><span>Email</span><input id="skill-access-email" type="email" autocomplete="email" placeholder="you@example.com"></label>
          <label class="skill-access-field"><span>Coupon</span><input id="skill-access-coupon" type="text" autocomplete="off" placeholder="SUCHA-EL-XXXXXXXX"></label>
          <div class="skill-access-actions">
            <button class="skill-access-button" id="skill-access-coupon-button" type="button">Redeem Coupon</button>
            <button class="skill-access-button secondary" id="skill-access-checkout-button" type="button">Upgrade $10,000/year</button>
          </div>
          <p class="skill-access-status" id="skill-access-status">Premium access is required for the full Skill Lab module.</p>
          <p><a href="/skill-lab" style="color:#efc84a">Back to Skill Lab outline</a></p>
        </aside>
      </div>
    </div>
  `;
  main.replaceChildren(gate);
  document.querySelector("#skill-access-coupon-button")?.addEventListener("click", () => {
    redeemSkillCoupon().catch((error) => setSkillStatus(error.message || "Could not redeem coupon."));
  });
  document.querySelector("#skill-access-checkout-button")?.addEventListener("click", () => {
    startSkillCheckout().catch((error) => setSkillStatus(error.message || "Could not start checkout."));
  });
}

if (!hasSkillAccess) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSkillGate, { once: true });
  } else {
    renderSkillGate();
  }
}
