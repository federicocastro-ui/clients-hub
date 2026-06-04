import type {
  AgentStage,
  SubAccountStatus,
  TipoDeMora,
} from './database.types'

// Modelo de vista para la lista jerárquica aplanada:
//   Status de sub cuenta → Sub cuenta (con cliente como etiqueta) → Agente
// El cliente ya no es un nivel de agrupación ni tiene status propio.

export interface PersonRef {
  id: string
  name: string
}

export interface AgentRow {
  id: string
  derivedName: string
  tipoDeMora: TipoDeMora
  countryName: string
  currentStage: AgentStage
  isLive: boolean
  isActive: boolean
  onb: PersonRef | null
  cs: PersonRef | null
  ie: PersonRef | null
}

export interface SubAccountRow {
  id: string
  name: string
  clientId: string
  clientName: string
  tier: number
  status: SubAccountStatus
  vendedor: PersonRef | null
  agents: AgentRow[]
  // Derivados de los agentes de la sub cuenta
  agentCount: number
  onbSet: PersonRef[]
  csSet: PersonRef[]
  ieSet: PersonRef[]
}

export interface StatusGroup {
  status: SubAccountStatus
  subAccountCount: number
  subAccounts: SubAccountRow[]
}

// ── Modelos de las vistas de detalle ─────────────────────────

import type { StageLog } from './stage-metrics'

export interface FixedLink {
  label: string
  url: string
}

export interface AgentDetail {
  id: string
  derivedName: string
  tipoDeMora: TipoDeMora
  countryName: string
  currentStage: AgentStage
  isLive: boolean
  isActive: boolean
  onb: PersonRef | null
  cs: PersonRef | null
  ie: PersonRef | null
  clientId: string
  clientName: string
  subAccountId: string
  subAccountName: string
  links: FixedLink[] // los 5 links fijos presentes (no nulos)
  stageLogs: StageLog[]
}

export interface SubAccountAgentRow {
  id: string
  derivedName: string
  currentStage: AgentStage
  tipoDeMora: TipoDeMora
  countryName: string
  isLive: boolean
  isActive: boolean
}

export interface SubAccountDetail {
  id: string
  name: string
  tier: number
  status: SubAccountStatus
  vendedor: PersonRef | null
  clientId: string
  clientName: string
  onbSet: PersonRef[]
  csSet: PersonRef[]
  ieSet: PersonRef[]
  agents: SubAccountAgentRow[]
}

export interface ClientSubAccountRow {
  id: string
  name: string
  tier: number
  status: SubAccountStatus
  vendedor: PersonRef | null
  agentCount: number
}

export interface ClientDetail {
  id: string
  name: string
  createdAt: string
  onbSet: PersonRef[]
  csSet: PersonRef[]
  ieSet: PersonRef[]
  subAccounts: ClientSubAccountRow[]
}
