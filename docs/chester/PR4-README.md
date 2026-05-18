# PR 4 — Stripe Checkout wiring (Chester funnel)

Wires the £9.99 Family Practice Pass into Stripe Checkout. One-time
payment, no subscription, no entitlement logic, no mobile changes.

## Summary

After the user creates their account on `/chester/start`, the "Securing
checkout…" state now calls a Supabase Edge Function that:

1. Inserts a `practice_pass_purchases` row (`status=pending`,
   `source=chester_waitlist_v1`, `amount=999`, `currency=gbp`).
2. Creates a Stripe Checkout Session (mode `payment`, inline `price_data`).
3. Stamps the resulting `stripe_checkout_session_id` onto the row.
4. Returns the Stripe Checkout URL; the browser redirects.

On `checkout.session.completed` the webhook flips the row to
`status=paid`, sets `paid_at = now()`, and records `stripe_customer_id`.
Idempotent: only rows still `pending` are updated.

## Files

- `supabase/functions/chester-create-checkout-session/index.ts`
- `supabase/functions/chester-stripe-webhook/index.ts`
- `supabase/config.toml`
- `src/pages/ChesterStartPlaceholder.tsx`  *(post-signup hook + cancel card)*
- `src/pages/ChesterSuccessPage.tsx`        *(new — `/chester/success`)*
- `src/App.tsx`                              *(route registration)*
- `docs/chester/PR4-README.md`

## Required environment variables (Supabase project secrets)

Set these on the Supabase project (Edge Functions → Secrets). They are
**server-only** — nothing Stripe-related is added to the frontend bundle.

| Name                      | Where      | Required | Notes                                                            |
| ------------------------- | ---------- | -------- | ---------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`       | Supabase   | yes      | `sk_test_…` for staging, `sk_live_…` for production.             |
| `STRIPE_WEBHOOK_SECRET`   | Supabase   | yes      | `whsec_…` shown when you create the webhook endpoint in Stripe.  |
| `CHESTER_PUBLIC_SITE_URL` | Supabase   | optional | Defaults to `https://cruzi.co.uk`. Override for previews.        |
| `SUPABASE_URL`            | Supabase   | auto     | Injected by the platform.                                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | auto     | Injected by the platform.                                        |

## Deployment

```
# Functions
supabase functions deploy chester-create-checkout-session
supabase functions deploy chester-stripe-webhook --no-verify-jwt

# Secrets (replace placeholders)
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set CHESTER_PUBLIC_SITE_URL=https://<preview>.vercel.app
```

> The Vercel preview URL is per-PR. Set
> `CHESTER_PUBLIC_SITE_URL` to the preview alias if you want
> success/cancel redirects to land back on the PR preview rather than
> production.

## Stripe webhook setup

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**.
2. Endpoint URL: `https://<project-ref>.supabase.co/functions/v1/chester-stripe-webhook`
3. Events to send:
   - `checkout.session.completed`
   - `checkout.session.expired`   *(logged only in v1)*
   - `payment_intent.payment_failed`   *(logged only in v1)*
4. Copy the **Signing secret** (`whsec_…`) and set it as `STRIPE_WEBHOOK_SECRET` above.

## Test-mode walk-through (staging)

1. Stripe → **Test mode** on; use `sk_test_…`.
2. Visit `/chester` on the preview, submit the waitlist form.
3. Tap *Start Family Practice* on the submitted card.
4. Fill the create-account form. Submit.
5. The "Securing checkout…" spinner appears, then the browser redirects
   to Stripe Checkout.
6. Pay with the test card `4242 4242 4242 4242`, any future date, any
   CVC, any postcode.
7. You land on `/chester/success` — *"You're in."*
8. Check Supabase: the matching row in `practice_pass_purchases` is now
   `status='paid'`, `paid_at` set, `stripe_customer_id` populated.

To test the cancel path: click **back** in the Stripe page. You land on
`/chester/start?canceled=1` with the calm "No problem." card and a
*Continue to secure checkout* button that re-invokes the function.

To test webhook signature verification locally:

```
stripe listen --forward-to https://<project-ref>.supabase.co/functions/v1/chester-stripe-webhook
# Copy the whsec_… it prints → set as STRIPE_WEBHOOK_SECRET.
stripe trigger checkout.session.completed
```

The webhook returns 400 `invalid_signature` for any request without a
valid Stripe signature header — verify by hitting the endpoint with curl.

## Success / cancel URLs

- Success: `{CHESTER_PUBLIC_SITE_URL}/chester/success?cs={CHECKOUT_SESSION_ID}`
- Cancel:  `{CHESTER_PUBLIC_SITE_URL}/chester/start?canceled=1`

The `cs` query param on success is purely informational (we already know
the outcome from the webhook); the page never queries Stripe from the
browser.

## Confirmation: no mobile changes

- No edits to `cruzi-mobile` (separate repo) — this PR is `cruzi-web` only.
- The mobile app does not read `practice_pass_purchases` and v1
  introduces no premium gating on either platform. Mobile signup remains
  free.
- The £9.99 charge is a web conversion-validation test only.

## Out of scope

- Entitlement logic (gating any feature on `status='paid'`).
- Subscription, billing portal, or refund flows.
- App-store in-app-purchase wiring.
- Redesign of `/chester`, the submitted page, or the create-account form.

## Migrations

This PR introduces **no migration**. The `practice_pass_purchases` table
was already created in PR 1 and is staged for production behind separate
approval.
