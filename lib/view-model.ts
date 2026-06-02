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
