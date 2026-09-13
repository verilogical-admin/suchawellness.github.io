(() => {
  const el = id => document.getElementById(`standing-${id}`);
  const settings = ['pace', 'length', 'no-hold'];
  const chips = [...document.querySelectorAll('.standing-steps span')];
  let active = false, done = false, saved = 0, start = 0, raf = 0, last = -2;
  const preparation = 5;
  el('still').checked = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function sequence() {
    const [inhale, exhale] = el('pace').value.split(',').map(Number);
    const hold = el('no-hold').checked ? 0 : 2;
    return [
      {duration: inhale, name: 'Breathe in. Lift.', hint: 'Lift both arms forward and overhead, only as far as comfortable.'},
      {duration: hold, name: 'Hold after inhale.', hint: 'Arms raised. Keep your shoulders easy; no strain.'},
      {duration: exhale, name: 'Breathe out. Lower.', hint: 'Lower both arms forward along the same path, with your exhale.'},
      {duration: hold, name: 'Hold after exhale.', hint: 'Stand at ease, arms resting by your sides.'}
    ];
  }
  const cycleLength = () => sequence().reduce((sum, phase) => sum + phase.duration, 0);
  function arms(amount) {
    if (el('still').checked) amount = 0;
    // Project a forward shoulder rotation into the front view. The wrists
    // remain in their shoulder lanes; depth creates natural foreshortening.
    const angle = amount * Math.PI;
    const vertical = Math.cos(angle), depth = Math.sin(angle);
    const wristY = 168 + 90 * vertical;
    const handScale = 1 + .2 * depth;
    const palmFront = depth * depth;
    for (const [side, x, mirror] of [['left', 148, 1], ['right', 212, -1]]) {
      const halfWidth = 5 + 2 * depth;
      el(`${side}-limb`).setAttribute('d',
        `M${x - 8} 168 Q${x} ${160 - 2 * depth} ${x + 8} 168 L${x + halfWidth} ${wristY} Q${x} ${wristY + 3 * vertical} ${x - halfWidth} ${wristY} Z`);
      el(`${side}-hand`).setAttribute('transform',
        `translate(${x} ${wristY}) scale(${mirror * handScale} ${vertical * handScale})`);
      // Show a relaxed edge-on hand at both endpoints, blending into the
      // open palm during the lift. Reverse the same rotation on the exhale.
      el(`${side}-hand`).setAttribute('opacity', palmFront);
      el(`${side}-hand-edge`).setAttribute('transform',
        `translate(${x} ${wristY}) scale(${mirror * handScale} ${vertical * handScale})`);
      el(`${side}-hand-edge`).setAttribute('opacity', 1 - palmFront);
      el(`${side}-knuckles`).setAttribute('cy', wristY);
      el(`${side}-knuckles`).setAttribute('rx', 9 * handScale);
      el(`${side}-knuckles`).setAttribute('opacity', Math.pow(depth, 8));
    }
  }
  function lock(value) { settings.forEach(id => { el(id).disabled = value; }); }
  function label(name, hint, index) {
    if (last === index) return;
    el('phase').textContent = name; el('hint').textContent = hint;
    chips.forEach((chip, i) => chip.classList.toggle('active', i === index));
    last = index;
  }
  function draw(time) {
    const cycle = cycleLength(), target = Number(el('length').value), total = target * cycle;
    const seconds = saved + Math.max(0, time - preparation);
    el('progress').style.width = `${Math.min(100, seconds / total * 100)}%`;
    if (time < preparation) {
      label('Find your footing.', 'Eyes open. Feet steady. Arms down. Breathe naturally.', -1);
      el('step').textContent = 'A moment to settle'; el('count').textContent = Math.ceil(preparation - time);
      el('status').textContent = 'Begin only when you feel steady.'; arms(0); return;
    }
    if (seconds >= total) {
      active = false; done = true; saved = 0; lock(false); arms(0);
      label('Rest in stillness.', 'Arms down. Breathe naturally, with your eyes open.', 4);
      el('step').textContent = 'Practice complete'; el('count').textContent = '✓';
      el('status').textContent = `${target} breaths complete. Take your time before moving.`;
      el('toggle').textContent = 'Begin again'; return;
    }
    let t = seconds % cycle, index = 0;
    const phases = sequence();
    while (t >= phases[index].duration) { t -= phases[index].duration; index++; }
    const phase = phases[index], fraction = t / phase.duration;
    label(phase.name, phase.hint, index);
    el('step').textContent = `Breath ${Math.floor(seconds / cycle) + 1} of ${target}`;
    el('count').textContent = Math.max(1, Math.ceil(phase.duration - t));
    arms(index === 0 ? fraction : index === 1 ? 1 : index === 2 ? 1 - fraction : 0);
    const remaining = Math.ceil(total - seconds);
    el('status').textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} remaining · Keep your eyes open`;
  }
  function tick(now) {
    if (!active) return;
    draw((now - start) / 1000);
    if (active) raf = requestAnimationFrame(tick);
  }
  function pauseStanding() {
    if (!active) return;
    const time = (performance.now() - start) / 1000;
    // Resume with a fresh inhale after preparation, never an interrupted hold.
    saved += Math.floor(Math.max(0, time - preparation) / cycleLength()) * cycleLength();
    active = false; cancelAnimationFrame(raf); arms(0);
    label('Pause. Arms down.', 'Lower your arms comfortably. Breathe naturally; keep your eyes open.', 5);
    el('count').textContent = '—'; el('step').textContent = 'Take your time';
    el('status').textContent = 'Resume starts the current breath again, after 5 seconds to settle.';
    el('toggle').textContent = 'Resume standing';
  }
  function resetStanding() {
    active = false; done = false; saved = 0; last = -3; cancelAnimationFrame(raf); lock(false); arms(0);
    label('Stand at ease.', 'Arms resting by your sides.', -2);
    chips.forEach(chip => chip.classList.remove('active'));
    el('step').textContent = 'Your next quiet moment'; el('count').textContent = 'Ready';
    el('toggle').textContent = 'Begin standing practice'; el('progress').style.width = '0%';
    const seconds = cycleLength() * Number(el('length').value), phases = sequence();
    el('rhythm').textContent = `Inhale ${phases[0].duration}s · ${phases[1].duration ? 'Hold 2s' : 'No hold'} · Exhale ${phases[2].duration}s · ${phases[3].duration ? 'Hold 2s' : 'No hold'}`;
    el('status').textContent = `${el('length').value} breaths · ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}, plus a moment to settle.`;
  }
  el('toggle').addEventListener('click', () => {
    if (active) { pauseStanding(); return; }
    if (done) resetStanding();
    pause(); // Only one breathing guide runs at a time.
    active = true; last = -2; lock(true); start = performance.now();
    el('toggle').textContent = 'Pause standing';
    document.querySelector('.standing-stage').scrollIntoView({behavior: el('still').checked ? 'instant' : 'smooth', block: 'start'});
    tick(start);
  });
  window.stopStandingForSeated = pauseStanding;
  el('reset').addEventListener('click', () => { resetStanding(); });
  settings.forEach(id => el(id).addEventListener('change', () => { resetStanding(); }));
  el('still').addEventListener('change', () => { if (!active || el('still').checked) arms(0); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseStanding(); });
  resetStanding();
})();
