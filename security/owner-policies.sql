-- Review verify-rls.sql and the schema before applying. Not auto-deployed.
-- Only the two application tables using user_id are changed.
begin;
alter table public.user_progress enable row level security;
alter table public.user_reviews enable row level security;

-- A restrictive guard cannot be bypassed by an older permissive OR policy.
-- PUBLIC includes anonymous and authenticated roles; null auth.uid() denies anon.
drop policy if exists app_owner_guard on public.user_progress;
create policy app_owner_guard on public.user_progress as restrictive for all to public
using ((select auth.uid())::text = user_id::text)
with check ((select auth.uid())::text = user_id::text);
drop policy if exists app_owner_access on public.user_progress;
create policy app_owner_access on public.user_progress as permissive for all to authenticated
using ((select auth.uid())::text = user_id::text)
with check ((select auth.uid())::text = user_id::text);

drop policy if exists app_owner_guard on public.user_reviews;
create policy app_owner_guard on public.user_reviews as restrictive for all to public
using ((select auth.uid())::text = user_id::text)
with check ((select auth.uid())::text = user_id::text);
drop policy if exists app_owner_access on public.user_reviews;
create policy app_owner_access on public.user_reviews as permissive for all to authenticated
using ((select auth.uid())::text = user_id::text)
with check ((select auth.uid())::text = user_id::text);
commit;
