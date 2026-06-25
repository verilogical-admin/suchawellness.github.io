const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https://*.razorpay.com; font-src https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' https://checkout.razorpay.com; connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; form-action 'self'; upgrade-insecure-requests",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const JOURNAL_PLAN_ID = 'journal_monthly_5';
const JOURNAL_PRODUCT = 'SuchaJournal';
const GUARANTEE_DAYS = 30;
const COUPON_HASHES = [
  'b09ec9ef54d652c18c09ed3ecf48a142bbddea9f9e76c165864109c24fc775ab',
  '2aacdc460a8dae37fb0888261e219c1d0c6b8d6e0371e453af90a1d37cf5e47c',
  'e55d0db900dcd17324da0621ff14e74dacfa04a315cc741f08e0016569fe45c7',
  'c6bcb075d86e209fde0e4c90404948a3d674884e6e7eea8cecdb696fc6390d26',
  '7941239a3d85367c1ccf2ed4938cd76dd1c476b2dc8759ef5ed0527313ced6c0',
];

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });
}

function getRazorpayAuth(env) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return null;
  return 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function validateJournalCheckoutRequest(body) {
  const email = String(body.email || '').trim().toLowerCase();
  if (body.planId && body.planId !== JOURNAL_PLAN_ID) throw new Error('Unknown journal plan.');
  if (body.product && body.product !== JOURNAL_PRODUCT) throw new Error('Unknown product.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid billing email is required.');
  return email;
}

async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(message) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function getKv(env) {
  return env.SUCHA_ADMIN_KV || env.SUCHA_KV || null;
}

function requireAdmin(request, env) {
  const expected = env.SUCHA_ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${expected}`;
}

async function getCouponState(kv, hash) {
  return await kv.get(`coupon:${hash}`, { type: 'json' }) || {};
}

async function putCouponState(kv, hash, state) {
  await kv.put(`coupon:${hash}`, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
}

async function redeemCoupon(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Coupon storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const code = String(body.code || '').trim().toUpperCase();
  const email = String(body.email || '').trim().toLowerCase();
  if (!code) return json({ error: 'Enter a coupon code.' }, { status: 400 });
  const hash = await sha256Hex(code);
  if (!COUPON_HASHES.includes(hash)) return json({ error: 'Coupon not found.' }, { status: 404 });

  const state = await getCouponState(kv, hash);
  if (state.revoked) return json({ error: 'Coupon has been revoked.' }, { status: 403 });
  if (state.usedAt) return json({ error: 'Coupon has already been used.' }, { status: 409 });

  const now = Date.now();
  const access = {
    ok: true,
    source: 'admin_coupon',
    planId: JOURNAL_PLAN_ID,
    product: JOURNAL_PRODUCT,
    email,
    couponHash: hash,
    redeemedAt: now,
    expiresAt: now + 365 * 24 * 60 * 60 * 1000,
  };
  await putCouponState(kv, hash, {
    usedAt: new Date(now).toISOString(),
    usedBy: email || 'not provided',
  });
  return json(access);
}

async function trackAnalytics(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ ok: true, stored: false });
  const body = await readJson(request);
  const event = String(body.event || 'event').slice(0, 64);
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const country = request.headers.get('CF-IPCountry') || 'unknown';
  const region = request.cf?.region || 'unknown';
  const city = request.cf?.city || 'unknown';
  const key = `analytics:${day}`;
  const summary = await kv.get(key, { type: 'json' }) || { total: 0, events: {}, countries: {}, regions: {}, tests: {}, journal: {} };
  summary.total += 1;
  summary.events[event] = (summary.events[event] || 0) + 1;
  summary.countries[country] = (summary.countries[country] || 0) + 1;
  summary.regions[`${country}:${region}:${city}`] = (summary.regions[`${country}:${region}:${city}`] || 0) + 1;
  if (body.test) summary.tests[String(body.test).slice(0, 80)] = (summary.tests[String(body.test).slice(0, 80)] || 0) + 1;
  if (event.startsWith('journal_')) summary.journal[event] = (summary.journal[event] || 0) + 1;
  await kv.put(key, JSON.stringify(summary), { expirationTtl: 60 * 60 * 24 * 120 });
  return json({ ok: true, stored: true });
}

async function adminSummary(request, env) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, { status: 401 });
  const kv = getKv(env);
  if (!kv) return json({ error: 'Admin KV storage is not configured.' }, { status: 501 });
  const couponStates = await Promise.all(COUPON_HASHES.map(async (hash, index) => ({
    id: `Coupon ${index + 1}`,
    hash,
    ...(await getCouponState(kv, hash)),
  })));
  const analytics = [];
  for (let i = 0; i < 14; i += 1) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    analytics.push({ date, ...(await kv.get(`analytics:${date}`, { type: 'json' }) || {}) });
  }
  return json({ coupons: couponStates, analytics });
}

async function adminRevokeCoupon(request, env) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, { status: 401 });
  const kv = getKv(env);
  if (!kv) return json({ error: 'Admin KV storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const hash = String(body.hash || '');
  if (!COUPON_HASHES.includes(hash)) return json({ error: 'Coupon not found.' }, { status: 404 });
  const state = await getCouponState(kv, hash);
  await putCouponState(kv, hash, { ...state, revoked: true, revokedAt: new Date().toISOString() });
  return json({ ok: true });
}

async function createSuchaJournalCheckout(request, env) {
  const auth = getRazorpayAuth(env);
  if (!auth) return json({ error: 'Razorpay Worker secrets are not configured.' }, { status: 501 });

  const body = await readJson(request);
  let email;
  try {
    email = validateJournalCheckoutRequest(body);
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }

  const now = Date.now();
  const guaranteeEndsAt = now + GUARANTEE_DAYS * 24 * 60 * 60 * 1000;
  const accessExpiresAt = now + 31 * 24 * 60 * 60 * 1000;
  const subscriptionPlanId = env.RAZORPAY_SUCHA_JOURNAL_PLAN_ID;

  if (subscriptionPlanId) {
    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: subscriptionPlanId,
        total_count: Number(env.SUCHA_JOURNAL_SUBSCRIPTION_COUNT || 120),
        quantity: 1,
        customer_notify: 1,
        notes: {
          product: JOURNAL_PRODUCT,
          planId: JOURNAL_PLAN_ID,
          email,
          guaranteeDays: String(GUARANTEE_DAYS),
          supportEmail: 'support@suchawellness.com',
        },
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return json({ error: data.error?.description || 'Could not create Razorpay subscription.' }, { status: 502 });
    return json({
      mode: 'subscription',
      keyId: env.RAZORPAY_KEY_ID,
      subscriptionId: data.id,
      guaranteeEndsAt,
      expiresAt: accessExpiresAt,
    });
  }

  const amount = Number(env.SUCHA_JOURNAL_AMOUNT_MINOR || 500);
  const currency = env.SUCHA_JOURNAL_CURRENCY || 'USD';
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt: `sucha_journal_${now}`,
      notes: {
        product: JOURNAL_PRODUCT,
        planId: JOURNAL_PLAN_ID,
        email,
        guaranteeDays: String(GUARANTEE_DAYS),
        price: '$5/month',
        supportEmail: 'support@suchawellness.com',
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: data.error?.description || 'Could not create Razorpay order.' }, { status: 502 });
  return json({
    mode: 'order',
    keyId: env.RAZORPAY_KEY_ID,
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    guaranteeEndsAt,
    expiresAt: accessExpiresAt,
  });
}

async function verifySuchaJournalCheckout(request, env) {
  if (!env.RAZORPAY_KEY_SECRET) return json({ error: 'Razorpay Worker secrets are not configured.' }, { status: 501 });

  const body = await readJson(request);
  let email;
  try {
    email = validateJournalCheckoutRequest(body);
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }

  const signature = String(body.razorpay_signature || '');
  const mode = body.checkoutMode === 'subscription' || body.razorpay_subscription_id ? 'subscription' : 'order';
  const message = mode === 'subscription'
    ? `${body.razorpay_payment_id}|${body.razorpay_subscription_id}`
    : `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
  const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, message);

  if (!signature || signature !== expected) {
    return json({ ok: false, error: 'Razorpay signature verification failed.' }, { status: 400 });
  }

  const now = Date.now();
  const guaranteeEndsAt = now + GUARANTEE_DAYS * 24 * 60 * 60 * 1000;
  const accessExpiresAt = now + 31 * 24 * 60 * 60 * 1000;
  return json({
    ok: true,
    source: mode === 'subscription' ? 'razorpay_subscription' : 'razorpay_order',
    planId: JOURNAL_PLAN_ID,
    product: JOURNAL_PRODUCT,
    email,
    razorpayPaymentId: body.razorpay_payment_id,
    razorpaySubscriptionId: body.razorpay_subscription_id,
    razorpayOrderId: body.razorpay_order_id,
    guaranteeEndsAt,
    expiresAt: accessExpiresAt,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.hostname === 'suchawellness.com') {
      url.hostname = 'www.suchawellness.com';
      return Response.redirect(url.toString(), 301);
    }

    if (request.method === 'POST' && (url.pathname === '/api/sucha-journal/create-checkout' || url.pathname === '/api/create-order')) {
      return createSuchaJournalCheckout(request, env);
    }

    if (request.method === 'POST' && (url.pathname === '/api/sucha-journal/verify-checkout' || url.pathname === '/api/verify-payment')) {
      return verifySuchaJournalCheckout(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/sucha-journal/redeem-coupon') {
      return redeemCoupon(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/analytics/track') {
      return trackAnalytics(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/summary') {
      return adminSummary(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/coupons/revoke') {
      return adminRevokeCoupon(request, env);
    }

    const response = await fetch(request);
    const headers = new Headers(response.headers);

    Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
      headers.set(name, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
