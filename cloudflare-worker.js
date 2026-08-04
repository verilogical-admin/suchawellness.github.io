const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https://*.razorpay.com; font-src https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' https://checkout.razorpay.com; script-src-attr 'none'; connect-src 'self' https://www.suchawellness.com https://payment-worker.verilogical.com https://praivasipdf-api.verilogical.com https://api.razorpay.com https://checkout.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; form-action 'self'; worker-src 'self'; manifest-src 'self'; media-src 'self'; upgrade-insecure-requests",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-Robots-Tag': 'index, follow',
  'Permissions-Policy': 'accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(self), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(self), usb=()',
};

const STATIC_ASSET_VERSION = '2026-08-04-eq-lab-v1';

const ROBOTS_TXT = `# Sucha™ Wellness allows responsible search and AI discovery so people can find
# mental wellness screening, private journaling, and care-navigation resources.
# Public pages may be crawled and referenced. Private account, payment, and
# admin surfaces remain unavailable to automated crawlers.

Content-Signal: search=yes,ai-input=yes,ai-train=yes,use=reference

Sitemap: https://www.suchawellness.com/sitemap.xml
Host: https://www.suchawellness.com

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin.html
Disallow: /account
Disallow: /account.html
`;

const LLMS_TXT = `# Sucha™ Wellness

> Sucha™ Wellness is a privacy-focused mental wellness platform for informational screening tests, private journaling, care navigation, and provider pages. It helps people reflect on mental wellness signals, keep private notes, and take a next step toward qualified care. Sucha™ Wellness content is informational only and is not a diagnosis or a replacement for care from a qualified doctor, psychologist, therapist, or licensed counsellor.

Important interpretation notes:
- Sucha™ Wellness should be described as a mental wellness and care-navigation platform, not as an emergency service or standalone medical diagnosis provider.
- Screening tools on the site are informational only.
- The private journal stores entries in the browser by default; premium adds a password-protected encrypted vault.
- Care-seeker and provider onboarding requests are designed to route people toward qualified, licensed, and vetted professionals.
- For support, contact support@suchawellness.com.

## Core Pages
- [Homepage](https://www.suchawellness.com/): Main Sucha™ Wellness experience with mental wellness screening, journaling, care navigation, provider onboarding, and contact information.
- [Mental health screening tests](https://www.suchawellness.com/tests): Dedicated landing page for informational Sucha™-hosted screening tools and optional premium report unlocks.
- [Empathy Type Test](https://www.suchawellness.com/empathy-test): Dedicated page for the free 5-question empathy snapshot and separate paid 20Q/50Q empathy reports.
- [Empathy Lab](https://www.suchawellness.com/empathy-lab): Interactive premium training lab for cognitive, emotional, compassionate, synchrony, and Read the Room empathy practice.
- [EQ Lab](https://www.suchawellness.com/eq-lab): Visual emotional intelligence learning and practice lab for self-awareness, self-regulation, empathy, trigger response, and relationship skill.
- [Sucha™ Journal](https://www.suchawellness.com/journal): Dedicated page for private mental health notes, local journal storage, and optional premium encrypted vault.
- [Transactional Analysis Practice Lab](https://www.suchawellness.com/transactional-analysis): TA learning and application tool with free PAC lessons, a 7-day local trial, and optional Razorpay premium for transaction analysis, logs, strokes, life positions, and reflection.
- [Care seeker matching](https://www.suchawellness.com/therapist-matching): Dedicated page for requesting connection to a licensed and vetted therapist or counsellor.
- [Premium PDF reports](https://www.suchawellness.com/premium-reports): Dedicated page explaining premium account report access, one-time report unlocks, and separate empathy report products.
- [Provider pages](https://www.suchawellness.com/#provider-page): Provider onboarding for branded pages powered by Sucha™ Wellness.
- [Contact](https://www.suchawellness.com/#contact): General contact and support entry point.
- [Legal disclaimer](https://www.suchawellness.com/legal-disclaimer.html): Safety, informational-use, and clinical-care disclaimers.

## Products And Offers
- [Sucha™ Journal Premium](https://www.suchawellness.com/journal): $60/year premium journal vault with password-protected encryption and a 30-day cancellation refund policy described on the page.
- [Premium screening report unlocks](https://www.suchawellness.com/premium-reports): Optional paid downloadable reports for selected informational screening tools.
- [Premium empathy reports](https://www.suchawellness.com/empathy-test): Separate paid 20Q comprehensive and 50Q deep empathy tests with downloadable PDF reports.
- [Empathy Lab Premium](https://www.suchawellness.com/empathy-lab): Separate $1000/year premium lab access for empathy skill practice, currently unlockable through dedicated Empathy Lab coupons or Razorpay checkout.
- [Care navigation](https://www.suchawellness.com/therapist-matching): Request routing to qualified, licensed, and vetted mental health professionals.
- [Provider presence](https://www.suchawellness.com/#provider-page): Branded provider pages, bookings, payments, secure sharing, and credential verification workflow.

## Safety Boundaries
- Sucha™ Wellness screening tools do not diagnose mental health conditions.
- Users should consult qualified doctors, psychologists, therapists, or licensed counsellors for clinical guidance.
- If someone may be in immediate danger or a mental health crisis, they should contact local emergency services or a local crisis helpline.
- The site should not be represented as a substitute for emergency care, clinical diagnosis, medical treatment, or medication advice.

## Structured Data
- [JSON-LD on homepage](https://www.suchawellness.com/): Organization, WebSite, WebApplication, Offer, and FAQPage structured data.
- [Sitemap](https://www.suchawellness.com/sitemap.xml): Canonical public URLs for crawlers.
- [Robots policy](https://www.suchawellness.com/robots.txt): Public crawler guidance for search and AI discovery.

## Optional
- [Account dashboard](https://www.suchawellness.com/account.html): User account dashboard. Crawlers should not use this as a public content source.
- [Admin page](https://www.suchawellness.com/admin.html): Administrative surface. Crawlers should not use this as a public content source.
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.suchawellness.com/</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/tests</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/empathy-test</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/empathy-lab</loc>
    <lastmod>2026-08-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/eq-lab</loc>
    <lastmod>2026-08-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/journal</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/transactional-analysis</loc>
    <lastmod>2026-08-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/therapist-matching</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/premium-reports</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/legal-disclaimer.html</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.suchawellness.com/llms.txt</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
`;

const JOURNAL_PLAN_ID = 'journal_yearly_60';
const JOURNAL_PRODUCT = 'SuchaJournal';
const JOURNAL_PRICE_LABEL = '$60/year';
const JOURNAL_ACCESS_DAYS = 365;
const JOURNAL_REFUND_REPORT_DEDUCTION = '$10';
const EMPATHY_REPORT_PLAN_ID = 'empathy_report_10';
const EMPATHY_DEEP_REPORT_PLAN_ID = 'empathy_deep_report_30';
const EMPATHY_REPORT_PRODUCT = 'SuchaEmpathyReport';
const TEST_REPORT_PLAN_ID = 'test_report_5';
const TEST_REPORT_PRODUCT = 'SuchaTestReport';
const TA_LAB_PLAN_ID = 'ta_lab_yearly_60';
const TA_LAB_PRODUCT = 'SuchaTALabPremium';
const TA_LAB_PRICE_LABEL = '$60/year';
const TA_LAB_ACCESS_DAYS = 365;
const EMPATHY_LAB_PLAN_ID = 'empathy_lab_yearly_1000';
const EMPATHY_LAB_PRODUCT = 'SuchaEmpathyLabPremium';
const EMPATHY_LAB_PRICE_LABEL = '$1000/year';
const EMPATHY_LAB_ACCESS_DAYS = 365;
const GUARANTEE_DAYS = 30;
const VERIFICATION_COOKIE = 'sucha_verified_visitor';
const WALLET_PRODUCT = 'SuchaCareWallet';
const WALLET_CURRENCY = 'INR';
const WALLET_LIMITS = {
  INR: { min: 10000, max: 5000000, minLabel: '₹100', maxLabel: '₹50,000' },
  USD: { min: 500, max: 500000, minLabel: '$5', maxLabel: '$5,000' },
};
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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      ...(init.headers || {}),
    },
  });
}

function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function staticResponse(request, body, contentType) {
  return new Response(request.method === 'HEAD' ? null : body, {
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=300',
    },
  });
}

function staticContentType(pathname) {
  if (pathname.endsWith('.html')) return 'text/html; charset=utf-8';
  if (pathname.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (pathname.endsWith('.css')) return 'text/css; charset=utf-8';
  if (pathname.endsWith('.json') || pathname.endsWith('.webmanifest')) return 'application/manifest+json; charset=utf-8';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.ico')) return 'image/x-icon';
  if (pathname.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (pathname.endsWith('.xml')) return 'application/xml; charset=utf-8';
  return 'application/octet-stream';
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

function validateEmpathyReportCheckoutRequest(body) {
  const email = String(body.email || '').trim().toLowerCase();
  if (body.planId && ![EMPATHY_REPORT_PLAN_ID, EMPATHY_DEEP_REPORT_PLAN_ID].includes(body.planId)) throw new Error('Unknown empathy report plan.');
  if (body.product && body.product !== EMPATHY_REPORT_PRODUCT) throw new Error('Unknown product.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid billing email is required.');
  return email;
}

function validateTestReportCheckoutRequest(body) {
  const email = String(body.email || '').trim().toLowerCase();
  if (body.planId && body.planId !== TEST_REPORT_PLAN_ID) throw new Error('Unknown test report plan.');
  if (body.product && body.product !== TEST_REPORT_PRODUCT) throw new Error('Unknown product.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid billing email is required.');
  return email;
}

function validateTaLabCheckoutRequest(body) {
  const email = String(body.email || '').trim().toLowerCase();
  if (body.planId && body.planId !== TA_LAB_PLAN_ID) throw new Error('Unknown TA Lab plan.');
  if (body.product && body.product !== TA_LAB_PRODUCT) throw new Error('Unknown product.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid billing email is required.');
  return email;
}

function validateEmpathyLabCheckoutRequest(body) {
  const email = String(body.email || '').trim().toLowerCase();
  if (body.planId && body.planId !== EMPATHY_LAB_PLAN_ID) throw new Error('Unknown Empathy Lab plan.');
  if (body.product && body.product !== EMPATHY_LAB_PRODUCT) throw new Error('Unknown product.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid billing email is required.');
  return email;
}

function empathyReportPlan(body = {}) {
  const planId = body.planId === EMPATHY_DEEP_REPORT_PLAN_ID ? EMPATHY_DEEP_REPORT_PLAN_ID : EMPATHY_REPORT_PLAN_ID;
  return planId === EMPATHY_DEEP_REPORT_PLAN_ID
    ? { planId, label: '50-question deep empathy report', amount: 3000, price: '$30', length: 50 }
    : { planId, label: '20-question comprehensive empathy report', amount: 1000, price: '$10', length: 20 };
}

function testReportPlan() {
  return { planId: TEST_REPORT_PLAN_ID, label: 'single test PDF report', amount: 500, price: '$5' };
}

function taLabPlan() {
  return { planId: TA_LAB_PLAN_ID, label: 'TA Lab Premium', amount: 6000, price: TA_LAB_PRICE_LABEL };
}

function empathyLabPlan() {
  return { planId: EMPATHY_LAB_PLAN_ID, label: 'Empathy Lab Premium', amount: 100000, price: EMPATHY_LAB_PRICE_LABEL };
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

function feedbackKey(date, id) {
  return `feedback:${date}:${id}`;
}

function askQuestionKey(date, id) {
  return `ask-question:${date}:${id}`;
}

function freeAccessRequestKey(id) {
  return `free-access-request:${id}`;
}

function walletKey(ownerHash) {
  return `wallet:${ownerHash}`;
}

function walletOrderKey(orderId) {
  return `wallet:order:${orderId}`;
}

function walletTransactionKey(ownerHash, paymentId) {
  return `wallet:tx:${ownerHash}:${paymentId}`;
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
      subject: 'Your Sucha™ Wellness verification code',
      text: `Your Sucha™ Wellness verification code is ${code}. It expires in 10 minutes.\n\nOr click this verification link:\n${verifyUrl}\n\nYou are receiving this because this email was used to access Sucha™ Wellness tools.`,
      html: `<!doctype html>
<html>
  <body style="margin:0;background:#F5F2EB;color:#171717;font-family:Jost,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EB;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #D9D2C4;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;">
                <div style="color:#2D7A6B;font-family:Georgia,serif;font-size:28px;line-height:1.1;font-weight:700;">Sucha™ Wellness</div>
                <p style="font-size:17px;line-height:1.55;margin:20px 0 0;">Use this secure link to verify your email and continue with Sucha™ Wellness.</p>
                <p style="margin:24px 0;">
                  <a href="${verifyUrl}" style="display:inline-block;background:#2D7A6B;color:#fff;text-decoration:none;font-weight:700;border-radius:999px;padding:13px 20px;">Verify email</a>
                </p>
                <p style="font-size:15px;line-height:1.55;margin:0 0 18px;color:#3F4945;">Or enter this 6-digit code on the site:</p>
                <div style="display:inline-block;letter-spacing:6px;font-size:28px;font-weight:700;color:#171717;background:#F5F2EB;border:1px solid #D9D2C4;border-radius:10px;padding:12px 16px;">${code}</div>
                <p style="font-size:14px;line-height:1.55;margin:22px 0 0;color:#5A625F;">This link and code expire in 10 minutes. You are receiving this because this email was used to access Sucha™ Wellness tools.</p>
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
    return new Response('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verification failed</title><body style="font-family:Jost,system-ui,sans-serif;background:#F5F2EB;color:#171717;display:grid;min-height:100vh;place-items:center;margin:0"><main style="max-width:520px;padding:28px"><h1 style="color:#2D7A6B;font-family:serif">Verification link expired</h1><p>Please return to Sucha™ Wellness and request a fresh code.</p><a href="/" style="color:#2D7A6B">Back to Sucha™</a></main></body>', {
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

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function couponCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return `SUCHA-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join('')}`;
}

function publicCoupon(hash, state = {}, fallback = {}) {
  return {
    hash,
    id: fallback.id || state.id || 'Manual coupon',
    code: state.code || '',
    manual: Boolean(state.manual),
    status: state.revoked ? 'Revoked' : state.usedAt ? 'Used' : state.expiresAt && Date.parse(state.expiresAt) < Date.now() ? 'Expired' : 'Available',
    email: state.email || '',
    accessDays: state.accessDays || JOURNAL_ACCESS_DAYS,
    validUntil: state.expiresAt || '',
    usedBy: state.usedBy || '',
    usedAt: state.usedAt || '',
    revoked: Boolean(state.revoked),
    revokedAt: state.revokedAt || '',
    updatedAt: state.updatedAt || '',
    createdAt: state.createdAt || '',
    note: state.note || '',
    product: state.product || JOURNAL_PRODUCT,
    requestId: state.requestId || '',
  };
}

async function redeemCoupon(request, env, forcedProduct = '') {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Coupon storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const code = String(body.code || '').trim().toUpperCase();
  const email = String(body.email || '').trim().toLowerCase();
  const requestedProduct = forcedProduct || cleanText(body.product || JOURNAL_PRODUCT, 80);
  if (!code) return json({ error: 'Enter a coupon code.' }, { status: 400 });
  if (!normalizeEmail(email)) return json({ error: 'Enter a valid email for this coupon.' }, { status: 400 });
  const hash = await sha256Hex(code);
  const state = await getCouponState(kv, hash);
  if (!COUPON_HASHES.includes(hash) && !state.manual) return json({ error: 'Coupon not found.' }, { status: 404 });
  if (state.revoked) return json({ error: 'Coupon has been revoked.' }, { status: 403 });
  if (state.usedAt) return json({ error: 'Coupon has already been used.' }, { status: 409 });
  if (state.expiresAt && Date.parse(state.expiresAt) < Date.now()) return json({ error: 'Coupon has expired.' }, { status: 410 });
  if (state.email && state.email !== email) return json({ error: 'This coupon is assigned to a different email.' }, { status: 403 });
  const couponProduct = state.product || JOURNAL_PRODUCT;
  if (couponProduct !== requestedProduct) return json({ error: 'This coupon is for a different Sucha™ product.' }, { status: 403 });

  const now = Date.now();
  const maxAccessDays = couponProduct === EMPATHY_LAB_PRODUCT
    ? EMPATHY_LAB_ACCESS_DAYS
    : couponProduct === TA_LAB_PRODUCT
      ? TA_LAB_ACCESS_DAYS
      : JOURNAL_ACCESS_DAYS;
  const accessDays = clampNumber(state.accessDays, 1, maxAccessDays, maxAccessDays);
  const planId = couponProduct === EMPATHY_LAB_PRODUCT
    ? EMPATHY_LAB_PLAN_ID
    : couponProduct === TA_LAB_PRODUCT
      ? TA_LAB_PLAN_ID
      : JOURNAL_PLAN_ID;
  const access = {
    ok: true,
    source: state.source || 'admin_coupon',
    planId,
    product: couponProduct,
    email,
    couponHash: hash,
    redeemedAt: now,
    expiresAt: now + accessDays * 24 * 60 * 60 * 1000,
    accessDays,
  };
  await putCouponState(kv, hash, {
    ...state,
    usedAt: new Date(now).toISOString(),
    usedBy: email || 'not provided',
  });
  return json(access);
}

async function createFreeAccessRequest(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Request storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email) return json({ error: 'Enter a valid email so the coupon can be sent if approved.' }, { status: 400 });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record = {
    id,
    email,
    message: cleanText(body.message || "I can't afford to pay now, please give me a day's access for free, I will voluntarily do some marketing for you in good faith", 360),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    country: request.headers.get('CF-IPCountry') || 'unknown',
    region: cleanText(request.cf?.region || 'unknown', 80),
    city: cleanText(request.cf?.city || 'unknown', 80),
  };
  await kv.put(freeAccessRequestKey(id), JSON.stringify(record));
  return json({ ok: true, request: record });
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

async function createFeedback(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Feedback storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const message = cleanText(body.message, 5000);
  if (!message) return json({ error: 'Message is required.' }, { status: 400 });
  const now = new Date();
  const id = `fb_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  const item = {
    id,
    type: cleanText(body.type || 'Feedback', 60),
    message,
    contact: cleanText(body.contact, 240),
    product: cleanText(body.product || 'Sucha™ Mama', 120),
    brand: cleanText(body.brand || 'Sucha™ Wellness', 120),
    page: cleanText(body.page, 160),
    url: cleanText(body.url, 500),
    timezone: cleanText(body.timezone, 80),
    country: request.headers.get('CF-IPCountry') || 'unknown',
    region: cleanText(request.cf?.region || 'unknown', 80),
    city: cleanText(request.cf?.city || 'unknown', 80),
    createdAt: now.toISOString(),
    status: 'open',
  };
  const date = now.toISOString().slice(0, 10);
  await kv.put(feedbackKey(date, id), JSON.stringify(item), { expirationTtl: 60 * 60 * 24 * 365 });
  return json({ ok: true, id });
}

async function createAskSuchaQuestion(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Question storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const question = cleanText(body.question, 1000);
  if (!question) return json({ error: 'Question is required.' }, { status: 400 });
  const now = new Date();
  const id = `ask_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  const item = {
    id,
    question,
    matched: Boolean(body.matched),
    answerTitle: cleanText(body.answerTitle, 120),
    contact: cleanText(body.email || body.contact, 240),
    wantsReply: Boolean(body.wantsReply),
    page: cleanText(body.page, 160),
    path: cleanText(body.path, 160),
    url: cleanText(body.url, 500),
    timezone: cleanText(body.timezone, 80),
    country: request.headers.get('CF-IPCountry') || 'unknown',
    region: cleanText(request.cf?.region || 'unknown', 80),
    city: cleanText(request.cf?.city || 'unknown', 80),
    createdAt: now.toISOString(),
    source: 'ask-sucha',
    status: 'open',
  };
  const date = now.toISOString().slice(0, 10);
  await kv.put(askQuestionKey(date, id), JSON.stringify(item), { expirationTtl: 60 * 60 * 24 * 365 });
  return json({ ok: true, id });
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
  const wallet = await readWallet(kv, ownerHash);
  const list = await kv.list({ prefix: `care:owner:${ownerHash}:`, limit: 100 });
  const requests = [];
  for (const item of list.keys) {
    const id = item.name.split(':').pop();
    const record = await kv.get(careRequestKey(id), { type: 'json' });
    if (record) requests.push(carePublicRecord(record));
  }
  requests.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return json({ ok: true, requests, wallet: publicWallet(wallet) });
}

async function adminSummary(request, env) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, { status: 401 });
  const kv = getKv(env);
  if (!kv) return json({ error: 'Admin KV storage is not configured.' }, { status: 501 });
  const couponStates = await Promise.all(COUPON_HASHES.map(async (hash, index) => ({
    ...publicCoupon(hash, await getCouponState(kv, hash), { id: `Coupon ${index + 1}` }),
  })));
  const manualCouponList = await kv.list({ prefix: 'coupon:', limit: 500 });
  const manualCoupons = [];
  for (const key of manualCouponList.keys) {
    const hash = key.name.replace('coupon:', '');
    if (COUPON_HASHES.includes(hash)) continue;
    const state = await kv.get(key.name, { type: 'json' });
    if (state?.manual) manualCoupons.push(publicCoupon(hash, state));
  }
  manualCoupons.sort((a, b) => String(b.createdAt || b.updatedAt).localeCompare(String(a.createdAt || a.updatedAt)));
  const freeRequestList = await kv.list({ prefix: 'free-access-request:', limit: 500 });
  const freeAccessRequests = [];
  for (const key of freeRequestList.keys) {
    const item = await kv.get(key.name, { type: 'json' });
    if (item) freeAccessRequests.push(item);
  }
  freeAccessRequests.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
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
  const feedbackList = await kv.list({ prefix: 'feedback:', limit: 500 });
  const feedback = [];
  for (const key of feedbackList.keys) {
    const item = await kv.get(key.name, { type: 'json' });
    if (item) feedback.push(item);
  }
  feedback.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const questionList = await kv.list({ prefix: 'ask-question:', limit: 500 });
  const questions = [];
  for (const key of questionList.keys) {
    const item = await kv.get(key.name, { type: 'json' });
    if (item) questions.push(item);
  }
  questions.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return json({ coupons: couponStates, manualCoupons, freeAccessRequests, analytics, verifiedVisitors, careRequests, feedback, questions });
}

async function adminRevokeCoupon(request, env) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, { status: 401 });
  const kv = getKv(env);
  if (!kv) return json({ error: 'Admin KV storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const hash = String(body.hash || '');
  const state = await getCouponState(kv, hash);
  if (!COUPON_HASHES.includes(hash) && !state.manual) return json({ error: 'Coupon not found.' }, { status: 404 });
  await putCouponState(kv, hash, { ...state, revoked: true, revokedAt: new Date().toISOString() });
  return json({ ok: true });
}

async function adminCreateCoupon(request, env) {
  if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, { status: 401 });
  const kv = getKv(env);
  if (!kv) return json({ error: 'Admin KV storage is not configured.' }, { status: 501 });
  const body = await readJson(request);
  const email = body.email ? normalizeEmail(body.email) : '';
  if (body.email && !email) return json({ error: 'Enter a valid email or leave email blank.' }, { status: 400 });
  const product = cleanText(body.product || JOURNAL_PRODUCT, 80);
  if (![JOURNAL_PRODUCT, TA_LAB_PRODUCT, EMPATHY_LAB_PRODUCT].includes(product)) return json({ error: 'Unknown coupon product.' }, { status: 400 });
  const productAccessDays = product === EMPATHY_LAB_PRODUCT ? EMPATHY_LAB_ACCESS_DAYS : product === TA_LAB_PRODUCT ? TA_LAB_ACCESS_DAYS : JOURNAL_ACCESS_DAYS;
  const accessDays = clampNumber(body.accessDays, 1, productAccessDays, 1);
  const validHours = clampNumber(body.validHours, 1, 24 * 30, 48);
  const now = new Date();
  let code = '';
  let hash = '';
  for (let attempt = 0; attempt < 8; attempt += 1) {
    code = couponCode();
    hash = await sha256Hex(code);
    const existing = await getCouponState(kv, hash);
    if (!existing.manual && !COUPON_HASHES.includes(hash)) break;
  }
  const state = {
    manual: true,
    id: cleanText(body.label || `${accessDays}-day access coupon`, 80),
    code,
    email,
    accessDays,
    expiresAt: new Date(now.getTime() + validHours * 60 * 60 * 1000).toISOString(),
    createdAt: now.toISOString(),
    createdBy: 'admin',
    source: 'admin_manual_coupon',
    product,
    note: cleanText(body.note || '', 240),
    requestId: cleanText(body.requestId || '', 80),
  };
  await putCouponState(kv, hash, state);
  const couponProductLabel = product === EMPATHY_LAB_PRODUCT
    ? 'Empathy Lab Premium'
    : product === TA_LAB_PRODUCT
      ? 'TA Lab Premium'
      : 'Sucha™ Journal Premium';
  const couponDestination = product === EMPATHY_LAB_PRODUCT
    ? 'Empathy Lab premium coupon field'
    : product === TA_LAB_PRODUCT
      ? 'TA Lab premium coupon field'
      : 'Sucha™ Journal premium coupon field';
  let emailed = false;
  let emailError = '';
  if (email && body.emailCoupon !== false) {
    try {
      await sendSuchaEmail(env, {
        to: email,
        subject: `Your Sucha™ Wellness ${couponProductLabel} coupon`,
        text: `Your Sucha™ Wellness coupon code is ${code}.\n\nIt gives ${accessDays} day${accessDays === 1 ? '' : 's'} of ${couponProductLabel} access and must be used by ${state.expiresAt}.\n\nEnter it in the ${couponDestination} with this email address.`,
        html: `<!doctype html>
<html>
  <body style="margin:0;background:#F5F2EB;color:#171717;font-family:Jost,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EB;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #D9D2C4;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px;">
                <div style="color:#2D7A6B;font-family:Georgia,serif;font-size:28px;line-height:1.1;font-weight:700;">Sucha™ Wellness</div>
                <p style="font-size:17px;line-height:1.55;margin:20px 0 0;">Your ${couponProductLabel} coupon is ready.</p>
                <div style="display:inline-block;letter-spacing:3px;font-size:24px;font-weight:700;color:#171717;background:#F5F2EB;border:1px solid #D9D2C4;border-radius:10px;padding:12px 16px;margin:22px 0;">${code}</div>
                <p style="font-size:15px;line-height:1.55;margin:0;color:#3F4945;">This code gives ${accessDays} day${accessDays === 1 ? '' : 's'} of ${couponProductLabel} access and must be used within the approval window. Enter it in the ${couponDestination} with this email address.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
      });
      emailed = true;
    } catch (error) {
      emailError = error.message || 'Email could not be sent.';
    }
  }
  if (state.requestId) {
    const key = freeAccessRequestKey(state.requestId);
    const requestRecord = await kv.get(key, { type: 'json' });
    if (requestRecord) {
      await kv.put(key, JSON.stringify({
        ...requestRecord,
        status: 'approved',
        approvedAt: now.toISOString(),
        updatedAt: now.toISOString(),
        couponHash: hash,
        couponCode: code,
        couponExpiresAt: state.expiresAt,
        couponEmailed: emailed,
        couponEmailError: emailError,
      }));
    }
  }
  return json({ ok: true, coupon: publicCoupon(hash, state), emailed, emailError });
}

async function createSuchaJournalCheckout(request, env) {
  const auth = getRazorpayAuth(env);
  if (!auth) return json({ error: 'Razorpay Worker secrets are not configured.' }, { status: 501 });

  const body = await readJson(request);
  if (body.product === EMPATHY_REPORT_PRODUCT || [EMPATHY_REPORT_PLAN_ID, EMPATHY_DEEP_REPORT_PLAN_ID].includes(body.planId)) {
    let email;
    try {
      email = validateEmpathyReportCheckoutRequest(body);
    } catch (error) {
      return json({ error: error.message }, { status: 400 });
    }

    const now = Date.now();
    const plan = empathyReportPlan(body);
    const amount = Number(plan.planId === EMPATHY_DEEP_REPORT_PLAN_ID
      ? env.SUCHA_EMPATHY_DEEP_REPORT_AMOUNT_MINOR || plan.amount
      : env.SUCHA_EMPATHY_REPORT_AMOUNT_MINOR || plan.amount);
    const currency = env.SUCHA_EMPATHY_REPORT_CURRENCY || 'USD';
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `sucha_empathy_${now}`,
        notes: {
          product: EMPATHY_REPORT_PRODUCT,
          planId: plan.planId,
          email,
          price: `${plan.price} ${plan.label}`,
          length: String(plan.length),
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
      planId: plan.planId,
      product: EMPATHY_REPORT_PRODUCT,
      price: plan.price,
      length: plan.length,
    });
  }

  if (body.product === TEST_REPORT_PRODUCT || body.planId === TEST_REPORT_PLAN_ID) {
    let email;
    try {
      email = validateTestReportCheckoutRequest(body);
    } catch (error) {
      return json({ error: error.message }, { status: 400 });
    }

    const now = Date.now();
    const plan = testReportPlan();
    const amount = Number(env.SUCHA_TEST_REPORT_AMOUNT_MINOR || plan.amount);
    const currency = env.SUCHA_TEST_REPORT_CURRENCY || 'USD';
    const testKey = cleanText(body.testKey || 'test', 60);
    const testTitle = cleanText(body.testTitle || 'Sucha™ test report', 120);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `sucha_test_report_${now}`,
        notes: {
          product: TEST_REPORT_PRODUCT,
          planId: plan.planId,
          email,
          price: `${plan.price} ${plan.label}`,
          testKey,
          testTitle,
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
      planId: plan.planId,
      product: TEST_REPORT_PRODUCT,
      price: plan.price,
      testKey,
      testTitle,
    });
  }

  if (body.product === TA_LAB_PRODUCT || body.planId === TA_LAB_PLAN_ID) {
    let email;
    try {
      email = validateTaLabCheckoutRequest(body);
    } catch (error) {
      return json({ error: error.message }, { status: 400 });
    }

    const now = Date.now();
    const guaranteeEndsAt = now + GUARANTEE_DAYS * 24 * 60 * 60 * 1000;
    const accessExpiresAt = now + TA_LAB_ACCESS_DAYS * 24 * 60 * 60 * 1000;
    const plan = taLabPlan();
    const amount = Number(env.SUCHA_TA_LAB_YEARLY_AMOUNT_MINOR || env.SUCHA_TA_LAB_AMOUNT_MINOR || plan.amount);
    const currency = env.SUCHA_TA_LAB_CURRENCY || 'USD';
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `sucha_ta_lab_${now}`,
        notes: {
          product: TA_LAB_PRODUCT,
          planId: plan.planId,
          email,
          guaranteeDays: String(GUARANTEE_DAYS),
          refundPolicy: '30-day cancellation refund policy described on Sucha™ Wellness',
          price: `${plan.price} ${plan.label}`,
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
      planId: plan.planId,
      product: TA_LAB_PRODUCT,
      price: plan.price,
      guaranteeEndsAt,
      expiresAt: accessExpiresAt,
    });
  }

  if (body.product === EMPATHY_LAB_PRODUCT || body.planId === EMPATHY_LAB_PLAN_ID) {
    let email;
    try {
      email = validateEmpathyLabCheckoutRequest(body);
    } catch (error) {
      return json({ error: error.message }, { status: 400 });
    }

    const now = Date.now();
    const guaranteeEndsAt = now + GUARANTEE_DAYS * 24 * 60 * 60 * 1000;
    const accessExpiresAt = now + EMPATHY_LAB_ACCESS_DAYS * 24 * 60 * 60 * 1000;
    const plan = empathyLabPlan();
    const amount = Number(env.SUCHA_EMPATHY_LAB_YEARLY_AMOUNT_MINOR || env.SUCHA_EMPATHY_LAB_AMOUNT_MINOR || plan.amount);
    const currency = env.SUCHA_EMPATHY_LAB_CURRENCY || 'USD';
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `sucha_empathy_lab_${now}`,
        notes: {
          product: EMPATHY_LAB_PRODUCT,
          planId: plan.planId,
          email,
          guaranteeDays: String(GUARANTEE_DAYS),
          refundPolicy: '30-day cancellation refund policy described on Sucha™ Wellness',
          price: `${plan.price} ${plan.label}`,
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
      planId: plan.planId,
      product: EMPATHY_LAB_PRODUCT,
      price: plan.price,
      guaranteeEndsAt,
      expiresAt: accessExpiresAt,
    });
  }

  let email;
  try {
    email = validateJournalCheckoutRequest(body);
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }

  const now = Date.now();
  const guaranteeEndsAt = now + GUARANTEE_DAYS * 24 * 60 * 60 * 1000;
  const accessExpiresAt = now + JOURNAL_ACCESS_DAYS * 24 * 60 * 60 * 1000;
  const amount = Number(env.SUCHA_JOURNAL_YEARLY_AMOUNT_MINOR || env.SUCHA_JOURNAL_AMOUNT_MINOR || 6000);
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
        refundPolicy: `30-day cancellation refund minus ${JOURNAL_REFUND_REPORT_DEDUCTION} for downloaded reports`,
        price: JOURNAL_PRICE_LABEL,
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
  const isEmpathyReport = body.product === EMPATHY_REPORT_PRODUCT || [EMPATHY_REPORT_PLAN_ID, EMPATHY_DEEP_REPORT_PLAN_ID].includes(body.planId);
  const isTestReport = body.product === TEST_REPORT_PRODUCT || body.planId === TEST_REPORT_PLAN_ID;
  const isTaLab = body.product === TA_LAB_PRODUCT || body.planId === TA_LAB_PLAN_ID;
  const isEmpathyLab = body.product === EMPATHY_LAB_PRODUCT || body.planId === EMPATHY_LAB_PLAN_ID;
  let email;
  try {
    email = isEmpathyReport
      ? validateEmpathyReportCheckoutRequest(body)
      : isTestReport
        ? validateTestReportCheckoutRequest(body)
        : isTaLab
          ? validateTaLabCheckoutRequest(body)
          : isEmpathyLab
            ? validateEmpathyLabCheckoutRequest(body)
            : validateJournalCheckoutRequest(body);
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

  if (isEmpathyReport) {
    const plan = empathyReportPlan(body);
    return json({
      ok: true,
      source: 'razorpay_order',
      planId: plan.planId,
      product: EMPATHY_REPORT_PRODUCT,
      email,
      razorpayPaymentId: body.razorpay_payment_id,
      razorpayOrderId: body.razorpay_order_id,
      purchasedAt: Date.now(),
      price: plan.price,
      length: plan.length,
    });
  }

  if (isTestReport) {
    const plan = testReportPlan();
    return json({
      ok: true,
      source: 'razorpay_order',
      planId: plan.planId,
      product: TEST_REPORT_PRODUCT,
      email,
      testKey: cleanText(body.testKey || 'test', 60),
      testTitle: cleanText(body.testTitle || 'Sucha™ test report', 120),
      razorpayPaymentId: body.razorpay_payment_id,
      razorpayOrderId: body.razorpay_order_id,
      purchasedAt: Date.now(),
      guaranteeEndsAt: Date.now() + GUARANTEE_DAYS * 24 * 60 * 60 * 1000,
      expiresAt: Date.now() + TA_LAB_ACCESS_DAYS * 24 * 60 * 60 * 1000,
      price: plan.price,
    });
  }

  if (isTaLab) {
    const plan = taLabPlan();
    return json({
      ok: true,
      source: 'razorpay_order',
      planId: plan.planId,
      product: TA_LAB_PRODUCT,
      email,
      razorpayPaymentId: body.razorpay_payment_id,
      razorpayOrderId: body.razorpay_order_id,
      purchasedAt: Date.now(),
      price: plan.price,
    });
  }

  if (isEmpathyLab) {
    const plan = empathyLabPlan();
    const now = Date.now();
    return json({
      ok: true,
      source: 'razorpay_order',
      planId: plan.planId,
      product: EMPATHY_LAB_PRODUCT,
      email,
      razorpayPaymentId: body.razorpay_payment_id,
      razorpayOrderId: body.razorpay_order_id,
      purchasedAt: now,
      guaranteeEndsAt: now + GUARANTEE_DAYS * 24 * 60 * 60 * 1000,
      expiresAt: now + EMPATHY_LAB_ACCESS_DAYS * 24 * 60 * 60 * 1000,
      price: plan.price,
    });
  }

  const now = Date.now();
  const guaranteeEndsAt = now + GUARANTEE_DAYS * 24 * 60 * 60 * 1000;
  const accessExpiresAt = now + JOURNAL_ACCESS_DAYS * 24 * 60 * 60 * 1000;
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

function normalizeWalletCurrency(value) {
  const currency = String(value || WALLET_CURRENCY).trim().toUpperCase();
  if (!WALLET_LIMITS[currency]) throw new Error('Wallet currency must be USD or INR.');
  return currency;
}

function normalizeWalletAmountMinor(value, currency) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) throw new Error('Enter a valid wallet amount.');
  const minor = Math.round(amount * 100);
  const limits = WALLET_LIMITS[currency] || WALLET_LIMITS[WALLET_CURRENCY];
  if (minor < limits.min) throw new Error(`Minimum wallet top-up is ${limits.minLabel}.`);
  if (minor > limits.max) throw new Error(`Maximum wallet top-up is ${limits.maxLabel}.`);
  return minor;
}

async function readWallet(kv, ownerHash) {
  const wallet = await kv.get(walletKey(ownerHash), { type: 'json' });
  return wallet || {
    balances: { USD: 0, INR: 0 },
    transactions: [],
    updatedAt: null,
  };
}

function publicWallet(wallet) {
  const balances = {
    USD: Number(wallet.balances?.USD || (wallet.currency === 'USD' ? wallet.balanceMinor : 0) || 0),
    INR: Number(wallet.balances?.INR || (wallet.currency === 'INR' ? wallet.balanceMinor : 0) || 0),
  };
  return {
    balanceMinor: balances.INR,
    currency: WALLET_CURRENCY,
    balances,
    transactions: Array.isArray(wallet.transactions) ? wallet.transactions.slice(0, 20) : [],
    updatedAt: wallet.updatedAt || null,
  };
}

async function createWalletCheckout(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Wallet storage is not configured.' }, { status: 501 });
  const auth = getRazorpayAuth(env);
  if (!auth) return json({ error: 'Razorpay Worker secrets are not configured.' }, { status: 501 });
  const visitor = await verifiedVisitorFromRequest(request, env);
  if (!visitor?.email) return json({ error: 'Verify your email before adding wallet funds.' }, { status: 401 });

  const body = await readJson(request);
  let amountMinor;
  let currency;
  try {
    currency = normalizeWalletCurrency(body.currency);
    amountMinor = normalizeWalletAmountMinor(body.amount, currency);
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }

  const ownerHash = await careOwnerHash(visitor.email, env);
  const now = Date.now();
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountMinor,
      currency,
      receipt: `sucha_wallet_${now}`,
      notes: {
        product: WALLET_PRODUCT,
        ownerHash,
        purpose: 'wallet_topup',
        supportEmail: 'support@suchawellness.com',
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: data.error?.description || 'Could not create Razorpay wallet order.' }, { status: 502 });

  const order = {
    orderId: data.id,
    ownerHash,
    amountMinor: data.amount || amountMinor,
    currency: data.currency || currency,
    createdAt: new Date(now).toISOString(),
    status: 'created',
  };
  await kv.put(walletOrderKey(data.id), JSON.stringify(order), { expirationTtl: 60 * 60 * 24 });
  await recordVerifiedVisitor(request, env, visitor, 'wallet_checkout_created', {
    tool: 'Sucha™ Wallet',
    toolType: 'billing',
  });

  return json({
    ok: true,
    mode: 'order',
    keyId: env.RAZORPAY_KEY_ID,
    orderId: data.id,
    amount: order.amountMinor,
    currency: order.currency,
  });
}

async function verifyWalletCheckout(request, env) {
  const kv = getKv(env);
  if (!kv) return json({ error: 'Wallet storage is not configured.' }, { status: 501 });
  if (!env.RAZORPAY_KEY_SECRET) return json({ error: 'Razorpay Worker secrets are not configured.' }, { status: 501 });
  const visitor = await verifiedVisitorFromRequest(request, env);
  if (!visitor?.email) return json({ error: 'Verify your email before adding wallet funds.' }, { status: 401 });

  const body = await readJson(request);
  const ownerHash = await careOwnerHash(visitor.email, env);
  const orderId = String(body.razorpay_order_id || '');
  const paymentId = String(body.razorpay_payment_id || '');
  const signature = String(body.razorpay_signature || '');
  const order = orderId ? await kv.get(walletOrderKey(orderId), { type: 'json' }) : null;
  if (!order || order.ownerHash !== ownerHash) return json({ ok: false, error: 'Wallet order was not found for this account.' }, { status: 404 });

  const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`);
  if (!signature || signature !== expected) {
    return json({ ok: false, error: 'Razorpay signature verification failed.' }, { status: 400 });
  }

  const existingTransaction = await kv.get(walletTransactionKey(ownerHash, paymentId), { type: 'json' });
  let wallet = await readWallet(kv, ownerHash);
  if (!existingTransaction) {
    const now = new Date().toISOString();
    const transaction = {
      id: paymentId,
      orderId,
      amountMinor: Number(order.amountMinor || 0),
      currency: order.currency || WALLET_CURRENCY,
      source: 'razorpay',
      status: 'credited',
      createdAt: now,
    };
    wallet = {
      ...wallet,
      balances: {
        USD: Number(wallet.balances?.USD || (wallet.currency === 'USD' ? wallet.balanceMinor : 0) || 0) + (transaction.currency === 'USD' ? transaction.amountMinor : 0),
        INR: Number(wallet.balances?.INR || (wallet.currency === 'INR' ? wallet.balanceMinor : 0) || 0) + (transaction.currency === 'INR' ? transaction.amountMinor : 0),
      },
      balanceMinor: Number(wallet.balances?.INR || (wallet.currency === 'INR' ? wallet.balanceMinor : 0) || 0) + (transaction.currency === 'INR' ? transaction.amountMinor : 0),
      currency: WALLET_CURRENCY,
      updatedAt: now,
      transactions: [transaction, ...(Array.isArray(wallet.transactions) ? wallet.transactions : [])].slice(0, 50),
    };
    await kv.put(walletTransactionKey(ownerHash, paymentId), JSON.stringify(transaction), { expirationTtl: 60 * 60 * 24 * 365 });
    await kv.put(walletKey(ownerHash), JSON.stringify(wallet), { expirationTtl: 60 * 60 * 24 * 365 });
    await kv.put(walletOrderKey(orderId), JSON.stringify({ ...order, status: 'paid', paymentId, paidAt: now }), { expirationTtl: 60 * 60 * 24 * 30 });
    await recordVerifiedVisitor(request, env, visitor, 'wallet_funded', {
      tool: 'Sucha™ Wallet',
      toolType: 'billing',
    });
  }

  return json({
    ok: true,
    product: WALLET_PRODUCT,
    razorpayPaymentId: paymentId,
    razorpayOrderId: orderId,
    wallet: publicWallet(wallet),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return corsPreflight();
    }

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

    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname === '/robots.txt') {
      return staticResponse(request, ROBOTS_TXT, 'text/plain; charset=utf-8');
    }

    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname === '/llms.txt') {
      return staticResponse(request, LLMS_TXT, 'text/markdown; charset=utf-8');
    }

    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname === '/sitemap.xml') {
      return staticResponse(request, SITEMAP_XML, 'application/xml; charset=utf-8');
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

    if (request.method === 'POST' && url.pathname === '/api/account/wallet/create-checkout') {
      return createWalletCheckout(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/account/wallet/verify-checkout') {
      return verifyWalletCheckout(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/sucha-journal/redeem-coupon') {
      return redeemCoupon(request, env, JOURNAL_PRODUCT);
    }

    if (request.method === 'POST' && url.pathname === '/api/ta-lab/redeem-coupon') {
      return redeemCoupon(request, env, TA_LAB_PRODUCT);
    }

    if (request.method === 'POST' && url.pathname === '/api/empathy-lab/redeem-coupon') {
      return redeemCoupon(request, env, EMPATHY_LAB_PRODUCT);
    }

    if (request.method === 'POST' && url.pathname === '/api/sucha-journal/free-day-request') {
      return createFreeAccessRequest(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/analytics/track') {
      return trackAnalytics(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/feedback') {
      return createFeedback(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/ask-sucha/question') {
      return createAskSuchaQuestion(request, env);
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

    if (request.method === 'POST' && url.pathname === '/api/admin/coupons/create') {
      return adminCreateCoupon(request, env);
    }

    const cleanPageMap = {
      '/admin': '/admin.html',
      '/account': '/account.html',
      '/legal-disclaimer': '/legal-disclaimer.html',
      '/tests': '/tests.html',
      '/empathy-test': '/empathy-test.html',
      '/empathy-lab': '/empathy-lab.html',
      '/eq-lab': '/eq-lab.html',
      '/journal': '/journal.html',
      '/transactional-analysis': '/transactional-analysis.html',
      '/therapist-matching': '/therapist-matching.html',
      '/premium-reports': '/premium-reports.html',
    };
    const staticPath = cleanPageMap[url.pathname] || (url.pathname === '/' ? '/index.html' : url.pathname);
    const rawUrl = `https://raw.githubusercontent.com/verilogical-admin/suchawellness.github.io/main${staticPath}?v=${STATIC_ASSET_VERSION}`;
    const response = await fetch(rawUrl, {
      headers: { 'User-Agent': 'suchawellness-edge-worker' },
    });
    const headers = new Headers(response.headers);

    Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
      headers.set(name, value);
    });
    headers.set('Content-Type', staticContentType(staticPath));

    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
