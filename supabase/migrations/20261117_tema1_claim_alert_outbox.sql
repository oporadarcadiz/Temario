-- OpoRadarCádiz · Avisos de compra Tema 1
-- Cola de entrega idempotente; no envía correos ni concede permisos.
-- La existencia de una fila solo significa "solicitud registrada".

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create table if not exists public.tema1_claim_alert_outbox (
  claim_id uuid primary key references public.tema1_order_claims(id) on delete cascade,
  queued_at timestamptz not null default now(),
  email_sent_at timestamptz,
  telegram_sent_at timestamptz,
  email_attempts integer not null default 0 check (email_attempts >= 0),
  telegram_attempts integer not null default 0 check (telegram_attempts >= 0),
  email_last_error text,
  telegram_last_error text
);

alter table public.tema1_claim_alert_outbox enable row level security;
revoke all on public.tema1_claim_alert_outbox from public, anon, authenticated;
grant select, insert, update on public.tema1_claim_alert_outbox to service_role;

create or replace function private.enqueue_tema1_claim_alert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.tema1_claim_alert_outbox (claim_id)
  values (new.id)
  on conflict (claim_id) do nothing;
  return new;
exception when others then
  -- Nunca impedir una compra porque la cola de avisos tenga un problema.
  raise log 'tema1_claim_alert_outbox: no se pudo encolar solicitud (SQLSTATE %)', SQLSTATE;
  return new;
end;
$$;

revoke all on function private.enqueue_tema1_claim_alert() from public, anon, authenticated;

create trigger tema1_claim_alert_enqueue
after insert on public.tema1_order_claims
for each row execute function private.enqueue_tema1_claim_alert();

-- Recuperar peticiones ya pendientes, sin enviar notificaciones retrospectivas hasta configurar el proveedor.
insert into public.tema1_claim_alert_outbox (claim_id)
select id from public.tema1_order_claims where status = 'pending'
on conflict (claim_id) do nothing;
