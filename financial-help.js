'use strict';
const $ = selector => document.querySelector(selector);
const money = amount => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:0,maximumFractionDigits:2}).format(amount);
let campaign = null;
let paymentAvailable = false;
let busy = false;
let checkoutAmount = 500;
let pendingProof = null;
let sdkPromise;
const contributions = new Map();
async function api(action, body) {
  const response = await fetch('/api/financial-help/'+action, {method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',signal:AbortSignal.timeout(20000)});
  const data = await response.json().catch(()=>null);
  if (!response.ok || !data) throw new Error(data?.error || 'Financial Help is temporarily unavailable. Please try again shortly.');
  return data;
}
function status(message, error=false) { $('#razorpay-status').textContent=message; $('#razorpay-status').classList.toggle('error',error); }
function setBusy(value) { busy=value; $('#razorpay-pay').disabled=value || Boolean(pendingProof); $('#verify-again').disabled=value; updateAmount(); }
function updateAmount() {
  const amount=Number($('#amount').value);
  const valid=Number.isInteger(amount)&&amount>=10&&amount<=100000;
  $('#amount-error').textContent=valid?'':'Enter a whole-rupee amount from ₹10 to ₹1,00,000.';
  $('#amount').setAttribute('aria-invalid',String(!valid));
  $('#contribute').disabled=!valid||!paymentAvailable||busy;
  $('#contribute').firstChild.textContent=valid?'Contribute '+money(amount)+' ':'Choose an amount ';
  $('#recipient-amount').textContent=valid?money(amount*.9):'—';$('#fee-amount').textContent=valid?money(amount*.1):'—';
  document.querySelectorAll('[data-amount]').forEach(button=>{const selected=Number(button.dataset.amount)===amount;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected))});
  return valid;
}
function renderLedger() {
  const rows=[...contributions.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  $('#ledger-body').replaceChildren();
  for (const item of rows) {
    const row=document.createElement('tr');
    const donor=document.createElement('td');donor.textContent=item.displayName;
    const ref=document.createElement('small');ref.textContent=item.id.slice(0,8)+' · '+new Date(item.createdAt).toLocaleDateString('en-IN');donor.append(ref);row.append(donor);
    for (const amount of [item.amountMinor,item.recipientMinor]) { const cell=document.createElement('td');cell.textContent=money(amount/100);row.append(cell); }
    const delivery=document.createElement('td');const badge=document.createElement('span');badge.className='status pending';badge.textContent=campaign.mode==='test'?'Test · no transfer':'Awaiting transfer';delivery.append(badge);row.append(delivery);$('#ledger-body').append(row);
  }
  const total=rows.reduce((sum,item)=>sum+item.amountMinor,0);
  const fees=rows.reduce((sum,item)=>sum+item.feeMinor,0);
  $('#raised').textContent=money(total/100);$('#total-collected').textContent=money(total/100);$('#total-fees').textContent=money(fees/100);$('#pending').textContent=money((total-fees)/100);$('#supporters').textContent=rows.length+' contributions';
  const percentage=Math.round(total/(campaign.targetAmount*100)*100);$('#percentage').textContent=percentage+'% of the way';$('#progress-fill').style.width=Math.min(100,percentage)+'%';$('.progress').setAttribute('aria-valuenow',String(Math.min(100,percentage)));
  $('#ledger-status').textContent=rows.length?'Verified contributions. Recent payments may take a moment to appear.':'No contributions yet. Be part of the first step.';
}
async function refreshLedger() {
  $('#refresh-payments').disabled=true;
  try {
    let cursor=null;
    // Fetch all pages before publishing totals; partial data is never a full total.
    const next=new Map();
    do { const page=await api('contributions'+(cursor?'?cursor='+encodeURIComponent(cursor):''));for(const item of page.contributions)next.set(item.id,item);cursor=page.cursor; } while(cursor);
    for(const [id,item] of next)contributions.set(id,item);
    renderLedger();
  } catch(error) { $('#ledger-status').textContent=error.message; }
  finally { $('#refresh-payments').disabled=false; }
}
function loadRazorpay() {
  if(window.Razorpay)return Promise.resolve();
  if(sdkPromise)return sdkPromise;
  sdkPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.async=true;
    const timer=setTimeout(()=>{script.remove();sdkPromise=null;reject(new Error('Razorpay took too long to load. Please retry.'))},15000);
    script.onload=()=>{clearTimeout(timer);if(window.Razorpay)resolve();else {sdkPromise=null;reject(new Error('Razorpay did not load. Please retry.'))}};
    script.onerror=()=>{clearTimeout(timer);script.remove();sdkPromise=null;reject(new Error('Could not load Razorpay. Check your connection and retry.'))};document.head.append(script);
  });
  return sdkPromise;
}
async function verifyPayment() {
  if(!pendingProof)return;
  setBusy(true);status('Confirming your payment with Razorpay…');
  try {
    const data=await api('verify-checkout',pendingProof);
    contributions.set(data.contribution.id,data.contribution);pendingProof=null;$('#verify-again').hidden=true;renderLedger();$('#checkout').close();
    $('#toast').textContent=campaign.mode==='test'?'Test payment verified. No real money was transferred.':'Thank you. Your contribution is verified and awaiting transfer to the recipient.';$('#toast').hidden=false;
    $('#transparency').scrollIntoView({behavior:'smooth'});
  } catch(error) {
    if(!$('#checkout').open)$('#checkout').showModal();
    status(error.message+' Use “Check payment status again” before making another payment.',true);$('#verify-again').hidden=false;
  } finally {setBusy(false)}
}
$('#checkout-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy||pendingProof||!paymentAvailable)return;
  setBusy(true);status('Opening secure Razorpay checkout…');
  try {
    await loadRazorpay();
    const order=await api('create-checkout',{campaignId:campaign.id,amount:checkoutAmount,anonymous:$('#anonymous').checked,displayName:$('#anonymous').checked?'':$('#donor-name').value.trim()});
    if(order.mode!==campaign.mode||!order.keyId.startsWith('rzp_'+campaign.mode+'_')||order.amount!==checkoutAmount*100||order.currency!=='INR')throw new Error('Checkout settings changed. Reload before continuing.');
    let submitted=false;
    const checkout=new window.Razorpay({key:order.keyId,order_id:order.orderId,amount:order.amount,currency:order.currency,name:'Sucha Wellness',description:'Financial Help contribution',theme:{color:'#254e40'},handler:async proof=>{submitted=true;pendingProof=proof;await verifyPayment()},modal:{ondismiss:()=>{if(!submitted){setBusy(false);if(!$('#checkout').open)$('#checkout').showModal();status('Checkout closed. No contribution has been confirmed.')}}}});
    checkout.on('payment.failed',()=>{status('Payment failed. You can retry in Razorpay or close the payment window.',true)});
    // Native modal dialogs otherwise sit above Razorpay’s iframe.
    $('#checkout').close();checkout.open();
  } catch(error) {setBusy(false);if(!$('#checkout').open)$('#checkout').showModal();status(error.message,true)}
});
$('#contribute').addEventListener('click',()=>{if(!updateAmount())return;checkoutAmount=Number($('#amount').value);$('#checkout-total').replaceChildren(document.createTextNode(money(checkoutAmount)));const detail=document.createElement('small');detail.textContent=money(checkoutAmount*.9)+' to the recipient · '+money(checkoutAmount*.1)+' for operations';$('#checkout-total').append(detail);if(!pendingProof)status('');$('#checkout').showModal()});
$('#verify-again').addEventListener('click',verifyPayment);
$('#refresh-payments').addEventListener('click',refreshLedger);
$('#anonymous').addEventListener('change',()=>{$('#donor-name').disabled=$('#anonymous').checked});$('#donor-name').disabled=true;
$('#amount').addEventListener('input',updateAmount);
document.querySelectorAll('[data-amount]').forEach(button=>button.addEventListener('click',()=>{$('#amount').value=button.dataset.amount;updateAmount()}));
$('#request-help').addEventListener('click',()=>$('#request-dialog').showModal());
document.querySelectorAll('dialog .close').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
async function initialize() {
  try {
    const config=await api('config');campaign=config.campaign;paymentAvailable=config.available;
    if(!campaign)return;
    $('#campaign-empty').hidden=true;$('#active-campaign').hidden=false;
    $('#campaign-title').textContent=campaign.title;$('#recipient-name').textContent=campaign.recipientName;$('#recipient-caption').textContent=campaign.recipientName;$('#campaign-story').textContent=campaign.story;$('#story-link').href=campaign.storyUrl;$('#campaign-location').textContent=campaign.location;$('#target').textContent='raised of '+money(campaign.targetAmount);$('#campaign-mode').textContent=campaign.mode==='test'?'Razorpay test mode':'Financial help';
    $('#checkout-note').textContent=!paymentAvailable?'Contributions are not open yet.':campaign.mode==='test'?'Test mode. No real money is collected.':'Secure UPI and card payments through Razorpay.';
    $('#checkout-mode-note').textContent=campaign.mode==='test'?'Test payments only. No real funds are collected.':'90% supports the recipient. 10% sustains operations.';
    await refreshLedger();
  } catch { $('#availability-message').textContent='Fundraisers are not available right now. Contact our team to discuss a need or check back shortly.'; }
  finally {updateAmount()}
}
void initialize();
