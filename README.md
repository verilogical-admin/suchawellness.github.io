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

## Sucha email verification

Tests and journal usage are gated by a single Sucha-branded email verification flow. The
same verified email can also be used for updates/notifications when the checked-by-default
subscribe option is left enabled. The Worker stores verified email, consent state, country,
region/city, date, and tool usage metadata in KV; it does not store screening answers or
journal content.

Set these Worker secrets/vars before enabling live verification email:

- `RESEND_API_KEY`
- `SUCHA_EMAIL_FROM` such as `support@suchawellness.com` after the sender/domain is verified
- `SUCHA_EMAIL_REPLY_TO` such as `support@suchawellness.com`
- `SUCHA_VERIFICATION_SECRET` for signing verification tokens

## HIPAA-ready care platform foundation

The public care seeker/provider forms no longer send private intake details by email.
Before storage, the browser encrypts the submitted form payload with AES-GCM and keeps
the decryption key in that browser only. The Worker stores ciphertext plus operational
metadata such as request id, request type, status, timestamp, and Cloudflare-provided
coarse location.

Current endpoints:

- `POST /api/care/requests` stores an encrypted care request for a verified visitor.
- `GET /api/care/requests/mine` returns the verified visitor's encrypted requests.
- `GET /api/admin/summary` includes care request metadata for admin monitoring, but not
  decrypted care details.

The `/account.html` page is separate from the public site and shows submitted requests,
settings, billing/wallet placeholders, and security notes. Request contents decrypt only
on browsers that still have the local request key.

Do not put PHI into email, analytics, logs, URLs, Razorpay notes, or support tickets.
Razorpay wallet/payment support should use non-PHI metadata only. A public HIPAA
compliance claim should wait until vendor BAAs, access policies, audit procedures,
incident response, retention/deletion workflows, and legal/security review are complete.
