-- =====================================================================
-- Escrita das tutoras: confirmar presença e emitir certificado só para
-- mentoradas da própria tutora (is_mentor_of). Complementa
-- 20261021000000_mentor_data_access.sql, que restringiu as leituras.
-- =====================================================================

drop policy if exists "attendance_update_mentor" on public.attendance;
create policy "attendance_update_mentor" on public.attendance
  for update
  using (public.is_mentor_of(mentee_id))
  with check (public.is_mentor_of(mentee_id));

drop policy if exists "certificates_insert_mentor" on public.certificates;
create policy "certificates_insert_mentor" on public.certificates
  for insert with check (public.is_mentor_of(mentee_id));
