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
