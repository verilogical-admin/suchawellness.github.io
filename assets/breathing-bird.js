(() => {
  const standing = document.getElementById('standing-toggle');
  const seated = document.getElementById('toggle');
  const anapana = document.getElementById('anapana-toggle');
  if (!standing || !seated) return;
  const bird = document.createElement('span');
  bird.className = 'breathing-bird';
  bird.setAttribute('aria-hidden', 'true');
  bird.innerHTML = `<svg viewBox="0 0 64 48" fill="none"><path d="M20 31 5 23l5 16 16-3" fill="#789d91"/><path d="M18 29c0-12 13-17 23-10 2-10 16-9 16 1 0 5-3 8-7 10-5 15-30 16-32-1Z" fill="#699285"/><path d="M22 28c6-5 15-3 18 3-3 8-14 8-18-3Z" fill="#a4bdac"/><path d="m56 20 7 3-7 3" fill="#c89f61"/><circle cx="51" cy="19" r="1.6" fill="#233c34"/><path d="m34 39-1 6m10-7-1 7m-13 0h7m3 0h7" stroke="#6b7357" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  const cue = document.createElement('button');
  cue.type = 'button'; cue.className = 'bird-next-cue';
  const cueLabel = document.createElement('span');
  let target, nextCue;
  const inView = button => {
    const r = button.getBoundingClientRect();
    return r.top >= 70 && r.bottom <= innerHeight - 110;
  };
  const lessMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.getElementById('still').checked || document.getElementById('standing-still').checked;
  cue.addEventListener('click', () => {
    if (!target) return;
    target.focus({preventScroll: true});
    target.scrollIntoView({behavior: lessMotion() ? 'instant' : 'smooth', block: 'center'});
  });
  window.addEventListener('scroll', () => {
    if (target && cue.isConnected && inView(target)) show(target);
  }, {passive: true});
  function hide() { clearTimeout(nextCue); bird.remove(); cue.remove(); target?.classList.remove('bird-perch'); target = null; }
  function show(button) {
    const previous = bird.isConnected ? bird.getBoundingClientRect() : null;
    hide(); target = button;
    bird.classList.toggle('bird-still', document.getElementById('still').checked || document.getElementById('standing-still').checked);
    if (!inView(button)) {
      cueLabel.textContent = button === standing ? 'Next: standing practice ↓' : button === seated ? 'Next: seated breathing ↓' : button === anapana ? 'Next: Anapana meditation ↓' : 'Forest sounds ↑';
      cue.replaceChildren(bird, cueLabel);
      document.body.append(cue);
      return;
    }
    button.classList.add('bird-perch');
    // Keep the guide outside the button: practice labels update during the session.
    button.parentElement.classList.add('bird-controls');
    button.insertAdjacentElement('beforebegin', bird);
    bird.style.left = `${button.offsetLeft + button.offsetWidth - 45}px`;
    bird.style.top = `${button.offsetTop - 34}px`;
    const destination = bird.getBoundingClientRect();
    const visible = r => r && r.top >= 0 && r.bottom <= innerHeight;
    if (visible(previous) && visible(destination) && !bird.classList.contains('bird-still') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bird.animate([
        {transform: `translate(${previous.left - destination.left}px, ${previous.top - destination.top}px) rotate(-8deg)`},
        {transform: 'translate(0, -9px) rotate(4deg)', offset: .8},
        {transform: 'translate(0, 0) rotate(0)'}
      ], {duration: 1500, easing: 'ease-in-out'});
    }
  }
  standing.addEventListener('click', hide);
  seated.addEventListener('click', hide);
  anapana?.addEventListener('click', hide);
  if (anapana) new MutationObserver(() => {
    if (document.getElementById('phase').textContent === 'Carry this calm.') show(anapana);
  }).observe(document.getElementById('phase'), {childList: true, characterData: true, subtree: true});
  document.getElementById('standing-reset').addEventListener('click', hide);
  new MutationObserver(() => {
    if (document.getElementById('standing-step').textContent === 'Practice complete') show(seated);
  }).observe(document.getElementById('standing-step'), {childList: true, characterData: true, subtree: true});
  for (const id of ['still', 'standing-still']) document.getElementById(id).addEventListener('change', () => {
    bird.classList.toggle('bird-still', document.getElementById('still').checked || document.getElementById('standing-still').checked);
  });
  const forest = document.getElementById('forest-toggle');
  if (forest) {
    show(forest);
    nextCue = setTimeout(() => show(standing), 5000);
    forest.addEventListener('click', () => {
      if (document.getElementById('standing-toggle').textContent === 'Pause standing' || seated.textContent === 'Pause breathing' || document.getElementById('anapana')?.dataset.active === 'true') return;
      show(standing);
    });
  } else show(standing);
})();
