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
const TRIAL_DAYS = 30;

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
  const trialEndsAt = now + TRIAL_DAYS * 24 * 60 * 60 * 1000;
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
        start_at: Math.floor(trialEndsAt / 1000),
        notes: {
          product: JOURNAL_PRODUCT,
          planId: JOURNAL_PLAN_ID,
          email,
          trialDays: String(TRIAL_DAYS),
        },
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return json({ error: data.error?.description || 'Could not create Razorpay subscription.' }, { status: 502 });
    return json({
      mode: 'subscription',
      keyId: env.RAZORPAY_KEY_ID,
      subscriptionId: data.id,
      trialEndsAt,
      billingStartsAt: trialEndsAt,
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
        trialDays: String(TRIAL_DAYS),
        price: '$5/month',
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
    trialEndsAt,
    billingStartsAt: trialEndsAt,
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
  const trialEndsAt = now + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  return json({
    ok: true,
    source: mode === 'subscription' ? 'razorpay_subscription_trial' : 'razorpay_order_trial',
    planId: JOURNAL_PLAN_ID,
    product: JOURNAL_PRODUCT,
    email,
    razorpayPaymentId: body.razorpay_payment_id,
    razorpaySubscriptionId: body.razorpay_subscription_id,
    razorpayOrderId: body.razorpay_order_id,
    trialEndsAt,
    expiresAt: trialEndsAt,
    billingStartsAt: trialEndsAt,
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
