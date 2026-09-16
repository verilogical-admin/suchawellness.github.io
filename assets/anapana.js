(() => {
  const el = id => document.getElementById(`anapana-${id}`);
  const section = document.getElementById('anapana');
  if (!section) return;
  const synth = window.speechSynthesis;
  const hasVoice = !!synth && 'SpeechSynthesisUtterance' in window;
  let active = false, complete = false, elapsed = 0, started = 0, frame = 0, lastCue = -1;
  let speechGeneration = 0;
  const duration = () => Number(el('length').value);
  const formatTime = s => `${Math.floor(s / 60)}:${String(Math.ceil(s) % 60).padStart(2, '0')}`;
  const cues = () => [
    {at: 0, title: 'Settle into your seat.', text: 'Allow your hands to rest. Feel the support beneath you. Let your shoulders soften and your back stay comfortably upright. You may close your eyes gently, or leave them softly open.'},
    {at: 30, title: 'Meet the breath.', text: 'Bring your attention to the openings of your nostrils. Notice the small feeling of air arriving and leaving. There is no rhythm you need to follow.'},
    {at: 65, title: 'Let breathing be.', text: 'Your body is already breathing. Allow a shallow breath to be shallow, a deeper breath to be deeper. You can simply notice what is happening, without helping it along.'},
    {at: duration() * .38, title: 'Return with kindness.', text: 'Perhaps your attention has wandered into a thought or a sound. That is all right. Gently return to the feeling of this breath at your nostrils. There is nothing to make up for.'},
    {at: duration() * .62, title: 'A quiet attention.', text: 'Stay curious about the breath you can feel now. You do not need to search for a special sensation. When attention drifts, come back softly, as often as you need.'},
    {at: duration() - 30, title: 'Stay for a moment.', text: 'For these last moments, let the breath be ordinary. Keep a light attention at the nostrils. Give yourself permission to finish gently.'}
  ];
  function silence() { speechGeneration++; if (hasVoice) synth.cancel(); }
  function speak(text) {
    silence();
    if (!hasVoice || !el('voice').checked) return;
    const generation = speechGeneration;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = synth.getVoices().find(v => v.voiceURI === el('voice-choice').value);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'en-US';
    utterance.rate = .82; utterance.pitch = 1; utterance.volume = .75;
    utterance.onerror = event => {
      if (generation !== speechGeneration || ['canceled', 'interrupted'].includes(event.error)) return;
      el('voice-note').textContent = 'Voice could not play on this device. The written prompts and timer will keep guiding you.';
    };
    synth.speak(utterance);
  }
  function loadVoices() {
    const previous = el('voice-choice').value;
    const novelty = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Junior|Organ|Ralph|Trinoids|Whisper|Wobble|Zarvox)$/i;
    const voices = synth.getVoices().filter(v => /^en(?:[-_]|$)/i.test(v.lang) && !novelty.test(v.name));
    el('voice-choice').replaceChildren(new Option('Device default · English', ''));
    for (const voice of voices) el('voice-choice').add(new Option(`${voice.name} · ${voice.lang}`, voice.voiceURI));
    const female = /Samantha|Ava|Serena|Karen|Moira|Tessa|Google UK English Female|Sonia|Jenny|Aria|Zira|Susan|Veena/i;
    const preferred = voices.find(v => female.test(v.name) && /Natural|Premium|Enhanced/i.test(v.name)) || voices.find(v => /Samantha|Google UK English Female|Sonia|Serena|Ava/i.test(v.name)) || voices.find(v => female.test(v.name)) || voices.find(v => v.default) || voices[0];
    el('voice-choice').value = voices.some(v => v.voiceURI === previous) ? previous : preferred?.voiceURI || '';
  }
  function paint(seconds, announce = true) {
    const total = duration();
    el('time').textContent = formatTime(Math.max(0, Math.ceil(total - seconds)));
    el('progress').style.width = `${Math.min(100, seconds / total * 100)}%`;
    if (seconds >= total) {
      active = false; complete = true; elapsed = total;
      section.dataset.active = 'false';
      el('length').disabled = false;
      el('toggle').textContent = 'Begin again';
      el('step').textContent = 'Practice complete';
      el('phase').textContent = 'Carry a little stillness.';
      el('prompt').textContent = 'Feel the support of your seat again. Notice the room around you. Open your eyes when you are ready, and take your time before standing.';
      el('status').textContent = 'Your meditation is complete. No hurry to move.';
      speak(el('prompt').textContent);
      return;
    }
    const schedule = cues();
    const index = schedule.reduce((found, cue, i) => seconds >= cue.at ? i : found, 0);
    if (lastCue !== index) {
      lastCue = index;
      el('step').textContent = 'Natural breath · Gentle attention';
      el('phase').textContent = schedule[index].title;
      el('prompt').textContent = schedule[index].text;
      if (announce) speak(schedule[index].text);
    }
  }
  function tick(now) {
    if (!active) return;
    paint(elapsed + (now - started) / 1000);
    if (active) frame = requestAnimationFrame(tick);
  }
  function pauseMeditation() {
    silence();
    if (!active) return;
    elapsed = Math.min(duration(), elapsed + (performance.now() - started) / 1000);
    active = false; section.dataset.active = 'false'; cancelAnimationFrame(frame);
    el('toggle').textContent = 'Resume Anapana';
    el('status').textContent = 'Paused. Breathe naturally; continue whenever you like.';
  }
  function resetMeditation() {
    pauseMeditation(); elapsed = 0; complete = false; lastCue = -1;
    el('length').disabled = false; el('toggle').textContent = 'Begin Anapana';
    el('time').textContent = formatTime(duration()); el('progress').style.width = '0%';
    el('step').textContent = 'Nothing to force'; el('phase').textContent = 'Simply notice.';
    el('prompt').textContent = 'Sit comfortably with your back upright and your hands at rest. Close your eyes gently if comfortable, or keep a soft, lowered gaze.';
    el('status').textContent = 'Start when you feel settled.';
  }
  el('toggle').addEventListener('click', () => {
    if (active) { pauseMeditation(); return; }
    if (complete) resetMeditation();
    window.pause?.();
    window.stopStandingForSeated?.();
    active = true; section.dataset.active = 'true';
    started = performance.now(); el('length').disabled = true;
    el('toggle').textContent = 'Pause Anapana';
    el('status').textContent = 'Let your breath find its own pace.';
    lastCue = -1; tick(started);
  });
  el('reset').addEventListener('click', resetMeditation);
  el('length').addEventListener('change', resetMeditation);
  el('voice').addEventListener('change', () => {
    silence(); el('voice-controls').hidden = !el('voice').checked;
    el('voice-note').textContent = el('voice').checked ? 'Original spoken guidance, with quiet spaces between reminders. Voice varies by device.' : 'Voice is off. Follow the written prompts, or rest your eyes.';
    if (active && el('voice').checked) speak(el('prompt').textContent);
  });
  el('voice-choice').addEventListener('change', () => { silence(); if (active) speak(el('prompt').textContent); });
  el('preview').addEventListener('click', () => {
    if (document.getElementById('standing-toggle').textContent === 'Pause standing' || document.getElementById('toggle').textContent === 'Pause breathing') {
      el('voice-note').textContent = 'Pause your breathing practice first to preview the voice.'; return;
    }
    speak('Take a quiet moment. Let your breathing be easy. There is nothing you need to force.');
  });
  el('stop-voice').addEventListener('click', () => {
    silence(); el('voice').checked = false; el('voice-controls').hidden = true;
    el('voice-note').textContent = 'Voice is off. Follow the written prompts, or rest your eyes.';
  });
  // Starting another practice cancels narration, including the closing message.
  for (const id of ['toggle', 'standing-toggle']) document.getElementById(id).addEventListener('click', pauseMeditation, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseMeditation(); });
  window.addEventListener('pagehide', pauseMeditation);
  if (hasVoice) { loadVoices(); synth.addEventListener('voiceschanged', loadVoices); }
  else {
    el('voice').checked = false; el('voice').disabled = true; el('voice-controls').hidden = true;
    el('voice-note').textContent = 'Voice is unavailable in this browser. The written prompts guide the same practice.';
  }
  resetMeditation();
})();
