# PR 1 — Chester funnel schema (schema only, revised)

## Summary
Adds the database shape required by the Chester learner funnel (waitlist
capture → optional £9.99 Practice Pass → standard Supabase student
account → Stripe Checkout → app login). **Schema only.** No UI, no
routes, no Stripe code, no edge functions, no mobile changes.

## Changes
- New table: `public.learner_waitlist` (generic across cities; Chester is
  just one `city` value so the table scales beyond this campaign).
- New table: `public.practice_pass_purchases` (dedicated payment log;
  kept OFF the `profiles` identity row for cleanliness, refund handling,
  Stripe reconciliation, and future analytics).
- Sensible indexes on both tables.
- RLS enabled on both, **zero policies** — server-only access via the
  service role. See `docs/chester/PR1-rls-plan.md`.
- `profiles` is **unchanged** in this PR.

## Files
- `supabase/migrations/2026-05-17-chester-funnel-schema.sql`
- `supabase/migrations/2026-05-17-chester-funnel-schema.ROLLBACK.sql`
- `supabase/migrations/2026-05-17-chester-funnel-schema.VERIFY.sql`
- `docs/chester/PR1-rls-plan.md`
- `docs/chester/PR1-README.md`

## Important context
- cruzi-web and cruzi-mobile share the same Supabase project. After this
  migration is applied, the new tables are visible to both clients, but
  **the mobile app does not read them** and v1 introduces no premium
  gating anywhere.
- `practice_pass_purchases` is **not** an entitlement source. It is an
  analytics + reconciliation log.

## Deployment
- Do **NOT** apply to production until explicit approval.
- Path: apply to staging Supabase first → run `…VERIFY.sql` → sign-off
  → production.
- Rollback: run `…ROLLBACK.sql` (drops both new tables; profiles
  untouched).

## Out of scope (later PRs)
- PR 2: `/chester` waitlist landing + confirmation page
- PR 3: `/chester/start` prefill signup → standard student Supabase
  account (same shape as solo mobile signup)
- PR 4: Stripe Checkout + webhook + success/cancel pages
  (server inserts `practice_pass_purchases` row at session creation;
  webhook transitions `pending → paid` idempotently)
- PR 5: transactional email, funnel analytics, copy polish
