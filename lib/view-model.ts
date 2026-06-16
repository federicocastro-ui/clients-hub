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

// Fila del panel de administración de organizaciones.
export interface OrgAdminRow {
  id: string
  name: string
  createdAt: string
  subAccountCount: number
  agentCount: number
}

// Fila de la vista global de Agentes (todos los agentes, aplanados).
export interface AgentListRow {
  id: string
  derivedName: string
  clientId: string // organización
  clientName: string
  subAccountId: string // cliente (sub-cuenta)
  subAccountName: string
  tipoDeMora: TipoDeMora
  countryName: string
  currentStage: AgentStage
  isLive: boolean
  isActive: boolean
  onb: PersonRef | null
  cs: PersonRef | null
  ie: PersonRef | null
}

// Campos editables de un agente (precarga de formularios).
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

// Modelo de la página de gestión de la organización (edición por parte).
export interface ManageAgent extends AgentEditData {
  label: string
}

export interface ManageClient {
  id: string
  name: string
  tier: number
  status: SubAccountStatus
  vendedorId: string | null
  agents: ManageAgent[]
}

export interface OrgManageData {
  id: string
  name: string
  clients: ManageClient[]
}

// ── Modelos de las vistas de detalle ─────────────────────────

import type { StageLog } from './stage-metrics'

export interface FixedLink {
  label: string
  url: string
}

export interface AgentDocument {
  id: string
  kind: 'link' | 'file'
  label: string
  url: string
}

export interface Note {
  id: string
  body: string
  author: string | null
  createdAt: string
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
