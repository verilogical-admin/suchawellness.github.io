const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https://*.razorpay.com; font-src https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' https://checkout.razorpay.com; script-src-attr 'none'; connect-src 'self' https://payment-worker.verilogical.com https://praivasipdf-api.verilogical.com https://api.razorpay.com https://checkout.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; form-action 'self'; worker-src 'self'; manifest-src 'self'; media-src 'self'; upgrade-insecure-requests",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-Robots-Tag': 'noai, noimageai',
  'Permissions-Policy': 'accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(self), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(self), usb=()',
};

const JOURNAL_PLAN_ID = 'journal_monthly_5';
const JOURNAL_PRODUCT = 'SuchaJournal';
const GUARANTEE_DAYS = 30;
const VERIFICATION_COOKIE = 'sucha_verified_visitor';
const VERIFICATION_TTL_SECONDS = 90 * 24 * 60 * 60;
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

async function serveAdminPage() {
  const response = await fetch(`https://raw.githubusercontent.com/verilogical-admin/suchawellness.github.io/main/admin.html?v=${Date.now()}`, {
    headers: { 'User-Agent': 'suchawellness-edge-worker' },
  });
  const html = await response.text();
  return new Response(html, {
    status: response.ok ? 200 : response.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
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

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function cleanText(value, max = 120) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanCareType(value) {
  return ['seeker', 'provider'].includes(value) ? value : 'seeker';
}

function careRequestKey(id) {
  return `care:request:${id}`;
}

async function careOwnerHash(email, env) {
  return (await hmacSha256Hex(verificationSecret(env), `care:${email}`)).slice(0, 32);
}

function carePublicRecord(record) {
  return {
    id: record.id,
    type: record.type,
    status: record.status || 'submitted',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt || record.createdAt,
    country: record.country || 'unknown',
    region: record.region || 'unknown',
    city: record.city || 'unknown',
    encryptedPayload: record.encryptedPayload || null,
    encryption: record.encryption || null,
    preview: record.preview || {},
  };
}

function readCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function getKv(env) {
  return env.SUCHA_ADMIN_KV || env.SUCHA_KV || env.FEEDBACK_KV || null;
}

function requireAdmin(request, env) {
  const expected = env.SUCHA_ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${expected}`;
}

function verificationSecret(env) {
  return env.SUCHA_VERIFICATION_SECRET || env.PRAIVASIPDF_QUOTA_SECRET || env.RAZORPAY_KEY_SECRET || env.SUCHA_ADMIN_TOKEN || 'sucha-verification';
}

function verificationCodeKey(email) {
  return `verification:code:${email}`;
}

async function verifiedVisitorId(email, env) {
  return (await hmacSha256Hex(verificationSecret(env), email)).slice(0, 24);
}

async function signVerificationToken(visitor, env) {
  const payload = btoa(JSON.stringify({
    email: visitor.email,
    subscribed: Boolean(visitor.subscribed),
    verifiedAt: visitor.verifiedAt,
    expiresAt: visitor.expiresAt,
  }));
  return `${payload}.${await hmacSha256Hex(verificationSecret(env), payload)}`;
}

async function signVerificationChallenge(challenge, env) {
  const payload = btoa(JSON.stringify(challenge));
  return `${payload}.${await hmacSha256Hex(verificationSecret(env), payload)}`;
}

async function verifyVerificationChallenge(token, env) {
  if (!token || !String(token).includes('.')) return null;
  const [payload, signature] = String(token).split('.');
  const expected = await hmacSha256Hex(verificationSecret(env), payload);
  if (signature !== expected) return null;
  try {
    const challenge = JSON.parse(atob(payload));
    if (!challenge.email || !challenge.hash || Number(challenge.expiresAt || 0) < Date.now()) return null;
    return challenge;
  } catch {
    return null;
  }
}

async function verifyVerificationToken(token, env) {
  if (!token || !String(token).includes('.')) return null;
  const [payload, signature] = String(token).split('.');
  const expected = await hmacSha256Hex(verificationSecret(env), payload);
  if (signature !== expected) return null;
  try {
    const visitor = JSON.parse(atob(payload));
    if (!visitor.email || Number(visitor.expiresAt || 0) < Date.now()) return null;
    return visitor;
  } catch {
    return null;
  }
}

function authBearer(request) {
  const header = request.headers.get('Authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

async function verifiedVisitorFromRequest(request, env) {
  return await verifyVerificationToken(authBearer(request) || readCookie(request, VERIFICATION_COOKIE), env);
}

async function sendSuchaEmail(env, { to, subject, text, html }) {
  if (!env.RESEND_API_KEY) throw new Error('Email sending is not configured.');
  const from = env.SUCHA_EMAIL_FROM || env.EMAIL_FROM || 'support@suchawellness.com';
  const replyTo = env.SUCHA_EMAIL_REPLY_TO || env.EMAIL_REPLY_TO || 'support@suchawellness.com';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      ...(html ? { html } : {}),
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Email provider rejected the message.');
  return data;
}

async function recordVerifiedVisitor(request, env, visitor, event, detail = {}) {
  const kv = getKv(env);
  if (!kv || !visitor.email) return;
  const now = new Date();
  const id = await verifiedVisitorId(visitor.email, env);
  const key = `verified:${id}`;
  const existing = await kv.get(key, { type: 'json' }) || {};
  const item = {
    ...existing,
    id,
    email: visitor.email,
    subscribed: Boolean(visitor.subscribed ?? existing.subscribed),
    verifiedAt: existing.verifiedAt || visitor.verifiedAt || now.toISOString(),
    expiresAt: visitor.expiresAt || existing.expiresAt || 0,
    lastSeenAt: now.toISOString(),
    lastEvent: event,
    lastTool: cleanText(detail.tool || existing.lastTool || '', 80),
    lastToolType: cleanText(detail.toolType || existing.lastToolType || '', 40),
    country: request.headers.get('CF-IPCountry') || existing.country || 'unknown',
    region: cleanText(request.cf?.region || existing.region || 'unknown', 80),
    city: cleanText(request.cf?.city || existing.city || 'unknown', 80),
    visits: Number(existing.visits || 0) + 1,
  };
  await kv.put(key, JSON.stringify(item), { expirationTtl: VERIFICATION_TTL_SECONDS + 30 * 24 * 60 * 60 });
}

async function requestVerificationCode(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Verification storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email) return json({ error: 'Enter a valid email address.' }, { status: 400 });
  const subscribed = body.subscribed !== false;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hash = await hmacSha256Hex(verificationSecret(env), code);
  const challenge = {
    email,
    hash,
    subscribed,
    tool: cleanText(body.tool, 80),
    toolType: cleanText(body.toolType, 40),
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  const challengeToken = await signVerificationChallenge(challenge, env);
  const verifyUrl = `${new URL(request.url).origin}/verify-email?challenge=${encodeURIComponent(challengeToken)}`;
  await kv.put(verificationCodeKey(email), JSON.stringify({
    hash,
    subscribed,
    createdAt: new Date().toISOString(),
  }), { expirationTtl: 10 * 60 });
  try {
    await sendSuchaEmail(env, {
      to: email,
      subject: 'Your Sucha Wellness verification code',
      text: `Your Sucha Wellness verification code is ${code}. It expires in 10 minutes.\n\nOr click this verification link:\n${verifyUrl}\n\nYou are receiving this because this email was used to access Sucha Wellness tools.`,
      html: `<!doctype html>
<html>
  <body style="margin:0;background:#F5F2EB;color:#171717;font-family:Jost,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EB;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #D9D2C4;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;">
                <div style="color:#2D7A6B;font-family:Georgia,serif;font-size:28px;line-height:1.1;font-weight:700;">Sucha Wellness</div>
                <p style="font-size:17px;line-height:1.55;margin:20px 0 0;">Use this secure link to verify your email and continue with Sucha Wellness.</p>
                <p style="margin:24px 0;">
                  <a href="${verifyUrl}" style="display:inline-block;background:#2D7A6B;color:#fff;text-decoration:none;font-weight:700;border-radius:999px;padding:13px 20px;">Verify email</a>
                </p>
                <p style="font-size:15px;line-height:1.55;margin:0 0 18px;color:#3F4945;">Or enter this 6-digit code on the site:</p>
                <div style="display:inline-block;letter-spacing:6px;font-size:28px;font-weight:700;color:#171717;background:#F5F2EB;border:1px solid #D9D2C4;border-radius:10px;padding:12px 16px;">${code}</div>
                <p style="font-size:14px;line-height:1.55;margin:22px 0 0;color:#5A625F;">This link and code expire in 10 minutes. You are receiving this because this email was used to access Sucha Wellness tools.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    });
  } catch (error) {
    return json({ error: error.message || 'Could not send verification email.' }, { status: 502 });
  }
  await recordVerifiedVisitor(request, env, { email, subscribed, verifiedAt: new Date().toISOString(), expiresAt: Date.now() + VERIFICATION_TTL_SECONDS * 1000 }, 'code_sent', {
    tool: cleanText(body.tool, 80),
    toolType: cleanText(body.toolType, 40),
  });
  return json({ ok: true, codeSent: true, challenge: challengeToken });
}

async function verifyVerificationCode(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Verification storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const code = String(body.code || '').trim();
  if (!email || !/^\d{6}$/.test(code)) return json({ error: 'Enter the 6-digit code sent to your email.' }, { status: 400 });
  const saved = await kv.get(verificationCodeKey(email), { type: 'json' });
  const actual = await hmacSha256Hex(verificationSecret(env), code);
  if (!saved || saved.hash !== actual) return json({ error: 'Invalid or expired verification code.' }, { status: 401 });
  await kv.delete(verificationCodeKey(email));
  const now = Date.now();
  const visitor = {
    email,
    subscribed: saved.subscribed !== false,
    verifiedAt: new Date(now).toISOString(),
    expiresAt: now + VERIFICATION_TTL_SECONDS * 1000,
  };
  await recordVerifiedVisitor(request, env, visitor, 'verified', {
    tool: cleanText(body.tool, 80),
    toolType: cleanText(body.toolType, 40),
  });
  const token = await signVerificationToken(visitor, env);
  return new Response(JSON.stringify({ ok: true, token, visitor }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': `${VERIFICATION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${VERIFICATION_TTL_SECONDS}; Path=/; SameSite=Lax; Secure; HttpOnly`,
    },
  });
}

async function consumeVerificationLink(request, env) {
  const challenge = await verifyVerificationChallenge(new URL(request.url).searchParams.get('challenge') || '', env);
  if (!challenge) {
    return new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verification failed</title><body style="font-family:Jost,system-ui,sans-serif;background:#F5F2EB;color:#171717;display:grid;min-height:100vh;place-items:center;margin:0"><main style="max-width:520px;padding:28px"><h1 style="color:#2D7A6B;font-family:serif">Verification link expired</h1><p>Please return to Sucha Wellness and request a fresh code.</p><a href="/" style="color:#2D7A6B">Back to Sucha</a></main></body>', {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS },
    });
  }
  const now = Date.now();
  const visitor = {
    email: challenge.email,
    subscribed: challenge.subscribed !== false,
    verifiedAt: new Date(now).toISOString(),
    expiresAt: now + VERIFICATION_TTL_SECONDS * 1000,
  };
  await recordVerifiedVisitor(request, env, visitor, 'magic_link', {
    tool: challenge.tool || '',
    toolType: challenge.toolType || '',
  });
  const token = await signVerificationToken(visitor, env);
  const location = challenge.toolType === 'account'
    ? '/account'
    : `/${challenge.toolType === 'journal' ? '#journal' : '#take-test'}`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Set-Cookie': `${VERIFICATION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${VERIFICATION_TTL_SECONDS}; Path=/; SameSite=Lax; Secure; HttpOnly`,
      'Cache-Control': 'no-store',
    },
  });
}

async function verificationStatus(request, env) {
  const visitor = await verifiedVisitorFromRequest(request, env);
  if (!visitor) return json({ ok: false, verified: false }, { status: 401 });
  await recordVerifiedVisitor(request, env, visitor, 'status_check');
  return json({ ok: true, verified: true, visitor: { email: visitor.email, subscribed: Boolean(visitor.subscribed), expiresAt: visitor.expiresAt } });
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

async function createCareRequest(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Care request storage is not configured.' }, { status: 501 });
  const visitor = await verifiedVisitorFromRequest(request, env);
  if (!visitor?.email) return json({ error: 'Verify your email before creating a care request.' }, { status: 401 });

  const body = await readJson(request);
  const encryptedPayload = body.encryptedPayload || {};
  if (!encryptedPayload.iv || !encryptedPayload.data) {
    return json({ error: 'Encrypted care request payload is required.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = `care_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  const ownerHash = await careOwnerHash(visitor.email, env);
  const record = {
    id,
    ownerHash,
    type: cleanCareType(body.type),
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
    country: request.headers.get('CF-IPCountry') || 'unknown',
    region: cleanText(request.cf?.region || 'unknown', 80),
    city: cleanText(request.cf?.city || 'unknown', 80),
    encryptedPayload: {
      iv: cleanText(encryptedPayload.iv, 80),
      data: String(encryptedPayload.data || '').slice(0, 24000),
    },
    encryption: {
      version: 'client-aes-gcm-v1',
      unreadableByServer: true,
      keyStored: 'client-device-only',
    },
    preview: {
      typeLabel: cleanCareType(body.type) === 'provider' ? 'Provider onboarding' : 'Care seeker matching',
    },
  };

  await kv.put(careRequestKey(id), JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 365 });
  await kv.put(`care:owner:${ownerHash}:${id}`, JSON.stringify({ id, createdAt: now }), { expirationTtl: 60 * 60 * 24 * 365 });
  await recordVerifiedVisitor(request, env, visitor, 'care_request_created', {
    tool: record.preview.typeLabel,
    toolType: 'care',
  });
  return json({ ok: true, request: carePublicRecord(record) });
}

async function listMyCareRequests(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Care request storage is not configured.' }, { status: 501 });
  const visitor = await verifiedVisitorFromRequest(request, env);
  if (!visitor?.email) return json({ error: 'Verify your email to view care requests.' }, { status: 401 });
  const ownerHash = await careOwnerHash(visitor.email, env);
  const list = await kv.list({ prefix: `care:owner:${ownerHash}:`, limit: 100 });
  const requests = [];
  for (const item of list.keys) {
    const id = item.name.split(':').pop();
    const record = await kv.get(careRequestKey(id), { type: 'json' });
    if (record) requests.push(carePublicRecord(record));
  }
  requests.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return json({ ok: true, requests });
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
  const verifiedList = await kv.list({ prefix: 'verified:', limit: 500 });
  const verifiedVisitors = [];
  for (const key of verifiedList.keys) {
    const item = await kv.get(key.name, { type: 'json' });
    if (item) verifiedVisitors.push(item);
  }
  verifiedVisitors.sort((a, b) => String(b.lastSeenAt || b.verifiedAt).localeCompare(String(a.lastSeenAt || a.verifiedAt)));
  const careList = await kv.list({ prefix: 'care:request:', limit: 500 });
  const careRequests = [];
  for (const key of careList.keys) {
    const item = await kv.get(key.name, { type: 'json' });
    if (item) careRequests.push(carePublicRecord(item));
  }
  careRequests.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return json({ coupons: couponStates, analytics, verifiedVisitors, careRequests });
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

    if (request.method === 'GET' && (url.pathname === '/admin' || url.pathname === '/admin.html')) {
      return serveAdminPage();
    }

    if (request.method === 'GET' && url.pathname === '/verify-email') {
      return consumeVerificationLink(request, env);
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

    if (request.method === 'POST' && url.pathname === '/api/care/requests') {
      return createCareRequest(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/api/care/requests/mine') {
      return listMyCareRequests(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/verification/request-code') {
      return requestVerificationCode(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/verification/verify-code') {
      return verifyVerificationCode(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/api/verification/status') {
      return verificationStatus(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/summary') {
      return adminSummary(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/coupons/revoke') {
      return adminRevokeCoupon(request, env);
    }

    const originRequest = url.pathname === '/admin'
      ? new Request(new URL('/admin.html', url), request)
      : request;

    const response = await fetch(originRequest);
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
