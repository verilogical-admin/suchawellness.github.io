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
  ['universal', 'Universal screen', 'Universal Mental Health Screen', 'A broader Sucha-hosted screen for common mental health signals.', 'Start test'],
  ['depression', 'Sucha screen', 'Depression Test', 'For overwhelming sadness, despair, low energy, or negative self-image.', 'Start test'],
  ['adhd', 'Sucha screen', 'ADHD Test', 'For trouble focusing, remembering things, completing tasks, or sitting still.', 'Start test'],
  ['anxiety', 'Sucha screen', 'Anxiety Test', 'For worry or fear that affects day-to-day functioning.', 'Start test'],
  ['bai', 'Sucha screen', 'Beck Anxiety Inventory (BAI) Quick Screen', 'A BAI-informed anxiety symptom check for recent physical and panic-like symptoms.', 'Start test'],
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
    @media (max-width: 900px) {
      .inline-test-head { display: grid; }
      .inline-options { grid-template-columns: 1fr; }
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

function ensureScreeningMarkup() {
  const tools = document.querySelector('.screening-tools');
  if (!tools) return;

  addScreeningStyles();

  const takeTest = document.querySelector('#take-test');
  const subtitle = takeTest?.querySelector('.section-subtitle');
  if (subtitle) {
    subtitle.textContent = 'Choose a quick, confidential Sucha-hosted screening tool. Answers stay in your browser and results are informational only, not a diagnosis or a replacement for care from a qualified clinician.';
  }

  const needsCardRefresh = tools.querySelectorAll('.screening-card[data-test]').length !== screeningCardData.length ||
    tools.querySelector('a[href*="screening.mhanational.org"], a[href*="trypsytest.com"]');

  if (needsCardRefresh) {
    tools.replaceChildren(...screeningCardData.map(createScreeningCard));
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
        <p class="score-note" id="screening-note"></p>
      </aside>
    `;
    tools.after(panel);
  }
}

ensureScreeningMarkup();

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
    title: 'Depression Test',
    description: 'A brief Sucha screen for low mood, loss of interest, energy changes, and self-critical thinking.',
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

const screeningScale = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
const screeningCards = document.querySelectorAll('.screening-card[data-test]');
const screeningPanel = document.querySelector('#screening-panel');
const screeningTitle = document.querySelector('#screening-title');
const screeningDesc = document.querySelector('#screening-desc');
const screeningForm = document.querySelector('#screening-form');
const screeningResult = document.querySelector('#screening-result');
const screeningBand = document.querySelector('#screening-band');
const screeningNote = document.querySelector('#screening-note');
const screeningClose = document.querySelector('#screening-close');
let activeScreeningKey = null;

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

function showScreeningResult(test) {
  const checked = [...screeningForm.querySelectorAll('input[type=\"radio\"]:checked')];
  const answeredValues = checked.map((input) => Number(input.value));
  const score = answeredValues.reduce((total, value) => total + value, 0);
  const maxScore = test.questions.length * (screeningScale.length - 1);
  const interpretation = getScreeningInterpretation(test, score, maxScore, answeredValues);

  screeningBand.textContent = `${interpretation.band} (${score}/${maxScore})`;
  screeningNote.textContent = interpretation.note;
  screeningResult.hidden = false;
}

function renderScreeningTest(key) {
  const test = screeningTests[key];
  if (!test || !screeningPanel || !screeningForm) return;

  activeScreeningKey = key;
  screeningTitle.textContent = test.title;
  screeningDesc.textContent = test.description;
  screeningForm.innerHTML = '';
  screeningResult.hidden = true;

  test.questions.forEach((question, questionIndex) => {
    const item = document.createElement('div');
    const heading = document.createElement('div');
    const options = document.createElement('div');

    item.className = 'inline-question';
    heading.className = 'inline-question-title';
    heading.textContent = `${String(questionIndex + 1).padStart(2, '0')}. ${question}`;
    options.className = 'inline-options';
    options.setAttribute('role', 'radiogroup');
    options.setAttribute('aria-label', question);

    screeningScale.forEach((label, value) => {
      const option = document.createElement('label');
      const input = document.createElement('input');
      const labelText = document.createElement('span');

      input.type = 'radio';
      input.name = `${key}-${questionIndex}`;
      input.value = value;
      input.required = true;

      labelText.textContent = label;
      option.append(input, labelText);
      options.append(option);
    });

    item.append(heading, options);
    screeningForm.append(item);
  });

  const actions = document.createElement('div');
  const submit = document.createElement('button');
  const reset = document.createElement('button');

  actions.className = 'inline-test-actions';
  submit.className = 'test-submit';
  submit.type = 'submit';
  submit.textContent = 'Show result';
  reset.className = 'test-reset';
  reset.type = 'button';
  reset.textContent = 'Reset';
  reset.addEventListener('click', () => {
    screeningForm.reset();
    screeningResult.hidden = true;
  });

  actions.append(submit, reset);
  screeningForm.append(actions);

  screeningPanel.hidden = false;
  screeningPanel.classList.add('visible');
  screeningPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

screeningCards.forEach((card) => {
  card.addEventListener('click', () => renderScreeningTest(card.dataset.test));
});

screeningForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!activeScreeningKey) return;
  showScreeningResult(screeningTests[activeScreeningKey]);
});

screeningClose?.addEventListener('click', () => {
  screeningPanel.hidden = true;
  screeningForm.innerHTML = '';
  screeningResult.hidden = true;
  activeScreeningKey = null;
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

  hamaForm.addEventListener('change', updateHamaScore);
  hamaReset?.addEventListener('click', () => {
    hamaForm.reset();
    updateHamaScore();
  });
}
