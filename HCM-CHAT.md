# HeyChandMama homepage companion

Free, anonymous AI chat with the existing HeyChandMama mascot. The independent
`sucha-hcm-chat` Worker owns only `/api/hcm/chat` on the two SuchaWellness hosts;
it does not replace the main site/payment/license Worker.

Deploy backend: `wrangler deploy --config hcm-chat.wrangler.jsonc`.
Static homepage/assets follow this repository's existing GitHub origin deployment.
Test: `node --test hcm-chat.test.mjs`.

## Data and operation

- Messages stay in page memory, never localStorage, cookies or Sucha KV.
- Sending requires an unchecked-by-default disclosure of Cloudflare Workers AI processing.
- Recent messages are sent for input safety classification, reply generation and output review.
- No transcript logging, analytics or Worker observability is enabled for the chat service.
- A maximum of 11 recent messages is sent per turn; each message is capped at 1,600 characters.
- Anonymous network traffic protection allows 12 requests/minute per IP per Cloudflare location.
  It is an abuse control, not a subscription limit; shared networks can share the cooldown.
- Explicit danger bypasses AI and rate limiting. Human-help content is static and always available.
- Semantic input screening handles indirect danger; malformed/failed checks fail closed.
- The UI pauses chat on a human-help route, cancels pending requests and prevents stale replies.
- Clear conversation resets page memory. Refresh also clears it. It cannot retract data already processed.

## Limits and review

This is AI wellbeing support, not therapy or an emergency service, and it cannot
contact anyone. Safety heuristics and model checks are not clinical validation and
can miss danger or flag benign discussion. Model checks share one model and are not
independent clinical judgments. Have a qualified clinician review the crisis wording
and representative conversations, including multilingual, indirect, youth and
third-person disclosures. Maintain the listed crisis resources and review them periodically.

Verified resources on 2026-09-20: Tele-MANAS tool lookup, https://112.gov.in/,
https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide.

Do not promote this as a suicide-prevention treatment or claim measured effectiveness.
The student book remains explicitly marked as planned.
