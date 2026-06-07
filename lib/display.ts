import type {
  AgentStage,
  SubAccountStatus,
  TipoDeMora,
} from './database.types'

export const TIPO_DE_MORA_ORDER: TipoDeMora[] = ['B0', 'B1', 'B2', 'B3', 'B4', 'Judicial']

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
  backlog: 'bg-slate-100 text-slate-600 border-slate-200',
  nuevo: 'bg-blue-50 text-blue-700 border-blue-200',
  en_construccion: 'bg-amber-50 text-amber-700 border-amber-200',
  entregado_qa: 'bg-violet-50 text-violet-700 border-violet-200',
  iterando_qa: 'bg-orange-50 text-orange-700 border-orange-200',
  listo_para_mostrar: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  en_produccion: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  iterando_cliente: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
}

export const SUB_ACCOUNT_STATUS_BADGE: Record<SubAccountStatus, string> = {
  onboarding: 'bg-blue-50 text-blue-700 border-blue-200',
  adoption: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  renewal: 'bg-amber-50 text-amber-700 border-amber-200',
  churn_risk: 'bg-orange-50 text-orange-700 border-orange-200',
  churned: 'bg-rose-50 text-rose-700 border-rose-200',
}

// ── Descripciones (tooltips) ─────────────────────────────────

export const SUB_ACCOUNT_STATUS_DESC: Record<SubAccountStatus, string> = {
  onboarding: 'Cliente nuevo que todavía no lanzó su primera campaña.',
  adoption: 'Ya lanzó al menos una campaña con 30 minutos reales.',
  success: 'Ya hizo al menos una recarga de minutos.',
  renewal: 'Negociando la renovación de su contrato antes de continuar (no es churn risk).',
  churn_risk: 'En riesgo de darse de baja o con señales de decrecimiento.',
  churned: 'Ya no es cliente.',
}

export const AGENT_STAGE_DESC: Record<AgentStage, string> = {
  backlog: 'Planeado, pero faltan definiciones esenciales para empezar a construirlo.',
  nuevo: 'Esperando el kickoff para crear los tickets y que el IE arranque el desarrollo.',
  en_construccion: 'El IE lo está construyendo.',
  entregado_qa: 'QA está creando los casos de prueba (TC) y testeándolos.',
  iterando_qa: 'QA reabrió tickets que hay que resolver antes de lanzar.',
  listo_para_mostrar: 'En condiciones de ser probado por el cliente.',
  en_produccion: 'Ya corrió carteras en producción con clientes reales.',
  iterando_cliente: 'El cliente pidió cambios que impiden seguir corriendo.',
}

// ── Tags de agente (independientes entre sí) ─────────────────
// is_live: el agente está en vivo. is_active: vigente vs dado de baja.

export const AGENT_LIVE_BADGE = 'bg-emerald-50 text-emerald-700 border-emerald-200'
export const AGENT_INACTIVE_BADGE = 'bg-rose-50 text-rose-700 border-rose-200'

export const AGENT_LIVE_DESC = 'Corriendo activamente campañas en producción con clientes reales.'
export const AGENT_ACTIVE_DESC = 'Activo: corrió al menos una campaña en los últimos 90 días.'
export const AGENT_INACTIVE_DESC = 'Baja: sin campañas en los últimos 90 días.'

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
