'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from './Badge'
import { AgentStageBadge, ClientStatusBadge } from './StatusBadge'
import {
  AGENT_ACTIVE_DESC,
  AGENT_INACTIVE_BADGE,
  AGENT_INACTIVE_DESC,
  AGENT_LIVE_BADGE,
  AGENT_LIVE_DESC,
  AGENT_STAGE_LABELS,
  AGENT_STAGE_ORDER,
  SUB_ACCOUNT_STATUS_LABELS,
  SUB_ACCOUNT_STATUS_ORDER,
} from '@/lib/display'
import type { AgentStage, SubAccountStatus } from '@/lib/database.types'
import type {
  AgentRow,
  PersonRef,
  StatusGroup,
  SubAccountRow,
} from '@/lib/view-model'

type FilterKey = 'status' | 'stage' | 'onb' | 'cs' | 'ie' | 'tier'
interface FilterOption {
  value: string
  label: string
  count: number
}
interface FilterCategory {
  key: FilterKey
  label: string
  options: FilterOption[]
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`}
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
      className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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

  // ── Filtros multi-select (estilo Linear, por categorías) ──
  const emptyFilters = (): Record<FilterKey, Set<string>> => ({
    status: new Set(),
    stage: new Set(),
    onb: new Set(),
    cs: new Set(),
    ie: new Set(),
    tier: new Set(),
  })
  const [filters, setFilters] = useState<Record<FilterKey, Set<string>>>(emptyFilters)
  const toggleValue = (key: FilterKey, value: string) =>
    setFilters((prev) => {
      const next = { ...prev, [key]: new Set(prev[key]) }
      next[key].has(value) ? next[key].delete(value) : next[key].add(value)
      return next
    })
  const clearFilters = () => setFilters(emptyFilters())
  const activeCount = (Object.values(filters) as Set<string>[]).reduce((n, s) => n + s.size, 0)

  // Categorías + opciones con contadores (sobre todos los datos).
  const categories = useMemo<FilterCategory[]>(() => {
    const subs = groups.flatMap((g) => g.subAccounts)
    const onb = new Map<string, string>()
    const cs = new Map<string, string>()
    const ie = new Map<string, string>()
    const tiers = new Set<number>()
    for (const s of subs) {
      tiers.add(s.tier)
      for (const a of s.agents) {
        if (a.onb) onb.set(a.onb.id, a.onb.name)
        if (a.cs) cs.set(a.cs.id, a.cs.name)
        if (a.ie) ie.set(a.ie.id, a.ie.name)
      }
    }
    const personOpts = (m: Map<string, string>, role: 'onb' | 'cs' | 'ie'): FilterOption[] =>
      [...m.entries()]
        .map(([id, name]) => ({
          value: id,
          label: name,
          count: subs.filter((s) => s.agents.some((a) => a[role]?.id === id)).length,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    return [
      {
        key: 'status',
        label: 'Estado (cliente)',
        options: SUB_ACCOUNT_STATUS_ORDER.map((v) => ({
          value: v,
          label: SUB_ACCOUNT_STATUS_LABELS[v],
          count: subs.filter((s) => s.status === v).length,
        })).filter((o) => o.count > 0),
      },
      {
        key: 'stage',
        label: 'Etapa (agente)',
        options: AGENT_STAGE_ORDER.map((v) => ({
          value: v,
          label: AGENT_STAGE_LABELS[v],
          count: subs.filter((s) => s.agents.some((a) => a.currentStage === v)).length,
        })).filter((o) => o.count > 0),
      },
      { key: 'onb', label: 'Onb', options: personOpts(onb, 'onb') },
      { key: 'cs', label: 'CS', options: personOpts(cs, 'cs') },
      { key: 'ie', label: 'IE', options: personOpts(ie, 'ie') },
      {
        key: 'tier',
        label: 'Tier',
        options: [...tiers]
          .sort((a, b) => a - b)
          .map((t) => ({
            value: String(t),
            label: `Tier ${t}`,
            count: subs.filter((s) => s.tier === t).length,
          })),
      },
    ]
  }, [groups])

  // Match: dentro de una categoría OR; entre categorías AND.
  const filteredGroups = useMemo(() => {
    if (activeCount === 0) return groups
    const match = (sub: SubAccountRow) => {
      if (filters.status.size && !filters.status.has(sub.status)) return false
      if (filters.tier.size && !filters.tier.has(String(sub.tier))) return false
      if (filters.stage.size && !sub.agents.some((a) => filters.stage.has(a.currentStage)))
        return false
      if (filters.onb.size && !sub.agents.some((a) => a.onb && filters.onb.has(a.onb.id)))
        return false
      if (filters.cs.size && !sub.agents.some((a) => a.cs && filters.cs.has(a.cs.id)))
        return false
      if (filters.ie.size && !sub.agents.some((a) => a.ie && filters.ie.has(a.ie.id)))
        return false
      return true
    }
    return groups
      .map((g) => {
        const subAccounts = g.subAccounts.filter(match)
        return { ...g, subAccounts, subAccountCount: subAccounts.length }
      })
      .filter((g) => g.subAccounts.length > 0)
  }, [groups, filters, activeCount])

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        categories={categories}
        filters={filters}
        toggleValue={toggleValue}
        clearFilters={clearFilters}
        activeCount={activeCount}
      />

      {filteredGroups.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-8 text-center text-sm text-slate-500">
          {activeCount > 0 ? 'Ningún cliente coincide con los filtros.' : 'No hay clientes para mostrar.'}
        </div>
      ) : (
        filteredGroups.map((group) => {
        const statusOpen = !collapsedStatus.has(group.status)
        return (
          <section key={group.status}>
            {/* Nivel 1: status de sub cuenta */}
            <button
              onClick={() => toggleStatus(group.status)}
              className="mb-2 flex w-full items-center gap-2 text-left"
            >
              <Chevron open={statusOpen} />
              <ClientStatusBadge status={group.status} />
              <span className="text-xs text-slate-500">
                {group.subAccountCount}{' '}
                {group.subAccountCount === 1 ? 'cliente' : 'clientes'}
              </span>
            </button>

            {statusOpen && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                {/* Encabezado de columnas */}
                <div
                  className={`${SUB_GRID} border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase`}
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
        })
      )}
    </div>
  )
}

function FunnelIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 3h12l-4.5 5.5V13L6.5 11V8.5L2 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OptionLabel({ catKey, option }: { catKey: FilterKey; option: FilterOption }) {
  if (catKey === 'status') return <ClientStatusBadge status={option.value as SubAccountStatus} />
  if (catKey === 'stage') return <AgentStageBadge stage={option.value as AgentStage} />
  return <span className="truncate text-slate-700">{option.label}</span>
}

function FilterBar({
  categories,
  filters,
  toggleValue,
  clearFilters,
  activeCount,
}: {
  categories: FilterCategory[]
  filters: Record<FilterKey, Set<string>>
  toggleValue: (key: FilterKey, value: string) => void
  clearFilters: () => void
  activeCount: number
}) {
  const [open, setOpen] = useState(false)
  const [cat, setCat] = useState<FilterKey | null>(null)
  const current = categories.find((c) => c.key === cat) ?? null
  const close = () => {
    setOpen(false)
    setCat(null)
  }

  // Chips de filtros activos.
  const chips = categories.flatMap((c) =>
    c.options.filter((o) => filters[c.key].has(o.value)).map((o) => ({ key: c.key, ...o })),
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          <FunnelIcon />
          Filtros
          {activeCount > 0 && (
            <span className="rounded-md bg-accent px-1.5 text-xs font-medium text-white">
              {activeCount}
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={close} />
            <div className="absolute left-0 z-20 mt-1.5 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.14)]">
              {!current ? (
                <ul className="py-1">
                  {categories.map((c) => (
                    <li key={c.key}>
                      <button
                        onClick={() => setCat(c.key)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span>{c.label}</span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          {filters[c.key].size > 0 && (
                            <span className="font-medium text-accent">{filters[c.key].size}</span>
                          )}
                          <Chevron open={false} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  <button
                    onClick={() => setCat(null)}
                    className="flex w-full items-center gap-1 border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    <span aria-hidden>←</span> {current.label}
                  </button>
                  <ul className="max-h-72 overflow-auto py-1">
                    {current.options.map((o) => {
                      const checked = filters[current.key].has(o.value)
                      return (
                        <li key={o.value}>
                          <button
                            onClick={() => toggleValue(current.key, o.value)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-50"
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                checked
                                  ? 'border-accent bg-accent text-white'
                                  : 'border-slate-300 text-transparent'
                              }`}
                            >
                              <CheckIcon />
                            </span>
                            <span className="flex min-w-0 flex-1 items-center">
                              <OptionLabel catKey={current.key} option={o} />
                            </span>
                            <span className="text-xs text-slate-400">{o.count}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {chips.map((ch) => (
        <button
          key={`${ch.key}:${ch.value}`}
          onClick={() => toggleValue(ch.key, ch.value)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
          title="Quitar filtro"
        >
          {ch.label}
          <span className="text-slate-400">✕</span>
        </button>
      ))}

      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="rounded-xl px-2 py-1 text-xs text-slate-500 hover:text-slate-900"
        >
          Limpiar
        </button>
      )}
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
  const headerBg = even ? 'bg-white' : 'bg-slate-50'
  const agentsBg = even ? 'bg-slate-50' : 'bg-white'

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
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
        className={`${SUB_GRID} w-full cursor-pointer px-3 py-2 text-left text-sm ${headerBg} hover:bg-slate-100`}
      >
        <Chevron open={open} />
        <Link
          href={`/clients/${sub.clientId}`}
          onClick={(e) => e.stopPropagation()}
          className="truncate text-slate-500 hover:text-slate-800 hover:underline"
          title={sub.clientName}
        >
          {sub.clientName}
        </Link>
        <span className="truncate font-medium text-slate-900" title={sub.name}>
          {sub.name}
        </span>
        <span className="text-slate-500">T{sub.tier}</span>
        <span className="text-slate-500">{sub.agentCount}</span>
        <span className="truncate text-slate-700" title={sub.vendedor?.name ?? '—'}>
          {sub.vendedor?.name ?? '—'}
        </span>
        <span className="truncate text-slate-700" title={people(sub.onbSet)}>
          {people(sub.onbSet)}
        </span>
        <span className="truncate text-slate-700" title={people(sub.csSet)}>
          {people(sub.csSet)}
        </span>
        <span className="truncate text-slate-700" title={people(sub.ieSet)}>
          {people(sub.ieSet)}
        </span>
        <EyeLink href={`/sub-accounts/${sub.id}`} label="Ver detalle del cliente" />
      </div>

      {/* Nivel 3: agentes */}
      {open && (
        <div className={`border-t border-slate-200 ${agentsBg}`}>
          {sub.agents.length === 0 ? (
            <p className="px-3 py-2 pl-6 text-xs text-slate-500">Sin agentes.</p>
          ) : (
            <>
              <div
                className={`${AGENT_GRID} px-3 py-1.5 pl-6 text-[11px] font-medium tracking-wide text-slate-400 uppercase`}
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
    <div className={`${AGENT_GRID} px-3 py-1.5 pl-6 text-sm hover:bg-slate-50`}>
      <span className="truncate font-medium text-slate-800" title={agent.derivedName}>
        {agent.derivedName}
      </span>
      <span>
        <AgentStageBadge stage={agent.currentStage} />
      </span>
      <span className="text-slate-500">{agent.countryName}</span>
      <span className="text-slate-500">{agent.tipoDeMora}</span>
      <span>
        {agent.isLive ? (
          <Badge label="Live" className={AGENT_LIVE_BADGE} title={AGENT_LIVE_DESC} />
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </span>
      <span>
        {agent.isActive ? (
          <span className="cursor-help text-xs text-slate-500" title={AGENT_ACTIVE_DESC}>
            Activo
          </span>
        ) : (
          <Badge label="Baja" className={AGENT_INACTIVE_BADGE} title={AGENT_INACTIVE_DESC} />
        )}
      </span>
      <EyeLink href={`/agents/${agent.id}`} label="Ver detalle del agente" />
    </div>
  )
}
