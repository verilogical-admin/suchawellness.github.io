(function () {
  'use strict';

  const STORAGE_KEY = 'suchaEqGymLog.v1';
  const empathyLabAccessKey = 'suchaEmpathyLabAccess.v1';
  const empathyLabPlanId = 'empathy_lab_yearly_1000';
  const empathyLabProduct = 'SuchaEmpathyLabPremium';

  const compass = [
    {
      id: 'awareness',
      label: 'Self-awareness',
      color: '#2b7a6d',
      question: 'What is happening inside me right now?',
      strong: 'You can name feelings, body signals, urges, assumptions, and needs before they turn into behavior.',
      stress: 'Stress blurts out as certainty: "I am fine", "they are wrong", or "this is just how I am."',
      reps: [
        'Name one feeling, one body signal, and one need before replying.',
        'Separate facts from interpretation in one sentence.',
        'Ask: What emotion is driving my next sentence?'
      ]
    },
    {
      id: 'regulation',
      label: 'Self-regulation',
      color: '#4f6d9b',
      question: 'Can I choose my response before my nervous system chooses it for me?',
      strong: 'You can slow the moment down, stay boundaried, and speak from intention rather than impulse.',
      stress: 'You may attack, withdraw, freeze, perform calmness, or try to end the discomfort too quickly.',
      reps: [
        'Exhale longer than you inhale for three breaths.',
        'Say: I want to respond well. Give me a moment.',
        'Move from accusation to request.'
      ]
    },
    {
      id: 'values',
      label: 'Motivation and values',
      color: '#b88a3d',
      question: 'What kind of person do I want to be in this moment?',
      strong: 'You can keep your deeper aim visible even when approval, fear, pride, or pressure gets loud.',
      stress: 'The immediate win becomes more seductive than the long-term relationship or self-respect.',
      reps: [
        'Pick one value: honest, kind, precise, brave, patient, fair.',
        'Ask: What outcome will I respect tomorrow?',
        'Do the next small honest thing.'
      ]
    },
    {
      id: 'social',
      label: 'Social awareness',
      color: '#b95f67',
      question: 'What might be true for the other person?',
      strong: 'You read tone, context, pressure, motives, status, needs, and emotional cues without pretending to know everything.',
      stress: 'You mind-read with confidence, miss hidden shame or fear, or focus only on what their behavior did to you.',
      reps: [
        'Generate two generous hypotheses and one boundary-aware hypothesis.',
        'Notice pace, posture, word choice, and what they avoid.',
        'Ask a clarifying question before concluding.'
      ]
    },
    {
      id: 'relationship',
      label: 'Relationship management',
      color: '#7762a8',
      question: 'What response improves clarity, trust, or repair?',
      strong: 'You combine truth with timing, ask better questions, repair misses, and make conflict more workable.',
      stress: 'You become right but ineffective, nice but unclear, or silent but resentful.',
      reps: [
        'Use one clear observation, one feeling, one request.',
        'Repair fast: I did not say that well. Let me try again.',
        'Choose the next useful question.'
      ]
    }
  ];

  const weatherStates = [
    {
      id: 'clear',
      title: 'Clear',
      subtitle: 'Present, steady, curious',
      means: 'Your system has enough space to listen and choose. This is a good time for subtle conversations.',
      regulate: 'Stay slow enough to keep the other person with you.',
      avoid: 'Do not rush just because you feel capable.',
      response: 'Try: "Here is what I am noticing. What is your read?"'
    },
    {
      id: 'foggy',
      title: 'Foggy',
      subtitle: 'Confused, numb, overloaded',
      means: 'Your mind may be protecting you from too much data. Clarity will improve after grounding.',
      regulate: 'Name three facts, one uncertainty, and one next question.',
      avoid: 'Do not force a final decision while your signal is low.',
      response: 'Try: "I am not fully clear yet. Can we slow this down and define the main issue?"'
    },
    {
      id: 'stormy',
      title: 'Stormy',
      subtitle: 'Angry, hurt, urgent',
      means: 'The emotion is giving useful information, but it may be exaggerating threat and certainty.',
      regulate: 'Pause, lengthen your exhale, unclench your jaw, and make one request instead of one accusation.',
      avoid: 'Do not send the message that proves your pain but damages your aim.',
      response: 'Try: "I am upset, and I want to handle this well. I need a minute, then I want to talk about what happened."'
    },
    {
      id: 'charged',
      title: 'Charged',
      subtitle: 'Excited, anxious, activated',
      means: 'Energy is high. It can become courage or impulsivity depending on whether you ground it.',
      regulate: 'Turn the energy into a concrete next step and check the timing.',
      avoid: 'Do not confuse intensity with truth.',
      response: 'Try: "I care about this. The next useful step I see is..."'
    },
    {
      id: 'numb',
      title: 'Numb',
      subtitle: 'Flat, distant, shut down',
      means: 'Your body may be reducing feeling to keep you functional. Gentleness works better than pressure.',
      regulate: 'Warm your hands, feel your feet, and use simple language.',
      avoid: 'Do not mistake numbness for not caring.',
      response: 'Try: "I am a bit shut down, but I want to stay connected. Can we take this one piece at a time?"'
    }
  ];

  const scenarios = [
    {
      id: 'criticism',
      label: 'Someone criticizes your work',
      prompt: 'A manager says your work missed the mark in a blunt tone.',
      optimal: 'Thank you for telling me directly. I want to understand the gap. Which part matters most to fix first?'
    },
    {
      id: 'cold-message',
      label: 'A close person sends a cold message',
      prompt: 'Someone you care about replies with a short, distant message.',
      optimal: 'I noticed the message felt brief, and I may be reading too much into it. Are we okay, or is something on your mind?'
    },
    {
      id: 'ignored',
      label: 'You feel ignored',
      prompt: 'You shared something important and the other person changed the topic.',
      optimal: 'I want to come back to what I said because it matters to me. Could you give me a minute with it?'
    },
    {
      id: 'partner-conflict',
      label: 'Conflict with a partner',
      prompt: 'A disagreement is becoming repetitive and both of you sound tired.',
      optimal: 'I think we are moving into the old loop. I want to understand your concern and also say mine clearly.'
    },
    {
      id: 'team-pressure',
      label: 'Pressure in a team',
      prompt: 'A group is pushing for a fast decision and you sense a risk nobody is naming.',
      optimal: 'I can move quickly, and I want to name one risk before we commit so we do not create rework.'
    }
  ];

  const archetypes = [
    {
      title: 'The Reactor',
      accent: '#b95f67',
      pattern: 'Feels fast, speaks faster, then has to repair the blast radius.',
      move: 'Pause long enough to convert the emotion into one clean request.'
    },
    {
      title: 'The Overthinker',
      accent: '#4f6d9b',
      pattern: 'Tries to solve every possible meaning before saying anything real.',
      move: 'Share one grounded observation and one question.'
    },
    {
      title: 'The Peacekeeper',
      accent: '#2b7a6d',
      pattern: 'Keeps harmony by swallowing truth, then stores resentment quietly.',
      move: 'Practice kind firmness: "I want us to be okay, and I need to say this."'
    },
    {
      title: 'The Ice Wall',
      accent: '#7762a8',
      pattern: 'Looks calm from the outside while connection disappears inside.',
      move: 'Name shutdown without shame and request a slower pace.'
    },
    {
      title: 'The Fixer',
      accent: '#b88a3d',
      pattern: 'Moves quickly into advice because other people’s pain feels hard to witness.',
      move: 'Reflect before fixing: "That sounds heavy. What would help right now?"'
    },
    {
      title: 'The Grounded Adult',
      accent: '#2f7568',
      pattern: 'Feels the emotion, respects the facts, and chooses the next useful response.',
      move: 'Keep practicing repair, curiosity, and clear boundaries.'
    }
  ];

  const $ = (selector) => document.querySelector(selector);

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function loadLog() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveLog(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function activeAccess() {
    const access = loadJson(empathyLabAccessKey, null);
    if (!access) return null;
    if (access.expiresAt && Number(access.expiresAt) < Date.now()) return null;
    return access;
  }

  function setStatus(message) {
    const status = $('#eq-lab-status');
    if (status) status.textContent = message;
  }

  function updateGate() {
    const access = activeAccess();
    document.querySelectorAll('[data-premium-required]').forEach((section) => {
      section.classList.toggle('premium-locked', !access);
      section.querySelectorAll('input, textarea, select, button').forEach((control) => {
        control.disabled = !access;
      });
    });

    const checkout = $('#eq-lab-checkout-button');
    if (!access) {
      setStatus('Premium unlocks EQ Lab and Empathy Lab together.');
      if (checkout) {
        checkout.textContent = 'Upgrade $1000/year';
        checkout.disabled = false;
      }
      return;
    }

    const date = access.expiresAt ? new Date(access.expiresAt).toLocaleDateString() : '';
    setStatus(`Empathy + EQ Labs Premium active${access.email ? ` for ${access.email}` : ''}${date ? ` until ${date}` : ''}.`);
    if (checkout) {
      checkout.textContent = 'Premium active';
      checkout.disabled = true;
    }
  }

  async function redeemCoupon() {
    const email = normalizeEmail($('#eq-lab-email')?.value);
    const code = String($('#eq-lab-coupon')?.value || '').trim().toUpperCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid billing email.');
    if (!code) throw new Error('Enter an Empathy Lab premium coupon code.');
    const button = $('#eq-lab-coupon-button');
    button.disabled = true;
    setStatus('Checking shared premium coupon...');
    try {
      const response = await fetch('/api/empathy-lab/redeem-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email, product: empathyLabProduct })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || 'Coupon could not be redeemed.');
      saveJson(empathyLabAccessKey, {
        source: data.source || 'admin_coupon',
        product: data.product || empathyLabProduct,
        planId: data.planId || empathyLabPlanId,
        email: data.email || email,
        couponHash: data.couponHash,
        redeemedAt: data.redeemedAt || Date.now(),
        expiresAt: data.expiresAt,
        accessDays: data.accessDays,
        price: 'Coupon'
      });
      $('#eq-lab-coupon').value = '';
      updateGate();
    } finally {
      button.disabled = false;
    }
  }

  async function ensureRazorpayLoaded() {
    if (typeof Razorpay !== 'undefined') return true;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(typeof Razorpay !== 'undefined');
      script.onerror = () => resolve(false);
      document.head.append(script);
      window.setTimeout(() => resolve(typeof Razorpay !== 'undefined'), 7000);
    });
  }

  async function startCheckout() {
    if (location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      throw new Error('Open the live site to use Razorpay Checkout.');
    }
    const email = normalizeEmail($('#eq-lab-email')?.value);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid billing email.');
    const ready = await ensureRazorpayLoaded();
    if (!ready) throw new Error('Razorpay Checkout could not load.');
    const button = $('#eq-lab-checkout-button');
    button.disabled = true;
    setStatus('Opening secure Razorpay checkout...');
    try {
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: empathyLabPlanId, product: empathyLabProduct, email, amountUsd: 1000 })
      });
      const checkout = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok) throw new Error(checkout.error || 'Could not create checkout.');
      const rz = new Razorpay({
        key: checkout.keyId,
        name: 'Sucha™ Wellness',
        description: 'Empathy + EQ Labs Premium - $1000/year',
        amount: checkout.amount,
        currency: checkout.currency || 'USD',
        order_id: checkout.orderId,
        prefill: { email },
        theme: { color: '#13584f' },
        handler: async (response) => {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              planId: empathyLabPlanId,
              product: empathyLabProduct,
              email,
              checkoutMode: checkout.mode || 'order',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verified = await verifyResponse.json().catch(() => ({}));
          if (!verifyResponse.ok || verified.ok === false) throw new Error(verified.error || 'Payment verification failed.');
          saveJson(empathyLabAccessKey, {
            source: verified.source || 'razorpay_order',
            product: verified.product || empathyLabProduct,
            planId: verified.planId || empathyLabPlanId,
            email: verified.email || email,
            paymentId: verified.razorpayPaymentId || response.razorpay_payment_id,
            orderId: verified.razorpayOrderId || response.razorpay_order_id,
            purchasedAt: verified.purchasedAt || Date.now(),
            expiresAt: verified.expiresAt || checkout.expiresAt,
            guaranteeEndsAt: verified.guaranteeEndsAt || checkout.guaranteeEndsAt,
            price: verified.price || '$1000/year'
          });
          updateGate();
        },
        modal: { ondismiss: () => { button.disabled = false; updateGate(); } }
      });
      rz.on('payment.failed', (event) => {
        button.disabled = false;
        setStatus(`Razorpay payment failed: ${event.error?.description || 'Try again.'}`);
      });
      rz.open();
    } catch (error) {
      button.disabled = false;
      throw error;
    }
  }

  function renderCompass(activeId) {
    const active = compass.find((item) => item.id === activeId) || compass[0];
    const buttonHost = $('#eq-compass-buttons');
    const detailHost = $('#eq-compass-detail');
    if (!buttonHost || !detailHost) return;

    buttonHost.innerHTML = compass.map((item) => `
      <button class="compass-button ${item.id === active.id ? 'active' : ''}" type="button" data-compass="${item.id}">
        <span>${escapeHtml(item.label)}</span>
        <i class="score-dot" style="background:${item.color}" aria-hidden="true"></i>
      </button>
    `).join('');

    detailHost.innerHTML = `
      <div class="card-kicker">${escapeHtml(active.label)}</div>
      <h3>${escapeHtml(active.question)}</h3>
      <div class="insight-grid">
        <div class="insight-tile"><b>When strong</b>${escapeHtml(active.strong)}</div>
        <div class="insight-tile"><b>Under stress</b>${escapeHtml(active.stress)}</div>
      </div>
      <ul class="practice-list">
        ${active.reps.map((rep) => `<li>${escapeHtml(rep)}</li>`).join('')}
      </ul>
    `;
  }

  function renderWeather(activeId) {
    const active = weatherStates.find((item) => item.id === activeId) || weatherStates[0];
    const optionsHost = $('#weather-options');
    const resultHost = $('#weather-result');
    if (!optionsHost || !resultHost) return;

    optionsHost.innerHTML = weatherStates.map((item) => `
      <button class="weather-button ${item.id === active.id ? 'active' : ''}" type="button" data-weather="${item.id}">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.subtitle)}</span>
      </button>
    `).join('');

    resultHost.innerHTML = `
      <div class="card-kicker">${escapeHtml(active.title)} weather</div>
      <h3>${escapeHtml(active.subtitle)}</h3>
      <div class="insight-grid">
        <div class="insight-tile"><b>What it may mean</b>${escapeHtml(active.means)}</div>
        <div class="insight-tile"><b>Regulate first</b>${escapeHtml(active.regulate)}</div>
        <div class="insight-tile"><b>Avoid</b>${escapeHtml(active.avoid)}</div>
        <div class="insight-tile"><b>Try this response</b>${escapeHtml(active.response)}</div>
      </div>
    `;
  }

  function populateScenarios() {
    const select = $('#trigger-scenario');
    if (!select) return;
    select.innerHTML = scenarios.map((item) => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join('');
  }

  function scoreText(text, keywords) {
    const normalized = String(text || '').toLowerCase();
    const matches = keywords.filter((keyword) => normalized.includes(keyword)).length;
    return Math.min(5, Math.max(1, 1 + matches));
  }

  function scoreTrigger(event) {
    event.preventDefault();
    const scenario = scenarios.find((item) => item.id === $('#trigger-scenario').value) || scenarios[0];
    const feeling = $('#trigger-feeling').value.trim();
    const story = $('#trigger-story').value.trim();
    const other = $('#trigger-other').value.trim();
    const response = $('#trigger-response').value.trim();

    const awareness = scoreText(`${feeling} ${story}`, ['feel', 'body', 'notice', 'story', 'assume', 'need', 'afraid', 'angry', 'hurt', 'sad']);
    const regulation = scoreText(response, ['pause', 'moment', 'slow', 'breathe', 'calm', 'clear', 'wait', 'understand']);
    const empathy = scoreText(other, ['may', 'might', 'need', 'feel', 'think', 'protect', 'pressure', 'worried', 'afraid']);
    const relationship = scoreText(response, ['ask', 'request', 'understand', 'clarify', 'together', 'repair', 'next', 'help']);
    const total = awareness + regulation + empathy + relationship;

    const feedback = total >= 16
      ? 'Strong EQ response. You are naming your inner state, staying regulated, considering the other person, and moving toward clarity.'
      : total >= 11
        ? 'Good foundation. The next level is making your response more specific: name one feeling, one generous hypothesis, and one clear request.'
        : 'Start by slowing down. The response needs more feeling language, more curiosity, and a clearer next request.';

    const host = $('#trigger-result');
    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(scenario.label)}</div>
      <h3>${escapeHtml(feedback)}</h3>
      <p>${escapeHtml(scenario.prompt)}</p>
      <div class="score-rings">
        ${renderRing('Awareness', awareness)}
        ${renderRing('Regulation', regulation)}
        ${renderRing('Empathy', empathy)}
        ${renderRing('Relationship', relationship)}
      </div>
      <div class="insight-grid">
        <div class="insight-tile"><b>Optimal response</b>${escapeHtml(scenario.optimal)}</div>
        <div class="insight-tile"><b>Practice note</b>${escapeHtml(makePracticeNote(awareness, regulation, empathy, relationship))}</div>
      </div>
    `;
  }

  function renderRing(label, score) {
    return `
      <div class="ring">
        <div class="ring-score" style="--score:${score}"><span>${score}/5</span></div>
        <div class="ring-label">${escapeHtml(label)}</div>
      </div>
    `;
  }

  function makePracticeNote(awareness, regulation, empathy, relationship) {
    const scores = [
      ['awareness', awareness, 'name your feeling and body signal more directly'],
      ['regulation', regulation, 'add a pause or pacing phrase before the content'],
      ['empathy', empathy, 'include one plausible inner state for the other person'],
      ['relationship skill', relationship, 'turn the response into a clear request or next step']
    ];
    scores.sort((a, b) => a[1] - b[1]);
    return `Your next rep: strengthen ${scores[0][0]} by trying to ${scores[0][2]}.`;
  }

  function scoreDaily(event) {
    event.preventDefault();
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      moment: $('#gym-moment').value.trim(),
      feeling: $('#gym-feeling').value.trim(),
      other: $('#gym-other').value.trim(),
      response: $('#gym-response').value.trim()
    };
    entry.score = [
      entry.moment.length > 12,
      entry.feeling.length > 8,
      entry.other.length > 12,
      entry.response.length > 12
    ].filter(Boolean).length;

    if (!entry.moment && !entry.feeling && !entry.other && !entry.response) {
      $('#gym-summary').textContent = 'Add at least one real practice note before saving.';
      return;
    }

    const log = loadLog();
    log.unshift(entry);
    saveLog(log.slice(0, 120));
    $('#gym-form').reset();
    renderGymStats();
  }

  function renderGymStats() {
    const log = loadLog();
    const statsHost = $('#gym-stats');
    const summary = $('#gym-summary');
    if (!statsHost || !summary) return;

    const sessions = log.length;
    const avg = sessions ? (log.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / sessions).toFixed(1) : '0.0';
    const today = new Date().toISOString().slice(0, 10);
    const practicedToday = log.some((item) => String(item.date || '').slice(0, 10) === today);

    summary.textContent = sessions
      ? `You have saved ${sessions} EQ practice ${sessions === 1 ? 'entry' : 'entries'}. ${practicedToday ? 'Today already counts.' : 'One short entry today would keep the practice warm.'}`
      : 'No practice saved yet. Start with one moment from today.';

    statsHost.innerHTML = `
      <div class="stat"><strong>${sessions}</strong><span>Sessions</span></div>
      <div class="stat"><strong>${avg}</strong><span>Avg depth</span></div>
      <div class="stat"><strong>${practicedToday ? 'Yes' : 'No'}</strong><span>Today</span></div>
    `;
  }

  function downloadGymLog() {
    const log = loadLog();
    const lines = [
      'Sucha™ Wellness EQ Lab Practice Log',
      'Website: https://www.suchawellness.com/eq-lab',
      `Downloaded: ${new Date().toLocaleString()}`,
      '',
      ...log.map((entry, index) => [
        `Entry ${index + 1}`,
        `Date: ${new Date(entry.date).toLocaleString()}`,
        `Score: ${entry.score || 0}/4`,
        `Moment: ${entry.moment || '-'}`,
        `Feeling: ${entry.feeling || '-'}`,
        `Other person: ${entry.other || '-'}`,
        `Wise response: ${entry.response || '-'}`,
        ''
      ].join('\n'))
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sucha-eq-lab-log-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderArchetypes() {
    const host = $('#archetype-grid');
    if (!host) return;
    host.innerHTML = archetypes.map((item) => `
      <article class="archetype-card" style="--accent:${item.accent}">
        <div class="card-kicker">Pattern</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.pattern)}</p>
        <p class="move">${escapeHtml(item.move)}</p>
      </article>
    `).join('');
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      const compassButton = event.target.closest('[data-compass]');
      if (compassButton) renderCompass(compassButton.dataset.compass);

      const weatherButton = event.target.closest('[data-weather]');
      if (weatherButton) renderWeather(weatherButton.dataset.weather);
    });

    const triggerForm = $('#trigger-form');
    if (triggerForm) triggerForm.addEventListener('submit', scoreTrigger);

    const gymForm = $('#gym-form');
    if (gymForm) gymForm.addEventListener('submit', scoreDaily);

    const downloadButton = $('#download-gym');
    if (downloadButton) downloadButton.addEventListener('click', downloadGymLog);

    const couponButton = $('#eq-lab-coupon-button');
    if (couponButton) {
      couponButton.addEventListener('click', () => {
        redeemCoupon().catch((error) => setStatus(error.message || 'Coupon could not be redeemed.'));
      });
    }

    const checkoutButton = $('#eq-lab-checkout-button');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => {
        startCheckout().catch((error) => setStatus(error.message || 'Could not start checkout.'));
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCompass('awareness');
    renderWeather('clear');
    populateScenarios();
    renderGymStats();
    renderArchetypes();
    bindEvents();
    updateGate();
  });
}());
