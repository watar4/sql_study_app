-- Run in the Supabase SQL editor with an administrative account.
-- Returns policy definitions only, never application records.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('user_progress', 'user_reviews')
order by tablename, policyname;

select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('user_progress', 'user_reviews');
