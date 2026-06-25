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

The premium journal UI uses the existing Verilogical payment Worker, currently called from
`https://praivasipdf-api.verilogical.com` with `https://payment-worker.verilogical.com` as
a fallback custom domain. That Worker owns Razorpay Checkout, payment verification, Sucha
one-time coupons, coarse aggregate analytics, and the admin API.

The payment Worker uses its existing Razorpay settings and `ADMIN_TOKEN`. Sucha coupon and
analytics data is stored under `sucha:*` keys in the payment Worker KV store, using
`SUCHA_ADMIN_KV` if it is bound or falling back to `FEEDBACK_KV`.

The journal remains free without a password. Premium offers an optional password-protected
encrypted local vault at `$5/month` with a 30-day money-back guarantee, and directs
cancellation/refund/support questions to `support@suchawellness.com`.

The admin page is available at `/admin` or `/admin.html`. It supports five one-time premium
coupons, coupon revocation, and coarse usage analytics: page views, screening tool usage,
journal events, and Cloudflare-provided country/region summaries. Journal text and
screening answers are not sent to analytics.
