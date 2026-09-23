# Financial Help

Public page: `/financial-help.html` (also `/financial-help`). No sample campaigns or fabricated payment history are published. When no campaign is configured, the page accepts enquiries through the existing Sucha support address and checkout stays closed.

## Razorpay

The Financial Help API uses the site's existing `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` Worker secrets. Dedicated `FINANCIAL_HELP_RAZORPAY_KEY_ID` / `FINANCIAL_HELP_RAZORPAY_KEY_SECRET` secrets may override them as a pair. Secrets never enter page source. Campaign mode must match the key prefix (`live` or `test`).

Routes:

- `GET /api/financial-help/config`: public campaign and checkout availability.
- `POST /api/financial-help/create-checkout`: creates a server-priced INR Razorpay order.
- `POST /api/financial-help/verify-checkout`: verifies HMAC and independently fetches payment status, order, currency, amount, and refund state.
- `GET /api/financial-help/contributions`: public paginated ledger, excluding provider IDs and contact details.
- `POST /api/financial-help/webhook`: signed `payment.captured` recovery when the browser closes. Set `FINANCIAL_HELP_RAZORPAY_WEBHOOK_SECRET` and register this endpoint in Razorpay before opening live collection.

Configure automatic capture in the Razorpay account. Browser confirmation alone never records a contribution. Each captured payment has one KV record, so retries cannot increment an aggregate balance twice. KV propagation can delay public listing; the donor sees the verified response immediately. Platform operations are 10% and the recipient allocation is 90%, calculated in integer paise. This records allocations, not automatic split settlement or disbursement.

## Open the first real campaign

An operator must obtain the recipient-approved story, public name, target and confirmed beneficiary arrangement. Save a JSON object in `FEEDBACK_KV` at `financial-help:campaign` with these fields:

- `id`: stable lowercase letters, digits, hyphens, maximum 60 characters.
- `mode`: `live` or `test`.
- `published`: true to show the campaign.
- `recipientName`, `title`, `story`, `location`: approved public content.
- `storyUrl`: HTTPS article/video URL.
- `targetAmount`: positive whole rupees, gross contributions including the 10% operations allocation.
- `beneficiaryConfirmed`: true only after confirming the beneficiary and payout arrangement.
- `paymentsEnabled`: true only when the merchant setup, webhook, recipient details, fee disclosure and support/refund process are ready.

No real campaign has been supplied or enabled as part of this release. No NGO registration claim is published without the actual registered entity. Do not save bank details, identity documents, or medical records in this public configuration.

## Current limits

This release supports one active campaign. Before replacing its configuration, close and reconcile its outstanding payments; callbacks and webhook lookups use the active campaign namespace. The ledger presently records collection and awaiting-transfer status. Recipient disbursement, delivery evidence, refunds/disputes and campaign administration are not automated; implement those operations before accepting live contributions. `FINANCIAL_HELP_RATE_LIMITER` is an optional Cloudflare rate-limiter binding; configure it before opening public checkout at scale.

## Checks

`node --test financial-help-payments.test.mjs` covers missing campaign, mode matching, unconfirmed recipient, invalid input/origin, anonymity, signature verification, amount/currency/order tampering, capture status, refunds, idempotent callbacks/webhooks, body limits and upstream failures. No test sends a real payment.
