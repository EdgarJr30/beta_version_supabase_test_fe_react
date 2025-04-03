-- Database Schema for Business Link Management

-- # Enums
create type dgii_environment_type as enum('testecf', 'certecf', 'ecf');
create type roles_type as enum('super_admin', 'admin', 'user');

-- # Tablas
-- ## Tabla Certificate
create table public.certificate (
  id serial not null,
  name text not null,
  pkcs12_data text not null,
  password text not null,
  expiration_date timestamp with time zone not null,
  created_at timestamp without time zone null default now(),
  constraint certificate_pkey primary key (id)
) TABLESPACE pg_default;

-- Habilitar RLS para la tabla
alter table public.certificate enable row level security;

-- ## Tabla Semilla Token
create table public.semilla_token (
  id uuid not null default gen_random_uuid (),
  created_at timestamp without time zone not null default now(),
  token text null,
  expira timestamp with time zone null default (now() + '01:00:00'::interval),
  expedido timestamp with time zone null default now(),
  constraint semilla_token_pkey primary key (id)
) TABLESPACE pg_default;

-- Habilitar RLS para la tabla
alter table public.semilla_token enable row level security;

-- ## Tabla Roles
create table public.roles (
  id serial not null,
--   name text not null,
  name public.roles_type not null default 'user'::roles_type,
  created_at timestamp with time zone null default now(),
  description character varying null,
  constraint roles_pkey primary key (id),
  constraint roles_nombre_key unique (name)
) TABLESPACE pg_default;

-- Habilitar RLS para la tabla
alter table public.roles enable row level security;

-- ## Tabla Usuarios
create table public.users (
  id uuid not null,
  name text not null,
  rol_id integer null,
  created_at timestamp without time zone null default now(),
  email character varying null,
  constraint usuarios_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_auth_fk foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint usuarios_rol_id_fkey foreign KEY (rol_id) references roles (id) on delete set null
) TABLESPACE pg_default;

-- Habilitar RLS para la tabla
alter table public.users enable row level security;

-- ## Tabla Tenant
create table public.tenant (
  id serial not null,
  fiscal_number character varying(20) not null,
  fiscal_name text not null,
  commercial_name text not null,
  address text null,
  city text null,
  zipcode text null,
  phone character varying(15) not null,
  email text not null,
  environment public.dgii_environment_type not null default 'testecf'::dgii_environment_type,
  created_at timestamp without time zone not null default now(),
  constraint tenant_pkey primary key (id),
  constraint tenant_email_key unique (email),
  constraint tenant_email_check check (
    (
      email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$'::text
    )
  ),
  constraint tenant_phone_check check (((phone)::text ~ '^[0-9+\-\s]+$'::text))
) TABLESPACE pg_default;

-- Habilitar RLS para la tabla
alter table public.tenant enable row level security;

-- ## Tabla Emisión Comprobantes
create table public.emision_comprobantes (
  id uuid not null default gen_random_uuid (),
  emisor_rnc character varying(20) null,
  emisor_razon_social text null,
  receptor_rnc character varying(20) null,
  receptor_razon_social text null,
  numero_documento character varying(30) not null,
  tipo_documento character varying(10) null,
  tipo_ecf character varying(10) null,
  es_rfc boolean null,
  fecha_emision date null,
  subtotal_sin_impuestos numeric(12, 2) null,
  total_impuesto numeric(12, 2) null,
  itbis numeric(12, 2) null,
  importe_total numeric(12, 2) null,
  dgii_filename character varying(50) null,
  dgii_estado character varying(20) null,
  dgii_mensaje_respuesta text null,
  track_id character varying(100) null,
  fecha_autorizacion date null,
  fecha_firma character varying(30) null,
  codigo_seguridad character varying(6) null,
  url_consulta_qr text null,
  document_xml text null,
  acuse_recibo_estado character varying(20) null,
  acuse_recibo_json text null,
  aprobacion_comercial_estado character varying(20) null,
  aprobacion_comercial_json text null,
  numero_documento_sustento character varying(100) null,
  secuencial_erp character varying(50) null,
  codigo_erp character varying(50) null,
  usuario_erp character varying(50) null,
  fecha_reproceso timestamp without time zone null,
  destinatarios text null,
  created_at timestamp without time zone null default now(),
  rfc_xml text null,
  constraint emision_comprobantes_pkey primary key (id),
  constraint emision_comprobantes_numero_documento_key unique (numero_documento)
) TABLESPACE pg_default;

-- Habilitar RLS para la tabla
alter table public.emision_comprobantes enable row level security;

-- ## Tabla Recepción Comprobantes
create table public.recepcion_comprobantes (
  id uuid not null default gen_random_uuid (),
  emisor_rnc character varying(20) null,
  emisor_razon_social text null,
  receptor_rnc character varying(20) null,
  receptor_razon_social text null,
  numero_documento character varying(30) not null,
  tipo_documento character varying(10) null,
  tipo_ecf character varying(10) null,
  es_rfc boolean null,
  fecha_emision date null,
  subtotal_sin_impuestos numeric(12, 2) null,
  total_impuesto numeric(12, 2) null,
  itbis numeric(12, 2) null,
  importe_total numeric(12, 2) null,
  dgii_filename character varying(50) null,
  dgii_estado character varying(20) null,
  dgii_mensaje_respuesta text null,
  track_id character varying(100) null,
  fecha_autorizacion date null,
  fecha_firma character varying(30) null,
  codigo_seguridad character varying(6) null,
  url_consulta_qr text null,
  document_xml text null,
  rfc_xml text null,
  acuse_recibo_estado character varying(20) null,
  acuse_recibo_json text null,
  aprobacion_comercial_estado character varying(20) null,
  aprobacion_comercial_json text null,
  numero_documento_sustento character varying(100) null,
  secuencial_erp character varying(50) null,
  codigo_erp character varying(50) null,
  usuario_erp character varying(50) null,
  fecha_reproceso timestamp without time zone null,
  destinatarios text null,
  created_at timestamp without time zone null default now(),
  aprobacion_comercial_dgii_json json null,
  constraint recepcion_comprobantes_pkey primary key (id),
  constraint recepcion_comprobantes_numero_documento_emisor_rnc_key unique (numero_documento, emisor_rnc)
) TABLESPACE pg_default;

-- Habilitar RLS para la tabla
alter table public.recepcion_comprobantes enable row level security;

-- ## Tabla Anulación eNCF
create table public.ancef (
  id uuid not null default gen_random_uuid (),
  emisor_rnc character varying(20) null,
  cantidad_ncf_anulados integer null default 0,
  fecha_hora_anulaciones_ncf text null,
  detalle_anulacion json null,
  document_xml text null,
  dgii_respuesta json null,
  created_at timestamp without time zone null default now(),
  dgii_estado text null,
  constraint ancef_pkey primary key (id)
) TABLESPACE pg_default;

-- Habilitar RLS para la tabla
alter table public.ancef enable row level security;

-- ## Tabla Clientes - Proveedores
create table public.clientes_proveedores (
  id serial not null,
  usuario character varying(20) not null,
  nombre text not null,
  correo text not null,
  es_cliente boolean null default false,
  es_proveedor boolean null default false,
  estado text not null,
  created_at timestamp without time zone null default now(),
  constraint clientes_proveedores_pkey primary key (id),
  constraint clientes_proveedores_correo_key unique (correo),
  constraint clientes_proveedores_usuario_key unique (usuario),
  constraint clientes_proveedores_correo_check check (
    (
      correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$'::text
    )
  ),
  constraint clientes_proveedores_estado_check check (
    (
      estado = any (array['activo'::text, 'inactivo'::text])
    )
  )
) TABLESPACE pg_default;

-- Habilitar RLS para la tabla
alter table public.clientes_proveedores enable row level security;

-- # Función para crear usuarios en schema public.users, al crearlo desde auth.users
create or replace function public.create_user_in_public (
  p_id uuid,
  p_email text,
  p_name text,
  p_rol_id int
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER as $$
BEGIN
  -- 1) Verificar si el que llama (auth.uid()) es super_admin o admin en public.users
  IF NOT EXISTS (
    SELECT 1
      FROM public.users u
      JOIN public.roles r ON u.rol_id = r.id
     WHERE u.id = auth.uid()
       AND r.name IN ('super_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Solo un super_admin o un admin pueden crear usuarios en public.users';
  END IF;

  -- 2) Insertar en public.users con el mismo ID que existe en auth.users
  INSERT INTO public.users(id, email, name, rol_id)
  VALUES (p_id, p_email, p_name, p_rol_id);

END;
$$;

-- Dar permisos de ejecución a usuarios autenticados (o al rol que necesitemos)
grant
execute on FUNCTION public.create_user_in_public (uuid, text, text, int) to authenticated;

-- # RLS Policies para las tablas.

-- ## Tabla Roles
-- ### CREATE
CREATE policy "Allow authenticated admin users to insert into roles" on "public"."roles" as PERMISSIVE for INSERT to authenticated
with
  check (
    (
      exists (
        select
          1
        from
          (
            users u
            join roles r on ((u.rol_id = r.id))
          )
        where
          (
            (u.id = auth.uid ())
            and (r.name = 'admin'::roles_type)
          )
      )
    )
  );
-- ### READ
CREATE policy "Enable read access for all authenticated users" on "public"."roles" as PERMISSIVE for
select
  to authenticated using (true);
-- ### UPDATE
CREATE policy "Allow authenticated admin users to update roles" on "public"."roles" as PERMISSIVE
for update
  to authenticated using (
    (
      exists (
        select
          1
        from
          (
            users u
            join roles r on ((u.rol_id = r.id))
          )
        where
          (
            (u.id = auth.uid ())
            and (r.name = 'admin'::roles_type)
          )
      )
    )
  );
-- ### DELETE
CREATE policy "Allow authenticated admin users to delete roles" on "public"."roles" as PERMISSIVE for DELETE to authenticated using (
  (
    exists (
      select
        1
      from
        (
          users u
          join roles r on ((u.rol_id = r.id))
        )
      where
        (
          (u.id = auth.uid ())
          and (r.name = 'admin'::roles_type)
        )
    )
  )
);

-- ## Tabla Usuarios
-- ### CREATE
create policy "Allow authenticated admin users to insert into users" on "public"."users" as PERMISSIVE for INSERT to authenticated
with
  check (
    (
      exists (
        select
          1
        from
          (
            users u
            join roles r on ((u.rol_id = r.id))
          )
        where
          (
            (u.id = auth.uid ())
            and (r.name = 'admin'::roles_type)
          )
      )
    )
  );

-- ### READ
create policy "Enable read access for all authenticated users" on "public"."users" as PERMISSIVE for
select
  to authenticated using (true);

-- ### UPDATE
create policy "Allow authenticated admin users to update users" on "public"."users" as PERMISSIVE
for update
  to authenticated using (
    (
      exists (
        select
          1
        from
          (
            users u
            join roles r on ((u.rol_id = r.id))
          )
        where
          (
            (u.id = auth.uid ())
            and (r.name = 'admin'::roles_type)
          )
      )
    )
  );

-- ### DELETE
create policy "Allow authenticated admin users to delete users" on "public"."users" as PERMISSIVE for DELETE to authenticated using (
  (
    exists (
      select
        1
      from
        (
          users u
          join roles r on ((u.rol_id = r.id))
        )
      where
        (
          (u.id = auth.uid ())
          and (r.name = 'admin'::roles_type)
        )
    )
  )
);

-- ## Tabla Tenant
-- ### CREATE
-- ### READ
create policy "Enable read access for all authenticated users" on "public"."tenant" as PERMISSIVE for
select
  to authenticated using (true);

-- ### UPDATE
create policy "Allow authenticated admin users to update tenants" on "public"."tenant" as PERMISSIVE
for update
  to authenticated using (
    (
      exists (
        select
          1
        from
          (
            users u
            join roles r on ((u.rol_id = r.id))
          )
        where
          (
            (u.id = auth.uid ())
            and (r.name = 'admin'::roles_type)
          )
      )
    )
  );

-- ### DELETE

-- ## Tabla Emisión Comprobantes
-- ### CREATE
-- ### READ
create policy "Enable read access for all authenticated users" on "public"."emision_comprobantes" as PERMISSIVE for
select
  to authenticated using (true);

-- ### UPDATE
-- ### DELETE

-- ## Tabla Recepción Comprobantes
-- ### CREATE
-- ### READ
create policy "Enable read access for all authenticated users" on "public"."recepcion_comprobantes" as PERMISSIVE for
select
  to authenticated using (true);

-- ### UPDATE
-- ### DELETE

-- ## Tabla Anulación eNCF
-- ### CREATE
create policy "Allow authenticated admin users to insert into ancef" on "public"."ancef" as PERMISSIVE for INSERT to authenticated
with
  check (
    (
      exists (
        select
          1
        from
          (
            users u
            join roles r on ((u.rol_id = r.id))
          )
        where
          (
            (u.id = auth.uid ())
            and (r.name = 'admin'::roles_type)
          )
      )
    )
  );

-- ### READ
create policy "Enable read access for all authenticated users" on "public"."ancef" as PERMISSIVE for
select
  to authenticated using (true);

-- ### UPDATE
-- ### DELETE

-- ## Tabla Clientes - Proveedores
-- ### CREATE
-- ### READ
create policy "Enable read access for all authenticated users" on "public"."clientes_proveedores" as PERMISSIVE for
select
  to authenticated using (true);

-- ### UPDATE
-- ### DELETE

INSERT INTO public.roles (name, description)
VALUES ('super_admin', 'Rol con permisos de superadministrador');

INSERT INTO public.roles (name, description)
VALUES ('admin', 'Rol con permisos de aministrador');

INSERT INTO public.roles (name, description)
VALUES ('user', 'Rol con permisos de usario');

INSERT INTO public.tenant (fiscal_number, fiscal_name, commercial_name, address, city, zipcode, phone, email, environment)
VALUES ('fiscal_number', 'fiscal_name', 'commercial_name', 'address', 'city', 'zipcode', '8098000000', 'email@company.com', 'testecf');