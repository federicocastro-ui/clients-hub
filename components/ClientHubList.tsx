'use client'

import { useState } from 'react'
import { Badge } from './Badge'
import {
  AGENT_STAGE_BADGE,
  AGENT_STAGE_LABELS,
  CLIENT_STATUS_BADGE,
  CLIENT_STATUS_LABELS,
  SUB_ACCOUNT_STATUS_BADGE,
  SUB_ACCOUNT_STATUS_LABELS,
} from '@/lib/display'
import type { ClientStatus } from '@/lib/database.types'
import type {
  AgentRow,
  ClientGroup,
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

// Columnas de la fila de sub cuenta. Definidas como template para poder
// sumar columnas nuevas después sin romper el layout.
// chevron · Sub cuenta · Tier · Agentes · Onb · CS · IE · Status
const SUB_GRID =
  'grid grid-cols-[1.25rem_minmax(7rem,1.3fr)_3rem_4rem_minmax(5.5rem,1fr)_minmax(5.5rem,1fr)_minmax(5.5rem,1fr)_7rem] items-center gap-2'

// Agente · Etapa · País · Mora
const AGENT_GRID =
  'grid grid-cols-[minmax(12rem,2fr)_11rem_minmax(6rem,1fr)_5rem] items-center gap-2'

export function ClientHubList({ groups }: { groups: StatusGroup[] }) {
  const [collapsedStatus, setCollapsedStatus] = useState<Set<ClientStatus>>(new Set())
  const [collapsedSub, setCollapsedSub] = useState<Set<string>>(new Set())

  const toggleStatus = (s: ClientStatus) =>
    setCollapsedStatus((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })

  const toggleSub = (id: string) =>
    setCollapsedSub((prev) => {
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
            {/* Nivel 1: status del cliente */}
            <button
              onClick={() => toggleStatus(group.status)}
              className="mb-2 flex w-full items-center gap-2 text-left"
            >
              <Chevron open={statusOpen} />
              <Badge
                label={CLIENT_STATUS_LABELS[group.status]}
                className={CLIENT_STATUS_BADGE[group.status]}
              />
              <span className="text-xs text-zinc-500">
                {group.clientCount} {group.clientCount === 1 ? 'cliente' : 'clientes'}
              </span>
            </button>

            {statusOpen && (
              <div className="flex flex-col gap-3">
                {group.clients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    collapsedSub={collapsedSub}
                    toggleSub={toggleSub}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ClientCard({
  client,
  collapsedSub,
  toggleSub,
}: {
  client: ClientGroup
  collapsedSub: Set<string>
  toggleSub: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40">
      {/* Nivel 2: cliente (resumen de alto nivel) */}
      <div className="border-b border-zinc-800 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-zinc-100">{client.name}</span>
          <Badge
            label={CLIENT_STATUS_LABELS[client.status]}
            className={CLIENT_STATUS_BADGE[client.status]}
          />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
          <span>
            {client.subAccountCount} sub {client.subAccountCount === 1 ? 'cuenta' : 'cuentas'}
          </span>
          <span className="text-zinc-600">·</span>
          <span>{client.agentCount} agentes</span>
          {client.tiposDeMora.length > 0 && (
            <>
              <span className="text-zinc-600">·</span>
              <span>{client.tiposDeMora.join(', ')}</span>
            </>
          )}
        </div>
      </div>

      {/* Encabezado de columnas de sub cuentas */}
      <div
        className={`${SUB_GRID} border-b border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-medium tracking-wide text-zinc-500 uppercase`}
      >
        <span />
        <span>Sub cuenta</span>
        <span>Tier</span>
        <span>Agentes</span>
        <span>Onb</span>
        <span>CS</span>
        <span>IE</span>
        <span>Status</span>
      </div>

      {/* Nivel 3: sub cuentas — cada una en su bloque, con tonos alternados */}
      <div className="flex flex-col gap-1.5 p-1.5">
        {client.subAccounts.map((sub, i) => (
          <SubAccountBlock
            key={sub.id}
            sub={sub}
            index={i}
            open={!collapsedSub.has(sub.id)}
            onToggle={() => toggleSub(sub.id)}
          />
        ))}
      </div>
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
  // Tonos alternados para distinguir visualmente una sub cuenta de otra.
  const even = index % 2 === 0
  const headerBg = even ? 'bg-zinc-800/30' : 'bg-zinc-900/70'
  const agentsBg = even ? 'bg-zinc-950/50' : 'bg-black/50'

  return (
    <div className="overflow-hidden rounded-md border border-zinc-800">
      <button
        onClick={onToggle}
        className={`${SUB_GRID} w-full px-3 py-2 text-left text-sm ${headerBg} hover:bg-zinc-700/30`}
      >
        <Chevron open={open} />
        <span className="font-medium text-zinc-100">{sub.name}</span>
        <span className="text-zinc-400">T{sub.tier}</span>
        <span className="text-zinc-400">{sub.agentCount}</span>
        <span className="truncate text-zinc-300" title={people(sub.onbSet)}>
          {people(sub.onbSet)}
        </span>
        <span className="truncate text-zinc-300" title={people(sub.csSet)}>
          {people(sub.csSet)}
        </span>
        <span className="truncate text-zinc-300" title={people(sub.ieSet)}>
          {people(sub.ieSet)}
        </span>
        <Badge
          label={SUB_ACCOUNT_STATUS_LABELS[sub.status]}
          className={SUB_ACCOUNT_STATUS_BADGE[sub.status]}
        />
      </button>

      {/* Nivel 4: agentes — recesado y nesteado bajo su sub cuenta */}
      {open && (
        <div className={`border-t border-zinc-800 ${agentsBg}`}>
          {sub.agents.length === 0 ? (
            <p className="px-3 py-2 pl-9 text-xs text-zinc-500">Sin agentes.</p>
          ) : (
            <>
              <div
                className={`${AGENT_GRID} px-3 py-1.5 pl-9 text-[11px] font-medium tracking-wide text-zinc-600 uppercase`}
              >
                <span>Agente</span>
                <span>Etapa</span>
                <span>País</span>
                <span>Mora</span>
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
    <div className={`${AGENT_GRID} px-3 py-1.5 pl-9 text-sm hover:bg-zinc-800/30`}>
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
    </div>
  )
}
