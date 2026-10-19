-- Funções de trigger não devem ser chamáveis via /rest/v1/rpc.
-- O revoke da v3 cobriu public e anon, mas authenticated tem grant direto.
revoke execute on function
  public.handle_new_user(), public.touch_streak()
  from authenticated;