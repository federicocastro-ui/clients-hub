import { createClient } from '@supabase/supabase-js'
import type { Database, AgentStage, ClientStatus, SubAccountStatus, TipoDeMora } from './database.types'
import { deriveAgentName } from './display'
import type {
  AgentRow,
  ClientGroup,
  PersonRef,
  StatusGroup,
  SubAccountRow,
} from './view-model'

// ── Shape "crudo" devuelto por Supabase (nested select) / mock ─

export interface RawPerson {
  id: string
  name: string
}

export interface RawAgent {
  id: string
  tipo_de_mora: TipoDeMora
  current_stage: AgentStage
  country: { id: string; name: string } | { id: string; name: string }[] | null
  onb: RawPerson | RawPerson[] | null
  cs: RawPerson | RawPerson[] | null
  ie: RawPerson | RawPerson[] | null
}

export interface RawSubAccount {
  id: string
  name: string
  tier: number
  status: SubAccountStatus
  agents: RawAgent[]
}

export interface RawClient {
  id: string
  name: string
  status: ClientStatus
  created_at: string
  sub_accounts: RawSubAccount[]
}

// PostgREST puede devolver embeds to-one como objeto o (según versión)
// como array de un elemento. Normalizamos a objeto | null.
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

const STATUS_ORDER: ClientStatus[] = ['en_construccion', 'live']
const MORA_ORDER: TipoDeMora[] = ['B0', 'B1', 'B2', 'B3', 'B4', 'Judicial']

// ── Acceso a datos ───────────────────────────────────────────

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

async function fetchRawClients(): Promise<RawClient[]> {
  // Fallback a mock cuando Supabase no está configurado (solo dev).
  if (!supabaseConfigured()) {
    const { MOCK_CLIENTS } = await import('./mock-data')
    return MOCK_CLIENTS
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data, error } = await supabase
    .from('clients')
    .select(
      `
      id, name, status, created_at,
      sub_accounts (
        id, name, tier, status,
        agents (
          id, tipo_de_mora, current_stage,
          country:countries!country_id ( id, name ),
          onb:team_members!onb_id ( id, name ),
          cs:team_members!cs_id ( id, name ),
          ie:team_members!ie_id ( id, name )
        )
      )
    `,
    )
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Supabase query failed: ${error.message}`)
  return (data ?? []) as unknown as RawClient[]
}

// ── Helpers de agregación derivada ───────────────────────────

function uniquePeople(people: (PersonRef | null)[]): PersonRef[] {
  const map = new Map<string, PersonRef>()
  for (const p of people) {
    if (p && !map.has(p.id)) map.set(p.id, p)
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function buildAgentRow(raw: RawAgent, clientName: string, subAccountName: string): AgentRow {
  const country = one(raw.country)
  const onb = one(raw.onb)
  const cs = one(raw.cs)
  const ie = one(raw.ie)
  return {
    id: raw.id,
    tipoDeMora: raw.tipo_de_mora,
    currentStage: raw.current_stage,
    countryName: country?.name ?? '—',
    onb,
    cs,
    ie,
    derivedName: deriveAgentName({
      clientName,
      subAccountName,
      tipoDeMora: raw.tipo_de_mora,
      countryName: country?.name ?? '—',
    }),
  }
}

function buildSubAccountRow(raw: RawSubAccount, clientName: string): SubAccountRow {
  const agents = raw.agents.map((a) => buildAgentRow(a, clientName, raw.name))
  return {
    id: raw.id,
    name: raw.name,
    tier: raw.tier,
    status: raw.status,
    agents,
    agentCount: agents.length,
    onbSet: uniquePeople(agents.map((a) => a.onb)),
    csSet: uniquePeople(agents.map((a) => a.cs)),
    ieSet: uniquePeople(agents.map((a) => a.ie)),
  }
}

function buildClientGroup(raw: RawClient): ClientGroup {
  const subAccounts = raw.sub_accounts.map((s) => buildSubAccountRow(s, raw.name))
  const allAgents = subAccounts.flatMap((s) => s.agents)

  const moraSet = new Set(allAgents.map((a) => a.tipoDeMora))
  const tiposDeMora = MORA_ORDER.filter((m) => moraSet.has(m))

  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    createdAt: raw.created_at,
    subAccounts,
    subAccountCount: subAccounts.length,
    agentCount: allAgents.length,
    tiposDeMora,
  }
}

// ── API pública ──────────────────────────────────────────────

export async function getClientHubData(): Promise<StatusGroup[]> {
  const rawClients = await fetchRawClients()
  const clients = rawClients.map(buildClientGroup)

  return STATUS_ORDER.map((status) => {
    const inStatus = clients.filter((c) => c.status === status)
    return {
      status,
      clientCount: inStatus.length,
      clients: inStatus.sort((a, b) => a.name.localeCompare(b.name)),
    }
  }).filter((group) => group.clients.length > 0)
}

export function isUsingMockData(): boolean {
  return !supabaseConfigured()
}
