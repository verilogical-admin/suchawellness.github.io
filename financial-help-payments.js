// Razorpay collection and public ledger. Recipient payouts are a separate operation.
const encoder = new TextEncoder();
const reply = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail = (message, status = 400) => { throw Object.assign(new Error(message), {status}); };
const prefix = env => 'financial-help:'+env.campaign.mode+':'+env.campaign.id+':';
const orderKey = (env,id) => prefix(env) + 'order:' + id;
const paymentKey = (env,id) => prefix(env) + 'payment:' + id;
const storage = env => env.FEEDBACK_KV;
async function campaignConfig(env) {
  const saved = await storage(env)?.get('financial-help:campaign', {type:'json'});
  if (!saved || saved.published !== true) return null;
  if (!/^[a-z0-9-]{1,60}$/.test(saved.id || '') || !['live','test'].includes(saved.mode)) return null;
  if (!saved.recipientName || !saved.title || !saved.story || !Number.isInteger(saved.targetAmount) || saved.targetAmount <= 0) return null;
  let storyUrl;
  try { storyUrl = new URL(saved.storyUrl); if (storyUrl.protocol !== 'https:') return null; } catch { return null; }
  return {id:saved.id, mode:saved.mode, recipientName:String(saved.recipientName).slice(0,100), title:String(saved.title).slice(0,200), story:String(saved.story).slice(0,5000), storyUrl:storyUrl.href, targetAmount:saved.targetAmount, location:String(saved.location || '').slice(0,100), paymentsEnabled:saved.paymentsEnabled === true && saved.beneficiaryConfirmed === true};
}
function configured(env) {
  const mode = env.campaign?.mode;
  return Boolean(storage(env) && env.campaign?.paymentsEnabled && mode && env.FINANCIAL_HELP_RAZORPAY_KEY_ID?.startsWith('rzp_'+mode+'_') && env.FINANCIAL_HELP_RAZORPAY_KEY_SECRET);
}
async function boundedText(request) {
  if (Number(request.headers.get('Content-Length')) > 65536) fail('Request too large.', 413);
  const reader = request.body?.getReader();
  if (!reader) return '';
  let length = 0;
  const chunks = [];
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 65536) { await reader.cancel(); fail('Request too large.', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(bytes);
}
function parse(raw) {
  try { const data = JSON.parse(raw); if (!data || typeof data !== 'object' || Array.isArray(data)) fail('Invalid request.'); return data; }
  catch { fail('Invalid JSON request.'); }
}
async function validSignature(message, signature, secret) {
  if (!/^[a-f0-9]{64}$/i.test(signature || '') || !secret) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['verify']);
  const bytes = Uint8Array.from(signature.match(/../g), value => parseInt(value,16));
  return crypto.subtle.verify('HMAC', key, bytes, encoder.encode(message));
}
async function provider(env, path, body) {
  const response = await fetch('https://api.razorpay.com/v1/' + path, {
    method: body ? 'POST' : 'GET',
    headers: {Authorization:'Basic '+btoa(env.FINANCIAL_HELP_RAZORPAY_KEY_ID+':'+env.FINANCIAL_HELP_RAZORPAY_KEY_SECRET),'Content-Type':'application/json'},
    ...(body ? {body:JSON.stringify(body)} : {}), signal:AbortSignal.timeout(12000),
  });
  if (!response.ok) fail('Razorpay is unavailable. Please try again shortly.', 502);
  return response.json();
}
async function createOrder(request, env, body) {
  if (body.campaignId !== env.campaign.id) fail('This campaign is unavailable.',404);
  if (!Number.isInteger(body.amount) || body.amount < 10 || body.amount > 100000) fail('Choose a whole-rupee amount from ₹10 to ₹1,00,000.');
  if (typeof body.anonymous !== 'boolean') fail('Choose a display-name preference.');
  if (body.displayName !== undefined && (typeof body.displayName !== 'string' || body.displayName.length > 50)) fail('Display names must be at most 50 characters.');
  // Optional edge binding can enforce a strict traffic limit without storing IPs.
  if (env.FINANCIAL_HELP_RATE_LIMITER) {
    const result = await env.FINANCIAL_HELP_RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP') || 'local'});
    if (!result.success) fail('Too many checkout attempts. Please try again later.',429);
  }
  const amount = body.amount * 100;
  const publicId = crypto.randomUUID();
  const order = await provider(env, 'orders', {amount,currency:'INR',receipt:'fh_'+publicId.replaceAll('-',''),partial_payment:false,notes:{product:'financial_help',campaign_id:env.campaign.id}});
  if (!/^order_[A-Za-z0-9]+$/.test(order.id || '') || order.amount !== amount || order.currency !== 'INR') fail('Unexpected payment order. Please try again.',502);
  const record = {orderId:order.id,publicId,campaignId:env.campaign.id,amountMinor:amount,currency:'INR',displayName:body.anonymous?'Anonymous':(body.displayName?.trim() || 'Anonymous'),createdAt:new Date().toISOString()};
  await storage(env).put(orderKey(env,order.id),JSON.stringify(record));
  return reply({keyId:env.FINANCIAL_HELP_RAZORPAY_KEY_ID,orderId:order.id,amount,currency:'INR',mode:env.campaign.mode});
}
async function recordCaptured(env, order, paymentId) {
  // Never trust a checkout callback/webhook alone: confirm captured amount/order.
  const payment = await provider(env, 'payments/'+paymentId);
  if (payment.id !== paymentId || payment.order_id !== order.orderId || payment.amount !== order.amountMinor || payment.currency !== 'INR') fail('Payment does not match this contribution.',403);
  if (payment.status !== 'captured' || payment.captured !== true || Number(payment.amount_refunded || 0) > 0) fail('Payment is not captured yet. Check again before trying another payment.',409);
  const existing = await storage(env).get(paymentKey(env,paymentId),{type:'json'});
  if (existing) return existing;
  const feeMinor = Math.round(order.amountMinor / 10);
  const record = {id:order.publicId,displayName:order.displayName,amountMinor:order.amountMinor,feeMinor,recipientMinor:order.amountMinor-feeMinor,currency:'INR',mode:env.campaign.mode,deliveryStatus:'not_transferred',createdAt:order.createdAt};
  // One immutable key per payment makes callback/webhook retries idempotent.
  // No read-modify-write aggregate balance, and no private provider IDs in output.
  await storage(env).put(paymentKey(env,paymentId),JSON.stringify(record));
  return record;
}
async function verifyPayment(env, body) {
  if (!/^order_[A-Za-z0-9]+$/.test(body.razorpay_order_id || '') || !/^pay_[A-Za-z0-9]+$/.test(body.razorpay_payment_id || '')) fail('Invalid payment reference.');
  const order = await storage(env).get(orderKey(env,body.razorpay_order_id),{type:'json'});
  if (!order || order.campaignId !== env.campaign.id) fail('Contribution order not found.',404);
  if (!await validSignature(order.orderId+'|'+body.razorpay_payment_id,body.razorpay_signature,env.FINANCIAL_HELP_RAZORPAY_KEY_SECRET)) fail('Invalid payment signature.',403);
  return reply({ok:true,contribution:await recordCaptured(env,order,body.razorpay_payment_id)});
}
async function webhook(request, env, raw) {
  if (!env.FINANCIAL_HELP_RAZORPAY_WEBHOOK_SECRET) fail('Webhook is not configured.',503);
  if (!await validSignature(raw,request.headers.get('X-Razorpay-Signature'),env.FINANCIAL_HELP_RAZORPAY_WEBHOOK_SECRET)) fail('Invalid webhook signature.',403);
  const event = parse(raw);
  if (event.event !== 'payment.captured') return reply({ok:true,ignored:true});
  const payment = event.payload?.payment?.entity;
  if (!/^order_[A-Za-z0-9]+$/.test(payment?.order_id || '') || !/^pay_[A-Za-z0-9]+$/.test(payment?.id || '')) fail('Invalid payment reference.');
  const order = await storage(env).get(orderKey(env,payment.order_id),{type:'json'});
  // A brief propagation delay in KV should cause a webhook retry, not lose it.
  if (!order) fail('Contribution order is not available yet.',503);
  await recordCaptured(env,order,payment.id);
  return reply({ok:true});
}
export async function handleFinancialHelpPayments(request, env) {
  try {
    const campaign = await campaignConfig(env);
    env = {...env,campaign,FINANCIAL_HELP_RAZORPAY_KEY_ID:env.FINANCIAL_HELP_RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID,FINANCIAL_HELP_RAZORPAY_KEY_SECRET:env.FINANCIAL_HELP_RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET};
    const url = new URL(request.url);
    const action = url.pathname.slice('/api/financial-help/'.length);
    if (request.method === 'GET' && action === 'config') return reply({available:configured(env),campaign});
    if (!campaign) fail('No fundraiser is accepting contributions yet.',503);
    if (request.method !== 'GET' && !configured(env)) fail('Contributions are not open for this fundraiser yet.',503);
    if (request.method === 'GET' && action === 'contributions') {
      const cursor = url.searchParams.get('cursor') || undefined;
      if (cursor && cursor.length > 2048) fail('Invalid page cursor.');
      const page = await storage(env).list({prefix:prefix(env)+'payment:',limit:100,...(cursor?{cursor}:{})});
      const contributions = (await Promise.all(page.keys.map(key=>storage(env).get(key.name,{type:'json'})))).filter(Boolean);
      return reply({mode:env.campaign.mode,contributions,cursor:page.list_complete?null:page.cursor});
    }
    if (request.method !== 'POST' || !['create-checkout','verify-checkout','webhook'].includes(action)) return reply({error:'Not found.'},404);
    if (action !== 'webhook' && request.headers.get('Origin') !== url.origin) fail('Use checkout from this site.',403);
    const raw = await boundedText(request);
    if (action === 'webhook') return await webhook(request,env,raw);
    const body = parse(raw);
    return action === 'create-checkout' ? await createOrder(request,env,body) : await verifyPayment(env,body);
  } catch (error) {
    return reply({error:error.status?error.message:'Payment service unavailable. Please retry shortly.'},error.status || 503);
  }
}
