import type { AgentStage } from './database.types'
import { STAGE_TEAM_MAP, type Team } from './display'

// ─────────────────────────────────────────────────────────────
// Cálculo de tiempo por etapa y por equipo a partir de los logs
// de cambio de etapa (agent_stage_logs).
// ─────────────────────────────────────────────────────────────

export interface StageLog {
  fromStage: AgentStage | null
  toStage: AgentStage
  changedAt: string // ISO
  changedBy?: string | null
}

export interface TimelineEntry {
  fromStage: AgentStage | null
  toStage: AgentStage
  changedAt: string
  durationMs: number // tiempo en toStage en este tramo (hasta el log siguiente o now)
  isCurrent: boolean
}

export interface StageDuration {
  stage: AgentStage
  totalMs: number
}

export interface TeamDuration {
  team: Team
  totalMs: number
}

const TEAM_ORDER: Team[] = ['Onboarding', 'IE', 'QA']

/** Secuencia de cambios con la duración de cada tramo (cronológica). */
export function buildTimeline(logs: StageLog[], now: Date): TimelineEntry[] {
  const sorted = [...logs].sort(
    (a, b) => +new Date(a.changedAt) - +new Date(b.changedAt),
  )
  return sorted.map((log, i) => {
    const start = +new Date(log.changedAt)
    const end = i < sorted.length - 1 ? +new Date(sorted[i + 1].changedAt) : +now
    return {
      fromStage: log.fromStage,
      toStage: log.toStage,
      changedAt: log.changedAt,
      durationMs: Math.max(0, end - start),
      isCurrent: i === sorted.length - 1,
    }
  })
}

/**
 * Tiempo total acumulado por etapa. Si una etapa se visitó más de una vez
 * (el agente retrocedió y volvió), se suman todas las visitas.
 */
export function stageDurations(timeline: TimelineEntry[]): StageDuration[] {
  const map = new Map<AgentStage, number>()
  for (const e of timeline) {
    map.set(e.toStage, (map.get(e.toStage) ?? 0) + e.durationMs)
  }
  return [...map.entries()]
    .map(([stage, totalMs]) => ({ stage, totalMs }))
    .sort((a, b) => b.totalMs - a.totalMs)
}

/**
 * Tiempo total por equipo: suma del tiempo de las etapas que mapean a ese
 * equipo. Las etapas multi-equipo (iterando_qa, iterando_cliente) suman a
 * ambos, por eso los totales por equipo PUEDEN solaparse y no necesariamente
 * suman el tiempo total del agente.
 */
export function teamDurations(stages: StageDuration[]): TeamDuration[] {
  const map = new Map<Team, number>()
  for (const { stage, totalMs } of stages) {
    for (const team of STAGE_TEAM_MAP[stage]) {
      map.set(team, (map.get(team) ?? 0) + totalMs)
    }
  }
  return TEAM_ORDER.filter((t) => map.has(t)).map((t) => ({
    team: t,
    totalMs: map.get(t)!,
  }))
}

/** Suma de todas las etapas (tiempo total del agente desde el primer log). */
export function totalDuration(stages: StageDuration[]): number {
  return stages.reduce((acc, s) => acc + s.totalMs, 0)
}

/** Formato compacto: "12d 4h", "4h 30m", "25m". */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  return `${minutes}m`
}
