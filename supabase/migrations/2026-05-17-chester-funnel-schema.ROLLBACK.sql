-- Rollback for 2026-05-17-chester-funnel-schema.sql (revised)
-- WARNING: drops both new tables and all rows in them.
-- profiles is untouched by this migration, so nothing to undo there.

begin;

-- practice_pass_purchases
drop index if exists public.practice_pass_purchases_stripe_customer_id_idx;
drop index if exists public.practice_pass_purchases_email_lower_idx;
drop index if exists public.practice_pass_purchases_status_created_at_idx;
drop index if exists public.practice_pass_purchases_user_id_created_at_idx;
drop index if exists public.practice_pass_purchases_source_paid_at_idx;
drop table if exists public.practice_pass_purchases;

-- learner_waitlist
drop index if exists public.learner_waitlist_converted_user_id_idx;
drop index if exists public.learner_waitlist_source_created_at_idx;
drop index if exists public.learner_waitlist_city_created_at_idx;
drop index if exists public.learner_waitlist_signup_token_uniq;
drop index if exists public.learner_waitlist_email_lower_uniq;
drop table if exists public.learner_waitlist;

commit;
