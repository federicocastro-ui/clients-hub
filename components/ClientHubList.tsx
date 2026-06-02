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
const SUB_GRID =
  'grid grid-cols-[1.25rem_minmax(8rem,1.4fr)_3.5rem_4rem_minmax(6rem,1fr)_minmax(6rem,1fr)_7.5rem] items-center gap-2'

const AGENT_GRID =
  'grid grid-cols-[minmax(10rem,1.8fr)_10rem_7rem_4rem_minmax(9rem,1.4fr)] items-center gap-2'

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
      {/* Nivel 2: cliente */}
      <div className="border-b border-zinc-800 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-zinc-100">{client.name}</span>
          <Badge
            label={CLIENT_STATUS_LABELS[client.status]}
            className={CLIENT_STATUS_BADGE[client.status]}
          />
        </div>
        {/* Resumen derivado del cliente */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
          <span>
            {client.subAccountCount} sub {client.subAccountCount === 1 ? 'cuenta' : 'cuentas'}
          </span>
          <span className="text-zinc-600">·</span>
          <span>{client.agentCount} agentes</span>
          {client.tiers.length > 0 && (
            <>
              <span className="text-zinc-600">·</span>
              <span>Tiers {client.tiers.join(', ')}</span>
            </>
          )}
          {client.countries.length > 0 && (
            <>
              <span className="text-zinc-600">·</span>
              <span>{client.countries.join(', ')}</span>
            </>
          )}
          {client.tiposDeMora.length > 0 && (
            <>
              <span className="text-zinc-600">·</span>
              <span>{client.tiposDeMora.join(', ')}</span>
            </>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="text-zinc-500">
            Onb: <span className="text-zinc-300">{people(client.onbSet)}</span>
          </span>
          <span className="text-zinc-500">
            CS: <span className="text-zinc-300">{people(client.csSet)}</span>
          </span>
          <span className="text-zinc-500">
            IE: <span className="text-zinc-300">{people(client.ieSet)}</span>
          </span>
        </div>
      </div>

      {/* Encabezado de columnas de sub cuentas */}
      <div
        className={`${SUB_GRID} border-b border-zinc-800/60 px-3 py-1.5 text-[11px] font-medium tracking-wide text-zinc-500 uppercase`}
      >
        <span />
        <span>Sub cuenta</span>
        <span>Tier</span>
        <span>Agentes</span>
        <span>CS</span>
        <span>IE</span>
        <span>Status</span>
      </div>

      {/* Nivel 3: sub cuentas */}
      <div className="divide-y divide-zinc-800/60">
        {client.subAccounts.map((sub) => (
          <SubAccountBlock
            key={sub.id}
            sub={sub}
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
  open,
  onToggle,
}: {
  sub: SubAccountRow
  open: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`${SUB_GRID} w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/30`}
      >
        <Chevron open={open} />
        <span className="font-medium text-zinc-200">{sub.name}</span>
        <span className="text-zinc-400">T{sub.tier}</span>
        <span className="text-zinc-400">{sub.agentCount}</span>
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

      {/* Nivel 4: agentes */}
      {open && (
        <div className="bg-zinc-950/40 pb-1">
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
                <span>Onb · CS · IE</span>
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
    <div className={`${AGENT_GRID} px-3 py-1.5 pl-9 text-sm hover:bg-zinc-800/20`}>
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
      <span className="truncate text-xs text-zinc-400">
        {agent.onb?.name ?? '—'} · {agent.cs?.name ?? '—'} · {agent.ie?.name ?? '—'}
      </span>
    </div>
  )
}
