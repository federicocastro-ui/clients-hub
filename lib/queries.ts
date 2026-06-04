import { createClient } from '@supabase/supabase-js'
import type { Database, AgentStage, SubAccountStatus, TipoDeMora } from './database.types'
import { deriveAgentName, SUB_ACCOUNT_STATUS_ORDER } from './display'
import type { StageLog } from './stage-metrics'
import type {
  AgentDetail,
  AgentRow,
  ClientDetail,
  FixedLink,
  PersonRef,
  StatusGroup,
  SubAccountDetail,
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
  is_live: boolean
  is_active: boolean
  country: { id: string; name: string } | { id: string; name: string }[] | null
  onb: RawPerson | RawPerson[] | null
  cs: RawPerson | RawPerson[] | null
  ie: RawPerson | RawPerson[] | null
  // Links fijos (solo se usan en el detalle del agente; opcionales en la lista)
  linear_url?: string | null
  notion_url?: string | null
  figma_url?: string | null
  qa_form_url?: string | null
  manual_url?: string | null
}

export interface RawSubAccount {
  id: string
  name: string
  tier: number
  status: SubAccountStatus
  vendedor: RawPerson | RawPerson[] | null
  agents: RawAgent[]
}

export interface RawClient {
  id: string
  name: string
  created_at: string
  sub_accounts: RawSubAccount[]
}

// PostgREST puede devolver embeds to-one como objeto o (según versión)
// como array de un elemento. Normalizamos a objeto | null.
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

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
      id, name, created_at,
      sub_accounts (
        id, name, tier, status,
        vendedor:team_members!vendedor_id ( id, name ),
        agents (
          id, tipo_de_mora, current_stage, is_live, is_active,
          linear_url, notion_url, figma_url, qa_form_url, manual_url,
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
  return {
    id: raw.id,
    tipoDeMora: raw.tipo_de_mora,
    currentStage: raw.current_stage,
    isLive: raw.is_live,
    isActive: raw.is_active,
    countryName: country?.name ?? '—',
    onb: one(raw.onb),
    cs: one(raw.cs),
    ie: one(raw.ie),
    derivedName: deriveAgentName({
      clientName,
      subAccountName,
      tipoDeMora: raw.tipo_de_mora,
      countryName: country?.name ?? '—',
    }),
  }
}

function buildSubAccountRow(
  raw: RawSubAccount,
  client: { id: string; name: string },
): SubAccountRow {
  const agents = raw.agents.map((a) => buildAgentRow(a, client.name, raw.name))
  return {
    id: raw.id,
    name: raw.name,
    clientId: client.id,
    clientName: client.name,
    tier: raw.tier,
    status: raw.status,
    vendedor: one(raw.vendedor),
    agents,
    agentCount: agents.length,
    onbSet: uniquePeople(agents.map((a) => a.onb)),
    csSet: uniquePeople(agents.map((a) => a.cs)),
    ieSet: uniquePeople(agents.map((a) => a.ie)),
  }
}

// ── API pública ──────────────────────────────────────────────

export async function getClientHubData(): Promise<StatusGroup[]> {
  const rawClients = await fetchRawClients()

  // Aplanamos: todas las sub cuentas de todos los clientes en una lista,
  // cada una con su cliente como etiqueta.
  const allSubAccounts: SubAccountRow[] = rawClients.flatMap((client) =>
    client.sub_accounts.map((sa) =>
      buildSubAccountRow(sa, { id: client.id, name: client.name }),
    ),
  )

  // Agrupamos por status de sub cuenta, en el orden definido.
  return SUB_ACCOUNT_STATUS_ORDER.map((status) => {
    const inStatus = allSubAccounts
      .filter((sa) => sa.status === status)
      .sort(
        (a, b) =>
          a.clientName.localeCompare(b.clientName) || a.name.localeCompare(b.name),
      )
    return {
      status,
      subAccountCount: inStatus.length,
      subAccounts: inStatus,
    }
  }).filter((group) => group.subAccounts.length > 0)
}

export function isUsingMockData(): boolean {
  return !supabaseConfigured()
}

// ── Datos de referencia (para formularios) ───────────────────

export async function getTeamMembers(): Promise<PersonRef[]> {
  if (!supabaseConfigured()) {
    const { MOCK_TEAM_MEMBERS } = await import('./mock-data')
    return [...MOCK_TEAM_MEMBERS].sort((a, b) => a.name.localeCompare(b.name))
  }
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data, error } = await supabase
    .from('team_members')
    .select('id, name')
    .order('name')
  if (error) throw new Error(`Supabase team_members query failed: ${error.message}`)
  return (data ?? []) as PersonRef[]
}

export async function getCountries(): Promise<PersonRef[]> {
  if (!supabaseConfigured()) {
    const { MOCK_COUNTRIES } = await import('./mock-data')
    return [...MOCK_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name))
  }
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data, error } = await supabase
    .from('countries')
    .select('id, name')
    .order('name')
  if (error) throw new Error(`Supabase countries query failed: ${error.message}`)
  return (data ?? []) as PersonRef[]
}

// ── Detalle ──────────────────────────────────────────────────

function buildFixedLinks(raw: RawAgent): FixedLink[] {
  const links: FixedLink[] = []
  if (raw.linear_url) links.push({ label: 'Linear', url: raw.linear_url })
  if (raw.notion_url) links.push({ label: 'Notion', url: raw.notion_url })
  if (raw.figma_url) links.push({ label: 'Figma', url: raw.figma_url })
  if (raw.qa_form_url) links.push({ label: 'Formulario QA', url: raw.qa_form_url })
  if (raw.manual_url) links.push({ label: 'Manual', url: raw.manual_url })
  return links
}

async function fetchStageLogs(agentId: string, currentStage: string): Promise<StageLog[]> {
  if (!supabaseConfigured()) {
    const { mockStageLogsFor } = await import('./mock-data')
    return mockStageLogsFor(agentId, currentStage).map((l) => ({
      fromStage: l.from_stage as StageLog['fromStage'],
      toStage: l.to_stage as StageLog['toStage'],
      changedAt: l.changed_at,
    }))
  }
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data, error } = await supabase
    .from('agent_stage_logs')
    .select('from_stage, to_stage, changed_at')
    .eq('agent_id', agentId)
    .order('changed_at', { ascending: true })
  if (error) throw new Error(`Supabase stage logs query failed: ${error.message}`)
  const rows = (data ?? []) as unknown as Array<{
    from_stage: StageLog['fromStage']
    to_stage: StageLog['toStage']
    changed_at: string
  }>
  return rows.map((l) => ({
    fromStage: l.from_stage,
    toStage: l.to_stage,
    changedAt: l.changed_at,
  }))
}

export async function getAgentDetail(id: string): Promise<AgentDetail | null> {
  const rawClients = await fetchRawClients()
  for (const client of rawClients) {
    for (const sa of client.sub_accounts) {
      const agent = sa.agents.find((a) => a.id === id)
      if (!agent) continue
      const country = one(agent.country)
      const countryName = country?.name ?? '—'
      const stageLogs = await fetchStageLogs(agent.id, agent.current_stage)
      return {
        id: agent.id,
        tipoDeMora: agent.tipo_de_mora,
        countryName,
        currentStage: agent.current_stage,
        isLive: agent.is_live,
        isActive: agent.is_active,
        onb: one(agent.onb),
        cs: one(agent.cs),
        ie: one(agent.ie),
        clientId: client.id,
        clientName: client.name,
        subAccountId: sa.id,
        subAccountName: sa.name,
        links: buildFixedLinks(agent),
        stageLogs,
        derivedName: deriveAgentName({
          clientName: client.name,
          subAccountName: sa.name,
          tipoDeMora: agent.tipo_de_mora,
          countryName,
        }),
      }
    }
  }
  return null
}

export async function getSubAccountDetail(id: string): Promise<SubAccountDetail | null> {
  const rawClients = await fetchRawClients()
  for (const client of rawClients) {
    const sa = client.sub_accounts.find((s) => s.id === id)
    if (!sa) continue
    const row = buildSubAccountRow(sa, { id: client.id, name: client.name })
    return {
      id: row.id,
      name: row.name,
      tier: row.tier,
      status: row.status,
      vendedor: row.vendedor,
      clientId: client.id,
      clientName: client.name,
      onbSet: row.onbSet,
      csSet: row.csSet,
      ieSet: row.ieSet,
      agents: row.agents.map((a) => ({
        id: a.id,
        derivedName: a.derivedName,
        currentStage: a.currentStage,
        tipoDeMora: a.tipoDeMora,
        countryName: a.countryName,
        isLive: a.isLive,
        isActive: a.isActive,
      })),
    }
  }
  return null
}

export interface AgentEditData {
  id: string
  subAccountId: string
  tipoDeMora: TipoDeMora
  countryId: string | null
  currentStage: AgentStage
  onbId: string | null
  csId: string | null
  ieId: string | null
  isLive: boolean
  isActive: boolean
  linearUrl: string | null
  notionUrl: string | null
  figmaUrl: string | null
  qaFormUrl: string | null
  manualUrl: string | null
}

export async function getAgentForEdit(id: string): Promise<AgentEditData | null> {
  const rawClients = await fetchRawClients()
  for (const client of rawClients) {
    for (const sa of client.sub_accounts) {
      const a = sa.agents.find((ag) => ag.id === id)
      if (!a) continue
      return {
        id: a.id,
        subAccountId: sa.id,
        tipoDeMora: a.tipo_de_mora,
        countryId: one(a.country)?.id ?? null,
        currentStage: a.current_stage,
        onbId: one(a.onb)?.id ?? null,
        csId: one(a.cs)?.id ?? null,
        ieId: one(a.ie)?.id ?? null,
        isLive: a.is_live,
        isActive: a.is_active,
        linearUrl: a.linear_url ?? null,
        notionUrl: a.notion_url ?? null,
        figmaUrl: a.figma_url ?? null,
        qaFormUrl: a.qa_form_url ?? null,
        manualUrl: a.manual_url ?? null,
      }
    }
  }
  return null
}

export async function getClientDetail(id: string): Promise<ClientDetail | null> {
  const rawClients = await fetchRawClients()
  const client = rawClients.find((c) => c.id === id)
  if (!client) return null

  const subAccountRows = client.sub_accounts.map((sa) =>
    buildSubAccountRow(sa, { id: client.id, name: client.name }),
  )
  const allAgents = subAccountRows.flatMap((s) => s.agents)

  return {
    id: client.id,
    name: client.name,
    createdAt: client.created_at,
    onbSet: uniquePeople(allAgents.map((a) => a.onb)),
    csSet: uniquePeople(allAgents.map((a) => a.cs)),
    ieSet: uniquePeople(allAgents.map((a) => a.ie)),
    subAccounts: subAccountRows.map((s) => ({
      id: s.id,
      name: s.name,
      tier: s.tier,
      status: s.status,
      vendedor: s.vendedor,
      agentCount: s.agentCount,
    })),
  }
}
