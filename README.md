# suchawellness.github.io

Static site for Sucha Wellness.

## Security headers

The site includes:

- `_headers` for Cloudflare Pages/Netlify-style static hosting.
- `_redirects` for same-host HTTP-to-HTTPS redirects before canonical host redirects.
- `cloudflare-worker.js` for the current GitHub Pages behind Cloudflare DNS setup.

GitHub Pages does not support custom response headers from repository files. If this site
continues to be served by GitHub Pages, deploy `cloudflare-worker.js` on both routes:

- `suchawellness.com/*`
- `www.suchawellness.com/*`

The Worker applies CSP, HSTS, Referrer-Policy, X-Content-Type-Options, X-Frame-Options,
Cross-Origin-Resource-Policy, and the same-host HTTPS redirect needed for HSTS scanners.

## Sucha Journal premium

The premium journal UI uses Razorpay Checkout and encrypts journal entries in the browser
before saving them to local storage. Deploy `cloudflare-worker.js` with these Worker
environment variables/secrets:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_SUCHA_JOURNAL_PLAN_ID` for the recurring `$5/month` Journal subscription, recommended
- `SUCHA_JOURNAL_CURRENCY` and `SUCHA_JOURNAL_AMOUNT_MINOR` only if using the fallback order flow
- `SUCHA_ADMIN_TOKEN` for `/admin.html` dashboard API access
- `SUCHA_ADMIN_KV` bound to a Cloudflare KV namespace for coupons and analytics

The subscription plan should represent the Sucha Journal price of `$5/month`. If the plan
ID is missing, the Worker falls back to a standard Razorpay order endpoint. The UI presents
a 30-day money-back guarantee and directs cancellation/refund/support questions to
`support@suchawellness.com`.

The Worker also supports five one-time premium coupons. Coupon status is stored in KV,
so coupons can be redeemed once and revoked anytime from `/admin.html`. The admin page
also shows coarse usage analytics: page views, screening tool usage, journal events, and
Cloudflare-provided country/region summaries. Journal text and screening answers are not
sent to analytics.
