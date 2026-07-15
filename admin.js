const tokenInput = document.querySelector('#token');
const tokenToggle = document.querySelector('#token-toggle');
const loadButton = document.querySelector('#load');
const statusEl = document.querySelector('#status');
const couponsEl = document.querySelector('#coupons');
const manualCouponsEl = document.querySelector('#manual-coupons');
const freeDayRequestsEl = document.querySelector('#free-day-requests');
const manualCouponEmail = document.querySelector('#manual-coupon-email');
const manualCouponDays = document.querySelector('#manual-coupon-days');
const manualCouponHours = document.querySelector('#manual-coupon-hours');
const manualCouponNote = document.querySelector('#manual-coupon-note');
const manualCouponCreate = document.querySelector('#manual-coupon-create');
const totalsEl = document.querySelector('#totals');
const analyticsEl = document.querySelector('#analytics');
const careRequestsEl = document.querySelector('#care-requests');
const feedbackEl = document.querySelector('#feedback');
const visitorQuestionsEl = document.querySelector('#visitor-questions');
const adminApiBase = location.protocol === 'https:' && /(^|\.)suchawellness\.com$/i.test(location.hostname)
  ? location.origin
  : 'https://www.suchawellness.com';
const adminApiLegacyBase = 'https://praivasipdf-api.verilogical.com';
const adminApiFallbackBase = 'https://payment-worker.verilogical.com';
const adminApiBases = [adminApiBase, adminApiLegacyBase, adminApiFallbackBase];

tokenInput.value = sessionStorage.getItem('sucha-admin-token') || '';

tokenToggle.addEventListener('click', () => {
  const show = tokenInput.type === 'password';
  tokenInput.type = show ? 'text' : 'password';
  tokenToggle.setAttribute('aria-pressed', String(show));
  tokenToggle.setAttribute('aria-label', show ? 'Hide admin token' : 'Show admin token');
});

function authHeaders() {
  return { Authorization: `Bearer ${tokenInput.value.trim()}` };
}

function setStatus(message) {
  statusEl.textContent = message;
}

function fmt(value) {
  return value ? new Date(value).toLocaleString() : '-';
}

async function adminFetch(path, options = {}) {
  let lastError = null;
  for (const base of adminApiBases) {
    try {
      const response = await fetch(`${base}${path}`, options);
      const data = await response.json().catch(() => ({}));
      if (response.ok) return data;
      lastError = new Error(data.error || 'Admin request failed.');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Admin request failed.');
}

function sumObject(object = {}) {
  return Object.values(object).reduce((total, value) => total + Number(value || 0), 0);
}

function renderCoupons(coupons) {
  couponsEl.replaceChildren();
  coupons.forEach((coupon) => {
    const row = document.createElement('tr');
    const status = coupon.revoked ? 'Revoked' : coupon.usedAt ? 'Used' : 'Available';
    row.innerHTML = `
      <td><strong>${coupon.id}</strong><br><code>${coupon.hash}</code></td>
      <td>${status}</td>
      <td>${coupon.usedBy || '-'}</td>
      <td>${fmt(coupon.revokedAt || coupon.usedAt || coupon.updatedAt)}</td>
      <td></td>
    `;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = coupon.revoked ? 'Revoked' : 'Revoke';
    button.disabled = !!coupon.revoked;
    button.className = 'secondary';
    button.addEventListener('click', () => revokeCoupon(coupon.hash));
    row.lastElementChild.append(button);
    couponsEl.append(row);
  });
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    setStatus('Copied coupon code.');
  } catch {
    setStatus(value);
  }
}

function renderManualCoupons(coupons = []) {
  if (!manualCouponsEl) return;
  manualCouponsEl.replaceChildren();
  if (!coupons.length) {
    manualCouponsEl.innerHTML = '<tr><td colspan="6">No manual coupons yet.</td></tr>';
    return;
  }
  coupons.slice(0, 200).forEach((coupon) => {
    const row = document.createElement('tr');
    const codeCell = document.createElement('td');
    const code = document.createElement('code');
    code.textContent = coupon.code || coupon.hash;
    codeCell.append(code, document.createElement('br'), document.createTextNode(`Valid until ${fmt(coupon.validUntil)}`));
    const emailCell = document.createElement('td');
    emailCell.textContent = coupon.email || 'transferable';
    const accessCell = document.createElement('td');
    accessCell.textContent = `${coupon.accessDays || 1} day${Number(coupon.accessDays || 1) === 1 ? '' : 's'}`;
    const statusCell = document.createElement('td');
    statusCell.textContent = coupon.status || 'Available';
    const noteCell = document.createElement('td');
    noteCell.textContent = coupon.note || '-';
    const actionCell = document.createElement('td');
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'secondary';
    copy.textContent = 'Copy';
    copy.disabled = !coupon.code;
    copy.addEventListener('click', () => copyText(coupon.code));
    const revoke = document.createElement('button');
    revoke.type = 'button';
    revoke.className = 'secondary';
    revoke.textContent = coupon.revoked ? 'Revoked' : 'Revoke';
    revoke.disabled = !!coupon.revoked || coupon.status === 'Used';
    revoke.addEventListener('click', () => revokeCoupon(coupon.hash));
    actionCell.append(copy, document.createTextNode(' '), revoke);
    row.append(codeCell, emailCell, accessCell, statusCell, noteCell, actionCell);
    manualCouponsEl.append(row);
  });
}

function renderFreeDayRequests(requests = []) {
  if (!freeDayRequestsEl) return;
  freeDayRequestsEl.replaceChildren();
  if (!requests.length) {
    freeDayRequestsEl.innerHTML = '<tr><td colspan="6">No free-day requests yet.</td></tr>';
    return;
  }
  requests.slice(0, 200).forEach((request) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${fmt(request.createdAt)}</td>
      <td>${request.email || '-'}</td>
      <td style="max-width:360px;white-space:pre-wrap"></td>
      <td>${request.status || 'pending'}</td>
      <td><code>${request.couponCode || '-'}</code><br>${request.couponExpiresAt ? `Expires ${fmt(request.couponExpiresAt)}` : ''}<br>${request.couponEmailed ? 'Emailed' : request.couponEmailError ? `Email failed: ${request.couponEmailError}` : ''}</td>
      <td></td>
    `;
    row.children[2].textContent = request.message || '';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary';
    button.textContent = request.status === 'approved' ? 'Approved' : 'Approve 1-day coupon';
    button.disabled = request.status === 'approved';
    button.addEventListener('click', () => approveFreeDayRequest(request));
    row.lastElementChild.append(button);
    freeDayRequestsEl.append(row);
  });
}

function topEntries(object = {}, limit = 6) {
  return Object.entries(object)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, limit)
    .map(([key, value]) => `${key}: ${value}`)
    .join('<br>') || '-';
}

function renderAnalytics(days) {
  const totals = days.reduce((acc, day) => {
    acc.views += day.events?.page_view || 0;
    acc.tests += sumObject(day.tests);
    acc.journal += sumObject(day.journal);
    acc.events += day.total || 0;
    return acc;
  }, { views: 0, tests: 0, journal: 0, events: 0 });

  totalsEl.innerHTML = `
    <div class="card"><div class="label">Page views</div><div class="value">${totals.views}</div></div>
    <div class="card"><div class="label">Test interactions</div><div class="value">${totals.tests}</div></div>
    <div class="card"><div class="label">Journal events</div><div class="value">${totals.journal}</div></div>
    <div class="card"><div class="label">All events</div><div class="value">${totals.events}</div></div>
  `;

  analyticsEl.replaceChildren();
  days.forEach((day) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <strong>${day.date}</strong>
      <p class="label">Events</p>
      <p>${topEntries(day.events)}</p>
      <p class="label">Countries</p>
      <p>${topEntries(day.countries)}</p>
      <p class="label">Tests</p>
      <p>${topEntries(day.tests)}</p>
      <p class="label">Journal</p>
      <p>${topEntries(day.journal)}</p>
    `;
    analyticsEl.append(card);
  });
}

function renderVerifiedVisitors(visitors = []) {
  const existing = document.querySelector('#verified-visitors-card');
  existing?.remove();
  const card = document.createElement('div');
  card.className = 'card';
  card.id = 'verified-visitors-card';
  const rows = visitors.slice(0, 120).map((visitor) => [
    visitor.email || '',
    visitor.subscribed ? 'subscribed' : 'no updates',
    visitor.lastToolType || '',
    visitor.lastTool || '',
    visitor.country || '',
    visitor.region || '',
    visitor.city || '',
    fmt(visitor.lastSeenAt || visitor.verifiedAt),
    visitor.visits || 0,
  ].join(' | '));
  card.innerHTML = `
    <strong>Verified emails</strong>
    <p class="label">${visitors.length} verified visitor${visitors.length === 1 ? '' : 's'}</p>
    <textarea readonly style="width:100%;min-height:180px;margin-top:10px">${rows.join('\n') || 'No verified visitors yet.'}</textarea>
  `;
  totalsEl.after(card);
}

function renderCareRequests(requests = []) {
  if (!careRequestsEl) return;
  careRequestsEl.replaceChildren();
  if (!requests.length) {
    careRequestsEl.innerHTML = '<tr><td colspan="6">No encrypted care requests yet.</td></tr>';
    return;
  }
  requests.slice(0, 200).forEach((request) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${request.id}</strong></td>
      <td>${request.type === 'provider' ? 'Provider' : 'Care seeker'}</td>
      <td>${request.status || 'submitted'}</td>
      <td>${request.city || 'unknown'}, ${request.region || 'unknown'}, ${request.country || 'unknown'}</td>
      <td>${fmt(request.createdAt)}</td>
      <td>${request.encryption?.unreadableByServer ? 'Client encrypted' : 'Unknown'}</td>
    `;
    careRequestsEl.append(row);
  });
}

function renderFeedback(items = []) {
  if (!feedbackEl) return;
  feedbackEl.replaceChildren();
  if (!items.length) {
    feedbackEl.innerHTML = '<tr><td colspan="6">No Sucha Mama feedback yet.</td></tr>';
    return;
  }
  items.slice(0, 200).forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${fmt(item.createdAt)}</td>
      <td>${item.type || 'Feedback'}<br><span class="label">${item.product || 'Sucha Mama'}</span></td>
      <td style="max-width:360px;white-space:pre-wrap"></td>
      <td>${item.contact || '-'}</td>
      <td><code>${item.page || '-'}</code><br><span class="label">${item.url || ''}</span></td>
      <td>${item.city || 'unknown'}, ${item.region || 'unknown'}, ${item.country || 'unknown'}</td>
    `;
    row.children[2].textContent = item.message || '';
    feedbackEl.append(row);
  });
}

function renderVisitorQuestions(items = []) {
  if (!visitorQuestionsEl) return;
  visitorQuestionsEl.replaceChildren();
  if (!items.length) {
    visitorQuestionsEl.innerHTML = '<tr><td colspan="6">No visitor questions yet.</td></tr>';
    return;
  }
  items.slice(0, 250).forEach((item) => {
    const row = document.createElement('tr');
    const created = document.createElement('td');
    created.textContent = fmt(item.createdAt);
    const question = document.createElement('td');
    question.style.maxWidth = '420px';
    question.style.whiteSpace = 'pre-wrap';
    question.textContent = item.question || '';
    const match = document.createElement('td');
    match.append(document.createTextNode(item.matched ? 'Matched' : 'Needs review'), document.createElement('br'));
    const answerTitle = document.createElement('span');
    answerTitle.className = 'label';
    answerTitle.textContent = item.answerTitle || '-';
    match.append(answerTitle);
    const contact = document.createElement('td');
    contact.textContent = item.contact || (item.wantsReply ? 'Reply requested' : '-');
    const page = document.createElement('td');
    const code = document.createElement('code');
    code.textContent = item.page || item.path || '-';
    const url = document.createElement('span');
    url.className = 'label';
    url.textContent = item.url || '';
    page.append(code, document.createElement('br'), url);
    const location = document.createElement('td');
    location.textContent = `${item.city || 'unknown'}, ${item.region || 'unknown'}, ${item.country || 'unknown'}`;
    row.append(created, question, match, contact, page, location);
    visitorQuestionsEl.append(row);
  });
}

async function loadDashboard() {
  const token = tokenInput.value.trim();
  if (!token) {
    setStatus('Enter the admin token first.');
    return;
  }
  sessionStorage.setItem('sucha-admin-token', token);
  setStatus('Loading dashboard...');
  const data = await adminFetch('/api/admin/summary', { headers: authHeaders() });
  renderCoupons(data.coupons || []);
  renderManualCoupons(data.manualCoupons || []);
  renderFreeDayRequests(data.freeAccessRequests || []);
  renderAnalytics(data.analytics || []);
  renderVerifiedVisitors(data.verifiedVisitors || []);
  renderCareRequests(data.careRequests || []);
  renderFeedback(data.feedback || []);
  renderVisitorQuestions(data.questions || []);
  setStatus('Dashboard loaded.');
}

async function revokeCoupon(hash) {
  if (!confirm('Revoke this coupon? This cannot be undone from the page.')) return;
  await adminFetch('/api/admin/coupons/revoke', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash }),
  });
  await loadDashboard();
}

async function createManualCoupon() {
  if (!tokenInput.value.trim()) {
    setStatus('Enter the admin token first.');
    return;
  }
  manualCouponCreate.disabled = true;
  setStatus('Creating coupon...');
  try {
    const data = await adminFetch('/api/admin/coupons/create', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: manualCouponEmail.value.trim(),
        accessDays: manualCouponDays.value,
        validHours: manualCouponHours.value,
        label: 'Manual discount coupon',
        note: manualCouponNote.value.trim(),
      }),
    });
    setStatus(`Created coupon ${data.coupon?.code || ''}${data.emailed ? ' and emailed it.' : data.emailError ? `, but email failed: ${data.emailError}` : ''}`);
    if (data.coupon?.code) copyText(data.coupon.code);
    manualCouponNote.value = '';
    await loadDashboard();
  } finally {
    manualCouponCreate.disabled = false;
  }
}

async function approveFreeDayRequest(request) {
  if (!confirm(`Approve one day of access for ${request.email}?`)) return;
  const data = await adminFetch('/api/admin/coupons/create', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: request.email,
      accessDays: 1,
      validHours: 48,
      label: 'Good-faith 1-day access',
      note: `Approved free-day request: ${request.id}`,
      requestId: request.id,
    }),
  });
  setStatus(`Approved. Coupon: ${data.coupon?.code || ''}${data.emailed ? ' Email sent.' : data.emailError ? ` Email failed: ${data.emailError}` : ''}`);
  if (data.coupon?.code) copyText(data.coupon.code);
  await loadDashboard();
}

loadButton.addEventListener('click', () => {
  loadDashboard().catch((error) => setStatus(error.message));
});

manualCouponCreate?.addEventListener('click', () => {
  createManualCoupon().catch((error) => setStatus(error.message));
});
