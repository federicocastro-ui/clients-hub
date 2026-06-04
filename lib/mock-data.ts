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

export const MOCK_CLIENTS: RawClient[] = [
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
  from_stage: string | null
  to_stage: string
  changed_at: string
}

export const MOCK_STAGE_LOGS: Record<string, MockStageLog[]> = {
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

// Para agentes sin logs explícitos: un único log inicial al stage actual.
export function mockStageLogsFor(agentId: string, currentStage: string): MockStageLog[] {
  return (
    MOCK_STAGE_LOGS[agentId] ?? [
      { from_stage: null, to_stage: currentStage, changed_at: daysAgo(10) },
    ]
  )
}
