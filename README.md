# Kleva Client Hub

Herramienta interna de Kleva — Single Source of Truth de clientes, sub cuentas y agentes de voz. Usada por los equipos de Onboarding, Customer Success e Implementation Engineers.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (Postgres + Storage)
- **Deploy**: Vercel

---

## Correr localmente

### 1. Clonar y dependencias

```bash
git clone <repo-url>
cd client-hub
npm install
```

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Editá `.env.local` con los valores reales de tu proyecto Supabase:

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon / public key |

### 3. Aplicar migraciones en Supabase

**Opción A — SQL Editor (más rápida para empezar):**

1. Abrí tu proyecto en [supabase.com](https://supabase.com)
2. Andá a **SQL Editor**
3. Pegá y ejecutá el contenido de `supabase/migrations/001_initial_schema.sql`
4. Luego pegá y ejecutá `supabase/seeds/001_seed_ilumia.sql`

**Opción B — Supabase CLI:**

```bash
# Instalar CLI si no lo tenés
npm install -g supabase

# Linkar al proyecto
supabase link --project-ref <project-ref>

# Aplicar migraciones
supabase db push

# Aplicar seed
supabase db execute --file supabase/seeds/001_seed_ilumia.sql
```

### 4. Configurar Supabase Storage

En el Dashboard de Supabase → Storage, crear un bucket llamado **`agent-documents`** con acceso público para lectura.

O via SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-documents', 'agent-documents', true);
```

### 5. Correr el servidor de desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

---

## Desplegar en Vercel

1. Importar el repo en [vercel.com](https://vercel.com)
2. Agregar las variables de entorno en el panel de Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático en cada push a `main`

---

## Estructura del proyecto

```
client-hub/
├── app/                    # Next.js App Router (páginas y layouts)
├── lib/
│   ├── supabase.ts         # Cliente de Supabase
│   └── database.types.ts   # Tipos TypeScript del schema
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Enums, tablas, FKs, índices, trigger
│   └── seeds/
│       └── 001_seed_ilumia.sql      # Datos de ejemplo (Ilumia)
├── .env.local.example      # Plantilla de variables de entorno
└── README.md
```

---

## Arquitectura y decisiones

- **Sin auth por ahora**: el cliente de Supabase usa la anon key. La estructura está lista para sumar Supabase Auth + RLS después sin cambiar el modelo de datos.
- **Nombre del agente derivado**: se calcula en la UI como `{client.name}: {sub_account.name} - {tipo_de_mora} {country.name}`. No se almacena.
- **Logging de etapas**: un trigger de Postgres inserta automáticamente en `agent_stage_logs` cada vez que cambia `agents.current_stage`, incluyendo el log inicial al crear el agente.
- **metadata JSONB**: campo exploratorio en `agents`. Cuando un campo se vuelva estable, se promueve a columna propia con una nueva migración.
- **Asignaciones Onb/CS/IE**: viven a nivel agente como única fuente de verdad. Sub cuentas y clientes las muestran derivadas por query.
