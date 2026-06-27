const tokenInput = document.querySelector('#token');
const tokenToggle = document.querySelector('#token-toggle');
const loadButton = document.querySelector('#load');
const statusEl = document.querySelector('#status');
const couponsEl = document.querySelector('#coupons');
const totalsEl = document.querySelector('#totals');
const analyticsEl = document.querySelector('#analytics');
const careRequestsEl = document.querySelector('#care-requests');
const adminApiBase = location.protocol === 'https:' && /(^|\.)suchawellness\.com$/i.test(location.hostname)
  ? location.origin
  : 'https://praivasipdf-api.verilogical.com';
const adminApiFallbackBase = 'https://payment-worker.verilogical.com';
const adminApiBases = [adminApiBase, adminApiFallbackBase];

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
  renderAnalytics(data.analytics || []);
  renderVerifiedVisitors(data.verifiedVisitors || []);
  renderCareRequests(data.careRequests || []);
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

loadButton.addEventListener('click', () => {
  loadDashboard().catch((error) => setStatus(error.message));
});
