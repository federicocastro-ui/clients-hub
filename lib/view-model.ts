import type {
  AgentStage,
  ClientStatus,
  SubAccountStatus,
  TipoDeMora,
} from './database.types'

// Modelo de vista para la lista jerárquica. Las agregaciones a nivel
// cliente y sub cuenta son DERIVADAS de los agentes (no columnas).

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
  onb: PersonRef | null
  cs: PersonRef | null
  ie: PersonRef | null
}

export interface SubAccountRow {
  id: string
  name: string
  tier: number
  status: SubAccountStatus
  agents: AgentRow[]
  // Derivados
  agentCount: number
  csSet: PersonRef[]
  ieSet: PersonRef[]
}

export interface ClientGroup {
  id: string
  name: string
  status: ClientStatus
  createdAt: string
  subAccounts: SubAccountRow[]
  // Derivados
  subAccountCount: number
  agentCount: number
  tiers: number[]
  countries: string[]
  tiposDeMora: TipoDeMora[]
  onbSet: PersonRef[]
  csSet: PersonRef[]
  ieSet: PersonRef[]
}

export interface StatusGroup {
  status: ClientStatus
  clientCount: number
  clients: ClientGroup[]
}
