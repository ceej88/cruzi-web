-- Verification queries for 2026-05-17-chester-funnel-schema.sql
-- Run in staging after applying the migration. Expected results inline.

-- ===== learner_waitlist exists =====
select count(*) as learner_waitlist_table_count
from information_schema.tables
where table_schema = 'public' and table_name = 'learner_waitlist';
-- expected: 1

-- ===== learner_waitlist columns + nullability =====
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'learner_waitlist'
order by ordinal_position;
-- expected:
--   id                uuid         NO   gen_random_uuid()
--   email             text         NO
--   full_name         text         NO
--   city              text         NO
--   source            text         YES
--   created_at        timestamptz  NO   now()
--   signup_token      text         NO   encode(gen_random_bytes(24), 'hex')
--   token_expires_at  timestamptz  NO   (now() + '14 days'::interval)
--   converted_user_id uuid         YES

-- ===== learner_waitlist indexes =====
select indexname
from pg_indexes
where schemaname = 'public' and tablename = 'learner_waitlist'
order by indexname;
-- expected: learner_waitlist_pkey,
--           learner_waitlist_email_lower_uniq,
--           learner_waitlist_signup_token_uniq,
--           learner_waitlist_city_created_at_idx,
--           learner_waitlist_source_created_at_idx,
--           learner_waitlist_converted_user_id_idx

-- ===== practice_pass_purchases exists =====
select count(*) as practice_pass_purchases_table_count
from information_schema.tables
where table_schema = 'public' and table_name = 'practice_pass_purchases';
-- expected: 1

-- ===== practice_pass_purchases columns =====
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'practice_pass_purchases'
order by ordinal_position;
-- expected:
--   id                         uuid         NO   gen_random_uuid()
--   user_id                    uuid         YES
--   email                      text         NO
--   stripe_customer_id         text         YES
--   stripe_checkout_session_id text         YES
--   amount                     integer      NO
--   currency                   text         NO   'gbp'
--   status                     text         NO
--   source                     text         NO   'chester_waitlist_v1'
--   paid_at                    timestamptz  YES
--   created_at                 timestamptz  NO   now()

-- ===== status CHECK constraint =====
select pg_get_constraintdef(c.oid) as definition
from pg_constraint c
join pg_class t on t.oid = c.conrelid
where t.relname = 'practice_pass_purchases' and c.contype = 'c';
-- expected: CHECK (status IN ('pending','paid','failed','refunded'))

-- ===== practice_pass_purchases indexes =====
select indexname
from pg_indexes
where schemaname = 'public' and tablename = 'practice_pass_purchases'
order by indexname;
-- expected: practice_pass_purchases_pkey,
--           practice_pass_purchases_stripe_checkout_session_id_key, -- from UNIQUE
--           practice_pass_purchases_source_paid_at_idx,
--           practice_pass_purchases_user_id_created_at_idx,
--           practice_pass_purchases_status_created_at_idx,
--           practice_pass_purchases_email_lower_idx,
--           practice_pass_purchases_stripe_customer_id_idx

-- ===== RLS enabled on both tables, zero policies in PR 1 =====
select relname, relrowsecurity
from pg_class
where oid in ('public.learner_waitlist'::regclass,
              'public.practice_pass_purchases'::regclass);
-- expected: both relrowsecurity = t

select tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public'
  and tablename in ('learner_waitlist', 'practice_pass_purchases')
group by tablename;
-- expected: zero rows (no policies); anon/authenticated have no access.

-- ===== profiles is untouched =====
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
  and column_name in ('paid_at','paid_source','stripe_customer_id','stripe_checkout_session_id');
-- expected: zero rows (none of these were added to profiles)

-- ===== smoke insert / cleanup (staging only) =====
-- begin;
--   insert into public.learner_waitlist (email, full_name, city, source)
--   values ('verify+pr1@example.com', 'PR1 Verify', 'chester', 'verify_only')
--   returning id, signup_token, token_expires_at;
--
--   insert into public.practice_pass_purchases
--     (email, amount, status, source, stripe_checkout_session_id)
--   values
--     ('verify+pr1@example.com', 999, 'pending', 'verify_only', 'cs_test_verify_pr1')
--   returning id, status, currency;
-- rollback;
