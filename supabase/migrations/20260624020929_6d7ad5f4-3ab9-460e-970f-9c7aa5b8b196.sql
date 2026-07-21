-- Revoke broad EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;

-- has_role is invoked inside RLS USING clauses; the querying role needs EXECUTE.
-- Keep authenticated, drop anon (no anon-targeted policy depends on it).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;