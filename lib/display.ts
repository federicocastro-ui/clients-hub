import type {
  AgentStage,
  SubAccountStatus,
} from './database.types'

// ── Etiquetas legibles (ES) ──────────────────────────────────

export const AGENT_STAGE_LABELS: Record<AgentStage, string> = {
  backlog: 'Backlog',
  nuevo: 'Nuevo',
  en_construccion: 'En construcción',
  entregado_qa: 'Entregado a QA',
  iterando_qa: 'Iterando QA',
  listo_para_mostrar: 'Listo para mostrar',
  en_produccion: 'En producción',
  iterando_cliente: 'Iterando con cliente',
}

export const SUB_ACCOUNT_STATUS_LABELS: Record<SubAccountStatus, string> = {
  onboarding: 'Onboarding',
  adoption: 'Adoption',
  success: 'Success',
  renewal: 'Renewal',
  churn_risk: 'Churn risk',
  churned: 'Churned',
}

// Orden del agrupador más alto de la lista (status de sub cuenta).
export const SUB_ACCOUNT_STATUS_ORDER: SubAccountStatus[] = [
  'onboarding',
  'adoption',
  'success',
  'renewal',
  'churn_risk',
  'churned',
]

// Orden lógico de las etapas (el agente puede avanzar o retroceder).
export const AGENT_STAGE_ORDER: AgentStage[] = [
  'backlog',
  'nuevo',
  'en_construccion',
  'entregado_qa',
  'iterando_qa',
  'listo_para_mostrar',
  'en_produccion',
  'iterando_cliente',
]

// ── Mapeo etapa → equipo(s) ──────────────────────────────────
// Config editable. Usado para agrupar el tiempo por equipo (Fase 3).
// Asunción: en_produccion → IE (no fue especificado en el spec).

export type Team = 'Onboarding' | 'IE' | 'QA'

export const STAGE_TEAM_MAP: Record<AgentStage, Team[]> = {
  backlog: ['Onboarding'],
  nuevo: ['Onboarding'],
  en_construccion: ['IE'],
  entregado_qa: ['QA'],
  iterando_qa: ['QA', 'IE'],
  listo_para_mostrar: ['Onboarding'],
  en_produccion: ['IE'],
  iterando_cliente: ['Onboarding', 'IE'],
}

// ── Clases de color para badges (Tailwind, literales completos) ─

export const AGENT_STAGE_BADGE: Record<AgentStage, string> = {
  backlog: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  nuevo: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  en_construccion: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  entregado_qa: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  iterando_qa: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  listo_para_mostrar: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  en_produccion: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  iterando_cliente: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
}

export const SUB_ACCOUNT_STATUS_BADGE: Record<SubAccountStatus, string> = {
  onboarding: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  adoption: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  renewal: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  churn_risk: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  churned: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

// ── Tags de agente (independientes entre sí) ─────────────────
// is_live: el agente está en vivo. is_active: vigente vs dado de baja.

export const AGENT_LIVE_BADGE = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
export const AGENT_INACTIVE_BADGE = 'bg-rose-500/15 text-rose-300 border-rose-500/30'

// ── Nombre derivado del agente ───────────────────────────────
// Formato: {client.name}: {sub_account.name} - {tipo_de_mora} {country.name}
// Ej: "ilumia: Directv - B0 Argentina"

export function deriveAgentName(params: {
  clientName: string
  subAccountName: string
  tipoDeMora: string
  countryName: string
}): string {
  return `${params.clientName}: ${params.subAccountName} - ${params.tipoDeMora} ${params.countryName}`
}
