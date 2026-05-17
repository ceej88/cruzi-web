-- Chester learner funnel — PR 1 (schema only, revised)
-- Adds:
--   1. learner_waitlist          (generic across cities; chester is just one value)
--   2. practice_pass_purchases   (payment log; kept OFF the profiles identity row)
--
-- v1 has no premium gating. Nothing in mobile reads these tables. These rows
-- exist for analytics / reconciliation / future refund handling only.

begin;

------------------------------------------------------------
-- 1. learner_waitlist
------------------------------------------------------------
create table if not exists public.learner_waitlist (
  id                 uuid        primary key default gen_random_uuid(),
  email              text        not null,
  full_name          text        not null,
  city               text        not null,
  source             text,
  created_at         timestamptz not null default now(),
  signup_token       text        not null default encode(gen_random_bytes(24), 'hex'),
  token_expires_at   timestamptz not null default (now() + interval '14 days'),
  converted_user_id  uuid        references auth.users(id) on delete set null
);

create unique index if not exists learner_waitlist_email_lower_uniq
  on public.learner_waitlist (lower(email));

create unique index if not exists learner_waitlist_signup_token_uniq
  on public.learner_waitlist (signup_token);

create index if not exists learner_waitlist_city_created_at_idx
  on public.learner_waitlist (city, created_at desc);

create index if not exists learner_waitlist_source_created_at_idx
  on public.learner_waitlist (source, created_at desc);

create index if not exists learner_waitlist_converted_user_id_idx
  on public.learner_waitlist (converted_user_id)
  where converted_user_id is not null;

comment on table  public.learner_waitlist is
  'Learner waitlist capture. Generic across cities (city column); first user is Chester.';
comment on column public.learner_waitlist.signup_token is
  'Short-lived token used by the signup page to prefill name + email. Single-use enforced in app code.';
comment on column public.learner_waitlist.token_expires_at is
  'Default 14 days from creation; enforcement happens in app code.';
comment on column public.learner_waitlist.converted_user_id is
  'Set when this waitlist entry successfully creates a Supabase auth user.';

alter table public.learner_waitlist enable row level security;
-- No policies in PR 1. Anon / authenticated have no access.
-- Server code uses the service role (which bypasses RLS).

------------------------------------------------------------
-- 2. practice_pass_purchases
------------------------------------------------------------
-- Dedicated payment log. NOT an entitlement table. profiles is intentionally untouched.
create table if not exists public.practice_pass_purchases (
  id                          uuid        primary key default gen_random_uuid(),
  user_id                     uuid        references auth.users(id) on delete set null,
  email                       text        not null,
  stripe_customer_id          text,
  stripe_checkout_session_id  text        unique,
  amount                      integer     not null,            -- minor units (pence)
  currency                    text        not null default 'gbp',
  status                      text        not null
    check (status in ('pending','paid','failed','refunded')),
  source                      text        not null default 'chester_waitlist_v1',
  paid_at                     timestamptz,
  created_at                  timestamptz not null default now()
);

-- Reporting: paid conversions by funnel source, over time.
create index if not exists practice_pass_purchases_source_paid_at_idx
  on public.practice_pass_purchases (source, paid_at desc)
  where paid_at is not null;

-- Most recent purchase(s) by user (for support / reconciliation lookups).
create index if not exists practice_pass_purchases_user_id_created_at_idx
  on public.practice_pass_purchases (user_id, created_at desc)
  where user_id is not null;

-- Status filtering (e.g. find all 'pending' to reconcile against Stripe).
create index if not exists practice_pass_purchases_status_created_at_idx
  on public.practice_pass_purchases (status, created_at desc);

-- Lookup by email (support cases where user_id is null at insert time).
create index if not exists practice_pass_purchases_email_lower_idx
  on public.practice_pass_purchases (lower(email));

-- Lookup by Stripe customer id (Stripe dashboard cross-reference).
create index if not exists practice_pass_purchases_stripe_customer_id_idx
  on public.practice_pass_purchases (stripe_customer_id)
  where stripe_customer_id is not null;

comment on table  public.practice_pass_purchases is
  'One-time Practice Pass payment log (v1: £9.99 one-time). Analytics and reconciliation only — NOT an entitlement source.';
comment on column public.practice_pass_purchases.amount is
  'Minor currency units (e.g. pence). 999 = £9.99.';
comment on column public.practice_pass_purchases.status is
  'pending → paid (webhook) | failed | refunded. Webhook in PR 4 transitions pending → paid idempotently.';
comment on column public.practice_pass_purchases.source is
  'Funnel attribution, e.g. chester_waitlist_v1.';
comment on column public.practice_pass_purchases.user_id is
  'Nullable: account is created before checkout, so this is normally set, but FK uses ON DELETE SET NULL so deleting a user does not erase the payment record.';

alter table public.practice_pass_purchases enable row level security;
-- No policies in PR 1. Anon / authenticated have no access. Server-only via service role.

commit;
