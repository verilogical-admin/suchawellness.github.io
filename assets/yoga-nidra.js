(() => {
  const el = id => document.getElementById(`nidra-${id}`);
  const section = document.getElementById('nidra');
  if (!section) return;
  const narration = el('narration');
  let active = false, complete = false, elapsed = 0, started = 0, frame = 0, lastCue = -1;
  let speechGeneration = 0;
  const duration = () => Number(el('length').value);
  const formatTime = s => `${Math.floor(s / 60)}:${String(Math.ceil(s) % 60).padStart(2, '0')}`;
  const cues = () => [
    {at: duration() * 0, title: "Make yourself at home.", text: "Welcome to Sucha Wellness Yoga Nidra. Make yourself comfortable. Let the ground hold you. For a little while, there is nothing you need to do. Choose a position you can rest in comfortably. Let the surface beneath you carry your weight. Your eyes may close, or stay softly open. For these few minutes, you have permission to do less."},
    {at: duration() * 0.07, title: "An easy beginning.", text: "If it feels pleasant, breathe in gently, add a small second sip of air, then release one slow, easy sigh. There is no need to fill the lungs. You can simply keep your ordinary breath instead."},
    {at: duration() * 0.14, title: "Arrive in this room.", text: "Let breathing return to its own rhythm. Notice a sound nearby, and perhaps a sound farther away. Feel where your body meets the mat or bed. You are here, supported, with room to settle."},
    {at: duration() * 0.21, title: "Soften around the face.", text: "Bring a little attention to your forehead. Let the space around your eyes be easy. Notice your cheeks, your jaw, and your tongue resting in the mouth. Nothing needs to be held tightly."},
    {at: duration() * 0.29, title: "The right arm.", text: "Notice your right shoulder, your upper arm, and your elbow. Let attention travel down to the wrist, the palm, and each finger. You do not need to move. Simply notice this hand resting."},
    {at: duration() * 0.37, title: "The left arm.", text: "Now notice your left shoulder and arm. Your elbow, your wrist, the palm of your hand, and your fingers. Allow this side to feel supported too. Any sensation, or very little sensation, is welcome."},
    {at: duration() * 0.45, title: "The centre of the body.", text: "Notice your back where it touches the surface below. Feel the chest and belly moving in their own quiet way. Let awareness reach the waist, the hips, and the weight of the pelvis."},
    {at: duration() * 0.53, title: "The right leg.", text: "Let attention move into your right thigh, your knee, and your lower leg. Notice the ankle, the heel, the sole of the foot, and the toes. Let the whole leg rest without effort."},
    {at: duration() * 0.61, title: "The left leg.", text: "Notice your left thigh and knee. The lower leg, the ankle, the heel, and the foot. Feel the toes at rest. There is no need to make both sides feel the same."},
    {at: duration() * 0.69, title: "Rest as a whole.", text: "Allow awareness to include the whole body, from the head to the feet. Let the separate places become one resting body. Thoughts may come and go. You can return to the simple feeling of being supported."},
    {at: duration() * 0.79, title: "Let the breath pass.", text: "If you like, count each complete, natural breath backwards from ten. One number for a breath in and out. There is no set speed. If counting feels like work, leave it aside and rest."},
    {at: duration() * 0.92, title: "Welcome the room again.", text: "Let go of counting. Notice the sounds around you and the support beneath you. Invite a little movement into your fingers and toes. Open your eyes when you are ready. There is no hurry to get up."}
  ];
  function silence() {
    speechGeneration++; narration.pause();
    if (narration.readyState > 0) narration.currentTime = 0;
  }
  function speak(cue) {
    silence();
    if (!el('voice').checked) return;
    const generation = speechGeneration;
    const file = cue === 'preview' ? 'preview' : cue === 0 ? 'welcome' : `cue-${cue === 'complete' ? 12 : cue}`;
    narration.src = `/assets/yoga-nidra-voice/${file}.mp3`;
    narration.playbackRate = 0.85;
    narration.preservesPitch = true;
    narration.volume = Number(el('volume').value);
    const failed = () => {
      if (generation !== speechGeneration) return;
      el('voice-note').textContent = 'The voice could not play. Follow the written prompts, or try Preview voice again.';
    };
    narration.onerror = failed;
    narration.play().catch(failed);
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
      el('phase').textContent = 'Return at your own pace.';
      el('prompt').textContent = "Your practice is complete. If comfortable, roll gently onto your side and rest there a moment. Come up slowly when you feel ready, carrying a little of this ease into the rest of your day.";
      el('status').textContent = 'Your Yoga Nidra is complete. Take your time before getting up.';
      speak('complete');
      return;
    }
    const schedule = cues();
    const index = schedule.reduce((found, cue, i) => seconds >= cue.at ? i : found, 0);
    if (lastCue !== index) {
      lastCue = index;
      el('step').textContent = 'Supported body · Gentle awareness';
      el('phase').textContent = schedule[index].title;
      el('prompt').textContent = schedule[index].text;
      if (announce) speak(index);
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
    el('toggle').textContent = 'Resume Yoga Nidra';
    el('status').textContent = 'Paused. Breathe naturally; continue whenever you like.';
  }
  function resetMeditation() {
    pauseMeditation(); elapsed = 0; complete = false; lastCue = -1;
    el('length').disabled = false; el('toggle').textContent = 'Begin Yoga Nidra';
    el('time').textContent = formatTime(duration()); el('progress').style.width = '0%';
    el('step').textContent = 'A moment to get comfortable'; el('phase').textContent = 'Let the ground hold you.';
    el('prompt').textContent = 'Rest on a mat or bed, with a small pillow if helpful. Let your arms settle beside you. Keep a blanket nearby, and adjust your position whenever you need.';
    el('status').textContent = 'Settle in before you begin.';
  }
  el('toggle').addEventListener('click', () => {
    if (active) { pauseMeditation(); return; }
    if (complete) resetMeditation();
    window.pause?.();
    window.stopStandingForSeated?.();
    window.pauseAnapana?.();
    active = true; section.dataset.active = 'true';
    started = performance.now(); el('length').disabled = true;
    el('toggle').textContent = 'Pause Yoga Nidra';
    el('status').textContent = 'Rest comfortably and let the voice guide you.';
    lastCue = -1; tick(started);
  });
  el('reset').addEventListener('click', resetMeditation);
  el('length').addEventListener('change', resetMeditation);
  el('voice').addEventListener('change', () => {
    silence(); el('voice-controls').hidden = !el('voice').checked;
    el('voice-note').textContent = el('voice').checked ? 'Soft female narration, with long quiet spaces. AI-generated from our original guidance.' : 'Voice is off. Follow the written prompts, or rest your eyes.';
    if (active && el('voice').checked) speak(lastCue);
  });
  el('volume').addEventListener('input', () => { narration.volume = Number(el('volume').value); });
  el('preview').addEventListener('click', () => {
    if (document.getElementById('standing-toggle').textContent === 'Pause standing' || document.getElementById('toggle').textContent === 'Pause breathing' || document.getElementById('anapana')?.dataset.active === 'true') {
      el('voice-note').textContent = 'Pause your breathing practice first to preview the voice.'; return;
    }
    window.pauseAnapana?.();
    speak('preview');
  });
  el('stop-voice').addEventListener('click', () => {
    silence(); el('voice').checked = false; el('voice-controls').hidden = true;
    el('voice-note').textContent = 'Voice is off. Follow the written prompts, or rest your eyes.';
  });
  // Starting another practice cancels narration, including the closing message.
  for (const id of ['toggle', 'standing-toggle', 'anapana-toggle']) document.getElementById(id).addEventListener('click', pauseMeditation, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseMeditation(); });
  window.addEventListener('pagehide', pauseMeditation);
  window.pauseYogaNidra = pauseMeditation;
  resetMeditation();
})();
