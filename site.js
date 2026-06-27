function addReadabilityStyles() {
  document.querySelector('#sucha-readability-styles')?.remove();

  const style = document.createElement('style');
  style.id = 'sucha-readability-styles';
  style.textContent = `
    :root {
      --text: #171717;
      --muted: #4E534A;
      --body-copy: 1rem;
      --mobile-copy: 1.03rem;
    }
    body {
      color: var(--text);
      font-weight: 400;
      line-height: 1.75;
    }
    .nav-links a { color: #3f463f; }
    .hero h1,
    .section-title { font-weight: 400; }
    .hero-sub,
    .section-subtitle,
    .step-body,
    .why-body,
    .screening-card-desc,
    .inline-test-desc,
    .test-item-desc,
    .score-note,
    .test-disclaimer,
    .journal-sidebar p,
    .journal-note,
    .journal-empty,
    .journal-entry-preview,
    .journal-entry-meta {
      color: var(--muted);
      font-size: var(--body-copy);
      font-weight: 400;
    }
    .inline-options label,
    .rating-options label,
    .rating-label,
    .journal-stat span {
      font-weight: 500;
    }
    .journal-search,
    .journal-composer input,
    .journal-composer textarea,
    .journal-composer select {
      color: var(--text);
      font-size: 1rem;
      font-weight: 400;
    }
    .password-visibility-wrap {
      position: relative;
      min-width: 0;
    }
    .password-visibility-wrap input {
      width: 100%;
      padding-right: 3rem;
    }
    .password-visibility-toggle {
      align-items: center;
      background: transparent;
      border: 0;
      color: #2D7A6B;
      display: inline-flex;
      height: 42px;
      justify-content: center;
      min-height: 0;
      padding: 0;
      position: absolute;
      right: 0.15rem;
      top: 50%;
      transform: translateY(-50%);
      width: 42px;
    }
    .password-visibility-toggle svg {
      height: 19px;
      width: 19px;
    }
    @media (max-width: 640px) {
      body {
        color: #141414;
        line-height: 1.78;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      .section-title,
      .hero h1,
      .inline-test-title,
      .test-item-title,
      .journal-sidebar h3,
      .journal-panel h3 {
        color: #1f423c;
        font-weight: 500;
      }
      .hero-sub,
      .section-subtitle,
      .step-body,
      .why-body,
      .screening-card-desc,
      .inline-test-desc,
      .test-item-desc,
      .score-note,
      .test-disclaimer,
      .journal-sidebar p,
      .journal-note,
      .journal-empty,
      .journal-entry-preview,
      .journal-entry-meta {
        color: #373d36;
        font-size: var(--mobile-copy);
        line-height: 1.75;
      }
      .screening-card {
        background: rgba(255,255,255,0.74);
        min-height: 0;
      }
      .inline-options label,
      .rating-options label {
        color: #2f3935;
        font-size: 0.82rem;
      }
      .screening-card-tag,
      .screening-card-action,
      .score-label,
      .journal-stat span {
        color: #245e54;
      }
    }
  `;
  document.head.append(style);
}

addReadabilityStyles();

function addPasswordVisibilityToggle(input, label = 'password') {
  if (!input || input.dataset.visibilityToggleReady) return;
  input.dataset.visibilityToggleReady = 'true';
  const wrapper = document.createElement('span');
  wrapper.className = 'password-visibility-wrap';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.append(input);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'password-visibility-toggle';
  button.setAttribute('aria-label', `Show ${label}`);
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `;
  button.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', show ? `Hide ${label}` : `Show ${label}`);
  });
  wrapper.append(button);
}

const suchaApiBase = 'https://praivasipdf-api.verilogical.com';
const suchaApiFallbackBase = 'https://payment-worker.verilogical.com';
const suchaApiBases = [suchaApiBase, suchaApiFallbackBase];

function trackSuchaEvent(event, detail = {}) {
  const payload = JSON.stringify({
    event,
    ...detail,
    path: location.pathname,
    width: window.innerWidth,
    ts: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${suchaApiBase}/api/analytics/track`, new Blob([payload], { type: 'application/json' }));
      return;
    }
    fetch(`${suchaApiBase}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics should never interrupt care tools.
  }
}

trackSuchaEvent('page_view');

const suchaVerificationTokenKey = 'sucha-verification-token:v1';
const suchaVerificationEmailKey = 'sucha-verification-email:v1';
let suchaVerificationPending = null;

function addVerificationStyles() {
  if (document.querySelector('#sucha-verification-styles')) return;
  const style = document.createElement('style');
  style.id = 'sucha-verification-styles';
  style.textContent = `
    .sucha-verify-modal {
      align-items: center;
      background: rgba(23,23,23,0.38);
      display: none;
      inset: 0;
      justify-content: center;
      padding: 1rem;
      position: fixed;
      z-index: 400;
    }
    .sucha-verify-modal.on { display: flex; }
    .sucha-verify-card {
      background: var(--cream);
      border: 1px solid var(--border);
      box-shadow: 0 24px 80px rgba(45,122,107,0.18);
      color: var(--text);
      max-height: calc(100vh - 2rem);
      overflow: auto;
      padding: 2rem;
      width: min(480px, 100%);
    }
    .sucha-verify-mark {
      align-items: center;
      color: var(--teal-dark);
      display: flex;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.25rem;
      gap: 0.7rem;
      margin-bottom: 1rem;
    }
    .sucha-verify-mark span:first-child {
      border: 1px solid var(--teal);
      display: grid;
      height: 38px;
      place-items: center;
      width: 38px;
    }
    .sucha-verify-card h2 {
      color: var(--teal-dark);
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 400;
      line-height: 1.12;
      margin-bottom: 0.7rem;
    }
    .sucha-verify-card p {
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.65;
      margin-bottom: 1rem;
    }
    .sucha-verify-grid {
      display: grid;
      gap: 0.75rem;
    }
    .sucha-verify-grid input[type="email"],
    .sucha-verify-grid input[type="text"] {
      border: 1px solid var(--border);
      color: var(--text);
      font: inherit;
      min-height: 46px;
      padding: 0.8rem;
      width: 100%;
    }
    .sucha-verify-check {
      align-items: start;
      color: var(--muted);
      display: flex;
      font-size: 0.9rem;
      gap: 0.65rem;
      line-height: 1.45;
    }
    .sucha-verify-check input { margin-top: 0.28rem; }
    .sucha-verify-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      margin-top: 0.9rem;
    }
    .sucha-verify-actions button {
      border: 1px solid var(--teal-dark);
      cursor: pointer;
      font-family: 'Jost', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      padding: 0.75rem 1rem;
      text-transform: uppercase;
    }
    .sucha-verify-actions button:first-child,
    .sucha-verify-actions button:nth-child(2) {
      background: var(--teal-dark);
      color: white;
    }
    .sucha-verify-close {
      background: transparent;
      color: var(--teal-dark);
    }
    .sucha-verify-status {
      color: var(--muted);
      font-size: 0.9rem;
      min-height: 1.4rem;
    }
    .sucha-verify-status.error { color: #9f2f23; }
  `;
  document.head.append(style);
}

function ensureVerificationModal() {
  addVerificationStyles();
  if (document.querySelector('#sucha-verify-modal')) return;
  const modal = document.createElement('div');
  modal.className = 'sucha-verify-modal';
  modal.id = 'sucha-verify-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="sucha-verify-card" role="dialog" aria-modal="true" aria-labelledby="sucha-verify-title">
      <div class="sucha-verify-mark"><span>S</span><span>Sucha Wellness</span></div>
      <h2 id="sucha-verify-title">Verify your email to continue</h2>
      <p id="sucha-verify-copy">Use one verified email for Sucha tests, journal access, and optional updates.</p>
      <div class="sucha-verify-grid">
        <input id="sucha-verify-email" type="email" autocomplete="email" placeholder="Email address">
        <label class="sucha-verify-check">
          <input id="sucha-verify-subscribe" type="checkbox" checked>
          <span>Send me occasional Sucha updates and wellness notifications.</span>
        </label>
        <input id="sucha-verify-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit code">
        <div class="sucha-verify-status" id="sucha-verify-status" role="status" aria-live="polite"></div>
      </div>
      <div class="sucha-verify-actions">
        <button id="sucha-verify-send" type="button">Send code</button>
        <button id="sucha-verify-confirm" type="button">Verify</button>
        <button class="sucha-verify-close" id="sucha-verify-close" type="button">Close</button>
      </div>
    </div>
  `;
  document.body.append(modal);

  modal.querySelector('#sucha-verify-send').addEventListener('click', sendSuchaVerificationCode);
  modal.querySelector('#sucha-verify-confirm').addEventListener('click', confirmSuchaVerificationCode);
  modal.querySelector('#sucha-verify-close').addEventListener('click', () => resolveSuchaVerification(false));
  modal.addEventListener('click', (event) => {
    if (event.target === modal) resolveSuchaVerification(false);
  });
  modal.querySelector('#sucha-verify-code').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') confirmSuchaVerificationCode();
  });
}

function setSuchaVerifyStatus(message, isError = false) {
  const status = document.querySelector('#sucha-verify-status');
  if (!status) return;
  status.textContent = message || '';
  status.classList.toggle('error', Boolean(isError));
}

async function readSuchaJson(response, fallback) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || fallback);
  return data;
}

async function hasSuchaVerification() {
  const token = localStorage.getItem(suchaVerificationTokenKey);
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch('/api/verification/status', {
      headers,
      credentials: 'same-origin',
    });
    return response.ok;
  } catch {
    return Boolean(token);
  }
}

function openSuchaVerification(context = {}) {
  ensureVerificationModal();
  const modal = document.querySelector('#sucha-verify-modal');
  const email = document.querySelector('#sucha-verify-email');
  const code = document.querySelector('#sucha-verify-code');
  const title = document.querySelector('#sucha-verify-title');
  const copy = document.querySelector('#sucha-verify-copy');
  title.textContent = context.mode === 'subscribe' ? 'Subscribe to Sucha updates' : 'Verify your email to continue';
  copy.textContent = context.mode === 'subscribe'
    ? 'Use one verified email for Sucha updates, wellness notifications, tests, and journal access.'
    : `Verify once to use ${context.tool || 'Sucha tools'} on this browser.`;
  email.value = localStorage.getItem(suchaVerificationEmailKey) || '';
  code.value = '';
  setSuchaVerifyStatus('');
  modal.classList.add('on');
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => email.focus(), 50);
}

function resolveSuchaVerification(ok) {
  const modal = document.querySelector('#sucha-verify-modal');
  if (modal) {
    modal.classList.remove('on');
    modal.setAttribute('aria-hidden', 'true');
  }
  if (suchaVerificationPending) {
    suchaVerificationPending.resolve(Boolean(ok));
    suchaVerificationPending = null;
  }
}

async function requireSuchaVerification(context = {}) {
  if (await hasSuchaVerification()) return true;
  if (suchaVerificationPending) return suchaVerificationPending.promise;
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  suchaVerificationPending = { promise, resolve, context };
  openSuchaVerification(context);
  return promise;
}

async function sendSuchaVerificationCode() {
  const email = document.querySelector('#sucha-verify-email');
  const subscribe = document.querySelector('#sucha-verify-subscribe');
  const context = suchaVerificationPending?.context || { mode: 'subscribe', tool: 'Sucha updates', toolType: 'subscribe' };
  const value = (email?.value || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setSuchaVerifyStatus('Enter a valid email address.', true);
    return;
  }
  setSuchaVerifyStatus('Sending code...');
  try {
    const response = await fetch('/api/verification/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: value,
        subscribed: subscribe?.checked !== false,
        tool: context.tool || 'Sucha tools',
        toolType: context.toolType || context.mode || 'tool',
      }),
    });
    await readSuchaJson(response, 'Could not send verification code.');
    localStorage.setItem(suchaVerificationEmailKey, value);
    setSuchaVerifyStatus('Code sent. Check your email.');
    document.querySelector('#sucha-verify-code')?.focus();
  } catch (error) {
    setSuchaVerifyStatus(error.message || 'Could not send verification code.', true);
  }
}

async function confirmSuchaVerificationCode() {
  const email = document.querySelector('#sucha-verify-email');
  const code = document.querySelector('#sucha-verify-code');
  const context = suchaVerificationPending?.context || { mode: 'subscribe', tool: 'Sucha updates', toolType: 'subscribe' };
  setSuchaVerifyStatus('Verifying...');
  try {
    const response = await fetch('/api/verification/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email?.value || '',
        code: code?.value || '',
        tool: context.tool || 'Sucha tools',
        toolType: context.toolType || context.mode || 'tool',
      }),
    });
    const data = await readSuchaJson(response, 'Could not verify code.');
    localStorage.setItem(suchaVerificationTokenKey, data.token);
    localStorage.setItem(suchaVerificationEmailKey, data.visitor?.email || email.value.trim());
    setSuchaVerifyStatus('Verified.');
    trackSuchaEvent('email_verified', { tool: context.tool || '', toolType: context.toolType || '' });
    resolveSuchaVerification(true);
  } catch (error) {
    setSuchaVerifyStatus(error.message || 'Could not verify code.', true);
  }
}

ensureVerificationModal();

const siteNav = document.querySelector('nav');
const navMenuToggle = document.querySelector('.nav-menu-toggle');
const navLinksList = document.querySelector('.nav-links');

navMenuToggle?.addEventListener('click', () => {
  const isOpen = siteNav?.classList.toggle('is-menu-open');
  navMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  navMenuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

navLinksList?.addEventListener('click', (event) => {
  if (!event.target.closest?.('a')) return;
  siteNav?.classList.remove('is-menu-open');
  navMenuToggle?.setAttribute('aria-expanded', 'false');
  navMenuToggle?.setAttribute('aria-label', 'Open menu');
});

document.querySelectorAll('[data-research-toggle]').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const targetId = toggle.getAttribute('aria-controls');
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    const willOpen = target.hidden;
    target.hidden = !willOpen;
    toggle.setAttribute('aria-expanded', String(willOpen));
    toggle.textContent = willOpen ? 'Hide research' : 'Show research';
    if (willOpen) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.addEventListener('click', (event) => {
  const subscribeLink = event.target.closest?.('[data-sucha-subscribe]');
  if (!subscribeLink) return;
  event.preventDefault();
  requireSuchaVerification({ mode: 'subscribe', tool: 'Sucha updates', toolType: 'subscribe' }).then((ok) => {
    if (ok) document.querySelector('#take-test')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach((element) => observer.observe(element));

document.querySelectorAll('.step-card, .why-card, .screening-card').forEach((element, index) => {
  element.style.transitionDelay = `${(index % 3) * 0.12}s`;
});

const screeningCardData = [
  ['depression', 'BDI-style screen', 'BDI Depression Quick Screen', 'For overwhelming sadness, despair, low energy, or negative self-image.', 'Start test'],
  ['bai', 'Sucha screen', 'Beck Anxiety Inventory (BAI) Quick Screen', 'A BAI-informed anxiety symptom check for recent physical and panic-like symptoms.', 'Start test'],
  ['careerRiasec', 'Career guidance', 'Career Pathway RIASEC Quiz', 'A one-question-at-a-time interest quiz to identify your top Holland Code career themes.', 'Start quiz'],
  ['selfEsteem', 'Self-esteem scale', 'Rosenberg Self-Esteem Scale (RSE)', 'A 10-item self-esteem scale for reflecting on self-worth, self-respect, and overall self-attitude.', 'Start test'],
  ['universal', 'Universal screen', 'Universal Mental Health Screen', 'A broader Sucha-hosted screen for common mental health signals.', 'Start test'],
  ['adhd', 'Sucha screen', 'ADHD Test', 'For trouble focusing, remembering things, completing tasks, or sitting still.', 'Start test'],
  ['anxiety', 'Sucha screen', 'Anxiety Test', 'For worry or fear that affects day-to-day functioning.', 'Start test'],
  ['ocd', 'Sucha screen', 'OCD Test', 'For repetitive thoughts and behaviors, including checking or rituals, that interfere with life.', 'Start test'],
  ['bipolar', 'Sucha screen', 'Bipolar Test', 'For extreme mood swings or unusual shifts in mood and energy.', 'Start test'],
  ['psychosis', 'Sucha screen', 'Psychosis & Schizophrenia Test', 'For experiences that feel unreal, confusing, or like the brain is playing tricks.', 'Start test'],
  ['eating', 'Sucha screen', 'Eating Disorder Test', 'For unhealthy relationships with food that affect health and well-being.', 'Start test'],
  ['ptsd', 'Sucha screen', 'PTSD Test', 'For ongoing distress after a traumatic life event.', 'Start test'],
  ['addiction', 'Sucha screen', 'Addiction Test', 'For concerns about alcohol, drugs, gambling, self-harm, or other hard-to-control behaviors.', 'Start test'],
  ['gambling', 'Sucha screen', 'Gambling Addiction Test', 'For people concerned about gambling behaviors.', 'Start test'],
  ['socialAnxiety', 'Sucha screen', 'Social Anxiety Test', 'For extreme worry or fear in social situations.', 'Start test'],
  ['postpartum', 'Sucha screen', 'Postpartum Depression Test', 'For new and expecting parents experiencing overwhelming sadness during or after pregnancy.', 'Start test'],
  ['parent', 'Sucha screen', "Parent Test: Your Child's Mental Health", "For parents worried about a child's emotions, attention, or behaviors.", 'Start test'],
  ['youth', 'Sucha screen', 'Youth Mental Health Test', 'For young people ages 11-17 concerned about emotions, attention, or behaviors.', 'Start test'],
  ['goodDay', 'Sucha survey', 'Survey: What Makes a Good Day?', 'A reflection survey about what helps people have more good days.', 'Start survey'],
  ['psychedelics', 'Sucha survey', 'Psychedelics & Mental Health Survey', 'A reflection survey about opinions on psychedelics and mental health.', 'Start survey'],
  ['aiMentalHealth', 'Sucha survey', 'AI & Mental Health Survey', 'A reflection survey about opinions on artificial intelligence and mental health.', 'Start survey'],
  ['selfInjury', 'Sucha survey', 'Self-Injury Survey', 'A support-oriented survey for people who have hurt themselves on purpose without trying to die.', 'Start survey']
];

const screeningGroups = [
  ['Start here', 'Open first-step screens for visitors who want to begin quickly.', ['depression', 'bai']],
  ['Career interests', 'Career and vocational reflection tools.', ['careerRiasec']],
  ['Self-esteem and identity', 'Reflection tools for self-worth, self-respect, and personal confidence.', ['selfEsteem']],
  ['Common mental health screens', 'Focused screens for mood, anxiety, attention, and related concerns.', ['universal', 'adhd', 'anxiety', 'ocd', 'bipolar', 'psychosis']],
  ['Body, trauma, and behavior patterns', 'Screens for eating, trauma, addiction, gambling, and self-injury patterns.', ['eating', 'ptsd', 'addiction', 'gambling', 'selfInjury']],
  ['Family and youth', 'Screens for parents, young people, and new or expecting parents.', ['postpartum', 'parent', 'youth']],
  ['Reflection surveys', 'Short surveys for broader wellness and mental health reflection.', ['goodDay', 'psychedelics', 'aiMentalHealth']]
];

const screeningCardMap = new Map(screeningCardData.map((card) => [card[0], card]));

function addScreeningStyles() {
  if (document.querySelector('#screening-runtime-styles')) return;

  const style = document.createElement('style');
  style.id = 'screening-runtime-styles';
  style.textContent = `
    .screening-card {
      appearance: none;
      cursor: pointer;
      font: inherit;
      text-align: left;
      width: 100%;
    }
    .screening-tools {
      display: block;
    }
    .screening-group {
      margin-bottom: 2rem;
    }
    .screening-group-head {
      margin: 0 0 0.85rem;
    }
    .screening-group-title {
      color: var(--teal-dark);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.55rem;
      font-weight: 500;
      line-height: 1.1;
    }
    .screening-group-desc,
    .screening-disclaimer {
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.65;
      margin-top: 0.35rem;
      max-width: 760px;
    }
    .screening-disclaimer {
      background: rgba(245,242,235,0.8);
      border-left: 3px solid var(--teal);
      margin: 1.4rem 0 2rem;
      padding: 1rem 1.1rem;
    }
    .screening-disclaimer a,
    .result-support-note a {
      color: var(--teal-dark);
      font-weight: 600;
      text-decoration: none;
    }
    .screening-group-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }
    .screening-card:focus-visible {
      border-color: var(--teal);
      box-shadow: 0 14px 34px rgba(45,122,107,0.09);
      outline: none;
      transform: translateY(-2px);
    }
    .inline-test-panel {
      border: 1px solid var(--border);
      background: var(--cream);
      margin: 0 0 4rem;
      padding: 2rem;
    }
    .inline-test-panel[hidden],
    .inline-test-result[hidden] {
      display: none;
    }
    .inline-test-head {
      align-items: start;
      display: flex;
      gap: 1.5rem;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .inline-test-title {
      color: var(--teal-dark);
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 500;
      line-height: 1.15;
      margin-bottom: 0.5rem;
    }
    .inline-test-desc {
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.7;
      max-width: 720px;
    }
    .inline-test-form {
      display: grid;
      gap: 1rem;
    }
    .inline-question {
      background: white;
      border: 1px solid var(--border);
      padding: 1.2rem;
    }
    .inline-question-title {
      color: var(--teal-dark);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.2rem;
      line-height: 1.25;
      margin-bottom: 0.8rem;
    }
    .inline-options {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.5rem;
    }
    .inline-options label {
      align-items: center;
      border: 1px solid var(--border);
      color: var(--muted);
      cursor: pointer;
      display: flex;
      font-size: 0.72rem;
      justify-content: center;
      line-height: 1.25;
      min-height: 56px;
      padding: 0.6rem;
      text-align: center;
      text-transform: uppercase;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
    }
    .inline-options input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
    .inline-options label:has(input:checked) {
      background: var(--teal-dark);
      border-color: var(--teal-dark);
      color: white;
    }
    .inline-test-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }
    .test-submit {
      background: var(--teal-dark);
      border: 1px solid var(--teal-dark);
      color: white;
      cursor: pointer;
      font-family: 'Jost', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      padding: 0.7rem 1.2rem;
      text-transform: uppercase;
    }
    .inline-test-result {
      background: white;
      border-left: 3px solid var(--teal);
      margin-top: 1.5rem;
      padding: 1.2rem;
    }
    .result-summary {
      display: grid;
      gap: 0.85rem;
    }
    .result-summary p,
    .result-support-note {
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.7;
      margin: 0;
    }
    .result-support-note {
      background: var(--cream);
      border: 1px solid var(--border);
      padding: 1rem;
    }
    .riasec-progress {
      color: var(--teal-dark);
      font-size: 0.78rem;
      letter-spacing: 0.12em;
      margin-bottom: 0.9rem;
      text-transform: uppercase;
    }
    .riasec-progress-bar {
      background: rgba(45,122,107,0.12);
      height: 6px;
      margin: 0.7rem 0 1.2rem;
      overflow: hidden;
    }
    .riasec-progress-fill {
      background: var(--teal);
      display: block;
      height: 100%;
      transition: width 0.2s ease;
      width: 0;
    }
    .riasec-question {
      background: white;
      border: 1px solid var(--border);
      padding: 1.4rem;
    }
    .riasec-options {
      display: grid;
      gap: 0.55rem;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      margin-top: 1rem;
    }
    .riasec-option {
      background: var(--white);
      border: 1px solid var(--border);
      color: var(--muted);
      cursor: pointer;
      font: inherit;
      font-size: 0.72rem;
      min-height: 58px;
      padding: 0.65rem;
      text-transform: uppercase;
    }
    .riasec-option:hover,
    .riasec-option:focus-visible {
      border-color: var(--teal);
      color: var(--teal-dark);
      outline: none;
    }
    .riasec-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .riasec-result-grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-top: 1rem;
    }
    .riasec-result-card {
      border: 1px solid var(--border);
      padding: 1rem;
    }
    .riasec-result-code {
      color: var(--teal-dark);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.7rem;
      line-height: 1;
    }
    .riasec-result-title {
      color: var(--text);
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      margin-top: 0.4rem;
      text-transform: uppercase;
    }
    .riasec-result-card p,
    .riasec-result-card ul {
      color: var(--muted);
      font-size: 0.82rem;
      line-height: 1.55;
      margin-top: 0.55rem;
    }
    .riasec-result-card ul {
      padding-left: 1rem;
    }
    @media (max-width: 900px) {
      .inline-test-head { display: grid; }
      .inline-options { grid-template-columns: 1fr; }
      .screening-group-grid {
        grid-template-columns: 1fr;
      }
      .riasec-options,
      .riasec-result-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.append(style);
}

function createScreeningCard([key, tag, title, description, action]) {
  const card = document.createElement('button');
  card.className = 'screening-card reveal visible';
  card.type = 'button';
  card.dataset.test = key;

  const tagElement = document.createElement('span');
  const titleElement = document.createElement('span');
  const descriptionElement = document.createElement('span');
  const actionElement = document.createElement('span');

  tagElement.className = 'screening-card-tag';
  titleElement.className = 'screening-card-title';
  descriptionElement.className = 'screening-card-desc';
  actionElement.className = 'screening-card-action';

  tagElement.textContent = tag;
  titleElement.textContent = title;
  descriptionElement.textContent = description;
  actionElement.textContent = action;

  card.append(tagElement, titleElement, descriptionElement, actionElement);
  return card;
}

function createScreeningGroups() {
  return screeningGroups.map(([title, description, keys]) => {
    const section = document.createElement('section');
    const head = document.createElement('div');
    const heading = document.createElement('h3');
    const copy = document.createElement('p');
    const grid = document.createElement('div');

    section.className = 'screening-group';
    head.className = 'screening-group-head';
    heading.className = 'screening-group-title';
    copy.className = 'screening-group-desc';
    grid.className = 'screening-group-grid';
    heading.textContent = title;
    copy.textContent = description;
    keys.forEach((key) => {
      const card = screeningCardMap.get(key);
      if (card) grid.append(createScreeningCard(card));
    });
    head.append(heading, copy);
    section.append(head, grid);
    return section;
  });
}

function ensureScreeningDisclaimer(takeTest) {
  if (!takeTest || takeTest.querySelector('.screening-disclaimer')) return;
  const disclaimer = document.createElement('p');
  disclaimer.className = 'screening-disclaimer';
  disclaimer.innerHTML = 'These tests are informational only and are not a diagnosis or a substitute for clinical advice. Please consult a qualified doctor, psychologist, therapist, or licensed counsellor for clinical guidance. If you are interested in being connected to qualified licensed doctors or counsellors, write to <a href="mailto:support@suchawellness.com?subject=Licensed%20doctor%20or%20counsellor%20connection">support@suchawellness.com</a>.';
  takeTest.querySelector('.section-subtitle')?.after(disclaimer);
}

function ensureScreeningMarkup() {
  const tools = document.querySelector('.screening-tools');
  if (!tools) return;

  addScreeningStyles();

  const takeTest = document.querySelector('#take-test');
  const subtitle = takeTest?.querySelector('.section-subtitle');
  if (subtitle) {
    subtitle.textContent = 'Choose a quick, confidential Sucha-hosted screening tool. Answers stay in your browser and results are informational only, not a diagnosis or a replacement for care from a qualified clinician.';
  }
  ensureScreeningDisclaimer(takeTest);

  const needsCardRefresh = tools.querySelectorAll('.screening-card[data-test]').length !== screeningCardData.length ||
    !tools.querySelector('.screening-group') ||
    tools.querySelector('a[href*="screening.mhanational.org"], a[href*="trypsytest.com"]');

  if (needsCardRefresh) {
    tools.replaceChildren(...createScreeningGroups());
  }

  if (!document.querySelector('#screening-panel')) {
    const panel = document.createElement('div');
    panel.className = 'inline-test-panel reveal';
    panel.id = 'screening-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="inline-test-head">
        <div>
          <div class="section-eyebrow">Sucha-hosted screen</div>
          <h3 class="inline-test-title" id="screening-title">Choose a test</h3>
          <p class="inline-test-desc" id="screening-desc">Select a screening tool above to begin.</p>
        </div>
        <button class="test-reset" type="button" id="screening-close">Close</button>
      </div>
      <form class="inline-test-form" id="screening-form"></form>
      <aside class="inline-test-result" id="screening-result" aria-live="polite" hidden>
        <div class="score-label">Result</div>
        <div class="score-band" id="screening-band"></div>
        <div class="score-note" id="screening-note"></div>
      </aside>
    `;
    tools.after(panel);
  }
}

ensureScreeningMarkup();

function addJournalStyles() {
  if (document.querySelector('#journal-runtime-styles')) return;

  const style = document.createElement('style');
  style.id = 'journal-runtime-styles';
  style.textContent = `
    #journal { background: var(--cream); }
    .journal-shell {
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.78);
      display: grid;
      grid-template-columns: minmax(250px, 0.72fr) minmax(0, 1.35fr);
      min-height: 620px;
    }
    .journal-sidebar {
      border-right: 1px solid var(--border);
      display: grid;
      gap: 1.2rem;
      align-content: start;
      padding: 2rem;
      background: rgba(245,242,235,0.72);
    }
    .journal-mark {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border: 1px solid var(--teal);
      color: var(--teal-dark);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.55rem;
    }
    .journal-sidebar h3,
    .journal-panel h3 {
      color: var(--teal-dark);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.6rem;
      font-weight: 400;
      line-height: 1.2;
    }
    .journal-sidebar p,
    .journal-note,
    .journal-empty,
    .journal-entry-preview,
    .journal-entry-meta {
      color: var(--muted);
      font-size: 0.86rem;
      line-height: 1.7;
    }
    .journal-stats {
      display: grid;
      gap: 0.65rem;
      margin-top: 0.6rem;
    }
    .journal-stat {
      border: 1px solid var(--border);
      background: white;
      padding: 1rem;
    }
    .journal-stat span {
      color: var(--muted);
      display: block;
      font-size: 0.68rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .journal-stat strong {
      color: var(--teal-dark);
      display: block;
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem;
      font-weight: 400;
      line-height: 1;
      margin-top: 0.35rem;
    }
    .journal-panel {
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr);
      min-width: 0;
      padding: 2rem;
    }
    .journal-topline {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }
    .journal-search {
      border: 1px solid var(--border);
      background: white;
      color: var(--text);
      min-height: 42px;
      padding: 0.7rem 0.9rem;
      width: min(280px, 100%);
    }
    .journal-composer {
      border: 1px solid var(--border);
      background: white;
      display: grid;
      gap: 0.9rem;
      margin-bottom: 1.4rem;
      padding: 1.2rem;
    }
    .journal-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 160px;
      gap: 0.75rem;
    }
    .journal-composer input,
    .journal-composer textarea,
    .journal-composer select {
      border: 1px solid var(--border);
      color: var(--text);
      font-family: 'Jost', sans-serif;
      padding: 0.8rem;
      width: 100%;
    }
    .journal-composer textarea {
      min-height: 130px;
      resize: vertical;
    }
    .journal-premium,
    .journal-reminder,
    .journal-lock {
      border: 1px solid rgba(45,122,107,0.26);
      background: rgba(255,255,255,0.76);
      display: grid;
      gap: 0.9rem;
      margin-top: 0.4rem;
      padding: 1rem;
    }
    .journal-reminder {
      border-style: dashed;
    }
    .journal-reminder-row {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
    }
    .journal-premium-badge {
      color: var(--teal-dark);
      font-size: 0.66rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .journal-premium-title {
      color: var(--teal-dark);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.25rem;
      font-weight: 500;
      line-height: 1.2;
    }
    .journal-premium-grid,
    .journal-lock-row {
      display: grid;
      gap: 0.7rem;
    }
    .journal-lock-row {
      grid-template-columns: minmax(0, 1fr) auto;
    }
    .journal-premium input,
    .journal-lock-row input {
      border: 1px solid var(--border);
      color: var(--text);
      font: inherit;
      min-height: 42px;
      padding: 0.72rem 0.8rem;
      width: 100%;
    }
    .journal-premium-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
    }
    .journal-lock {
      background: rgba(245,242,235,0.82);
      margin: 0 0 1rem;
    }
    .journal-lock[hidden],
    .journal-private[hidden] {
      display: none;
    }
    .journal-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .journal-save {
      background: var(--teal-dark);
      border: 1px solid var(--teal-dark);
      color: white;
      cursor: pointer;
      font-family: 'Jost', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      padding: 0.8rem 1.25rem;
      text-transform: uppercase;
    }
    .journal-clear {
      background: transparent;
      border: 1px solid var(--teal-dark);
      color: var(--teal-dark);
      cursor: pointer;
      font-family: 'Jost', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      padding: 0.8rem 1.25rem;
      text-transform: uppercase;
    }
    .journal-premium-button {
      background: var(--teal-dark);
      border: 1px solid var(--teal-dark);
      color: white;
      cursor: pointer;
      font-family: 'Jost', sans-serif;
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      padding: 0.72rem 0.9rem;
      text-transform: uppercase;
    }
    .journal-premium-button.secondary {
      background: transparent;
      color: var(--teal-dark);
    }
    .journal-premium-button:disabled {
      cursor: not-allowed;
      opacity: 0.62;
    }
    .journal-list {
      display: grid;
      gap: 0.85rem;
    }
    .journal-entry {
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.88);
      display: grid;
      gap: 0.55rem;
      padding: 1.1rem;
    }
    .journal-entry-head {
      display: flex;
      gap: 0.75rem;
      justify-content: space-between;
      align-items: start;
    }
    .journal-entry-title {
      color: var(--teal-dark);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.35rem;
      line-height: 1.2;
    }
    .journal-entry-mood {
      border: 1px solid var(--border);
      color: var(--teal-dark);
      font-size: 0.66rem;
      letter-spacing: 0.12em;
      padding: 0.25rem 0.55rem;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .journal-entry-delete {
      justify-self: start;
      background: transparent;
      border: 0;
      color: var(--muted);
      cursor: pointer;
      font-size: 0.68rem;
      letter-spacing: 0.12em;
      padding: 0;
      text-transform: uppercase;
    }
    @media (max-width: 900px) {
      .journal-shell { grid-template-columns: 1fr; }
      .journal-sidebar { border-right: 0; border-bottom: 1px solid var(--border); }
      .journal-topline { display: grid; }
      .journal-row { grid-template-columns: 1fr; }
    }
  `;
  document.head.append(style);
}

function ensureJournalMarkup() {
  addJournalStyles();

  const navLinks = document.querySelector('.nav-links');
  if (navLinks && !navLinks.querySelector('a[href="#journal"]')) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#journal';
    link.textContent = 'Journal';
    item.append(link);
    const researchItem = navLinks.querySelector('a[href="#research"]')?.closest('li');
    navLinks.insertBefore(item, researchItem || navLinks.lastElementChild);
  }

  if (document.querySelector('#journal')) return;

  const journal = document.createElement('section');
  journal.id = 'journal';
  journal.innerHTML = `
    <div class="section-eyebrow">Journal</div>
    <h2 class="section-title">Sucha Journal</h2>
    <p class="section-subtitle">A private reflection space for mood notes, therapy takeaways, and small signals worth remembering. Entries stay in this browser.</p>
    <div class="journal-shell reveal visible">
      <aside class="journal-sidebar">
        <div class="journal-mark">S</div>
        <div>
          <h3>Daily mental health notes, without the noise.</h3>
          <p>Capture what happened, how it felt, and what helped. Use it between screenings, sessions, or quiet check-ins with yourself.</p>
        </div>
        <div class="journal-stats" aria-live="polite">
          <div class="journal-stat"><span>Entries</span><strong id="journal-count">0</strong></div>
          <div class="journal-stat"><span>Latest mood</span><strong id="journal-latest">-</strong></div>
          <div class="journal-stat"><span>This week</span><strong id="journal-week">0</strong></div>
        </div>
        <div class="journal-premium">
          <div class="journal-premium-badge">Optional premium vault</div>
          <div class="journal-premium-title">$5/month with a 30-day money-back guarantee</div>
          <p class="journal-note">Your journal is currently stored locally only. If you want more security and privacy, premium adds a password-protected encrypted vault.</p>
          <p class="journal-note">For privacy, email verification can help with premium access and support, but it cannot unlock encrypted journal contents. Keep your journal password somewhere safe.</p>
          <p class="journal-note">Cancel anytime. For cancellation, refund, or support help, <a href="mailto:support@suchawellness.com?subject=Sucha%20Journal%20Premium%20Support">contact support</a>.</p>
          <div class="journal-premium-grid">
            <input id="journal-billing-email" type="email" placeholder="Email for premium and support">
            <input id="journal-premium-password" type="password" placeholder="Journal password">
            <input id="journal-coupon-code" type="text" placeholder="One-time coupon code">
          </div>
          <div class="journal-premium-actions">
            <button class="journal-premium-button" type="button" id="journal-trial-button">Upgrade to premium</button>
            <button class="journal-premium-button secondary" type="button" id="journal-coupon-button">Redeem coupon</button>
            <button class="journal-premium-button secondary" type="button" id="journal-unlock-button">Unlock</button>
          </div>
          <p class="journal-note" id="journal-premium-status">Free journal stays easy to use. Upgrade only if you want password protection and encryption.</p>
        </div>
      </aside>
      <div class="journal-panel">
        <div class="journal-topline">
          <div>
            <div class="section-eyebrow">Private workspace</div>
            <h3>Write a note</h3>
          </div>
          <input class="journal-search" id="journal-search" type="search" placeholder="Search entries">
        </div>
        <div class="journal-lock" id="journal-lock" hidden>
          <p class="journal-note">Optional premium vault is locked. Enter your journal password to view encrypted entries. Email support can help with account access, but cannot decrypt your private notes.</p>
          <div class="journal-lock-row">
            <input id="journal-unlock-password" type="password" placeholder="Journal password">
            <button class="journal-premium-button secondary" type="button" id="journal-lock-unlock-button">Unlock</button>
          </div>
        </div>
        <div class="journal-private" id="journal-private">
          <form class="journal-composer" id="journal-form">
            <div class="journal-row">
              <input id="journal-title" type="text" placeholder="Title or moment" required>
              <select id="journal-mood" aria-label="Mood">
                <option value="Steady">Steady</option>
                <option value="Anxious">Anxious</option>
                <option value="Low">Low</option>
                <option value="Hopeful">Hopeful</option>
                <option value="Tired">Tired</option>
                <option value="Triggered">Triggered</option>
              </select>
            </div>
            <textarea id="journal-body" placeholder="What do you want to remember from today?" required></textarea>
            <div class="journal-actions">
              <span class="journal-note" id="journal-status">Ready when you are.</span>
              <div>
                <button class="journal-clear" type="reset">Clear</button>
                <button class="journal-save" type="submit">Save entry</button>
              </div>
            </div>
          </form>
          <div class="journal-list" id="journal-list" aria-live="polite">
            <p class="journal-empty">No entries yet. Start with one sentence about what felt true today.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const research = document.querySelector('#research');
  if (research) {
    research.before(journal);
  } else {
    document.querySelector('#take-test')?.after(journal);
  }
}

ensureJournalMarkup();

function ensureJournalPremiumMarkup() {
  const journal = document.querySelector('#journal');
  if (!journal) return;

  const sidebar = journal.querySelector('.journal-sidebar');
  if (sidebar && !journal.querySelector('#journal-trial-button')) {
    const premium = document.createElement('div');
    premium.className = 'journal-premium';
    premium.innerHTML = `
      <div class="journal-premium-badge">Optional premium vault</div>
      <div class="journal-premium-title">$5/month with a 30-day money-back guarantee</div>
      <p class="journal-note">Your journal is currently stored locally only. If you want more security and privacy, premium adds a password-protected encrypted vault.</p>
      <p class="journal-note">For privacy, email verification can help with premium access and support, but it cannot unlock encrypted journal contents. Keep your journal password somewhere safe.</p>
      <p class="journal-note">Cancel anytime. For cancellation, refund, or support help, <a href="mailto:support@suchawellness.com?subject=Sucha%20Journal%20Premium%20Support">contact support</a>.</p>
      <div class="journal-premium-grid">
        <input id="journal-billing-email" type="email" placeholder="Email for premium and support">
        <input id="journal-premium-password" type="password" placeholder="Journal password">
        <input id="journal-coupon-code" type="text" placeholder="One-time coupon code">
      </div>
      <div class="journal-premium-actions">
        <button class="journal-premium-button" type="button" id="journal-trial-button">Upgrade to premium</button>
        <button class="journal-premium-button secondary" type="button" id="journal-coupon-button">Redeem coupon</button>
        <button class="journal-premium-button secondary" type="button" id="journal-unlock-button">Unlock</button>
      </div>
      <p class="journal-note" id="journal-premium-status">Free journal stays easy to use. Upgrade only if you want password protection and encryption.</p>
    `;
    sidebar.append(premium);
  }

  const panel = journal.querySelector('.journal-panel');
  const form = journal.querySelector('#journal-form');
  const list = journal.querySelector('#journal-list');
  if (panel && form && list && !journal.querySelector('#journal-private')) {
    const lock = document.createElement('div');
    lock.className = 'journal-lock';
    lock.id = 'journal-lock';
    lock.innerHTML = `
      <p class="journal-note">Optional premium vault is locked. Enter your journal password to view encrypted entries. Email support can help with account access, but cannot decrypt your private notes.</p>
      <div class="journal-lock-row">
        <input id="journal-unlock-password" type="password" placeholder="Journal password">
        <button class="journal-premium-button secondary" type="button" id="journal-lock-unlock-button">Unlock</button>
      </div>
    `;
    const privateArea = document.createElement('div');
    privateArea.className = 'journal-private';
    privateArea.id = 'journal-private';
    privateArea.hidden = false;
    form.before(lock);
    lock.after(privateArea);
    privateArea.append(form, list);
    form.querySelector('.journal-save')?.replaceChildren(document.createTextNode('Save entry'));
  }
}

ensureJournalPremiumMarkup();

function ensureJournalReminderMarkup() {
  const sidebar = document.querySelector('#journal .journal-sidebar');
  if (!sidebar || document.querySelector('#journal-reminder')) return;
  const reminder = document.createElement('div');
  reminder.className = 'journal-reminder';
  reminder.id = 'journal-reminder';
  reminder.innerHTML = `
    <div class="journal-premium-badge">Daily reminder</div>
    <p class="journal-note">Get a gentle local reminder to use your journal. No reminder emails are sent.</p>
    <div class="journal-reminder-row">
      <button class="journal-premium-button secondary" type="button" id="journal-reminder-button">Enable reminder</button>
      <button class="journal-clear" type="button" id="journal-reminder-reset">Reset today</button>
    </div>
    <p class="journal-note" id="journal-reminder-status">Reminder is off.</p>
  `;
  const premium = sidebar.querySelector('.journal-premium');
  sidebar.insertBefore(reminder, premium || null);
}

ensureJournalReminderMarkup();
addReadabilityStyles();

const screeningTests = {
  universal: {
    title: 'Universal Mental Health Screen',
    description: 'A broad Sucha-hosted check across mood, anxiety, attention, reality testing, sleep, and coping patterns.',
    questions: [
      'Mood felt unusually low, heavy, or hopeless.',
      'Worry, panic, or fear felt hard to control.',
      'Sleep, appetite, or energy changed enough to affect your day.',
      'Attention, impulsivity, or restlessness interfered with tasks.',
      'Thoughts, perceptions, or experiences felt confusing or hard to trust.',
      'Urges, habits, substances, or coping behaviors felt hard to manage.'
    ]
  },
  depression: {
    title: 'BDI Depression Quick Screen',
    description: 'A BDI-style Sucha screen for low mood, loss of interest, energy changes, and self-critical thinking.',
    questions: [
      'You felt down, empty, tearful, or hopeless.',
      'Things that usually matter to you felt flat or uninteresting.',
      'Energy or motivation felt unusually low.',
      'Sleep, appetite, or daily rhythm changed noticeably.',
      'You were unusually hard on yourself or felt like a burden.'
    ]
  },
  adhd: {
    title: 'ADHD Test',
    description: 'A brief Sucha screen for attention, follow-through, restlessness, and impulsive patterns.',
    questions: [
      'You had trouble staying focused on tasks or conversations.',
      'You forgot details, appointments, or where you put things.',
      'You started tasks but struggled to finish them.',
      'You felt physically restless or mentally driven by a motor.',
      'You interrupted, rushed, or acted before thinking through consequences.'
    ]
  },
  anxiety: {
    title: 'Anxiety Test',
    description: 'A brief Sucha screen for worry, tension, avoidance, and physical anxiety symptoms.',
    questions: [
      'You felt nervous, keyed up, or on edge.',
      'Worry kept returning even when you tried to set it aside.',
      'Your body held anxiety as tension, stomach upset, or a racing heart.',
      'You avoided situations because of fear or worry.',
      'Anxiety interfered with sleep, work, school, or relationships.'
    ]
  },
  bai: {
    title: 'Beck Anxiety Inventory (BAI) Quick Screen',
    description: 'A BAI-informed Sucha check for recent anxiety sensations. This is not the official copyrighted BAI form.',
    questions: [
      'You had sudden fear, panic, or a rush of alarm.',
      'Your heart raced, pounded, or felt irregular.',
      'You felt dizzy, lightheaded, shaky, or unsteady.',
      'Breathing felt tight, shallow, or difficult.',
      'You noticed numbness, tingling, hot flashes, or chills.',
      'You feared losing control, fainting, or something terrible happening.',
      'Physical anxiety symptoms made you avoid normal activities.'
    ]
  },
  selfEsteem: {
    title: 'Rosenberg Self-Esteem Scale (RSE)',
    description: 'A 10-item self-esteem scale developed by Morris Rosenberg to reflect on self-worth, self-respect, and overall self-attitude.',
    rse: true,
    questions: [
      { text: 'On the whole, I am satisfied with myself.', reverse: false },
      { text: 'At times I think I am no good at all.', reverse: true },
      { text: 'I feel that I have a number of good qualities.', reverse: false },
      { text: 'I am able to do things as well as most other people.', reverse: false },
      { text: 'I feel I do not have much to be proud of.', reverse: true },
      { text: 'I certainly feel useless at times.', reverse: true },
      { text: 'I feel that I am a person of worth.', reverse: false },
      { text: 'I wish I could have more respect for myself.', reverse: true },
      { text: 'All in all, I am inclined to think that I am a failure.', reverse: true },
      { text: 'I take a positive attitude toward myself.', reverse: false }
    ]
  },
  ocd: {
    title: 'OCD Test',
    description: 'A brief Sucha screen for intrusive thoughts, rituals, checking, and time-consuming compulsions.',
    questions: [
      'Unwanted thoughts or images got stuck in your mind.',
      'You repeated checking, cleaning, ordering, counting, or reassurance-seeking.',
      'Stopping a ritual made you feel very distressed.',
      'These thoughts or behaviors took more time than you wanted.',
      'You avoided people, places, or objects because they triggered the cycle.'
    ]
  },
  bipolar: {
    title: 'Bipolar Test',
    description: 'A brief Sucha screen for periods of unusually elevated energy, reduced sleep, and risky behavior.',
    questions: [
      'You had periods of unusually high, wired, or expansive mood.',
      'You needed much less sleep but still felt energized.',
      'Your thoughts or speech moved much faster than usual.',
      'You took risks with spending, sex, substances, driving, or big plans.',
      'Other people were concerned about your mood, energy, or behavior shifts.'
    ]
  },
  psychosis: {
    title: 'Psychosis & Schizophrenia Test',
    description: 'A brief Sucha screen for unusual perceptions, suspiciousness, disorganized thinking, or feeling detached from reality.',
    questions: [
      'You heard, saw, or sensed things other people did not seem to notice.',
      'You felt unusually suspicious or watched.',
      'You held beliefs that others found difficult to understand.',
      'Your thoughts felt scrambled, blocked, or hard to explain.',
      'Reality sometimes felt changed, unreal, or difficult to trust.'
    ]
  },
  eating: {
    title: 'Eating Disorder Test',
    description: 'A brief Sucha screen for food, body image, restriction, bingeing, and compensatory behaviors.',
    questions: [
      'Thoughts about food, weight, or body shape took up a lot of mental space.',
      'You restricted food, skipped meals, or followed rigid rules to change your body.',
      'You ate in a way that felt out of control.',
      'You used vomiting, laxatives, overexercise, or fasting to compensate.',
      'Body image distress affected your mood, relationships, or daily choices.'
    ]
  },
  ptsd: {
    title: 'PTSD Test',
    description: 'A brief Sucha screen for trauma reminders, avoidance, hypervigilance, and emotional numbing.',
    questions: [
      'Memories, nightmares, or body reactions pulled you back toward a traumatic event.',
      'You avoided reminders, conversations, places, or feelings connected to trauma.',
      'You felt watchful, jumpy, irritable, or easily startled.',
      'You felt numb, detached, or distant from people.',
      'Trauma-related symptoms interfered with work, school, sleep, or relationships.'
    ]
  },
  addiction: {
    title: 'Addiction Test',
    description: 'A brief Sucha screen for loss of control, cravings, consequences, and difficulty cutting back.',
    questions: [
      'You used a substance or behavior more than you intended.',
      'Cravings or urges felt strong or distracting.',
      'The pattern caused problems with health, money, work, school, or relationships.',
      'You hid, minimized, or felt guilty about the behavior.',
      'You tried to cut back but could not sustain the change.'
    ]
  },
  gambling: {
    title: 'Gambling Addiction Test',
    description: 'A brief Sucha screen for gambling urges, chasing losses, secrecy, and financial strain.',
    questions: [
      'You gambled with more money or time than planned.',
      'You tried to win back losses by gambling again.',
      'You hid gambling or minimized its impact.',
      'Gambling created debt, borrowing, conflict, or stress.',
      'You felt restless, irritable, or preoccupied when trying to stop.'
    ]
  },
  socialAnxiety: {
    title: 'Social Anxiety Test',
    description: 'A brief Sucha screen for fear of judgment, avoidance, and after-the-fact rumination.',
    questions: [
      'You feared being judged, embarrassed, or visibly anxious around others.',
      'You avoided conversations, meetings, calls, events, or public tasks.',
      'Your body reacted strongly in social situations.',
      'You replayed interactions and criticized yourself afterward.',
      'Social fear limited work, school, relationships, or daily life.'
    ]
  },
  postpartum: {
    title: 'Postpartum Depression Test',
    description: 'A brief Sucha screen for new or expecting parents noticing mood, anxiety, overwhelm, or safety concerns.',
    safety: true,
    questions: [
      'You felt persistently sad, tearful, numb, or unlike yourself.',
      'Anxiety about the baby, pregnancy, or parenting felt hard to calm.',
      'Guilt, shame, or overwhelm made it hard to function.',
      'Sleep or appetite felt disrupted beyond normal care demands.',
      'You had thoughts of harming yourself, the baby, or someone else.'
    ]
  },
  parent: {
    title: "Parent Test: Your Child's Mental Health",
    description: 'A brief Sucha screen for parents noticing emotional, attention, behavioral, social, or safety changes in a child.',
    safety: true,
    questions: [
      'Your child seemed unusually sad, worried, angry, or withdrawn.',
      'Attention, impulsivity, or behavior problems interfered with school or home.',
      'Sleep, appetite, energy, or hygiene changed noticeably.',
      'Your child pulled away from friends, family, or usual activities.',
      'Your child talked about self-harm, not wanting to live, or feeling unsafe.'
    ]
  },
  youth: {
    title: 'Youth Mental Health Test',
    description: 'A brief Sucha screen for ages 11-17 noticing mood, anxiety, focus, relationships, or safety concerns.',
    safety: true,
    questions: [
      'You felt sad, worried, angry, numb, or overwhelmed.',
      'Focus, motivation, or schoolwork felt harder than usual.',
      'Sleep, appetite, or energy changed in a way that bothered you.',
      'You pulled away from people or had more conflict than usual.',
      'You thought about hurting yourself or not wanting to be alive.'
    ]
  },
  goodDay: {
    title: 'Survey: What Makes a Good Day?',
    description: 'A Sucha reflection survey about the conditions that make a day feel steadier, more connected, and more workable.',
    survey: true,
    questions: [
      'You had enough sleep or rest to meet the day.',
      'You felt connected to at least one supportive person.',
      'You had a clear purpose, priority, or meaningful activity.',
      'Your body had what it needed: food, movement, medication, or quiet.',
      'You had moments of ease, play, gratitude, or relief.'
    ]
  },
  psychedelics: {
    title: 'Psychedelics & Mental Health Survey',
    description: 'A Sucha reflection survey about perceived benefits, risks, support, and education needs around psychedelics.',
    survey: true,
    questions: [
      'You are curious about psychedelic-assisted mental health care.',
      'You believe potential benefits should be studied carefully.',
      'You have concerns about psychological, medical, legal, or safety risks.',
      'You think professional screening and support matter in this area.',
      'You would value balanced education before making any decision.'
    ]
  },
  aiMentalHealth: {
    title: 'AI & Mental Health Survey',
    description: 'A Sucha reflection survey about comfort, trust, privacy, and human support in AI mental health tools.',
    survey: true,
    questions: [
      'You would use AI for check-ins, journaling, or early reflection.',
      'Privacy and data control are important to your willingness to use AI.',
      'You want clear handoff to a human professional when risk is higher.',
      'You trust AI more when it explains uncertainty and limitations.',
      'You are interested in AI tools that support, but do not replace, care.'
    ]
  },
  selfInjury: {
    title: 'Self-Injury Survey',
    description: 'A support-oriented Sucha survey for people noticing self-injury urges, triggers, or recent harm.',
    safety: true,
    survey: true,
    questions: [
      'You had urges to hurt yourself on purpose.',
      'You hurt yourself on purpose, even without wanting to die.',
      'Stress, numbness, anger, shame, or overwhelm triggered the urge.',
      'It was hard to pause, delay, or choose another coping option.',
      'You felt alone with it or unsure who could support you safely.'
    ]
  }
};

const riasecQuestions = [
  ['R', 'I like to work on cars.'],
  ['I', 'I like to do puzzles.'],
  ['A', 'I am good at working independently.'],
  ['S', 'I like to work in teams.'],
  ['E', 'I am an ambitious person; I set goals for myself.'],
  ['C', 'I like to organize things, files, desks, or offices.'],
  ['R', 'I like to build things.'],
  ['A', 'I like to read about art and music.'],
  ['C', 'I like to have clear instructions to follow.'],
  ['E', 'I like to try to influence or persuade people.'],
  ['I', 'I like to do experiments.'],
  ['S', 'I like to teach or train people.'],
  ['S', 'I like trying to help people solve their problems.'],
  ['R', 'I like to take care of animals.'],
  ['C', 'I would not mind working 8 hours per day in an office.'],
  ['E', 'I like selling things.'],
  ['A', 'I enjoy creative writing.'],
  ['I', 'I enjoy science.'],
  ['E', 'I am quick to take on new responsibilities.'],
  ['S', 'I am interested in healing people.'],
  ['I', 'I enjoy trying to figure out how things work.'],
  ['R', 'I like putting things together or assembling things.'],
  ['A', 'I am a creative person.'],
  ['C', 'I pay attention to details.'],
  ['C', 'I like to do filing or typing.'],
  ['I', 'I like to analyze things, problems, or situations.'],
  ['A', 'I like to play instruments or sing.'],
  ['S', 'I enjoy learning about other cultures.'],
  ['E', 'I would like to start my own business.'],
  ['R', 'I like to cook.'],
  ['A', 'I like acting in plays.'],
  ['R', 'I am a practical person.'],
  ['I', 'I like working with numbers or charts.'],
  ['S', 'I like to get into discussions about issues.'],
  ['C', 'I am good at keeping records of my work.'],
  ['E', 'I like to lead.'],
  ['R', 'I like working outdoors.'],
  ['C', 'I would like to work in an office.'],
  ['I', 'I am good at math.'],
  ['S', 'I like helping people.'],
  ['A', 'I like to draw.'],
  ['E', 'I like to give speeches.']
];

const riasecTypes = {
  R: {
    title: 'Realistic',
    description: 'Hands-on, practical, mechanical, outdoor, technical, or building-focused work.',
    pathways: ['Natural resources', 'Health services', 'Industrial and engineering technology']
  },
  I: {
    title: 'Investigative',
    description: 'Analyzing, researching, experimenting, solving problems, and understanding how things work.',
    pathways: ['Health services', 'Business', 'Industrial and engineering technology']
  },
  A: {
    title: 'Artistic',
    description: 'Creative, expressive, flexible, design-oriented, musical, visual, or performance-based work.',
    pathways: ['Arts and communication', 'Public and human services']
  },
  S: {
    title: 'Social',
    description: 'Helping, teaching, healing, supporting, counseling, or working closely with people.',
    pathways: ['Health services', 'Public and human services']
  },
  E: {
    title: 'Enterprising',
    description: 'Leading, persuading, selling, starting projects, managing people, or shaping decisions.',
    pathways: ['Business', 'Public and human services', 'Arts and communication']
  },
  C: {
    title: 'Conventional',
    description: 'Organizing details, records, data, systems, office workflows, numbers, and clear procedures.',
    pathways: ['Health services', 'Business', 'Industrial and engineering technology']
  }
};

const riasecScale = [
  ['Strongly disagree', 0],
  ['Disagree', 1],
  ['Not sure', 2],
  ['Agree', 3],
  ['Strongly agree', 4]
];

const rseScale = [
  ['Strongly disagree', 0],
  ['Disagree', 1],
  ['Agree', 2],
  ['Strongly agree', 3]
];

screeningTests.careerRiasec = {
  title: 'Career Pathway RIASEC Quiz',
  description: 'A one-question-at-a-time Holland Code interest quiz based on the attached RIASEC career pathway worksheet.',
  riasec: true,
  questions: riasecQuestions.map(([code, text]) => ({ code, text }))
};

const screeningScale = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
const screeningCards = document.querySelectorAll('.screening-card[data-test]');
const publicScreeningTests = new Set(['depression', 'bai']);
const screeningPanel = document.querySelector('#screening-panel');
const screeningTitle = document.querySelector('#screening-title');
const screeningDesc = document.querySelector('#screening-desc');
const screeningForm = document.querySelector('#screening-form');
const screeningResult = document.querySelector('#screening-result');
const screeningBand = document.querySelector('#screening-band');
const screeningNote = document.querySelector('#screening-note');
const screeningClose = document.querySelector('#screening-close');
let activeScreeningKey = null;
const screeningStepState = { index: 0, answers: [] };

function getScreeningInterpretation(test, score, maxScore, answeredValues) {
  const ratio = maxScore ? score / maxScore : 0;
  const highestSafetyAnswer = test.safety ? Math.max(...answeredValues) : 0;

  if (test.safety && highestSafetyAnswer >= 2) {
    return {
      band: 'Higher support signal',
      note: 'One or more safety-related answers were elevated. Please consider reaching out to a trusted person or qualified clinician now. If there is immediate danger, call local emergency services or a crisis line right away.'
    };
  }

  if (test.survey) {
    if (ratio <= 0.33) {
      return {
        band: 'Lower current alignment',
        note: 'Your answers suggest this area may need more attention, information, or support before it feels steady.'
      };
    }

    if (ratio <= 0.66) {
      return {
        band: 'Mixed reflection profile',
        note: 'Your answers show some supportive signals and some areas worth exploring further.'
      };
    }

    return {
      band: 'Strong reflection signal',
      note: 'Your answers show this topic is meaningful or active for you. Consider sharing the pattern with a clinician, coach, or trusted support if it affects decisions about care.'
    };
  }

  if (ratio <= 0.2) {
    return {
      band: 'Low current signal',
      note: 'Your answers suggest a lower current signal on this screen. Keep watching patterns over time if symptoms change.'
    };
  }

  if (ratio <= 0.45) {
    return {
      band: 'Mild signal',
      note: 'Your answers suggest a mild signal. If it persists or affects daily life, consider discussing it with a qualified professional.'
    };
  }

  if (ratio <= 0.7) {
    return {
      band: 'Moderate signal',
      note: 'Your answers suggest a moderate signal. It may be useful to share these results with a qualified clinician for a fuller assessment.'
    };
  }

  return {
    band: 'High signal',
    note: 'Your answers suggest a high signal on this screen. This is not a diagnosis, but it is a good reason to seek support from a qualified clinician.'
  };
}

function getScreeningQuestions(test) {
  return test.riasec || test.rse ? test.questions : test.questions.map((text) => ({ text }));
}

function resultSupportNote() {
  return 'These results are informational only and should not be used as a diagnosis or as clinical advice. Please consult a qualified doctor, psychologist, therapist, or licensed counsellor for clinical guidance. If you are interested in being connected to qualified licensed doctors or counsellors, write to <a href="mailto:support@suchawellness.com?subject=Licensed%20doctor%20or%20counsellor%20connection">support@suchawellness.com</a>.';
}

function getResultMeaning(band, test) {
  if (test.survey) {
    return 'This summary reflects your current pattern of reflection on this topic. It can help you notice what feels supportive, uncertain, or worth discussing further.';
  }
  if (band.includes('Low')) {
    return 'Your answers do not show a strong current signal on this screen. That can be reassuring, but it does not rule out stress, symptoms, or the need for support if something still feels difficult.';
  }
  if (band.includes('Mild')) {
    return 'Your answers suggest some signs are present. A mild signal is often worth watching over time, especially if it lasts, repeats, or begins affecting sleep, work, study, relationships, or daily routines.';
  }
  if (band.includes('Moderate')) {
    return 'Your answers suggest a noticeable pattern. A moderate signal is a good reason to slow down, track what is happening, and consider sharing the pattern with a qualified professional.';
  }
  if (band.includes('Higher support')) {
    return 'Your answers included one or more safety-related concerns. It would be wise to seek support promptly from a trusted person or qualified clinician, and to use emergency or crisis services if there is immediate danger.';
  }
  return 'Your answers suggest a stronger signal on this screen. This does not confirm a diagnosis, but it is significant enough to consider timely support from a qualified professional.';
}

function showRiasecResult() {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  screeningStepState.answers.forEach((answer, index) => {
    const question = screeningTests.careerRiasec.questions[index];
    scores[question.code] += Number(answer ?? 0);
  });
  const ranked = Object.keys(scores).sort((a, b) => scores[b] - scores[a] || a.localeCompare(b));
  const code = ranked.slice(0, 3).join('');

  screeningBand.textContent = `Your Holland Code: ${code}`;
  screeningNote.innerHTML = `
    <div class="result-summary">
      <p>Your strongest themes are ${ranked.slice(0, 3).map((letter) => `${letter} - ${riasecTypes[letter].title}`).join(', ')}. Use this as a starting point for career reflection, not a fixed label.</p>
      <p>This pattern can point toward environments that may feel energizing: the kind of tasks you like, the level of structure you prefer, and whether you lean toward hands-on work, investigation, creativity, helping, leading, or organizing.</p>
    </div>
    <div class="riasec-result-grid">
      ${ranked.slice(0, 3).map((letter) => {
        const type = riasecTypes[letter];
        return `
          <div class="riasec-result-card">
            <div class="riasec-result-code">${letter}</div>
            <div class="riasec-result-title">${type.title} (${scores[letter]})</div>
            <p>${type.description}</p>
            <ul>${type.pathways.map((pathway) => `<li>${pathway}</li>`).join('')}</ul>
          </div>
        `;
      }).join('')}
    </div>
    <p class="result-support-note">Career interests can change with exposure, confidence, training, and life stage. If you want help turning this into course, college, or career decisions, consider speaking with a qualified career counsellor or licensed mental health professional.</p>
  `;
  screeningResult.hidden = false;
}

function getRseBand(score) {
  if (score < 15) {
    return {
      band: 'Lower self-esteem range',
      note: 'Your answers suggest self-esteem may be feeling strained right now. This can show up as self-criticism, difficulty recognizing strengths, or feeling less worthy than others.'
    };
  }

  if (score <= 25) {
    return {
      band: 'Typical self-esteem range',
      note: 'Your answers fall in a common middle range. This can mean you recognize some strengths while still having moments of doubt, criticism, or low confidence.'
    };
  }

  return {
    band: 'Higher self-esteem range',
    note: 'Your answers suggest a stronger current sense of self-worth and self-respect. It can still be helpful to notice situations that affect confidence over time.'
  };
}

function showRseResult(test) {
  const scoredValues = screeningStepState.answers.map((answer, index) => {
    const value = Number(answer);
    return test.questions[index].reverse ? 3 - value : value;
  });
  const score = scoredValues.reduce((total, value) => total + value, 0);
  const positiveItems = scoredValues.filter((value) => value >= 2).length;
  const interpretation = getRseBand(score);

  screeningBand.textContent = `${interpretation.band} (${score}/30)`;
  screeningNote.innerHTML = `
    <div class="result-summary">
      <p><strong>What this means:</strong> ${interpretation.note} The Rosenberg Self-Esteem Scale is best read as a snapshot of how you are relating to yourself today, not as a fixed label.</p>
      <p><strong>Your pattern:</strong> After reverse scoring the negatively worded items, ${positiveItems} of ${scoredValues.length} answers leaned toward a stronger self-esteem response. Scores are commonly read with lower scores suggesting more self-esteem strain and higher scores suggesting stronger self-regard.</p>
      <p><strong>Suggested next step:</strong> If this score feels low, painful, or very different from how you usually feel, consider journaling about the situations that affect your self-respect and discussing the pattern with a qualified counsellor, therapist, psychologist, or doctor.</p>
      <p class="result-support-note">${resultSupportNote()}</p>
    </div>
  `;
  screeningResult.hidden = false;
}

function showScreeningResult(test) {
  if (test.riasec) {
    showRiasecResult();
    return;
  }

  if (test.rse) {
    showRseResult(test);
    return;
  }

  const answeredValues = screeningStepState.answers.map((value) => Number(value));
  const score = answeredValues.reduce((total, value) => total + value, 0);
  const maxScore = test.questions.length * (screeningScale.length - 1);
  const interpretation = getScreeningInterpretation(test, score, maxScore, answeredValues);
  const answeredHigh = answeredValues.filter((value) => value >= 2).length;
  const answeredAny = answeredValues.filter((value) => value > 0).length;

  screeningBand.textContent = `${interpretation.band} (${score}/${maxScore})`;
  screeningNote.innerHTML = `
    <div class="result-summary">
      <p><strong>What this means:</strong> ${getResultMeaning(interpretation.band, test)}</p>
      <p><strong>Your pattern:</strong> You endorsed ${answeredAny} of ${answeredValues.length} items at least a little, with ${answeredHigh} items in the more noticeable range. The score is best read as a snapshot of how things feel right now, not a permanent label.</p>
      <p><strong>Suggested next step:</strong> ${interpretation.note}</p>
      <p class="result-support-note">${resultSupportNote()}</p>
    </div>
  `;
  screeningResult.hidden = false;
}

function renderScreeningStep() {
  const test = screeningTests[activeScreeningKey];
  if (!test || !screeningPanel || !screeningForm) return;
  const questions = getScreeningQuestions(test);
  const question = questions[screeningStepState.index];
  const isFinalQuestion = screeningStepState.index === questions.length - 1;
  const scale = test.riasec ? riasecScale : test.rse ? rseScale : screeningScale.map((label, value) => [label, value]);

  screeningForm.innerHTML = '';
  screeningResult.hidden = true;
  screeningNote.textContent = '';

  const progress = document.createElement('div');
  const progressBar = document.createElement('div');
  const progressFill = document.createElement('span');
  const item = document.createElement('div');
  const heading = document.createElement('div');
  const options = document.createElement('div');
  const nav = document.createElement('div');
  const back = document.createElement('button');
  const reset = document.createElement('button');

  progress.className = 'riasec-progress';
  progress.textContent = `Question ${screeningStepState.index + 1} of ${questions.length}`;
  progressBar.className = 'riasec-progress-bar';
  progressFill.className = 'riasec-progress-fill';
  progressFill.style.width = `${((screeningStepState.index + 1) / questions.length) * 100}%`;
  progressBar.append(progressFill);

  item.className = 'riasec-question';
  heading.className = 'inline-question-title';
  heading.textContent = question.text;
  options.className = 'riasec-options';
  options.setAttribute('role', 'group');
  options.setAttribute('aria-label', question.text);

  scale.forEach(([label, value]) => {
    const option = document.createElement('button');
    option.className = 'riasec-option';
    option.type = 'button';
    option.textContent = label;
    option.addEventListener('click', () => {
      screeningStepState.answers[screeningStepState.index] = value;
      if (isFinalQuestion) {
        screeningForm.innerHTML = '';
        showScreeningResult(test);
        trackSuchaEvent('test_submitted', { test: activeScreeningKey });
        return;
      }
      screeningStepState.index += 1;
      renderScreeningStep();
    });
    options.append(option);
  });

  nav.className = 'riasec-nav';
  back.className = 'test-reset';
  back.type = 'button';
  back.textContent = 'Back';
  back.disabled = screeningStepState.index === 0;
  back.addEventListener('click', () => {
    if (screeningStepState.index === 0) return;
    screeningStepState.index -= 1;
    renderScreeningStep();
  });

  reset.className = 'test-reset';
  reset.type = 'button';
  reset.textContent = 'Reset';
  reset.addEventListener('click', () => {
    screeningStepState.index = 0;
    screeningStepState.answers = [];
    renderScreeningStep();
  });

  item.append(heading, options);
  nav.append(back, reset);
  screeningForm.append(progress, progressBar, item, nav);
}

function renderScreeningTest(key) {
  const test = screeningTests[key];
  if (!test || !screeningPanel || !screeningForm) return;

  activeScreeningKey = key;
  screeningStepState.index = 0;
  screeningStepState.answers = [];
  screeningTitle.textContent = test.title;
  screeningDesc.textContent = test.description;
  screeningResult.hidden = true;
  renderScreeningStep();

  screeningPanel.hidden = false;
  screeningPanel.classList.add('visible');
  screeningPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  trackSuchaEvent('test_opened', { test: key });
}

screeningCards.forEach((card) => {
  card.addEventListener('click', async () => {
    const key = card.dataset.test;
    const test = screeningTests[key];
    if (publicScreeningTests.has(key)) {
      renderScreeningTest(key);
      return;
    }
    const ok = await requireSuchaVerification({
      mode: 'tool',
      tool: test?.title || 'Sucha screening test',
      toolType: 'test',
    });
    if (ok) renderScreeningTest(key);
  });
});

screeningClose?.addEventListener('click', () => {
  screeningPanel.hidden = true;
  screeningForm.innerHTML = '';
  screeningResult.hidden = true;
  activeScreeningKey = null;
  screeningStepState.index = 0;
  screeningStepState.answers = [];
});

const hamaForm = document.querySelector('#hama-form');
const hamaScore = document.querySelector('#hama-score');
const hamaBand = document.querySelector('#hama-band');
const hamaNote = document.querySelector('#hama-note');
const hamaReset = document.querySelector('#hama-reset');
const ratingLabels = ['None', 'Mild', 'Moderate', 'Severe', 'Very severe'];

function getHamaInterpretation(score, answered) {
  if (answered === 0) {
    return {
      band: 'No anxiety selected',
      note: 'Choose a rating for each item to calculate the Hamilton Anxiety Rating Scale total.'
    };
  }

  if (score <= 17) {
    return {
      band: 'Mild range',
      note: 'Common HAM-A guidance places scores of 17 or less in the mild anxiety severity range.'
    };
  }

  if (score <= 24) {
    return {
      band: 'Mild to moderate range',
      note: 'Common HAM-A guidance places scores from 18 to 24 in the mild to moderate range.'
    };
  }

  if (score <= 30) {
    return {
      band: 'Moderate to severe range',
      note: 'Common HAM-A guidance places scores from 25 to 30 in the moderate to severe range.'
    };
  }

  return {
    band: 'Severe range',
    note: 'Scores above 30 can indicate high anxiety severity and should be discussed with a qualified clinician.'
  };
}

function updateHamaScore() {
  if (!hamaForm) return;

  const checkedRatings = [...hamaForm.querySelectorAll('input[type="radio"]:checked')];
  const score = checkedRatings.reduce((total, input) => total + Number(input.value), 0);
  const interpretation = getHamaInterpretation(score, checkedRatings.length);

  hamaScore.textContent = score;
  hamaBand.textContent = interpretation.band;
  hamaNote.textContent = interpretation.note;
}

if (hamaForm) {
  hamaForm.querySelectorAll('.rating-options').forEach((group, index) => {
    ratingLabels.forEach((label, value) => {
      const option = document.createElement('label');
      const input = document.createElement('input');
      const valueText = document.createElement('span');
      const labelText = document.createElement('span');

      input.type = 'radio';
      input.name = `hama-${index + 1}`;
      input.value = value;

      valueText.className = 'rating-value';
      valueText.textContent = value;

      labelText.className = 'rating-label';
      labelText.textContent = label;

      option.append(input, valueText, labelText);
      group.append(option);
    });
  });

  const hamaItems = [...hamaForm.querySelectorAll('.test-item')];
  const hamaStepState = { index: 0 };
  const hamaStepControls = document.createElement('div');
  const hamaProgress = document.createElement('div');
  const hamaProgressBar = document.createElement('div');
  const hamaProgressFill = document.createElement('span');
  const hamaNav = document.createElement('div');
  const hamaBack = document.createElement('button');
  const hamaResetStep = document.createElement('button');

  hamaStepControls.className = 'hama-step-controls';
  hamaProgress.className = 'riasec-progress';
  hamaProgressBar.className = 'riasec-progress-bar';
  hamaProgressFill.className = 'riasec-progress-fill';
  hamaNav.className = 'riasec-nav';
  hamaBack.className = 'test-reset';
  hamaBack.type = 'button';
  hamaBack.textContent = 'Back';
  hamaResetStep.className = 'test-reset';
  hamaResetStep.type = 'button';
  hamaResetStep.textContent = 'Reset';
  hamaProgressBar.append(hamaProgressFill);
  hamaNav.append(hamaBack, hamaResetStep);
  hamaStepControls.append(hamaProgress, hamaProgressBar);
  hamaForm.insertBefore(hamaStepControls, hamaItems[0] || null);
  hamaForm.append(hamaNav);

  function renderHamaStep() {
    hamaItems.forEach((item, index) => {
      item.hidden = index !== hamaStepState.index;
      item.classList.toggle('visible', index === hamaStepState.index);
    });
    hamaProgress.textContent = `Question ${hamaStepState.index + 1} of ${hamaItems.length}`;
    hamaProgressFill.style.width = `${((hamaStepState.index + 1) / hamaItems.length) * 100}%`;
    hamaBack.disabled = hamaStepState.index === 0;
  }

  hamaBack.addEventListener('click', () => {
    if (hamaStepState.index === 0) return;
    hamaStepState.index -= 1;
    renderHamaStep();
  });

  hamaResetStep.addEventListener('click', () => {
    hamaForm.reset();
    hamaStepState.index = 0;
    updateHamaScore();
    renderHamaStep();
  });

  hamaForm.addEventListener('click', async (event) => {
    const input = event.target.closest?.('input[type="radio"]');
    if (!input || await hasSuchaVerification()) return;
    event.preventDefault();
    event.stopPropagation();
    input.checked = false;
    await requireSuchaVerification({ mode: 'tool', tool: 'Hamilton Anxiety Rating Scale', toolType: 'test' });
  }, true);

  hamaForm.addEventListener('change', (event) => {
    updateHamaScore();
    if (!event.target.closest?.('input[type="radio"]')) return;
    if (hamaStepState.index < hamaItems.length - 1) {
      hamaStepState.index += 1;
      renderHamaStep();
    }
  });
  hamaReset?.addEventListener('click', () => {
    hamaForm.reset();
    hamaStepState.index = 0;
    updateHamaScore();
    renderHamaStep();
  });
  renderHamaStep();
}

const journalLegacyStorageKey = 'sucha-journal-entries';
const journalVaultStorageKey = 'sucha-journal-vault:v1';
const journalAccessStorageKey = 'sucha-journal-premium-access:v1';
const journalReminderEnabledKey = 'sucha-journal-reminder-enabled:v1';
const journalReminderLastShownKey = 'sucha-journal-reminder-last-shown:v1';
const journalPlanId = 'journal_monthly_5';
const journalProduct = 'SuchaJournal';
const journalGuaranteeDays = 30;
const journalMonthlyPrice = '$5/month';
const journalForm = document.querySelector('#journal-form');
const journalTitle = document.querySelector('#journal-title');
const journalMood = document.querySelector('#journal-mood');
const journalBody = document.querySelector('#journal-body');
const journalSearch = document.querySelector('#journal-search');
const journalList = document.querySelector('#journal-list');
const journalCount = document.querySelector('#journal-count');
const journalLatest = document.querySelector('#journal-latest');
const journalReminderButton = document.querySelector('#journal-reminder-button');
const journalReminderReset = document.querySelector('#journal-reminder-reset');
const journalReminderStatus = document.querySelector('#journal-reminder-status');
const journalWeek = document.querySelector('#journal-week');
const journalStatus = document.querySelector('#journal-status');
const journalPrivate = document.querySelector('#journal-private');
const journalLock = document.querySelector('#journal-lock');
const journalBillingEmail = document.querySelector('#journal-billing-email');
const journalPremiumPassword = document.querySelector('#journal-premium-password');
const journalCouponCode = document.querySelector('#journal-coupon-code');
const journalUnlockPassword = document.querySelector('#journal-unlock-password');
const journalTrialButton = document.querySelector('#journal-trial-button');
const journalCouponButton = document.querySelector('#journal-coupon-button');
const journalUnlockButton = document.querySelector('#journal-unlock-button');
const journalLockUnlockButton = document.querySelector('#journal-lock-unlock-button');
const journalPremiumStatus = document.querySelector('#journal-premium-status');

addPasswordVisibilityToggle(journalPremiumPassword, 'journal password');
addPasswordVisibilityToggle(journalUnlockPassword, 'journal password');

const journalVaultState = {
  entries: [],
  unlocked: false,
  key: null,
  access: null,
};

function setJournalStatus(message) {
  if (journalStatus) journalStatus.textContent = message;
}

function setJournalPremiumStatus(message) {
  if (journalPremiumStatus) journalPremiumStatus.textContent = message;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function setJournalReminderStatus(message) {
  if (journalReminderStatus) journalReminderStatus.textContent = message;
}

function updateJournalReminderStatus() {
  if (localStorage.getItem(journalReminderEnabledKey) === 'true') {
    const permission = 'Notification' in window ? Notification.permission : 'unavailable';
    setJournalReminderStatus(permission === 'granted'
      ? 'Daily local reminder is on with browser notifications.'
      : 'Daily local reminder is on. Browser notifications are optional.');
    if (journalReminderButton) journalReminderButton.textContent = 'Reminder on';
  } else {
    setJournalReminderStatus('Reminder is off.');
    if (journalReminderButton) journalReminderButton.textContent = 'Enable reminder';
  }
}

function showJournalReminderIfDue() {
  if (localStorage.getItem(journalReminderEnabledKey) !== 'true') return;
  if (localStorage.getItem(journalReminderLastShownKey) === todayKey()) return;
  localStorage.setItem(journalReminderLastShownKey, todayKey());
  setJournalStatus('Gentle reminder: write one sentence in your journal today.');
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Sucha Journal', {
      body: 'A gentle reminder to write one sentence today.',
      icon: '/assets/sucha-web-icon-180.png',
    });
  }
  trackSuchaEvent('journal_reminder_shown');
}

async function enableJournalReminder() {
  localStorage.setItem(journalReminderEnabledKey, 'true');
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch {
      // On-site reminders still work even when browser notifications are unavailable.
    }
  }
  updateJournalReminderStatus();
  showJournalReminderIfDue();
  trackSuchaEvent('journal_reminder_enabled');
}

function resetJournalReminderToday() {
  localStorage.removeItem(journalReminderLastShownKey);
  showJournalReminderIfDue();
}

function readLegacyJournalEntries() {
  try {
    const parsed = JSON.parse(localStorage.getItem(journalLegacyStorageKey) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLegacyJournalEntries(entries) {
  localStorage.setItem(journalLegacyStorageKey, JSON.stringify(entries));
}

function readJournalAccess() {
  try {
    const parsed = JSON.parse(localStorage.getItem(journalAccessStorageKey) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function saveJournalAccess(access) {
  localStorage.setItem(journalAccessStorageKey, JSON.stringify(access));
  journalVaultState.access = access;
}

function hasActiveJournalAccess(access = readJournalAccess()) {
  return !!access?.expiresAt && Number(access.expiresAt) > Date.now();
}

function getJournalVaultPayload() {
  try {
    const parsed = JSON.parse(localStorage.getItem(journalVaultStorageKey) || 'null');
    return parsed && parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveJournalKey(password, salt) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 250000,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptJournalEntries(entries, key, salt) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(entries));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return {
    version: 1,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: 250000,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
    updatedAt: new Date().toISOString(),
  };
}

async function decryptJournalEntries(payload, password) {
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const data = base64ToBytes(payload.data);
  const key = await deriveJournalKey(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  const entries = JSON.parse(new TextDecoder().decode(decrypted));
  if (!Array.isArray(entries)) throw new Error('Journal vault is not readable.');
  return { entries, key, salt };
}

async function writeEncryptedJournalEntries(entries) {
  const payload = getJournalVaultPayload();
  if (!payload || !journalVaultState.key) throw new Error('Unlock the encrypted journal first.');
  const encrypted = await encryptJournalEntries(entries, journalVaultState.key, base64ToBytes(payload.salt));
  localStorage.setItem(journalVaultStorageKey, JSON.stringify(encrypted));
  journalVaultState.entries = entries;
}

function readJournalEntries() {
  return journalVaultState.unlocked ? journalVaultState.entries : readLegacyJournalEntries();
}

async function writeJournalEntries(entries) {
  if (journalVaultState.unlocked) {
    await writeEncryptedJournalEntries(entries);
    return;
  }
  writeLegacyJournalEntries(entries);
}

function formatJournalDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

function getJournalWeekCount(entries) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return entries.filter((entry) => new Date(entry.createdAt) >= weekAgo).length;
}

function renderJournalEntries() {
  if (!journalList) return;

  const entries = readJournalEntries().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const query = journalSearch?.value.trim().toLowerCase() || '';
  const filtered = query
    ? entries.filter((entry) => `${entry.title} ${entry.mood} ${entry.body}`.toLowerCase().includes(query))
    : entries;

  journalCount.textContent = entries.length;
  journalLatest.textContent = entries[0]?.mood || '-';
  journalWeek.textContent = getJournalWeekCount(entries);

  journalList.replaceChildren();

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'journal-empty';
    empty.textContent = entries.length === 0
      ? 'No entries yet. Start with one sentence about what felt true today.'
      : 'No entries match that search.';
    journalList.append(empty);
    return;
  }

  filtered.forEach((entry) => {
    const article = document.createElement('article');
    const head = document.createElement('div');
    const title = document.createElement('div');
    const mood = document.createElement('span');
    const meta = document.createElement('div');
    const preview = document.createElement('p');
    const remove = document.createElement('button');

    article.className = 'journal-entry';
    head.className = 'journal-entry-head';
    title.className = 'journal-entry-title';
    mood.className = 'journal-entry-mood';
    meta.className = 'journal-entry-meta';
    preview.className = 'journal-entry-preview';
    remove.className = 'journal-entry-delete';

    title.textContent = entry.title;
    mood.textContent = entry.mood;
    meta.textContent = formatJournalDate(entry.createdAt);
    preview.textContent = entry.body;
    remove.type = 'button';
    remove.textContent = 'Delete entry';
    remove.addEventListener('click', async () => {
      const nextEntries = readJournalEntries().filter((item) => item.id !== entry.id);
      try {
        await writeJournalEntries(nextEntries);
        setJournalStatus(journalVaultState.unlocked ? 'Encrypted entry deleted.' : 'Entry deleted.');
        trackSuchaEvent('journal_entry_deleted', { mode: journalVaultState.unlocked ? 'premium' : 'free' });
        renderJournalEntries();
      } catch (error) {
        setJournalStatus(error.message || 'Could not delete entry.');
      }
    });

    head.append(title, mood);
    article.append(head, meta, preview, remove);
    journalList.append(article);
  });
}

function updateJournalGate() {
  const active = hasActiveJournalAccess();
  const vault = getJournalVaultPayload();

  if (journalPrivate) journalPrivate.hidden = false;
  if (journalLock) journalLock.hidden = !vault || journalVaultState.unlocked;

  if (journalTrialButton) {
    journalTrialButton.textContent = active ? 'Premium active' : 'Upgrade to premium';
    journalTrialButton.disabled = active && !!vault && journalVaultState.unlocked;
  }

  if (active && vault && !journalVaultState.unlocked) {
    setJournalPremiumStatus('Premium is active. Enter your journal password to decrypt this browser vault. Email verification cannot unlock encrypted notes.');
  } else if (active && !vault) {
    setJournalPremiumStatus('Premium is active. Set a journal password to create the encrypted vault.');
  } else if (journalVaultState.unlocked) {
    const access = readJournalAccess();
    const date = access?.expiresAt ? formatJournalDate(access.expiresAt) : 'your renewal date';
    setJournalPremiumStatus(`Encrypted journal unlocked. Premium active until ${date}.`);
  } else {
    setJournalPremiumStatus('Your journal is currently stored locally only. Upgrade for a password-protected encrypted vault, with a 30-day money-back guarantee.');
  }

  renderJournalEntries();
}

async function openJournalVault(password, { createIfMissing = false } = {}) {
  if (!crypto?.subtle || !window.isSecureContext) {
    throw new Error('Encrypted journal needs HTTPS or localhost with Web Crypto support.');
  }
  if (!hasActiveJournalAccess()) {
    throw new Error('Upgrade to premium or restore premium access first.');
  }
  if (!password || password.length < 8) {
    throw new Error('Use a journal password of at least 8 characters.');
  }

  const payload = getJournalVaultPayload();
  if (!payload) {
    if (!createIfMissing) throw new Error('No encrypted vault exists yet. Enter an email and password, then upgrade to premium.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveJournalKey(password, salt);
    const migratedEntries = readLegacyJournalEntries();
    const encrypted = await encryptJournalEntries(migratedEntries, key, salt);
    localStorage.setItem(journalVaultStorageKey, JSON.stringify(encrypted));
    localStorage.removeItem(journalLegacyStorageKey);
    journalVaultState.entries = migratedEntries;
    journalVaultState.key = key;
    journalVaultState.unlocked = true;
    setJournalStatus(migratedEntries.length ? 'Free journal entries migrated into the encrypted vault.' : 'Encrypted journal ready.');
    return;
  }

  const unlocked = await decryptJournalEntries(payload, password);
  journalVaultState.entries = unlocked.entries;
  journalVaultState.key = unlocked.key;
  journalVaultState.unlocked = true;
  setJournalStatus('Encrypted journal unlocked.');
}

function normalizeJournalEmail(value) {
  return value.trim().toLowerCase();
}

async function ensureRazorpayLoaded() {
  if (typeof Razorpay !== 'undefined') return true;
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(typeof Razorpay !== 'undefined'), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      setTimeout(() => resolve(typeof Razorpay !== 'undefined'), 7000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(typeof Razorpay !== 'undefined');
    script.onerror = () => resolve(false);
    document.head.append(script);
    setTimeout(() => resolve(typeof Razorpay !== 'undefined'), 7000);
  });
}

async function createJournalCheckout(email) {
  const payload = {
    planId: journalPlanId,
    product: journalProduct,
    email,
    guaranteeDays: journalGuaranteeDays,
    amountUsd: 5,
  };

  const endpoints = suchaApiBases.map((base) => `${base}/api/create-order`);
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) return data;
      lastError = new Error(data.error || `Checkout endpoint ${endpoint} failed.`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Could not create Razorpay checkout.');
}

async function verifyJournalCheckout(email, checkout, response) {
  const payload = {
    planId: journalPlanId,
    product: journalProduct,
    email,
    guaranteeDays: journalGuaranteeDays,
    checkoutMode: checkout.mode || (checkout.subscriptionId ? 'subscription' : 'order'),
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_subscription_id: response.razorpay_subscription_id,
    razorpay_signature: response.razorpay_signature,
  };

  const endpoints = suchaApiBases.map((base) => `${base}/api/verify-payment`);
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const verifyResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await verifyResponse.json().catch(() => ({}));
      if (verifyResponse.ok && data.ok !== false) return data;
      lastError = new Error(data.error || `Verification endpoint ${endpoint} failed.`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Could not verify Razorpay checkout.');
}

async function startJournalPremiumTrial() {
  if (location.protocol === 'file:') throw new Error('Open the live site to use Razorpay Checkout.');

  const email = normalizeJournalEmail(journalBillingEmail?.value || '');
  const password = journalPremiumPassword?.value || '';
  if (!email) throw new Error('Enter an email for premium and support.');
  if (!password || password.length < 8) throw new Error('Choose a journal password of at least 8 characters.');

  const ready = await ensureRazorpayLoaded();
  if (!ready) throw new Error('Razorpay Checkout could not load. Check the connection and try again.');

  journalTrialButton.disabled = true;
  setJournalPremiumStatus('Opening secure Razorpay checkout...');

  try {
    const checkout = await createJournalCheckout(email);
    const options = {
      key: checkout.keyId,
      name: 'Sucha Wellness',
      description: `Encrypted Journal - ${journalMonthlyPrice}, 30-day money-back guarantee`,
      prefill: { email },
      theme: { color: '#2D7A6B' },
      handler: async (response) => {
        try {
          setJournalPremiumStatus('Verifying Razorpay checkout...');
          const verified = await verifyJournalCheckout(email, checkout, response);
          const now = Date.now();
          const expiresAt = Number(verified.expiresAt || (now + 31 * 24 * 60 * 60 * 1000));
          saveJournalAccess({
            source: verified.source || 'razorpay',
            planId: verified.planId || journalPlanId,
            email: verified.email || email,
            paymentId: verified.razorpayPaymentId || response.razorpay_payment_id,
            subscriptionId: verified.razorpaySubscriptionId || response.razorpay_subscription_id || checkout.subscriptionId,
            purchasedAt: now,
            expiresAt,
            guaranteeEndsAt: verified.guaranteeEndsAt || (now + journalGuaranteeDays * 24 * 60 * 60 * 1000),
            price: journalMonthlyPrice,
          });
          await openJournalVault(password, { createIfMissing: true });
          updateJournalGate();
          renderJournalEntries();
        } catch (error) {
          setJournalPremiumStatus(error.message || 'Payment verification failed.');
        } finally {
          journalTrialButton.disabled = false;
        }
      },
      modal: {
        ondismiss: () => {
          journalTrialButton.disabled = false;
          updateJournalGate();
        },
      },
    };

    if (checkout.subscriptionId) {
      options.subscription_id = checkout.subscriptionId;
    } else {
      options.amount = checkout.amount;
      options.currency = checkout.currency || 'USD';
      options.order_id = checkout.orderId;
    }

    const rz = new Razorpay(options);
    rz.on('payment.failed', (event) => {
      journalTrialButton.disabled = false;
      setJournalPremiumStatus(`Razorpay payment failed: ${event.error?.description || 'Try again.'}`);
    });
    rz.open();
  } catch (error) {
    journalTrialButton.disabled = false;
    throw error;
  }
}

async function redeemJournalCoupon() {
  const email = normalizeJournalEmail(journalBillingEmail?.value || '');
  const password = journalPremiumPassword?.value || '';
  const code = journalCouponCode?.value.trim().toUpperCase() || '';
  if (!email) throw new Error('Enter an email for premium and support.');
  if (!password || password.length < 8) throw new Error('Choose a journal password of at least 8 characters.');
  if (!code) throw new Error('Enter a coupon code.');

  journalCouponButton.disabled = true;
  setJournalPremiumStatus('Checking coupon...');
  trackSuchaEvent('coupon_attempt');
  try {
    let data = {};
    let lastError = null;
    for (const base of suchaApiBases) {
      try {
        const response = await fetch(`${base}/api/sucha-journal/redeem-coupon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, email }),
        });
        data = await response.json().catch(() => ({}));
        if (response.ok && data.ok !== false) {
          lastError = null;
          break;
        }
        lastError = new Error(data.error || 'Coupon could not be redeemed.');
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) throw lastError;
    saveJournalAccess({
      source: data.source || 'admin_coupon',
      planId: data.planId || journalPlanId,
      email: data.email || email,
      couponHash: data.couponHash,
      redeemedAt: Date.now(),
      expiresAt: Number(data.expiresAt || (Date.now() + 365 * 24 * 60 * 60 * 1000)),
      price: 'Coupon',
    });
    await openJournalVault(password, { createIfMissing: true });
    journalCouponCode.value = '';
    setJournalPremiumStatus('Coupon redeemed. Encrypted vault unlocked.');
    trackSuchaEvent('coupon_redeemed');
    updateJournalGate();
    renderJournalEntries();
  } finally {
    journalCouponButton.disabled = false;
  }
}

async function unlockJournalFromInput(input) {
  const password = input?.value || '';
  await openJournalVault(password, { createIfMissing: false });
  updateJournalGate();
  renderJournalEntries();
}

if (journalForm && journalTitle && journalMood && journalBody) {
  journalForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const ok = await requireSuchaVerification({ mode: 'tool', tool: 'Sucha Journal', toolType: 'journal' });
    if (!ok) {
      setJournalStatus('Verify your email to save journal entries.');
      return;
    }

    const entry = {
      id: `journal-${Date.now()}`,
      title: journalTitle.value.trim(),
      mood: journalMood.value,
      body: journalBody.value.trim(),
      createdAt: new Date().toISOString()
    };

    if (!entry.title || !entry.body) return;

    try {
      await writeJournalEntries([entry, ...readJournalEntries()]);
      journalForm.reset();
      setJournalStatus(journalVaultState.unlocked ? 'Encrypted entry saved in this browser.' : 'Entry saved locally in this browser.');
      trackSuchaEvent('journal_entry_saved', { mode: journalVaultState.unlocked ? 'premium' : 'free' });
      renderJournalEntries();
    } catch (error) {
      setJournalStatus(error.message || 'Could not save encrypted entry.');
    }
  });

  journalForm.addEventListener('reset', () => {
    setJournalStatus('Draft cleared.');
  });

  journalSearch?.addEventListener('input', renderJournalEntries);
}

journalReminderButton?.addEventListener('click', () => {
  enableJournalReminder().catch(() => setJournalReminderStatus('Could not enable browser notifications. On-site reminders are still available.'));
});

journalReminderReset?.addEventListener('click', resetJournalReminderToday);
updateJournalReminderStatus();
showJournalReminderIfDue();

journalTrialButton?.addEventListener('click', () => {
  trackSuchaEvent('premium_upgrade_click');
  startJournalPremiumTrial().catch((error) => setJournalPremiumStatus(error.message || 'Could not start premium.'));
});

journalCouponButton?.addEventListener('click', () => {
  redeemJournalCoupon().catch((error) => setJournalPremiumStatus(error.message || 'Could not redeem coupon.'));
});

journalUnlockButton?.addEventListener('click', () => {
  trackSuchaEvent('journal_unlock_click');
  unlockJournalFromInput(journalPremiumPassword).catch((error) => setJournalPremiumStatus(error.message || 'Could not unlock journal.'));
});

journalLockUnlockButton?.addEventListener('click', () => {
  trackSuchaEvent('journal_unlock_click');
  unlockJournalFromInput(journalUnlockPassword).catch((error) => setJournalPremiumStatus(error.message || 'Could not unlock journal.'));
});

journalUnlockPassword?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    journalLockUnlockButton?.click();
  }
});

journalVaultState.access = readJournalAccess();
updateJournalGate();
