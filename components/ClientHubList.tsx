'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from './Badge'
import {
  AGENT_INACTIVE_BADGE,
  AGENT_LIVE_BADGE,
  AGENT_STAGE_BADGE,
  AGENT_STAGE_LABELS,
  SUB_ACCOUNT_STATUS_BADGE,
  SUB_ACCOUNT_STATUS_LABELS,
} from '@/lib/display'
import type { SubAccountStatus } from '@/lib/database.types'
import type {
  AgentRow,
  PersonRef,
  StatusGroup,
  SubAccountRow,
} from '@/lib/view-model'

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function people(set: PersonRef[]): string {
  if (set.length === 0) return '—'
  return set.map((p) => p.name).join(', ')
}

// Botón "ojito" para abrir el detalle de la fila.
function EyeLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      title={label}
      aria-label={label}
      className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-100"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M1 8s2.6-4.5 7-4.5S15 8 15 8s-2.6 4.5-7 4.5S1 8 1 8z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="2" />
      </svg>
    </Link>
  )
}

// Columnas de la fila de sub cuenta (template para sumar columnas sin romper
// el layout). El status NO es columna: es el agrupador de la sección.
// chevron · Cliente · Sub cuenta · Tier · Agentes · Vendedor · Onb · CS · IE · ojo
const SUB_GRID =
  'grid grid-cols-[1.25rem_minmax(4.5rem,1fr)_minmax(5rem,1.1fr)_2.25rem_3rem_minmax(4.5rem,1fr)_minmax(4rem,1fr)_minmax(4rem,1fr)_minmax(4rem,1fr)_1.75rem] items-center gap-2'

// Agente · Etapa · País · Mora · Live · Activo · ojo
const AGENT_GRID =
  'grid grid-cols-[minmax(8rem,1.6fr)_9rem_minmax(4rem,0.8fr)_3.5rem_3.25rem_4rem_1.75rem] items-center gap-2'

export function ClientHubList({ groups }: { groups: StatusGroup[] }) {
  // Default: secciones de status abiertas, sub cuentas colapsadas.
  // Trackeamos lo EXPANDIDO; vacío = colapsado.
  const [collapsedStatus, setCollapsedStatus] = useState<Set<SubAccountStatus>>(new Set())
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set())

  const toggleStatus = (s: SubAccountStatus) =>
    setCollapsedStatus((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })

  const toggleSub = (id: string) =>
    setExpandedSubs((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
        No hay clientes para mostrar.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const statusOpen = !collapsedStatus.has(group.status)
        return (
          <section key={group.status}>
            {/* Nivel 1: status de sub cuenta */}
            <button
              onClick={() => toggleStatus(group.status)}
              className="mb-2 flex w-full items-center gap-2 text-left"
            >
              <Chevron open={statusOpen} />
              <Badge
                label={SUB_ACCOUNT_STATUS_LABELS[group.status]}
                className={SUB_ACCOUNT_STATUS_BADGE[group.status]}
              />
              <span className="text-xs text-zinc-500">
                {group.subAccountCount}{' '}
                {group.subAccountCount === 1 ? 'cliente' : 'clientes'}
              </span>
            </button>

            {statusOpen && (
              <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
                {/* Encabezado de columnas */}
                <div
                  className={`${SUB_GRID} border-b border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-medium tracking-wide text-zinc-500 uppercase`}
                >
                  <span />
                  <span>Organización</span>
                  <span>Cliente</span>
                  <span>Tier</span>
                  <span>Agentes</span>
                  <span>Vendedor</span>
                  <span>Onb</span>
                  <span>CS</span>
                  <span>IE</span>
                  <span />
                </div>

                {/* Nivel 2: sub cuentas, con tonos alternados */}
                <div className="flex flex-col gap-1.5 p-1.5">
                  {group.subAccounts.map((sub, i) => (
                    <SubAccountBlock
                      key={sub.id}
                      sub={sub}
                      index={i}
                      open={expandedSubs.has(sub.id)}
                      onToggle={() => toggleSub(sub.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function SubAccountBlock({
  sub,
  index,
  open,
  onToggle,
}: {
  sub: SubAccountRow
  index: number
  open: boolean
  onToggle: () => void
}) {
  const even = index % 2 === 0
  const headerBg = even ? 'bg-zinc-800/30' : 'bg-zinc-900/70'
  const agentsBg = even ? 'bg-zinc-950/50' : 'bg-black/50'

  return (
    <div className="overflow-hidden rounded-md border border-zinc-800">
      {/* Fila clickeable (toggle). Cliente y Sub cuenta son links a su
          detalle (stopPropagation para no togglear al navegar). */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
        className={`${SUB_GRID} w-full cursor-pointer px-3 py-2 text-left text-sm ${headerBg} hover:bg-zinc-700/30`}
      >
        <Chevron open={open} />
        <Link
          href={`/clients/${sub.clientId}`}
          onClick={(e) => e.stopPropagation()}
          className="truncate text-zinc-400 hover:text-zinc-200 hover:underline"
          title={sub.clientName}
        >
          {sub.clientName}
        </Link>
        <span className="truncate font-medium text-zinc-100" title={sub.name}>
          {sub.name}
        </span>
        <span className="text-zinc-400">T{sub.tier}</span>
        <span className="text-zinc-400">{sub.agentCount}</span>
        <span className="truncate text-zinc-300" title={sub.vendedor?.name ?? '—'}>
          {sub.vendedor?.name ?? '—'}
        </span>
        <span className="truncate text-zinc-300" title={people(sub.onbSet)}>
          {people(sub.onbSet)}
        </span>
        <span className="truncate text-zinc-300" title={people(sub.csSet)}>
          {people(sub.csSet)}
        </span>
        <span className="truncate text-zinc-300" title={people(sub.ieSet)}>
          {people(sub.ieSet)}
        </span>
        <EyeLink href={`/sub-accounts/${sub.id}`} label="Ver detalle del cliente" />
      </div>

      {/* Nivel 3: agentes */}
      {open && (
        <div className={`border-t border-zinc-800 ${agentsBg}`}>
          {sub.agents.length === 0 ? (
            <p className="px-3 py-2 pl-6 text-xs text-zinc-500">Sin agentes.</p>
          ) : (
            <>
              <div
                className={`${AGENT_GRID} px-3 py-1.5 pl-6 text-[11px] font-medium tracking-wide text-zinc-600 uppercase`}
              >
                <span>Agente</span>
                <span>Etapa</span>
                <span>País</span>
                <span>Mora</span>
                <span>Live</span>
                <span>Activo</span>
                <span />
              </div>
              {sub.agents.map((agent) => (
                <AgentRowView key={agent.id} agent={agent} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function AgentRowView({ agent }: { agent: AgentRow }) {
  return (
    <div className={`${AGENT_GRID} px-3 py-1.5 pl-6 text-sm hover:bg-zinc-800/30`}>
      <span className="truncate font-medium text-zinc-200" title={agent.derivedName}>
        {agent.derivedName}
      </span>
      <span>
        <Badge
          label={AGENT_STAGE_LABELS[agent.currentStage]}
          className={AGENT_STAGE_BADGE[agent.currentStage]}
        />
      </span>
      <span className="text-zinc-400">{agent.countryName}</span>
      <span className="text-zinc-400">{agent.tipoDeMora}</span>
      <span>
        {agent.isLive ? (
          <Badge label="Live" className={AGENT_LIVE_BADGE} />
        ) : (
          <span className="text-zinc-600">—</span>
        )}
      </span>
      <span>
        {agent.isActive ? (
          <span className="text-xs text-zinc-500">Activo</span>
        ) : (
          <Badge label="Baja" className={AGENT_INACTIVE_BADGE} />
        )}
      </span>
      <EyeLink href={`/agents/${agent.id}`} label="Ver detalle del agente" />
    </div>
  )
}
