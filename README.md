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
