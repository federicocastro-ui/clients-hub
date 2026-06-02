import type { RawClient } from './queries'

// ─────────────────────────────────────────────────────────────
// Dataset mock SOLO para desarrollo / verificación visual.
// Se usa como fallback cuando NEXT_PUBLIC_SUPABASE_URL no está
// configurado. Replica el seed de Ilumia (supabase/seeds/001) y
// agrega un segundo cliente "acme" en_construccion para demostrar
// el agrupamiento por status y las agregaciones derivadas.
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
    status: 'live',
    created_at: '2026-05-10T12:00:00Z',
    sub_accounts: [
      {
        id: 'sa-1',
        name: 'Directv',
        tier: 2,
        status: 'success',
        agents: [
          {
            id: 'ag-1',
            tipo_de_mora: 'B0',
            current_stage: 'en_produccion',
            country: argentina,
            onb: valentina,
            cs: martin,
            ie: lucia,
          },
          {
            id: 'ag-2',
            tipo_de_mora: 'B1',
            current_stage: 'iterando_qa',
            country: argentina,
            onb: valentina,
            cs: martin,
            ie: diego,
          },
        ],
      },
    ],
  },
  {
    id: 'cl-2',
    name: 'acme',
    status: 'en_construccion',
    created_at: '2026-05-28T09:30:00Z',
    sub_accounts: [
      {
        id: 'sa-2',
        name: 'Wallet',
        tier: 1,
        status: 'onboarding',
        agents: [
          {
            id: 'ag-3',
            tipo_de_mora: 'B2',
            current_stage: 'en_construccion',
            country: mexico,
            onb: valentina,
            cs: lucia,
            ie: diego,
          },
          {
            id: 'ag-4',
            tipo_de_mora: 'Judicial',
            current_stage: 'backlog',
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
        status: 'churn_risk',
        agents: [
          {
            id: 'ag-5',
            tipo_de_mora: 'B3',
            current_stage: 'entregado_qa',
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
    status: 'live',
    created_at: '2026-04-15T10:00:00Z',
    sub_accounts: [
      {
        id: 'sa-4',
        name: 'Tarjetas',
        tier: 1,
        status: 'success',
        agents: [
          {
            id: 'ag-6',
            tipo_de_mora: 'B0',
            current_stage: 'en_produccion',
            country: colombia,
            onb: sofia,
            cs: tomas,
            ie: lucia,
          },
          {
            id: 'ag-7',
            tipo_de_mora: 'B1',
            current_stage: 'iterando_cliente',
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
        agents: [
          {
            id: 'ag-8',
            tipo_de_mora: 'B2',
            current_stage: 'listo_para_mostrar',
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
    status: 'en_construccion',
    created_at: '2026-05-30T14:20:00Z',
    sub_accounts: [
      {
        id: 'sa-6',
        name: 'Cobranza temprana',
        tier: 4,
        status: 'onboarding',
        agents: [
          {
            id: 'ag-9',
            tipo_de_mora: 'B3',
            current_stage: 'nuevo',
            country: mexico,
            onb: valentina,
            cs: sofia,
            ie: diego,
          },
          {
            id: 'ag-10',
            tipo_de_mora: 'B4',
            current_stage: 'en_construccion',
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
