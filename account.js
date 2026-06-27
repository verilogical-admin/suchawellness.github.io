const statusEl = document.querySelector('#account-status');
const requestCountEl = document.querySelector('#request-count');
const actionCountEl = document.querySelector('#action-count');
const requestsList = document.querySelector('#requests-list');
const settingsToggle = document.querySelector('#settings-toggle');
const settingsMenu = document.querySelector('#settings-menu');
const loadButton = document.querySelector('#load-account');
const loginForm = document.querySelector('#account-login-form');
const codeForm = document.querySelector('#account-code-form');
const emailInput = document.querySelector('#account-email');
const codeInput = document.querySelector('#account-code');
const loginStatus = document.querySelector('#login-status');
const suchaApiBase = 'https://praivasipdf-api.verilogical.com';
const suchaApiFallbackBase = 'https://payment-worker.verilogical.com';
const suchaApiBases = location.protocol === 'https:' && /(^|\.)suchawellness\.com$/i.test(location.hostname)
  ? [location.origin, suchaApiBase, suchaApiFallbackBase]
  : [suchaApiBase, suchaApiFallbackBase];
const verificationTokenKey = 'sucha-verification-token:v1';
const verificationEmailKey = 'sucha-verification-email:v1';
const careRequestKeysStorageKey = 'sucha-care-request-keys:v1';

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function setLoginStatus(message, isError = false) {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.style.color = isError ? '#9b2c2c' : '';
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

function readCareKeys() {
  try {
    return JSON.parse(localStorage.getItem(careRequestKeysStorageKey) || '{}');
  } catch {
    return {};
  }
}

async function readJson(response, fallback) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || fallback);
  return data;
}

async function apiPost(path, body, fallback) {
  let lastError = null;
  for (const base of suchaApiBases) {
    try {
      const response = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: base === location.origin ? 'same-origin' : 'omit',
        body: JSON.stringify(body),
      });
      return await readJson(response, fallback);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(fallback);
}

async function sendAccountCode(email) {
  return apiPost('/api/verification/request-code', {
    email,
    subscribed: false,
    tool: 'Sucha Account',
    toolType: 'account',
  }, 'Could not send login code.');
}

async function verifyAccountCode(email, code) {
  return apiPost('/api/verification/verify-code', {
    email,
    code,
    tool: 'Sucha Account',
    toolType: 'account',
  }, 'Could not verify login code.');
}

async function accountFetch(path) {
  const token = localStorage.getItem(verificationTokenKey);
  let lastError = null;
  for (const base of suchaApiBases) {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: base === location.origin ? 'same-origin' : 'omit',
      });
      return await readJson(response, 'Could not load account data.');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Could not load account data.');
}

async function decryptCarePayload(request, localKey) {
  const key = await crypto.subtle.importKey(
    'raw',
    base64ToBytes(localKey),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(request.encryptedPayload.iv) },
    key,
    base64ToBytes(request.encryptedPayload.data)
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

function labelFor(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
}

function renderPayload(payload) {
  const fields = payload.fields || {};
  return Object.entries(fields)
    .filter(([, value]) => value)
    .map(([name, value]) => `${labelFor(name)}: ${value}`)
    .join('\n') || 'No private details entered.';
}

async function renderRequests(requests) {
  const keys = readCareKeys();
  requestsList.replaceChildren();
  if (requestCountEl) requestCountEl.textContent = String(requests.length);
  if (actionCountEl) actionCountEl.textContent = String(requests.filter((item) => item.status !== 'closed').length);

  if (!requests.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No care requests found for this verified account yet.';
    requestsList.append(empty);
    return;
  }

  for (const request of requests) {
    const article = document.createElement('article');
    article.className = 'request';
    const localKey = keys[request.id]?.key;
    let privateDetails = 'Private details are encrypted. This browser does not have the local key for this request.';
    if (localKey && crypto?.subtle) {
      try {
        privateDetails = renderPayload(await decryptCarePayload(request, localKey));
      } catch {
        privateDetails = 'Could not decrypt this request with the local key on this browser.';
      }
    }
    article.innerHTML = `
      <div class="request-head">
        <div>
          <div class="eyebrow">${request.type === 'provider' ? 'Provider' : 'Care seeker'}</div>
          <h3>${request.preview?.typeLabel || 'Care request'}</h3>
          <p>${new Date(request.createdAt).toLocaleString()} · ${request.city || 'unknown city'}, ${request.country || 'unknown country'}</p>
        </div>
        <span class="badge">${request.status || 'submitted'}</span>
      </div>
      <pre>${privateDetails}</pre>
    `;
    requestsList.append(article);
  }
}

async function loadAccount() {
  setStatus('Loading encrypted care requests...');
  const data = await accountFetch('/api/care/requests/mine');
  await renderRequests(data.requests || []);
  setStatus('Dashboard loaded. Private details decrypt only on browsers that hold the local keys.');
}

settingsToggle?.addEventListener('click', () => {
  const willOpen = settingsMenu.hidden;
  settingsMenu.hidden = !willOpen;
  settingsToggle.setAttribute('aria-expanded', String(willOpen));
});

settingsMenu?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-panel]');
  if (!button) return;
  document.querySelectorAll('[id^="panel-"]').forEach((panel) => {
    panel.classList.toggle('hidden', panel.id !== `panel-${button.dataset.panel}`);
  });
  settingsMenu.hidden = true;
  settingsToggle?.setAttribute('aria-expanded', 'false');
});

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  if (!email) {
    setLoginStatus('Enter your email address first.', true);
    return;
  }
  localStorage.setItem(verificationEmailKey, email);
  setLoginStatus('Sending login code...');
  sendAccountCode(email)
    .then(() => {
      setLoginStatus('Code sent. Check your email, then enter the 6-digit code below. You can also click the sign-in link in the email.');
      codeInput?.focus();
    })
    .catch((error) => setLoginStatus(error.message || 'Could not send login code.', true));
});

codeForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = (emailInput.value.trim() || localStorage.getItem(verificationEmailKey) || '').toLowerCase();
  const code = codeInput.value.trim();
  if (!email || !/^\d{6}$/.test(code)) {
    setLoginStatus('Enter your email and the 6-digit code from Sucha.', true);
    return;
  }
  setLoginStatus('Verifying and loading dashboard...');
  verifyAccountCode(email, code)
    .then(async (data) => {
      localStorage.setItem(verificationTokenKey, data.token);
      localStorage.setItem(verificationEmailKey, data.visitor?.email || email);
      setLoginStatus('Verified. Loading your private dashboard...');
      await loadAccount();
    })
    .catch((error) => setLoginStatus(error.message || 'Could not verify login code.', true));
});

loadButton?.addEventListener('click', () => {
  loadAccount().catch((error) => setStatus(error.message || 'Could not load dashboard.'));
});

emailInput.value = localStorage.getItem(verificationEmailKey) || '';

loadAccount().catch(() => {
  setStatus('Verify your email above to load your account dashboard.');
});
