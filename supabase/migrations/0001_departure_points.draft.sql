-- BORRADOR, NO APLICADO. Tabla de puntos autorizados de salida o recogida.
-- Es la única fuente de coordenadas del mapa (ver src/lib/catalog/types.ts).
-- Se aplicará en la fase 1 del ROADMAP, junto con el resto del esquema.

create extension if not exists postgis;

create table departure_points (
  id            text primary key,              -- 'cadaques', 'port-lligat'
  name          text not null,
  geog          geography(point, 4326) not null,
  kind          text not null default 'both'
                check (kind in ('departure', 'pickup', 'both')),
  boarding_notes text,
  -- Quién confirmó la coordenada y cuándo. Sin esto, el punto no se publica.
  verified_at   timestamptz,
  verified_by   text,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  constraint published_requires_verification
    check (not is_published or verified_at is not null)
);

alter table departure_points enable row level security;

create policy "public reads published points"
  on departure_points for select
  using (is_published);

-- boats.departure_point_id referenciará esta tabla:
--   departure_point_id text not null references departure_points (id)
