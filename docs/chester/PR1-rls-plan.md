# Chester funnel — RLS plan (PR 1 → PR 4)

## Principle
v1 is a conversion-validation test. All writes/reads against
`learner_waitlist` and `practice_pass_purchases` happen through
server-side code using the **Supabase service role key** (Next.js / Vite
route handlers / API routes / edge functions in later PRs). Anon and
authenticated keys must have **no** direct access to either table.

## PR 1 (this PR) — schema only
- `public.learner_waitlist`: RLS **enabled**, **zero policies**.
- `public.practice_pass_purchases`: RLS **enabled**, **zero policies**.
- Effect: anon and authenticated cannot select/insert/update/delete.
  Service role bypasses RLS, so server code in later PRs can read/write.
- `public.profiles`: **untouched** in this PR — no schema or RLS changes.

## PR 2 (waitlist capture page) — no policy changes
- Server route inserts into `learner_waitlist` via service role.
- Server route fetches a single row by `signup_token` via service role
  to render the prefill page.
- Anon key never touches `learner_waitlist`.

## PR 3 (signup with prefill) — no policy changes
- Account creation uses the standard public `supabase.auth.signUp` flow
  (identical shape to solo mobile signup).
- After signup, server updates `learner_waitlist.converted_user_id` via
  service role.

## PR 4 (Stripe Checkout + webhook) — no policy changes
- Server creates Checkout Session and inserts a
  `practice_pass_purchases` row with `status = 'pending'` and
  `stripe_checkout_session_id` populated, via service role.
- Webhook verifies Stripe signature, then matches on
  `stripe_checkout_session_id` and transitions:
    - `checkout.session.completed` → `status = 'paid'`, `paid_at = now()`,
      backfill `user_id`, `stripe_customer_id`.
    - failure events → `status = 'failed'`.
    - `charge.refunded` → `status = 'refunded'` (future-proofing; logic
      can be added when needed).
- Idempotent: re-running on an already-`paid` row is a no-op.

## Things we are deliberately NOT doing in v1
- No anon insert policy. The waitlist form posts to our own server
  route; the table is not exposed via PostgREST to clients.
- No learner-facing read policy on `practice_pass_purchases`. Mobile must
  not branch on payment status in v1.
- No `entitlements` table, no plan/tier enum, no premium gating.

## If/when we move beyond v1 (out of scope for PR 1)
- Introduce an `entitlements` table with explicit per-user select RLS,
  derived from `practice_pass_purchases` (and any future products).
- Re-evaluate whether learners need self-serve receipts (would mean a
  scoped read policy on `practice_pass_purchases` filtered by
  `auth.uid() = user_id`).
