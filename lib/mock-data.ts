import type { RawClient } from './queries'

// ─────────────────────────────────────────────────────────────
// Dataset mock SOLO para desarrollo / verificación visual.
// Se usa como fallback cuando NEXT_PUBLIC_SUPABASE_URL no está
// configurado. La lista se agrupa por status de SUB CUENTA, así que
// las sub cuentas están repartidas en varios status para demostrar
// el agrupamiento. Los agentes tienen is_live e is_active.
//
// Para quitarlo: borrar este archivo y el fallback en queries.ts.
// ─────────────────────────────────────────────────────────────

const valentina = { id: 'tm-1', name: 'Valentina Ríos' }
const martin = { id: 'tm-2', name: 'Martín Sosa' }
const lucia = { id: 'tm-3', name: 'Lucía Mendez' }
const diego = { id: 'tm-4', name: 'Diego Fernández' }
const sofia = { id: 'tm-5', name: 'Sofía Castro' }
const tomas = { id: 'tm-6', name: 'Tomás Vega' }

const argentina = { id: 'co-1', name: 'Argentina' }
const mexico = { id: 'co-2', name: 'México' }
const colombia = { id: 'co-3', name: 'Colombia' }
const chile = { id: 'co-4', name: 'Chile' }

const INITIAL_TEAM = [valentina, martin, lucia, diego, sofia, tomas]
const INITIAL_COUNTRIES = [argentina, mexico, colombia, chile]

const INITIAL_CLIENTS: RawClient[] = [
  {
    id: 'cl-1',
    name: 'ilumia',
    created_at: '2026-05-10T12:00:00Z',
    sub_accounts: [
      {
        id: 'sa-1',
        name: 'Directv',
        tier: 2,
        status: 'success',
        vendedor: diego,
        agents: [
          {
            id: 'ag-1',
            tipo_de_mora: 'B0',
            current_stage: 'en_produccion',
            is_live: true,
            is_active: true,
            country: argentina,
            onb: valentina,
            cs: martin,
            ie: lucia,
            linear_url: 'https://linear.app/kleva/issue/DEMO-1',
            notion_url: 'https://notion.so/kleva/demo-b0',
            figma_url: 'https://figma.com/file/demo-b0',
            qa_form_url: 'https://forms.gle/demo-b0',
            manual_url: 'https://notion.so/kleva/manual-b0',
          },
          {
            id: 'ag-2',
            tipo_de_mora: 'B1',
            current_stage: 'iterando_qa',
            is_live: false,
            is_active: true,
            country: argentina,
            onb: valentina,
            cs: martin,
            ie: diego,
            linear_url: 'https://linear.app/kleva/issue/DEMO-2',
            notion_url: 'https://notion.so/kleva/demo-b1',
          },
        ],
      },
    ],
  },
  {
    id: 'cl-2',
    name: 'acme',
    created_at: '2026-05-28T09:30:00Z',
    sub_accounts: [
      {
        id: 'sa-2',
        name: 'Wallet',
        tier: 1,
        status: 'onboarding',
        vendedor: tomas,
        agents: [
          {
            id: 'ag-3',
            tipo_de_mora: 'B2',
            current_stage: 'en_construccion',
            is_live: false,
            is_active: true,
            country: mexico,
            onb: valentina,
            cs: lucia,
            ie: diego,
          },
          {
            id: 'ag-4',
            tipo_de_mora: 'Judicial',
            current_stage: 'backlog',
            is_live: false,
            is_active: true,
            country: argentina,
            onb: martin,
            cs: lucia,
            ie: diego,
          },
        ],
      },
      {
        id: 'sa-3',
        name: 'Créditos',
        tier: 3,
        status: 'churned',
        vendedor: tomas,
        agents: [
          {
            id: 'ag-5',
            tipo_de_mora: 'B3',
            current_stage: 'entregado_qa',
            is_live: false,
            is_active: false, // dado de baja (sub cuenta churned)
            country: mexico,
            onb: martin,
            cs: martin,
            ie: lucia,
          },
        ],
      },
    ],
  },
  {
    id: 'cl-3',
    name: 'nexa',
    created_at: '2026-04-15T10:00:00Z',
    sub_accounts: [
      {
        id: 'sa-4',
        name: 'Tarjetas',
        tier: 1,
        status: 'success',
        vendedor: sofia,
        agents: [
          {
            id: 'ag-6',
            tipo_de_mora: 'B0',
            current_stage: 'en_produccion',
            is_live: true,
            is_active: true,
            country: colombia,
            onb: sofia,
            cs: tomas,
            ie: lucia,
          },
          {
            id: 'ag-7',
            tipo_de_mora: 'B1',
            current_stage: 'iterando_cliente',
            is_live: true,
            is_active: true,
            country: colombia,
            onb: sofia,
            cs: tomas,
            ie: diego,
          },
        ],
      },
      {
        id: 'sa-5',
        name: 'Préstamos',
        tier: 2,
        status: 'renewal',
        vendedor: sofia,
        agents: [
          {
            id: 'ag-8',
            tipo_de_mora: 'B2',
            current_stage: 'listo_para_mostrar',
            is_live: false,
            is_active: true,
            country: chile,
            onb: sofia,
            cs: martin,
            ie: tomas,
          },
        ],
      },
    ],
  },
  {
    id: 'cl-4',
    name: 'vala',
    created_at: '2026-05-30T14:20:00Z',
    sub_accounts: [
      {
        id: 'sa-6',
        name: 'Cobranza temprana',
        tier: 4,
        status: 'adoption',
        vendedor: martin,
        agents: [
          {
            id: 'ag-9',
            tipo_de_mora: 'B3',
            current_stage: 'nuevo',
            is_live: false,
            is_active: true,
            country: mexico,
            onb: valentina,
            cs: sofia,
            ie: diego,
          },
          {
            id: 'ag-10',
            tipo_de_mora: 'B4',
            current_stage: 'en_construccion',
            is_live: false,
            is_active: true,
            country: argentina,
            onb: valentina,
            cs: sofia,
            ie: tomas,
          },
        ],
      },
    ],
  },
]

// ── Stage logs mock ──────────────────────────────────────────
// Timestamps relativos a "ahora" para que las duraciones siempre den
// positivas, sin importar el reloj del sistema. ag-1 (Directv B0)
// retrocede de etapa (iterando_qa → en_construccion → ...) para validar
// la acumulación de tiempo cuando una etapa se visita más de una vez.

const DAY = 86_400_000
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString()

export interface MockStageLog {
  id: string
  from_stage: string | null
  to_stage: string
  changed_at: string
}

// Los literales no llevan id; se asignan ids estables al inicializar el store.
const INITIAL_STAGE_LOGS: Record<string, Omit<MockStageLog, 'id'>[]> = {
  // Directv B0 — progresión con un retroceso a en_construccion
  'ag-1': [
    { from_stage: null, to_stage: 'backlog', changed_at: daysAgo(40) },
    { from_stage: 'backlog', to_stage: 'nuevo', changed_at: daysAgo(36) },
    { from_stage: 'nuevo', to_stage: 'en_construccion', changed_at: daysAgo(33) },
    { from_stage: 'en_construccion', to_stage: 'entregado_qa', changed_at: daysAgo(24) },
    { from_stage: 'entregado_qa', to_stage: 'iterando_qa', changed_at: daysAgo(20) },
    // retrocede a construcción y vuelve a avanzar
    { from_stage: 'iterando_qa', to_stage: 'en_construccion', changed_at: daysAgo(17) },
    { from_stage: 'en_construccion', to_stage: 'entregado_qa', changed_at: daysAgo(12) },
    { from_stage: 'entregado_qa', to_stage: 'listo_para_mostrar', changed_at: daysAgo(8) },
    { from_stage: 'listo_para_mostrar', to_stage: 'en_produccion', changed_at: daysAgo(3) },
  ],
  // Directv B1 — progresión simple hasta iterando_qa
  'ag-2': [
    { from_stage: null, to_stage: 'backlog', changed_at: daysAgo(28) },
    { from_stage: 'backlog', to_stage: 'nuevo', changed_at: daysAgo(25) },
    { from_stage: 'nuevo', to_stage: 'en_construccion', changed_at: daysAgo(22) },
    { from_stage: 'en_construccion', to_stage: 'entregado_qa', changed_at: daysAgo(9) },
    { from_stage: 'entregado_qa', to_stage: 'iterando_qa', changed_at: daysAgo(4) },
  ],
}

// ── Store mutable compartido vía globalThis ──────────────────
// Next bundlea Server Actions y Server Components por separado, lo que puede
// crear instancias distintas de este módulo. Guardamos el estado en globalThis
// para que las mutaciones (create/edit) sean visibles desde cualquier bundle.

export interface MockAgentDocument {
  id: string
  kind: 'link' | 'file'
  label: string
  url: string
}

const INITIAL_AGENT_DOCS: Record<string, MockAgentDocument[]> = {
  'ag-1': [
    {
      id: 'doc-1',
      kind: 'link',
      label: 'Carpeta de grabaciones',
      url: 'https://drive.google.com/kleva/demo-b0',
    },
  ],
}

export interface MockNote {
  id: string
  body: string
  author: string | null
  created_at: string
}

// Notas por CLIENTE (sub cuenta), keyed por sub_account id.
const INITIAL_SUBACCOUNT_NOTES: Record<string, MockNote[]> = {
  'sa-1': [
    {
      id: 'note-1',
      body: 'El cliente pidió bajar la frecuencia de llamados los fines de semana.',
      author: 'Martín Sosa',
      created_at: daysAgo(2),
    },
  ],
}

// Contacto: persona que pertenece a una organización (client_id) y se
// vincula a cero o más de sus clientes/sub-cuentas (sub_account_ids).
export interface MockContact {
  id: string
  client_id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  notes: string | null
  created_at: string
  sub_account_ids: string[]
}

const INITIAL_CONTACTS: MockContact[] = [
  {
    id: 'ct-1',
    client_id: 'cl-1', // ilumia
    name: 'Juan Pérez',
    email: 'juan.perez@ilumia.com',
    phone: '+54 11 5555-1234',
    role: 'Gerente de Cobranzas',
    notes: 'Punto de contacto principal para operaciones.',
    created_at: daysAgo(30),
    sub_account_ids: ['sa-1'], // Directv
  },
  {
    id: 'ct-2',
    client_id: 'cl-2', // acme
    name: 'María González',
    email: 'maria.gonzalez@acme.com',
    phone: '+52 55 4444-9876',
    role: 'CFO',
    notes: null,
    created_at: daysAgo(20),
    sub_account_ids: ['sa-2', 'sa-3'], // Wallet, Créditos
  },
  {
    id: 'ct-3',
    client_id: 'cl-3', // nexa
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@nexa.com',
    phone: null,
    role: 'Jefe de Riesgo',
    notes: 'Prefiere comunicación por email.',
    created_at: daysAgo(12),
    sub_account_ids: [],
  },
]

interface MockStore {
  clients: RawClient[]
  countries: { id: string; name: string }[]
  teamMembers: { id: string; name: string }[]
  stageLogs: Record<string, MockStageLog[]>
  agentDocs: Record<string, MockAgentDocument[]>
  subAccountNotes: Record<string, MockNote[]>
  contacts: MockContact[]
}

// Asigna ids estables a los logs iniciales (id = `${agentId}-log-${i}`).
function withLogIds(
  logs: Record<string, Omit<MockStageLog, 'id'>[]>,
): Record<string, MockStageLog[]> {
  const out: Record<string, MockStageLog[]> = {}
  for (const [agentId, arr] of Object.entries(logs)) {
    out[agentId] = arr.map((l, i) => ({ ...l, id: `${agentId}-log-${i}` }))
  }
  return out
}

const g = globalThis as unknown as { __klevaMock?: MockStore }
const store: MockStore =
  g.__klevaMock ??
  (g.__klevaMock = {
    clients: INITIAL_CLIENTS,
    countries: INITIAL_COUNTRIES,
    teamMembers: INITIAL_TEAM,
    stageLogs: withLogIds(INITIAL_STAGE_LOGS),
    agentDocs: INITIAL_AGENT_DOCS,
    subAccountNotes: INITIAL_SUBACCOUNT_NOTES,
    contacts: INITIAL_CONTACTS,
  })

export const MOCK_CLIENTS = store.clients
export const MOCK_COUNTRIES = store.countries
export const MOCK_TEAM_MEMBERS = store.teamMembers
export const MOCK_STAGE_LOGS = store.stageLogs
export const MOCK_AGENT_DOCS = store.agentDocs
export const MOCK_SUBACCOUNT_NOTES = store.subAccountNotes
export const MOCK_CONTACTS = store.contacts

// Para agentes sin logs explícitos: un único log inicial al stage actual.
export function mockStageLogsFor(agentId: string, currentStage: string): MockStageLog[] {
  return (
    MOCK_STAGE_LOGS[agentId] ?? [
      { id: `${agentId}-log-0`, from_stage: null, to_stage: currentStage, changed_at: daysAgo(10) },
    ]
  )
}
