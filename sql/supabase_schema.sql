-- =====================================================
-- ODV / ODB GESTIONALE - SCHEMA COMPLETO SUPABASE
-- =====================================================
-- Eseguire questo SQL nel SQL Editor di Supabase.
--
-- Include:
-- - organizzazioni multi-tenant
-- - profili utenti e ruoli
-- - soci, tutori, consensi, pagamenti, tessere
-- - volontari continuativi e occasionali
-- - gruppi, eventi, ticket, tutorial
-- - trigger per codici univoci
-- - RLS base per organizzazione
-- =====================================================

create extension if not exists pgcrypto;

-- =====================================================
-- ENUM
-- =====================================================
create type public.member_status as enum ('attivo', 'sospeso');
create type public.payment_method as enum ('paypal', 'bonifico', 'contanti');
create type public.volunteer_type as enum ('continuativo', 'occasionale');
create type public.card_status as enum ('attiva', 'scaduta', 'revocata');
create type public.ticket_status as enum ('aperto', 'in_lavorazione', 'chiuso');
create type public.user_role as enum (
  'super_admin',
  'admin_organizzazione',
  'operatore_segreteria',
  'responsabile_eventi',
  'custom'
);

-- =====================================================
-- TIMESTAMP TRIGGER
-- =====================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================
-- CODICI UNIVOCI
-- =====================================================
create or replace function public.generate_prefixed_code(prefix text)
returns text
language plpgsql
as $$
declare
  result text;
begin
  result := prefix || '-' || lpad(floor(random() * 999999)::text, 6, '0');
  return result;
end;
$$;

create or replace function public.set_socio_code()
returns trigger
language plpgsql
as $$
begin
  if new.codice_univoco is null or new.codice_univoco = '' then
    new.codice_univoco := public.generate_prefixed_code('SOC');
  end if;
  return new;
end;
$$;

create or replace function public.set_volontario_code()
returns trigger
language plpgsql
as $$
begin
  if new.codice_univoco is null or new.codice_univoco = '' then
    new.codice_univoco := public.generate_prefixed_code('VOL');
  end if;
  return new;
end;
$$;

create or replace function public.set_tessera_code()
returns trigger
language plpgsql
as $$
begin
  if new.codice_tessera is null or new.codice_tessera = '' then
    new.codice_tessera := 'TESS-' || to_char(current_date, 'YYYY') || '-' || lpad(floor(random() * 999999)::text, 6, '0');
  end if;
  return new;
end;
$$;

-- =====================================================
-- TABELLE BASE
-- =====================================================
create table if not exists public.organizzazioni (
  id uuid primary key default gen_random_uuid(),
  ragione_sociale text not null,
  slug text unique not null,
  email text,
  telefono text,
  logo_url text,
  brand_color text default '#0a84ff',
  font_family text default 'Inter',
  font_color text default '#0f172a',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profili (
  id uuid primary key references auth.users(id) on delete cascade,
  organizzazione_id uuid references public.organizzazioni(id) on delete cascade,
  nome text,
  cognome text,
  email text not null,
  ruolo public.user_role not null default 'custom',
  account_attivo boolean not null default true,
  puo_gestire_soci boolean not null default false,
  puo_gestire_volontari boolean not null default false,
  puo_gestire_pagamenti boolean not null default false,
  puo_gestire_tessere boolean not null default false,
  puo_gestire_gruppi boolean not null default false,
  puo_gestire_eventi boolean not null default false,
  puo_gestire_impostazioni boolean not null default false,
  puo_gestire_utenti boolean not null default false,
  sola_lettura boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.soci (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid not null references public.organizzazioni(id) on delete cascade,
  codice_univoco text unique,
  nome text not null,
  cognome text not null,
  data_iscrizione date not null default current_date,
  stato public.member_status not null default 'attivo',
  data_nascita date,
  luogo_nascita text,
  provincia_nascita text,
  codice_fiscale text,
  indirizzo text,
  cap text,
  comune text,
  provincia text,
  telefono text,
  email text,
  e_minorenne boolean not null default false,
  e_anche_volontario boolean not null default false,
  modifica_bloccata boolean not null default false,
  archiviato boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutori_soci (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid not null unique references public.soci(id) on delete cascade,
  nome text not null,
  cognome text not null,
  data_nascita date,
  luogo_nascita text,
  provincia_nascita text,
  codice_fiscale text,
  indirizzo text,
  cap text,
  comune text,
  provincia text,
  telefono text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consensi_soci (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid not null unique references public.soci(id) on delete cascade,
  consenso_prestato_da text,
  consenso_at timestamptz,
  privacy_accettata boolean not null default false,
  statuto_accettato boolean not null default false,
  trattamento_dati_associazione boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pagamenti_soci (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid not null references public.soci(id) on delete cascade,
  causale text not null,
  importo numeric(10,2) not null default 0,
  metodo public.payment_method not null,
  data_pagamento date,
  numero_transazione text,
  intestatario_transazione text,
  indirizzo text,
  nota text,
  verificato boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tessere_digitali (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid not null unique references public.soci(id) on delete cascade,
  codice_tessera text unique,
  template_nome text,
  stato public.card_status not null default 'bozza',
  wallet_inviato boolean not null default false,
  wallet_provider text,
  email_inviata boolean not null default false,
  data_generazione timestamptz,
  data_invio_email timestamptz,
  data_invio_wallet timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.volontari (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid not null references public.organizzazioni(id) on delete cascade,
  socio_id uuid references public.soci(id) on delete set null,
  codice_univoco text unique,
  nome text not null,
  cognome text not null,
  stato public.member_status not null default 'attivo',
  tipologia public.volunteer_type not null default 'continuativo',
  data_inizio date not null default current_date,
  data_cessazione date,
  data_nascita date,
  luogo_nascita text,
  provincia_nascita text,
  codice_fiscale text,
  indirizzo text,
  cap text,
  comune text,
  provincia text,
  telefono text,
  email text,
  privacy_accettata boolean not null default false,
  statuto_accettato boolean not null default false,
  trattamento_dati_associazione boolean not null default false,
  modifica_bloccata boolean not null default false,
  archiviato boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.archivio_volontari (
  id uuid primary key default gen_random_uuid(),
  volontario_id uuid not null references public.volontari(id) on delete cascade,
  organizzazione_id uuid not null references public.organizzazioni(id) on delete cascade,
  data_cessazione date not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.gruppi (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid not null references public.organizzazioni(id) on delete cascade,
  nome text not null,
  descrizione text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organizzazione_id, nome)
);

create table if not exists public.gruppo_soci (
  id uuid primary key default gen_random_uuid(),
  gruppo_id uuid not null references public.gruppi(id) on delete cascade,
  socio_id uuid not null references public.soci(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (gruppo_id, socio_id)
);

create table if not exists public.gruppo_volontari (
  id uuid primary key default gen_random_uuid(),
  gruppo_id uuid not null references public.gruppi(id) on delete cascade,
  volontario_id uuid not null references public.volontari(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (gruppo_id, volontario_id)
);

create table if not exists public.eventi (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid not null references public.organizzazioni(id) on delete cascade,
  nome text not null,
  data_evento date not null,
  descrizione text,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evento_gruppi (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventi(id) on delete cascade,
  gruppo_id uuid not null references public.gruppi(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (evento_id, gruppo_id)
);

create table if not exists public.ticket_assistenza (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid references public.organizzazioni(id) on delete cascade,
  nome text not null,
  cognome text not null,
  email text not null,
  societa text,
  oggetto text not null,
  descrizione text not null,
  stato public.ticket_status not null default 'aperto',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutorial (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid references public.organizzazioni(id) on delete cascade,
  titolo text not null,
  categoria text,
  descrizione text,
  video_url text,
  is_pubblicato boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- TRIGGER UPDATED_AT
-- =====================================================
create trigger set_updated_at_organizzazioni before update on public.organizzazioni for each row execute function public.set_updated_at();
create trigger set_updated_at_profili before update on public.profili for each row execute function public.set_updated_at();
create trigger set_updated_at_soci before update on public.soci for each row execute function public.set_updated_at();
create trigger set_updated_at_tutori before update on public.tutori_soci for each row execute function public.set_updated_at();
create trigger set_updated_at_consensi before update on public.consensi_soci for each row execute function public.set_updated_at();
create trigger set_updated_at_pagamenti before update on public.pagamenti_soci for each row execute function public.set_updated_at();
create trigger set_updated_at_tessere before update on public.tessere_digitali for each row execute function public.set_updated_at();
create trigger set_updated_at_volontari before update on public.volontari for each row execute function public.set_updated_at();
create trigger set_updated_at_gruppi before update on public.gruppi for each row execute function public.set_updated_at();
create trigger set_updated_at_eventi before update on public.eventi for each row execute function public.set_updated_at();
create trigger set_updated_at_ticket before update on public.ticket_assistenza for each row execute function public.set_updated_at();
create trigger set_updated_at_tutorial before update on public.tutorial for each row execute function public.set_updated_at();

-- =====================================================
-- TRIGGER CODICI
-- =====================================================
create trigger trg_set_socio_code before insert on public.soci for each row execute function public.set_socio_code();
create trigger trg_set_volontario_code before insert on public.volontari for each row execute function public.set_volontario_code();
create trigger trg_set_tessera_code before insert on public.tessere_digitali for each row execute function public.set_tessera_code();

-- =====================================================
-- FUNZIONE: CONVERSIONE SOCIO -> VOLONTARIO
-- =====================================================
create or replace function public.converti_socio_in_volontario(
  p_socio_id uuid,
  p_tipologia public.volunteer_type default 'continuativo'
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_socio public.soci;
  v_volontario_id uuid;
begin
  select * into v_socio
  from public.soci
  where id = p_socio_id;

  if not found then
    raise exception 'Socio non trovato';
  end if;

  insert into public.volontari (
    organizzazione_id,
    socio_id,
    nome,
    cognome,
    stato,
    tipologia,
    data_inizio,
    data_nascita,
    luogo_nascita,
    provincia_nascita,
    codice_fiscale,
    indirizzo,
    cap,
    comune,
    provincia,
    telefono,
    email,
    modifica_bloccata
  )
  values (
    v_socio.organizzazione_id,
    v_socio.id,
    v_socio.nome,
    v_socio.cognome,
    v_socio.stato,
    p_tipologia,
    current_date,
    v_socio.data_nascita,
    v_socio.luogo_nascita,
    v_socio.provincia_nascita,
    v_socio.codice_fiscale,
    v_socio.indirizzo,
    v_socio.cap,
    v_socio.comune,
    v_socio.provincia,
    v_socio.telefono,
    v_socio.email,
    true
  )
  returning id into v_volontario_id;

  update public.soci
  set e_anche_volontario = true,
      modifica_bloccata = true
  where id = p_socio_id;

  return v_volontario_id;
end;
$$;

-- =====================================================
-- FUNZIONE: CESSAZIONE VOLONTARIO
-- =====================================================
create or replace function public.cessa_volontario(
  p_volontario_id uuid,
  p_data_cessazione date,
  p_note text default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_volontario public.volontari;
begin
  select * into v_volontario
  from public.volontari
  where id = p_volontario_id;

  if not found then
    raise exception 'Volontario non trovato';
  end if;

  update public.volontari
  set data_cessazione = p_data_cessazione,
      archiviato = true,
      stato = 'sospeso'
  where id = p_volontario_id;

  insert into public.archivio_volontari (volontario_id, organizzazione_id, data_cessazione, note)
  values (p_volontario_id, v_volontario.organizzazione_id, p_data_cessazione, p_note);
end;
$$;

-- =====================================================
-- VIEW: DETTAGLIO GRUPPI
-- =====================================================
create or replace view public.v_gruppi_statistiche as
select
  g.id,
  g.organizzazione_id,
  g.nome,
  count(distinct gs.socio_id) as totale_soci,
  count(distinct gv.volontario_id) as totale_volontari,
  count(distinct gs.socio_id) + count(distinct gv.volontario_id) as totale_componenti
from public.gruppi g
left join public.gruppo_soci gs on gs.gruppo_id = g.id
left join public.gruppo_volontari gv on gv.gruppo_id = g.id
group by g.id, g.organizzazione_id, g.nome;

-- =====================================================
-- VIEW: REGISTRO VOLONTARI CONTINUATIVI PER FIRMA DIGITALE
-- =====================================================
create or replace view public.v_registro_firma_digitale as
select
  v.id,
  v.organizzazione_id,
  v.codice_univoco,
  v.nome,
  v.cognome,
  v.email,
  v.codice_fiscale,
  v.data_inizio,
  v.stato,
  v.tipologia
from public.volontari v
where v.tipologia = 'continuativo'
  and v.archiviato = false;

-- =====================================================
-- RLS HELPERS
-- =====================================================
create or replace function public.current_organizzazione_id()
returns uuid
language sql
stable
as $$
  select organizzazione_id
  from public.profili
  where id = auth.uid()
$$;

-- =====================================================
-- ENABLE RLS
-- =====================================================
alter table public.organizzazioni enable row level security;
alter table public.profili enable row level security;
alter table public.soci enable row level security;
alter table public.tutori_soci enable row level security;
alter table public.consensi_soci enable row level security;
alter table public.pagamenti_soci enable row level security;
alter table public.tessere_digitali enable row level security;
alter table public.volontari enable row level security;
alter table public.archivio_volontari enable row level security;
alter table public.gruppi enable row level security;
alter table public.gruppo_soci enable row level security;
alter table public.gruppo_volontari enable row level security;
alter table public.eventi enable row level security;
alter table public.evento_gruppi enable row level security;
alter table public.ticket_assistenza enable row level security;
alter table public.tutorial enable row level security;

-- =====================================================
-- RLS POLICIES
-- =====================================================
create policy "organizzazioni_select_own" on public.organizzazioni
for select using (id = public.current_organizzazione_id());

create policy "profili_select_own_org" on public.profili
for select using (organizzazione_id = public.current_organizzazione_id() or id = auth.uid());

create policy "profili_update_self" on public.profili
for update using (id = auth.uid());

create policy "soci_crud_own_org" on public.soci
for all using (organizzazione_id = public.current_organizzazione_id())
with check (organizzazione_id = public.current_organizzazione_id());

create policy "tutori_select_through_socio" on public.tutori_soci
for all using (
  exists (
    select 1 from public.soci s
    where s.id = socio_id
      and s.organizzazione_id = public.current_organizzazione_id()
  )
)
with check (
  exists (
    select 1 from public.soci s
    where s.id = socio_id
      and s.organizzazione_id = public.current_organizzazione_id()
  )
);

create policy "consensi_select_through_socio" on public.consensi_soci
for all using (
  exists (
    select 1 from public.soci s
    where s.id = socio_id
      and s.organizzazione_id = public.current_organizzazione_id()
  )
)
with check (
  exists (
    select 1 from public.soci s
    where s.id = socio_id
      and s.organizzazione_id = public.current_organizzazione_id()
  )
);

create policy "pagamenti_select_through_socio" on public.pagamenti_soci
for all using (
  exists (
    select 1 from public.soci s
    where s.id = socio_id
      and s.organizzazione_id = public.current_organizzazione_id()
  )
)
with check (
  exists (
    select 1 from public.soci s
    where s.id = socio_id
      and s.organizzazione_id = public.current_organizzazione_id()
  )
);

create policy "tessere_select_through_socio" on public.tessere_digitali
for all using (
  exists (
    select 1 from public.soci s
    where s.id = socio_id
      and s.organizzazione_id = public.current_organizzazione_id()
  )
)
with check (
  exists (
    select 1 from public.soci s
    where s.id = socio_id
      and s.organizzazione_id = public.current_organizzazione_id()
  )
);

create policy "volontari_crud_own_org" on public.volontari
for all using (organizzazione_id = public.current_organizzazione_id())
with check (organizzazione_id = public.current_organizzazione_id());

create policy "archivio_volontari_crud_own_org" on public.archivio_volontari
for all using (organizzazione_id = public.current_organizzazione_id())
with check (organizzazione_id = public.current_organizzazione_id());

create policy "gruppi_crud_own_org" on public.gruppi
for all using (organizzazione_id = public.current_organizzazione_id())
with check (organizzazione_id = public.current_organizzazione_id());

create policy "gruppo_soci_crud_own_org" on public.gruppo_soci
for all using (
  exists (
    select 1 from public.gruppi g
    where g.id = gruppo_id
      and g.organizzazione_id = public.current_organizzazione_id()
  )
)
with check (
  exists (
    select 1 from public.gruppi g
    where g.id = gruppo_id
      and g.organizzazione_id = public.current_organizzazione_id()
  )
);

create policy "gruppo_volontari_crud_own_org" on public.gruppo_volontari
for all using (
  exists (
    select 1 from public.gruppi g
    where g.id = gruppo_id
      and g.organizzazione_id = public.current_organizzazione_id()
  )
)
with check (
  exists (
    select 1 from public.gruppi g
    where g.id = gruppo_id
      and g.organizzazione_id = public.current_organizzazione_id()
  )
);

create policy "eventi_crud_own_org" on public.eventi
for all using (organizzazione_id = public.current_organizzazione_id())
with check (organizzazione_id = public.current_organizzazione_id());

create policy "evento_gruppi_crud_own_org" on public.evento_gruppi
for all using (
  exists (
    select 1
    from public.eventi e
    where e.id = evento_id
      and e.organizzazione_id = public.current_organizzazione_id()
  )
)
with check (
  exists (
    select 1
    from public.eventi e
    where e.id = evento_id
      and e.organizzazione_id = public.current_organizzazione_id()
  )
);

create policy "ticket_crud_own_org" on public.ticket_assistenza
for all using (organizzazione_id = public.current_organizzazione_id())
with check (organizzazione_id = public.current_organizzazione_id());

create policy "tutorial_crud_own_org" on public.tutorial
for all using (
  organizzazione_id = public.current_organizzazione_id() or organizzazione_id is null
)
with check (
  organizzazione_id = public.current_organizzazione_id() or organizzazione_id is null
);

-- =====================================================
-- INDICI
-- =====================================================
create index if not exists idx_soci_org on public.soci (organizzazione_id);
create index if not exists idx_soci_email on public.soci (email);
create index if not exists idx_soci_codice_fiscale on public.soci (codice_fiscale);
create index if not exists idx_volontari_org on public.volontari (organizzazione_id);
create index if not exists idx_volontari_tipologia on public.volontari (tipologia);
create index if not exists idx_pagamenti_socio on public.pagamenti_soci (socio_id);
create index if not exists idx_gruppi_org on public.gruppi (organizzazione_id);
create index if not exists idx_eventi_org on public.eventi (organizzazione_id);
create index if not exists idx_ticket_org on public.ticket_assistenza (organizzazione_id);

-- =====================================================
-- SEED MINIMO DI ESEMPIO
-- =====================================================
insert into public.organizzazioni (id, ragione_sociale, slug, email, telefono)
values
  ('11111111-1111-1111-1111-111111111111', 'ODV Demo', 'odv-demo', 'info@odvdemo.it', '+39 000 0000000')
on conflict (slug) do nothing;

insert into public.soci (
  organizzazione_id,
  nome,
  cognome,
  data_iscrizione,
  stato,
  data_nascita,
  luogo_nascita,
  provincia_nascita,
  codice_fiscale,
  indirizzo,
  cap,
  comune,
  provincia,
  telefono,
  email,
  e_anche_volontario
)
values
  ('11111111-1111-1111-1111-111111111111', 'Giulia', 'Rossi', '2026-01-12', 'attivo', '1992-05-03', 'Milano', 'MI', 'RSSGLI92E43F205X', 'Via Roma 1', '20100', 'Milano', 'MI', '+39 333 1111111', 'giulia.rossi@example.it', true),
  ('11111111-1111-1111-1111-111111111111', 'Marco', 'Bianchi', '2025-11-03', 'sospeso', '1988-09-17', 'Brescia', 'BS', 'BNCMRC88P17B157N', 'Via Verdi 2', '25100', 'Brescia', 'BS', '+39 333 2222222', 'marco.bianchi@example.it', false)
on conflict do nothing;

insert into public.volontari (
  organizzazione_id,
  nome,
  cognome,
  stato,
  tipologia,
  data_inizio,
  email
)
values
  ('11111111-1111-1111-1111-111111111111', 'Luca', 'Neri', 'attivo', 'continuativo', '2025-10-20', 'luca.neri@example.it'),
  ('11111111-1111-1111-1111-111111111111', 'Elena', 'Gallo', 'attivo', 'occasionale', '2026-02-18', 'elena.gallo@example.it')
on conflict do nothing;

insert into public.gruppi (organizzazione_id, nome, descrizione)
values
  ('11111111-1111-1111-1111-111111111111', 'Protezione Civile', 'Gruppo operativo territoriale'),
  ('11111111-1111-1111-1111-111111111111', 'Eventi Solidali', 'Gruppo eventi e comunicazione')
on conflict (organizzazione_id, nome) do nothing;

insert into public.eventi (organizzazione_id, nome, data_evento, descrizione)
values
  ('11111111-1111-1111-1111-111111111111', 'Raccolta alimentare primavera', '2026-04-11', 'Evento territoriale con punti di raccolta diffusi')
on conflict do nothing;
