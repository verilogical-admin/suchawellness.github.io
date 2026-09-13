(() => {
  const toggle = document.getElementById('forest-toggle');
  const panel = document.getElementById('forest-player-panel');
  const mount = document.getElementById('forest-player-mount');
  const dock = document.getElementById('forest-dock');
  const status = document.getElementById('forest-status');
  function stop() {
    mount.replaceChildren(); // Unloading the player stops video, audio, and ads immediately.
    panel.hidden = true; dock.hidden = true;
    toggle.textContent = 'Turn on forest sounds';
    toggle.setAttribute('aria-pressed', 'false');
    status.textContent = 'Sound is off. Enjoy a quiet practice.';
    document.body.classList.remove('forest-enabled');
  }
  toggle.addEventListener('click', () => {
    if (toggle.getAttribute('aria-pressed') === 'true') { stop(); return; }
    const frame = document.createElement('iframe');
    frame.title = 'Forest bird sounds with gentle ambience — YouTube player';
    frame.src = 'https://www.youtube-nocookie.com/embed/ehZrLthYP_k?autoplay=1&playsinline=1&loop=1&playlist=ehZrLthYP_k&rel=0';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    mount.replaceChildren(frame);
    panel.hidden = false; dock.hidden = false;
    toggle.textContent = 'Turn off forest sounds';
    toggle.setAttribute('aria-pressed', 'true');
    status.textContent = 'Forest player enabled. If it stays quiet, press Play in the video below.';
    document.body.classList.add('forest-enabled');
  });
  document.getElementById('forest-stop').addEventListener('click', stop);
  window.addEventListener('pagehide', stop);
})();
