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
- `RAZORPAY_SUCHA_JOURNAL_PLAN_ID` for a real 30-day subscription trial, recommended
- `SUCHA_JOURNAL_CURRENCY` and `SUCHA_JOURNAL_AMOUNT_MINOR` only if using the fallback order flow

The subscription plan should represent the Sucha Journal price of `$5/month`. If the plan
ID is missing, the Worker falls back to a standard Razorpay order endpoint and grants a
30-day local trial after signature verification.
