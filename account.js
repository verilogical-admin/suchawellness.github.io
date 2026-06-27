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
const walletBalanceEl = document.querySelector('#wallet-balance');
const walletForm = document.querySelector('#wallet-form');
const walletCurrencyInput = document.querySelector('#wallet-currency');
const walletAmountInput = document.querySelector('#wallet-amount');
const walletAddFundsButton = document.querySelector('#wallet-add-funds');
const walletStatus = document.querySelector('#wallet-status');
const walletTransactions = document.querySelector('#wallet-transactions');
const suchaApiPrimaryBase = 'https://www.suchawellness.com';
const suchaApiBase = 'https://praivasipdf-api.verilogical.com';
const suchaApiFallbackBase = 'https://payment-worker.verilogical.com';
const suchaApiBases = location.protocol === 'https:' && /(^|\.)suchawellness\.com$/i.test(location.hostname)
  ? [location.origin, suchaApiBase, suchaApiFallbackBase]
  : [suchaApiPrimaryBase, suchaApiBase, suchaApiFallbackBase];
const walletApiBases = location.protocol === 'https:' && /(^|\.)suchawellness\.com$/i.test(location.hostname)
  ? [location.origin, suchaApiPrimaryBase]
  : [suchaApiPrimaryBase];
const verificationTokenKey = 'sucha-verification-token:v1';
const verificationEmailKey = 'sucha-verification-email:v1';
const careRequestKeysStorageKey = 'sucha-care-request-keys:v1';
const careRequestMessagesStorageKey = 'sucha-care-request-messages:v1';

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function setLoginStatus(message, isError = false) {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.style.color = isError ? '#9b2c2c' : '';
}

function setWalletStatus(message, isError = false) {
  if (!walletStatus) return;
  walletStatus.textContent = message;
  walletStatus.style.color = isError ? '#9b2c2c' : '';
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

function readCareMessages() {
  try {
    return JSON.parse(localStorage.getItem(careRequestMessagesStorageKey) || '{}');
  } catch {
    return {};
  }
}

function writeCareMessages(messages) {
  localStorage.setItem(careRequestMessagesStorageKey, JSON.stringify(messages));
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

async function accountPost(path, body, fallback) {
  const token = localStorage.getItem(verificationTokenKey);
  const bases = path.startsWith('/api/account/wallet/') ? walletApiBases : suchaApiBases;
  let lastError = null;
  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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

async function ensureRazorpayLoaded() {
  if (typeof Razorpay !== 'undefined') return true;
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(typeof Razorpay !== 'undefined'), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      setTimeout(() => resolve(typeof Razorpay !== 'undefined'), 7000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(typeof Razorpay !== 'undefined');
    script.onerror = () => resolve(false);
    document.head.append(script);
    setTimeout(() => resolve(typeof Razorpay !== 'undefined'), 7000);
  });
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

async function encryptMessageText(text, localKey) {
  const key = await crypto.subtle.importKey(
    'raw',
    base64ToBytes(localKey),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(text)
  );
  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  };
}

async function decryptMessageText(message, localKey) {
  const key = await crypto.subtle.importKey(
    'raw',
    base64ToBytes(localKey),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(message.encryptedPayload.iv) },
    key,
    base64ToBytes(message.encryptedPayload.data)
  );
  return new TextDecoder().decode(decrypted);
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

function roleForRequest(request) {
  return request.type === 'provider' ? 'Provider' : 'Care seeker';
}

function actionCountFor(requests) {
  const messages = readCareMessages();
  const openRequests = requests.filter((item) => item.status !== 'closed').length;
  const localMessages = requests.reduce((count, request) => {
    return count + (messages[request.id]?.length || 0);
  }, 0);
  return openRequests + localMessages;
}

function formatMoney(minor, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(minor || 0) / 100);
}

function walletLimits(currency) {
  return currency === 'INR'
    ? { min: 100, max: 50000, defaultAmount: 1000 }
    : { min: 5, max: 5000, defaultAmount: 50 };
}

function syncWalletAmountLimits() {
  if (!walletAmountInput || !walletCurrencyInput) return;
  const limits = walletLimits(walletCurrencyInput.value);
  walletAmountInput.min = String(limits.min);
  walletAmountInput.max = String(limits.max);
  if (!walletAmountInput.value || Number(walletAmountInput.value) < limits.min || Number(walletAmountInput.value) > limits.max) {
    walletAmountInput.value = String(limits.defaultAmount);
  }
}

function renderWallet(wallet = {}) {
  const balances = wallet.balances || {};
  if (walletBalanceEl) {
    walletBalanceEl.textContent = `${formatMoney(balances.USD || 0, 'USD')} / ${formatMoney(balances.INR || wallet.balanceMinor || 0, 'INR')}`;
  }
  if (!walletTransactions) return;
  walletTransactions.replaceChildren();
  const transactions = Array.isArray(wallet.transactions) ? wallet.transactions : [];
  if (!transactions.length) {
    const empty = document.createElement('p');
    empty.className = 'message-empty';
    empty.textContent = 'No wallet transactions yet.';
    walletTransactions.append(empty);
    return;
  }
  transactions.slice(0, 10).forEach((transaction) => {
    const row = document.createElement('div');
    row.className = 'wallet-transaction';

    const detail = document.createElement('span');
    detail.textContent = `${transaction.status || 'credited'} · ${new Date(transaction.createdAt).toLocaleString()}`;

    const amount = document.createElement('strong');
    amount.textContent = formatMoney(transaction.amountMinor, transaction.currency || 'INR');

    row.append(detail, amount);
    walletTransactions.append(row);
  });
}

async function renderMessageThread(container, request, localKey) {
  const allMessages = readCareMessages();
  const messages = allMessages[request.id] || [];
  container.replaceChildren();

  if (!messages.length) {
    const empty = document.createElement('p');
    empty.className = 'message-empty';
    empty.textContent = 'No follow-up messages yet. Use compose to add an encrypted note to this request thread.';
    container.append(empty);
    return;
  }

  for (const message of messages) {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    const meta = document.createElement('p');
    meta.className = 'message-meta';
    meta.textContent = `${message.author || roleForRequest(request)} · ${new Date(message.createdAt).toLocaleString()}`;

    const body = document.createElement('p');
    body.className = 'message-body';
    if (!localKey || !crypto?.subtle) {
      body.textContent = 'Encrypted message saved. This browser does not have the local key to open it.';
    } else {
      try {
        body.textContent = await decryptMessageText(message, localKey);
      } catch {
        body.textContent = 'Could not decrypt this message with the local key on this browser.';
      }
    }

    bubble.append(meta, body);
    container.append(bubble);
  }
}

async function renderRequests(requests) {
  const keys = readCareKeys();
  requestsList.replaceChildren();
  if (requestCountEl) requestCountEl.textContent = String(requests.length);
  if (actionCountEl) actionCountEl.textContent = String(actionCountFor(requests));

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
          <div class="eyebrow"></div>
          <h3></h3>
          <p></p>
        </div>
        <div class="request-actions">
          <span class="badge"></span>
          <button class="compose-button" type="button" aria-label="Compose message">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
            </svg>
          </button>
        </div>
      </div>
      <details class="intake-info">
        <summary>Show submitted intake details</summary>
        <pre></pre>
      </details>
      <div class="message-thread"></div>
      <form class="message-composer" hidden>
        <details class="message-info">
          <summary>Info</summary>
          <p>This message is encrypted with this request key and saved to this account dashboard on this browser. Sharing with a matched care seeker or provider will come after the payment gate is enabled.</p>
        </details>
        <textarea name="message" placeholder="Write a follow-up message for this request" required></textarea>
        <div class="message-composer-actions">
          <button type="submit">Send message</button>
          <button class="secondary" type="button" data-cancel>Cancel</button>
        </div>
      </form>
    `;
    article.querySelector('.eyebrow').textContent = roleForRequest(request);
    article.querySelector('h3').textContent = request.preview?.typeLabel || 'Care request';
    article.querySelector('.request-head p').textContent = `${new Date(request.createdAt).toLocaleString()} · ${request.city || 'unknown city'}, ${request.country || 'unknown country'}`;
    article.querySelector('.badge').textContent = request.status || 'submitted';
    article.querySelector('pre').textContent = privateDetails;

    const thread = article.querySelector('.message-thread');
    const composer = article.querySelector('.message-composer');
    const textarea = composer.querySelector('textarea');
    const composeButton = article.querySelector('.compose-button');
    const cancelButton = composer.querySelector('[data-cancel]');

    if (!localKey || !crypto?.subtle) {
      composeButton.disabled = true;
      composeButton.title = 'This browser needs the local encryption key before it can compose messages for this request.';
    }

    composeButton.addEventListener('click', () => {
      composer.hidden = !composer.hidden;
      if (!composer.hidden) textarea.focus();
    });

    cancelButton.addEventListener('click', () => {
      composer.hidden = true;
      textarea.value = '';
    });

    composer.addEventListener('submit', async (event) => {
      event.preventDefault();
      const messageText = textarea.value.trim();
      if (!messageText || !localKey || !crypto?.subtle) return;
      const allMessages = readCareMessages();
      const encryptedPayload = await encryptMessageText(messageText, localKey);
      const nextMessage = {
        id: `${request.id}-${Date.now()}`,
        author: roleForRequest(request),
        createdAt: new Date().toISOString(),
        encryptedPayload,
      };
      allMessages[request.id] = [...(allMessages[request.id] || []), nextMessage];
      writeCareMessages(allMessages);
      textarea.value = '';
      composer.hidden = true;
      await renderMessageThread(thread, request, localKey);
      if (actionCountEl) actionCountEl.textContent = String(actionCountFor(requests));
      setStatus('Encrypted message added to this request thread.');
    });

    await renderMessageThread(thread, request, localKey);
    requestsList.append(article);
  }
}

async function loadAccount() {
  setStatus('Loading encrypted care requests...');
  const data = await accountFetch('/api/care/requests/mine');
  renderWallet(data.wallet);
  await renderRequests(data.requests || []);
  setStatus('Dashboard loaded. Private details decrypt only on browsers that hold the local keys.');
}

async function createWalletCheckout(amount, currency) {
  return accountPost('/api/account/wallet/create-checkout', { amount, currency }, 'Could not create Razorpay wallet checkout.');
}

async function verifyWalletCheckout(response) {
  return accountPost('/api/account/wallet/verify-checkout', {
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  }, 'Could not verify wallet payment.');
}

async function startWalletTopUp() {
  if (location.protocol === 'file:') throw new Error('Open the live site or localhost to use Razorpay Checkout.');
  const currency = walletCurrencyInput?.value || 'USD';
  const limits = walletLimits(currency);
  const amount = Number(walletAmountInput?.value || 0);
  const minimum = currency === 'INR' ? '₹100' : '$5';
  const maximum = currency === 'INR' ? '₹50,000' : '$5,000';
  if (!Number.isFinite(amount) || amount < limits.min) throw new Error(`Enter at least ${minimum} to add to your wallet.`);
  if (amount > limits.max) throw new Error(`Maximum wallet top-up is ${maximum}.`);

  const email = localStorage.getItem(verificationEmailKey) || '';
  const ready = await ensureRazorpayLoaded();
  if (!ready) throw new Error('Razorpay Checkout could not load. Check the connection and try again.');

  walletAddFundsButton.disabled = true;
  setWalletStatus('Opening secure Razorpay checkout...');

  try {
    const checkout = await createWalletCheckout(amount, currency);
    const options = {
      key: checkout.keyId,
      name: 'Sucha Wellness',
      description: `Sucha wallet top-up (${checkout.currency || currency})`,
      amount: checkout.amount,
      currency: checkout.currency || 'INR',
      order_id: checkout.orderId,
      prefill: email ? { email } : {},
      theme: { color: '#2D7A6B' },
      notes: {
        product: 'Sucha Wallet',
      },
      handler: async (response) => {
        try {
          setWalletStatus('Verifying payment and updating wallet...');
          const verified = await verifyWalletCheckout(response);
          renderWallet(verified.wallet);
          setWalletStatus('Wallet funded. Your payment record stays separate from care details.');
        } catch (error) {
          setWalletStatus(error.message || 'Payment verification failed.', true);
        } finally {
          walletAddFundsButton.disabled = false;
        }
      },
      modal: {
        ondismiss: () => {
          walletAddFundsButton.disabled = false;
          setWalletStatus('Checkout closed. Wallet was not changed unless payment completed.');
        },
      },
    };

    const rz = new Razorpay(options);
    rz.on('payment.failed', (event) => {
      walletAddFundsButton.disabled = false;
      setWalletStatus(`Razorpay payment failed: ${event.error?.description || 'Try again.'}`, true);
    });
    rz.open();
  } catch (error) {
    walletAddFundsButton.disabled = false;
    throw error;
  }
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

walletForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  startWalletTopUp().catch((error) => setWalletStatus(error.message || 'Could not add wallet funds.', true));
});

walletCurrencyInput?.addEventListener('change', () => {
  syncWalletAmountLimits();
  setWalletStatus(walletCurrencyInput.value === 'INR'
    ? 'INR supports UPI and cards in Razorpay checkout when enabled.'
    : 'USD is best for international card top-ups when enabled by Razorpay and the issuing bank.');
});

emailInput.value = localStorage.getItem(verificationEmailKey) || '';
syncWalletAmountLimits();

loadAccount().catch(() => {
  setStatus('Open Settings > Email verify to verify this browser and load your account dashboard.');
});
