(function () {
  'use strict';

  const STORAGE_KEY = 'suchaEqGymLog.v1';
  const empathyLabAccessKey = 'suchaEmpathyLabAccess.v1';
  const empathyLabPlanId = 'empathy_lab_yearly_10000';
  const empathyLabProduct = 'SuchaEmpathyLabPremium';
  let triggerAttemptCount = 0;
  let lastTriggerSignature = '';

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

  const patienceTypes = [
    {
      id: 'urgency',
      title: 'Urgency',
      cue: 'I need this now.',
      protects: 'A need for certainty, progress, or relief from waiting.',
      reset: 'Name the deadline, then separate real urgency from emotional urgency.',
      response: 'I feel the urgency. Let us slow down just enough to choose the right next step.'
    },
    {
      id: 'irritation',
      title: 'Irritation',
      cue: 'Why are they so slow?',
      protects: 'A wish for competence, respect, or smoother effort.',
      reset: 'Unclench your jaw and translate the complaint into a request.',
      response: 'I am getting impatient, and I do not want that to come out sharply. Can we clarify what is blocking this?'
    },
    {
      id: 'control',
      title: 'Control',
      cue: 'If I do not push, this will fail.',
      protects: 'A fear that looseness, ambiguity, or someone else’s pace will create harm.',
      reset: 'Ask what is actually yours to own and what belongs to time, process, or another person.',
      response: 'I want to help this move well without forcing it. What part needs my action, and what part needs time?'
    },
    {
      id: 'anxiety',
      title: 'Anxiety',
      cue: 'Waiting means something bad.',
      protects: 'A nervous-system attempt to reduce uncertainty by acting fast.',
      reset: 'Exhale slowly, find one fact, and delay the conclusion by one minute.',
      response: 'I notice my mind is filling in blanks. Can we check what is actually known before deciding?'
    },
    {
      id: 'boredom',
      title: 'Boredom',
      cue: 'This is too slow.',
      protects: 'A need for stimulation, novelty, movement, or visible progress.',
      reset: 'Give the waiting a job: observe, prepare, breathe, or ask one useful question.',
      response: 'I am tempted to rush this. What is one useful thing I can do while this unfolds?'
    },
    {
      id: 'helplessness',
      title: 'Helplessness',
      cue: 'Nothing I do matters.',
      protects: 'A tired system trying to stop disappointment.',
      reset: 'Shrink the field: choose one next humane action, not the whole outcome.',
      response: 'I cannot control the whole outcome, but I can choose the next steady step.'
    }
  ];
  let activePatienceType = 'urgency';

  const patiencePractices = [
    {
      id: 'observe',
      label: 'Observer rep',
      action: 'Watch the urge like weather. Name three facts, one body sensation, and one thing you do not yet know.',
      phrase: 'Interesting. The urge is here. I can observe it without becoming it.',
      garden: 'Observation waters the roots before action grows.'
    },
    {
      id: 'prepare',
      label: 'Prepare rep',
      action: 'Use the waiting time to prepare one calmer sentence, one question, and one fallback option.',
      phrase: 'I can use this pause to become clearer, not just louder inside.',
      garden: 'Preparation turns waiting into quiet strength.'
    },
    {
      id: 'soften',
      label: 'Body softening rep',
      action: 'Unclench jaw, lower shoulders, relax hands, and make five exhales longer than the inhale.',
      phrase: 'My body can slow first. My mind will follow.',
      garden: 'A softer body gives patience somewhere to land.'
    },
    {
      id: 'micro-kindness',
      label: 'Micro-kindness rep',
      action: 'While waiting, do one small helpful thing: tidy, thank, clarify, breathe, or reduce friction for someone.',
      phrase: 'I do not need to force the outcome. I can add steadiness here.',
      garden: 'Kind action keeps patience from becoming passive.'
    },
    {
      id: 'breath',
      label: 'Breath observation',
      action: 'Observe ten breaths without changing them. Silently mark: inhale, exhale, pause. Return gently each time the mind rushes.',
      phrase: 'Breath is happening. I can ride one breath before I ride the impulse.',
      garden: 'Breath observation gives impatience a soft anchor.'
    },
    {
      id: 'mindfulness',
      label: 'Mindfulness scan',
      action: 'Notice five sensations, three sounds, two colors, and one feeling. Let each be here without fixing it.',
      phrase: 'This moment is larger than the thing I am waiting for.',
      garden: 'Mindfulness widens the room around the urge.'
    },
    {
      id: 'cognitive-empathy',
      label: 'Cognitive empathy',
      action: 'Generate three plausible reasons the other person may be slow, unavailable, defensive, or unclear without assuming bad intent.',
      phrase: 'There may be more happening on their side than I can see.',
      garden: 'Cognitive empathy turns impatience into better hypotheses.'
    },
    {
      id: 'ta-check',
      label: 'TA ego-state check',
      action: 'Ask: Am I in Critical Parent, Adapted Child, or Adult? Then write one Adult response that is factual, calm, and specific.',
      phrase: 'The Adult in me can wait, ask, clarify, or choose a boundary.',
      garden: 'The Adult ego state grows patience from clarity.'
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

  const politicalScenarios = [
    {
      id: 'founder-board',
      label: 'Founder wants board buy-in',
      prompt: 'You need support for a risky product pivot. The board chair likes bold moves, the CFO worries about runway, and a senior engineer can influence whether the team believes it.',
      optimal: 'I would pre-wire the CFO first: "What risk would make this responsible enough for you?" Then I would brief the senior engineer privately, ask what the team will fear, and present the board with one bold option plus one visible risk-control plan.',
      trap: 'Do not surprise the CFO in the meeting or frame caution as lack of vision.'
    },
    {
      id: 'manager-conflict',
      label: 'Manager conflict',
      prompt: 'Two managers are blocking each other. One owns budget, one owns execution, and both want the CEO to see them as the adult in the room.',
      optimal: 'I would meet each privately, name their legitimate concern, then propose a joint decision memo with clear ownership: budget guardrails from one, execution milestones from the other. In the group, I would give both a visible win.',
      trap: 'Do not pick a public winner unless the relationship damage is worth it.'
    },
    {
      id: 'family-business',
      label: 'Family business decision',
      prompt: 'A younger family member has the best plan, but an elder has informal veto power and feels bypassed when decisions move too fast.',
      optimal: 'I would ask the elder for counsel before asking for approval: "I want your read before this becomes a decision." Then I would let the younger person present the plan while explicitly honoring the elder’s risk sense.',
      trap: 'Do not treat informal power as irrational just because it is not on the org chart.'
    },
    {
      id: 'team-credit',
      label: 'Credit and visibility',
      prompt: 'You did the key work, but a politically polished colleague is getting most of the visibility. Your sponsor values calm professionalism.',
      optimal: 'I would document contribution without complaint: "For context, I led X and Y, and I would like to present the next milestone." Then I would strengthen sponsor awareness privately before the next public update.',
      trap: 'Do not attack the colleague publicly; make your value impossible to miss.'
    }
  ];

  const confidenceScenarios = [
    {
      id: 'challenged-meeting',
      label: 'Your idea is challenged',
      prompt: 'Someone says, "I do not think this plan makes sense," in front of others.',
      optimal: 'I see the concern. My view is different: the strongest reason to try this is the downside is contained and the learning value is high. What risk would you want addressed first?',
      avoid: 'Do not mock the concern, over-explain your intelligence, or rush to win the room.'
    },
    {
      id: 'senior-status',
      label: 'Senior person disagrees',
      prompt: 'A senior person dismisses your point quickly, but you believe they missed an important distinction.',
      optimal: 'You may be right about the larger pattern. I would add one distinction: in this case, the constraint is different. Can I show the specific data point?',
      avoid: 'Do not become submissive or combative. Hold respect and precision at the same time.'
    },
    {
      id: 'boundary-pressure',
      label: 'Someone pushes your boundary',
      prompt: 'Someone asks for a commitment you do not want to make and keeps pressing after your first no.',
      optimal: 'I understand why you want an answer now. My answer is still no, and I do not want to keep negotiating it. I am open to discussing a different option.',
      avoid: 'Do not apologize repeatedly or attack them for asking. Calm repetition is stronger.'
    },
    {
      id: 'credit-room',
      label: 'You need to claim credit',
      prompt: 'Your contribution is being skipped in a group conversation and you want to speak without sounding needy.',
      optimal: 'I want to add context because I led that part of the work. The key decision I made was X, and the result was Y. I am happy to walk through it.',
      avoid: 'Do not complain about being ignored. Make the value visible with clean facts.'
    }
  ];

  const trustScenarios = [
    {
      id: 'urgent-investment',
      label: 'Urgent investment pitch',
      prompt: 'Someone says an opportunity will return 30% and you have to decide today.',
      optimal: 'Interesting. I do not make money decisions under time pressure. Send the numbers, the risks, and where I can independently verify them. I will review it after that.',
      signal: 'Urgency plus extraordinary benefit.'
    },
    {
      id: 'flattering-partner',
      label: 'Flattering partnership offer',
      prompt: 'A charming person says you are exactly who they have been looking for and asks for access to your network quickly.',
      optimal: 'I appreciate that. I move gradually with introductions. Let us start with one small, low-risk step and see how you follow through.',
      signal: 'Heavy flattery plus fast access request.'
    },
    {
      id: 'lying-taker',
      label: 'Taker with shifting stories',
      prompt: 'Someone repeatedly asks for help, gives inconsistent explanations, and becomes irritated when you ask for details.',
      optimal: 'That does not match what I have documented. I am pausing this until the facts are clear. I am not comfortable proceeding on verbal assurance.',
      signal: 'Inconsistency plus anger when questioned.'
    },
    {
      id: 'secret-pressure',
      label: 'Do not check with anyone',
      prompt: 'Someone says the deal only works if you do not discuss it with anyone else first.',
      optimal: 'I do not make consequential decisions that I am told not to verify. If independent review is a problem, I am out.',
      signal: 'Isolation from outside verification.'
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
        checkout.textContent = 'Upgrade $10,000/year';
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
        body: JSON.stringify({ planId: empathyLabPlanId, product: empathyLabProduct, email, amountUsd: 10000 })
      });
      const checkout = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok) throw new Error(checkout.error || 'Could not create checkout.');
      const rz = new Razorpay({
        key: checkout.keyId,
        name: 'Sucha™ Wellness',
        description: 'Empathy + EQ Labs Premium - $10,000/year',
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
            price: verified.price || '$10,000/year'
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

  function populatePoliticalScenarios() {
    const select = $('#political-scenario');
    if (!select) return;
    select.innerHTML = politicalScenarios.map((item) => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join('');
  }

  function populateConfidenceScenarios() {
    const select = $('#confidence-scenario');
    if (!select) return;
    select.innerHTML = confidenceScenarios.map((item) => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join('');
  }

  function populateTrustScenarios() {
    const select = $('#trust-scenario');
    if (!select) return;
    select.innerHTML = trustScenarios.map((item) => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join('');
  }

  function renderPatience(activeId = activePatienceType) {
    activePatienceType = activeId;
    const active = patienceTypes.find((item) => item.id === activePatienceType) || patienceTypes[0];
    const host = $('#patience-types');
    if (!host) return;
    host.innerHTML = patienceTypes.map((item) => `
      <button class="patience-type ${item.id === active.id ? 'active' : ''}" type="button" data-patience="${item.id}">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.cue)}</span>
      </button>
    `).join('');
    renderPatiencePlan(false);
  }

  function populatePatiencePractices() {
    const select = $('#patience-practice');
    if (!select) return;
    select.innerHTML = patiencePractices.map((item) => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join('');
  }

  function selectedPatiencePractice() {
    return patiencePractices.find((item) => item.id === $('#patience-practice')?.value) || patiencePractices[0];
  }

  function patienceIntensity() {
    return Math.max(1, Math.min(5, Number($('#patience-intensity')?.value || 3)));
  }

  function renderPatienceMeter(intensity) {
    return `
      <div class="patience-meter" aria-label="Impatience intensity ${intensity} out of 5">
        ${[1, 2, 3, 4, 5].map((step) => `<span class="${step <= intensity ? 'active' : ''}"></span>`).join('')}
      </div>
    `;
  }

  function renderPatienceGarden(intensity) {
    const blooms = ['#b88a3d', '#2b7a6d', '#b95f67', '#7762a8', '#b88a3d'];
    return `
      <div class="patience-garden">
        <div class="garden-bed" aria-hidden="true">
          ${[1, 2, 3, 4, 5].map((step) => {
            const active = step <= intensity;
            const height = 24 + (step * 9) + (active ? 10 : 0);
            const opacity = active ? 0.92 : 0.36;
            const scale = active ? 0.94 : 0.62;
            return `<div class="garden-sprout" style="--stem:${height}px;--sprout-opacity:${opacity};--bloom-scale:${scale};--bloom:${blooms[step - 1]}"><div class="garden-bloom"></div><div class="garden-stem"></div></div>`;
          }).join('')}
        </div>
        <div class="garden-caption"><span>Notice</span><span>Soften</span><span>Choose</span></div>
      </div>
    `;
  }

  function renderPatiencePlan(includeTrigger = true) {
    const active = patienceTypes.find((item) => item.id === activePatienceType) || patienceTypes[0];
    const intensity = patienceIntensity();
    const practice = selectedPatiencePractice();
    const trigger = String($('#patience-trigger')?.value || '').trim();
    const waitTime = intensity >= 5 ? '10 minutes' : intensity >= 4 ? '3 minutes' : intensity >= 3 ? '90 seconds' : '30 seconds';
    const host = $('#patience-result');
    if (!host) return;
    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(active.title)} patience plan</div>
      <h3>${escapeHtml(active.cue)}</h3>
      ${renderPatienceMeter(intensity)}
      ${renderPatienceGarden(intensity)}
      <div class="insight-grid">
        <div class="insight-tile"><b>What it may protect</b>${escapeHtml(active.protects)}</div>
        <div class="insight-tile"><b>Reset move</b>${escapeHtml(active.reset)}</div>
        <div class="insight-tile"><b>Pause length</b>Wait ${waitTime} before sending, deciding, correcting, or pushing.</div>
        <div class="insight-tile"><b>Practice rep</b>${escapeHtml(practice.action)}</div>
        <div class="insight-tile"><b>Garden note</b>${escapeHtml(practice.garden)}</div>
        <div class="insight-tile"><b>Trigger focus</b>${escapeHtml(includeTrigger && trigger ? trigger : 'Name the exact moment that makes you want to rush.')}</div>
      </div>
      <div class="pause-ladder">
        <div class="pause-step"><b>1</b><span>Say internally: impatience is here, and I do not have to obey it.</span></div>
        <div class="pause-step"><b>2</b><span>Relax one body signal and make your exhale longer than your inhale.</span></div>
        <div class="pause-step"><b>3</b><span>Choose a patient action: ask, wait, clarify, schedule, or release.</span></div>
      </div>
    `;
  }

  function showPatienceOptimalResponse() {
    const active = patienceTypes.find((item) => item.id === activePatienceType) || patienceTypes[0];
    const practice = selectedPatiencePractice();
    const host = $('#patience-result');
    if (!host) return;
    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(active.title)} - Optimal response</div>
      <h3>Try these exact words.</h3>
      <blockquote>${escapeHtml(active.response)}</blockquote>
      <div class="insight-grid">
        <div class="insight-tile"><b>Why this works</b>It admits the internal pressure without dumping it on the other person.</div>
        <div class="insight-tile"><b>Practice phrase</b>${escapeHtml(practice.phrase)}</div>
        <div class="insight-tile"><b>Practice move</b>Say it slower than feels natural. Patience often begins as a change in pace.</div>
      </div>
    `;
  }

  function startPatienceRep() {
    const practice = selectedPatiencePractice();
    const active = patienceTypes.find((item) => item.id === activePatienceType) || patienceTypes[0];
    const host = $('#patience-result');
    if (!host) return;
    host.innerHTML = `
      <div class="card-kicker">30-second patience rep</div>
      <h3>${escapeHtml(practice.label)}</h3>
      <div class="patience-countdown">
        <div class="countdown-orb" style="--progress:100%"><span>30s</span></div>
        <div>
          <p><b>${escapeHtml(active.cue)}</b></p>
          <p>${escapeHtml(practice.action)}</p>
          <blockquote>${escapeHtml(practice.phrase)}</blockquote>
        </div>
      </div>
      ${renderPatienceGarden(Math.max(2, patienceIntensity()))}
      <div class="pause-ladder">
        <div class="pause-step"><b>1</b><span>For ten seconds: breathe out slowly and relax one body signal.</span></div>
        <div class="pause-step"><b>2</b><span>For ten seconds: name what you want to force, fix, or finish.</span></div>
        <div class="pause-step"><b>3</b><span>For ten seconds: choose the smallest patient action.</span></div>
      </div>
    `;
  }

  function selectedPoliticalScenario() {
    return politicalScenarios.find((item) => item.id === $('#political-scenario')?.value) || politicalScenarios[0];
  }

  function scorePolitical(event) {
    event.preventDefault();
    const scenario = selectedPoliticalScenario();
    const power = $('#political-power')?.value.trim() || '';
    const incentives = $('#political-incentives')?.value.trim() || '';
    const move = $('#political-move')?.value.trim() || '';
    const host = $('#political-result');
    if (!host) return;

    if (!power && !incentives && !move) {
      host.innerHTML = `
        <div class="card-kicker">Add a room read</div>
        <h3>Map at least one real signal first.</h3>
        <p>Political savvy begins by naming power, incentives, and the first low-drama move.</p>
      `;
      return;
    }

    const powerScore = scoreText(power, ['power', 'formal', 'informal', 'influence', 'veto', 'access', 'sponsor', 'block', 'decision', 'expert', 'budget', 'chair', 'ceo'], { otherBonus: true });
    const incentiveScore = scoreText(incentives, ['want', 'fear', 'protect', 'gain', 'lose', 'avoid', 'risk', 'status', 'credit', 'control', 'runway', 'trust', 'ego'], { otherBonus: true });
    const timingScore = scoreText(move, ['private', 'brief', 'before', 'pre-wire', 'ask', 'sequence', 'first', 'timing', 'heads-up', 'listen', 'coalition'], { questionBonus: true });
    const tactScore = scoreText(move, ['respect', 'face', 'honor', 'credit', 'clear', 'calm', 'frame', 'align', 'concern', 'help', 'together'], { longWords: 18 });
    const total = powerScore + incentiveScore + timingScore + tactScore;

    const feedback = total >= 16
      ? 'Strong political read. You are seeing power, naming incentives, sequencing the ask, and protecting dignity.'
      : total >= 11
        ? 'Good start. Add a clearer private pre-wire step and name what each stakeholder is protecting.'
        : 'Slow down before influencing. The move needs more power mapping, more incentive empathy, and less public pressure.';

    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(scenario.label)} - Savvy score</div>
      <h3>${escapeHtml(feedback)}</h3>
      <p>${escapeHtml(scenario.prompt)}</p>
      <div class="score-rings">
        ${renderRing('Power map', powerScore)}
        ${renderRing('Incentives', incentiveScore)}
        ${renderRing('Timing', timingScore)}
        ${renderRing('Tact', tactScore)}
      </div>
      <div class="insight-grid">
        <div class="insight-tile"><b>Optimal move</b>${escapeHtml(scenario.optimal)}</div>
        <div class="insight-tile"><b>Watch the trap</b>${escapeHtml(scenario.trap)}</div>
      </div>
    `;
  }

  function showPoliticalOptimalMove() {
    const scenario = selectedPoliticalScenario();
    const host = $('#political-result');
    if (!host) return;
    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(scenario.label)} - Optimal move</div>
      <h3>Use power with timing and tact.</h3>
      <blockquote>${escapeHtml(scenario.optimal)}</blockquote>
      <div class="insight-grid">
        <div class="insight-tile"><b>Why this works</b>It pre-wires resistance, gives important people dignity, and makes the decision easier to support.</div>
        <div class="insight-tile"><b>Trap to avoid</b>${escapeHtml(scenario.trap)}</div>
      </div>
    `;
  }

  function selectedConfidenceScenario() {
    return confidenceScenarios.find((item) => item.id === $('#confidence-scenario')?.value) || confidenceScenarios[0];
  }

  function scoreConfidence(event) {
    event.preventDefault();
    const scenario = selectedConfidenceScenario();
    const impulse = $('#confidence-impulse')?.value.trim() || '';
    const response = $('#confidence-response')?.value.trim() || '';
    const host = $('#confidence-result');
    if (!host) return;

    if (!impulse && !response) {
      host.innerHTML = `
        <div class="card-kicker">Add a response</div>
        <h3>Write the first impulse or the words you would use.</h3>
        <p>Quiet confidence begins by seeing the impulse without obeying it.</p>
      `;
      return;
    }

    const presenceScore = scoreText(`${impulse} ${response}`, ['pause', 'slow', 'breath', 'steady', 'calm', 'ground', 'moment', 'notice', 'soft', 'unhurried'], { ownershipBonus: true });
    const respectScore = scoreText(response, ['see', 'understand', 'fair', 'point', 'concern', 'respect', 'may', 'you', 'agree', 'different', 'add'], { otherBonus: true });
    const clarityScore = scoreText(response, ['view', 'reason', 'key', 'specific', 'data', 'clear', 'different', 'because', 'first', 'distinction', 'context'], { longWords: 14 });
    const boundaryScore = scoreText(response, ['no', 'not', 'still', 'boundary', 'answer', 'open', 'option', 'request', 'different', 'will', 'will not'], { longWords: 14 });
    const total = presenceScore + respectScore + clarityScore + boundaryScore;

    const feedback = total >= 16
      ? 'Strong quiet confidence. You sound grounded without making the other person smaller.'
      : total >= 11
        ? 'Good base. Make the response a little slower, cleaner, and more boundaried.'
        : 'The response may still leak insecurity or dominance. Reduce heat, reduce explanation, and say one clear sentence.';

    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(scenario.label)} - Confidence score</div>
      <h3>${escapeHtml(feedback)}</h3>
      <p>${escapeHtml(scenario.prompt)}</p>
      <div class="score-rings">
        ${renderRing('Presence', presenceScore)}
        ${renderRing('Respect', respectScore)}
        ${renderRing('Clarity', clarityScore)}
        ${renderRing('Boundary', boundaryScore)}
      </div>
      <div class="insight-grid">
        <div class="insight-tile"><b>Optimal wording</b>${escapeHtml(scenario.optimal)}</div>
        <div class="insight-tile"><b>Avoid</b>${escapeHtml(scenario.avoid)}</div>
      </div>
    `;
  }

  function showConfidenceOptimalWording() {
    const scenario = selectedConfidenceScenario();
    const host = $('#confidence-result');
    if (!host) return;
    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(scenario.label)} - Optimal wording</div>
      <h3>Try these exact words.</h3>
      <blockquote>${escapeHtml(scenario.optimal)}</blockquote>
      <div class="insight-grid">
        <div class="insight-tile"><b>Why this works</b>It holds your ground, gives the other person dignity, and keeps the conversation moving toward truth.</div>
        <div class="insight-tile"><b>Practice move</b>Say it with a slower pace than feels necessary. Confidence often shows up as unused speed.</div>
      </div>
    `;
  }

  function selectedTrustScenario() {
    return trustScenarios.find((item) => item.id === $('#trust-scenario')?.value) || trustScenarios[0];
  }

  function scoreTrust(event) {
    event.preventDefault();
    const scenario = selectedTrustScenario();
    const claim = $('#trust-claim')?.value.trim() || '';
    const evidence = $('#trust-evidence')?.value.trim() || '';
    const response = $('#trust-response')?.value.trim() || '';
    const host = $('#trust-result');
    if (!host) return;

    if (!claim && !evidence && !response) {
      host.innerHTML = `
        <div class="card-kicker">Add a claim</div>
        <h3>Write what is being asked of you first.</h3>
        <p>The skill is not distrust. It is delaying belief until the evidence deserves it.</p>
      `;
      return;
    }

    const evidenceScore = scoreText(evidence, ['evidence', 'verify', 'source', 'independent', 'numbers', 'risk', 'prove', 'wrong', 'downside', 'document', 'written'], { questionBonus: true });
    const incentiveScore = scoreText(`${claim} ${evidence}`, ['gain', 'incentive', 'commission', 'benefit', 'want', 'pressure', 'status', 'money', 'access', 'authority', 'they'], { otherBonus: true });
    const pressureScore = scoreText(`${claim} ${response}`, ['pause', 'slow', 'today', 'pressure', 'urgent', 'time', 'flattery', 'fear', 'guilt', 'maybe', 'review'], { ownershipBonus: true });
    const boundaryScore = scoreText(response, ['no', 'not', 'before', 'until', 'verify', 'written', 'pause', 'commit', 'access', 'comfortable', 'independent', 'proceed'], { longWords: 14 });
    const total = evidenceScore + incentiveScore + pressureScore + boundaryScore;

    const feedback = total >= 16
      ? 'Strong trust calibration. You stay open while protecting belief, access, and commitment.'
      : total >= 11
        ? 'Good judgment. Add one clearer independent check or one firmer access boundary.'
        : 'This still looks easy to rush. Ask for evidence, name the incentive, and delay commitment.';

    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(scenario.label)} - Judgment score</div>
      <h3>${escapeHtml(feedback)}</h3>
      <p>${escapeHtml(scenario.prompt)}</p>
      <div class="score-rings">
        ${renderRing('Evidence', evidenceScore)}
        ${renderRing('Incentive', incentiveScore)}
        ${renderRing('Pressure', pressureScore)}
        ${renderRing('Boundary', boundaryScore)}
      </div>
      <div class="insight-grid">
        <div class="insight-tile"><b>Manipulation signal</b>${escapeHtml(scenario.signal)}</div>
        <div class="insight-tile"><b>Optimal response</b>${escapeHtml(scenario.optimal)}</div>
      </div>
    `;
  }

  function showTrustOptimalResponse() {
    const scenario = selectedTrustScenario();
    const host = $('#trust-result');
    if (!host) return;
    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(scenario.label)} - Optimal response</div>
      <h3>Warm, calm, not captureable.</h3>
      <blockquote>${escapeHtml(scenario.optimal)}</blockquote>
      <div class="insight-grid">
        <div class="insight-tile"><b>Signal to notice</b>${escapeHtml(scenario.signal)}</div>
        <div class="insight-tile"><b>Practice move</b>Use fewer words. Do not debate the story. Move to verification, writing, and access boundaries.</div>
      </div>
    `;
  }

  function scoreText(text, keywords, options = {}) {
    const normalized = String(text || '').toLowerCase();
    const words = normalized.match(/[a-z']+/g) || [];
    const uniqueMatches = keywords.filter((keyword) => normalized.includes(keyword)).length;
    const lengthPoint = words.length >= (options.longWords || 18) ? 1 : words.length >= (options.shortWords || 8) ? 0.5 : 0;
    const questionPoint = options.questionBonus && normalized.includes('?') ? 0.75 : 0;
    const ownershipPoint = options.ownershipBonus && /\bi\b|\bmy\b|\bme\b/.test(normalized) ? 0.5 : 0;
    const otherPoint = options.otherBonus && /\bthey\b|\bthem\b|\byou\b|\btheir\b/.test(normalized) ? 0.5 : 0;
    const score = 1 + uniqueMatches + lengthPoint + questionPoint + ownershipPoint + otherPoint;
    return Math.min(5, Math.max(1, Math.round(score)));
  }

  function triggerSignature() {
    return [
      $('#trigger-scenario')?.value || '',
      $('#trigger-feeling')?.value || '',
      $('#trigger-story')?.value || '',
      $('#trigger-other')?.value || '',
      $('#trigger-response')?.value || ''
    ].join('|').trim();
  }

  function markTriggerDraftChanged() {
    const signature = triggerSignature();
    if (!lastTriggerSignature || signature === lastTriggerSignature) return;
    const host = $('#trigger-result');
    if (!host) return;
    host.innerHTML = `
      <div class="card-kicker">New draft ready</div>
      <h3>Your answers changed.</h3>
      <p>Press <b>Score response</b> again to calculate a fresh EQ score for this attempt.</p>
    `;
  }

  function scoreTrigger(event) {
    event.preventDefault();
    const signature = triggerSignature();
    const scenario = scenarios.find((item) => item.id === $('#trigger-scenario').value) || scenarios[0];
    const feeling = $('#trigger-feeling').value.trim();
    const story = $('#trigger-story').value.trim();
    const other = $('#trigger-other').value.trim();
    const response = $('#trigger-response').value.trim();

    if (!signature.replace(/\|/g, '').trim()) {
      const host = $('#trigger-result');
      host.innerHTML = `
        <div class="card-kicker">Add a response</div>
        <h3>Write at least one answer first.</h3>
        <p>The score updates when there is something real to evaluate.</p>
      `;
      return;
    }

    triggerAttemptCount += 1;
    lastTriggerSignature = signature;

    const awareness = scoreText(`${feeling} ${story}`, ['feel', 'body', 'notice', 'story', 'assume', 'need', 'afraid', 'angry', 'hurt', 'sad', 'defensive', 'tense'], { ownershipBonus: true });
    const regulation = scoreText(response, ['pause', 'moment', 'slow', 'breathe', 'calm', 'clear', 'wait', 'understand', 'minute', 'steady'], { longWords: 16 });
    const empathy = scoreText(other, ['may', 'might', 'need', 'feel', 'think', 'protect', 'pressure', 'worried', 'afraid', 'rushed', 'unclear'], { otherBonus: true });
    const relationship = scoreText(response, ['ask', 'request', 'understand', 'clarify', 'together', 'repair', 'next', 'help', 'could', 'can we'], { questionBonus: true });
    const total = awareness + regulation + empathy + relationship;

    const feedback = total >= 16
      ? 'Strong EQ response. You are naming your inner state, staying regulated, considering the other person, and moving toward clarity.'
      : total >= 11
        ? 'Good foundation. The next level is making your response more specific: name one feeling, one generous hypothesis, and one clear request.'
        : 'Start by slowing down. The response needs more feeling language, more curiosity, and a clearer next request.';

    const host = $('#trigger-result');
    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(scenario.label)} - Attempt ${triggerAttemptCount}</div>
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

  function showTriggerOptimalResponse() {
    const scenario = scenarios.find((item) => item.id === $('#trigger-scenario')?.value) || scenarios[0];
    const host = $('#trigger-result');
    if (!host) return;
    host.innerHTML = `
      <div class="card-kicker">${escapeHtml(scenario.label)} - Optimal response</div>
      <h3>Try these exact words.</h3>
      <blockquote>${escapeHtml(scenario.optimal)}</blockquote>
      <div class="insight-grid">
        <div class="insight-tile"><b>Why this works</b>It stays calm, names the issue without blame, and invites the next useful piece of information.</div>
        <div class="insight-tile"><b>Practice move</b>Say it once slowly, then adapt it to your natural voice before using it in the real conversation.</div>
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

      const patienceButton = event.target.closest('[data-patience]');
      if (patienceButton) renderPatience(patienceButton.dataset.patience);
    });

    const triggerForm = $('#trigger-form');
    if (triggerForm) triggerForm.addEventListener('submit', scoreTrigger);
    const optimalButton = $('#trigger-optimal-button');
    if (optimalButton) optimalButton.addEventListener('click', showTriggerOptimalResponse);
    document.querySelectorAll('#trigger-scenario, #trigger-feeling, #trigger-story, #trigger-other, #trigger-response').forEach((control) => {
      control.addEventListener('input', markTriggerDraftChanged);
      control.addEventListener('change', markTriggerDraftChanged);
    });

    const gymForm = $('#gym-form');
    if (gymForm) gymForm.addEventListener('submit', scoreDaily);

    const patiencePlanButton = $('#patience-plan-button');
    if (patiencePlanButton) patiencePlanButton.addEventListener('click', () => renderPatiencePlan(true));
    const patienceOptimalButton = $('#patience-optimal-button');
    if (patienceOptimalButton) patienceOptimalButton.addEventListener('click', showPatienceOptimalResponse);
    const patienceStartButton = $('#patience-start-button');
    if (patienceStartButton) patienceStartButton.addEventListener('click', startPatienceRep);
    const patienceIntensityInput = $('#patience-intensity');
    if (patienceIntensityInput) patienceIntensityInput.addEventListener('input', () => renderPatiencePlan(true));
    const patiencePracticeSelect = $('#patience-practice');
    if (patiencePracticeSelect) patiencePracticeSelect.addEventListener('change', () => renderPatiencePlan(true));

    const politicalForm = $('#political-form');
    if (politicalForm) politicalForm.addEventListener('submit', scorePolitical);
    const politicalOptimalButton = $('#political-optimal-button');
    if (politicalOptimalButton) politicalOptimalButton.addEventListener('click', showPoliticalOptimalMove);

    const confidenceForm = $('#confidence-form');
    if (confidenceForm) confidenceForm.addEventListener('submit', scoreConfidence);
    const confidenceOptimalButton = $('#confidence-optimal-button');
    if (confidenceOptimalButton) confidenceOptimalButton.addEventListener('click', showConfidenceOptimalWording);

    const trustForm = $('#trust-form');
    if (trustForm) trustForm.addEventListener('submit', scoreTrust);
    const trustOptimalButton = $('#trust-optimal-button');
    if (trustOptimalButton) trustOptimalButton.addEventListener('click', showTrustOptimalResponse);

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
    populatePatiencePractices();
    renderPatience('urgency');
    populateScenarios();
    populatePoliticalScenarios();
    populateConfidenceScenarios();
    populateTrustScenarios();
    renderGymStats();
    renderArchetypes();
    bindEvents();
    updateGate();
  });
}());
