-- =====================================================================
-- Editar o próprio perfil: a policy profiles_update_own só confere
-- id = auth.uid(), então qualquer usuária poderia mudar o próprio role
-- (virar mentora) ou deleted_at pelo front. Com a grant por coluna, só
-- nome, username e avatar podem ser alterados direto.
-- =====================================================================

revoke update on public.profiles from authenticated;
grant update (full_name, username, avatar_url) on public.profiles to authenticated;
