import Link from 'next/link'
import { Badge } from '@/components/Badge'
import { AgentStageBadge } from '@/components/StatusBadge'
import { getAllAgents, isUsingMockData } from '@/lib/queries'
import {
  AGENT_INACTIVE_BADGE,
  AGENT_INACTIVE_DESC,
  AGENT_LIVE_BADGE,
  AGENT_LIVE_DESC,
} from '@/lib/display'

export const dynamic = 'force-dynamic'

const GRID =
  'grid grid-cols-[minmax(12rem,2.2fr)_minmax(7rem,1fr)_minmax(5rem,0.9fr)_minmax(5rem,0.9fr)_minmax(5rem,0.9fr)_minmax(4rem,auto)] items-center gap-3'

export default async function AgentsPage() {
  const agents = await getAllAgents()
  const usingMock = isUsingMockData()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Agentes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {agents.length} {agents.length === 1 ? 'agente' : 'agentes'} en todas las organizaciones.
          </p>
        </div>
        <Link
          href="/agents/new"
          className="shrink-0 rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
        >
          + Nuevo agente
        </Link>
      </header>

      {usingMock && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Datos de ejemplo (mock local). Las acciones se reinician al reiniciar el server.
        </div>
      )}

      {agents.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-8 text-center text-sm text-slate-500">
          No hay agentes todavía. Se crean dentro de un cliente.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div
            className={`${GRID} border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase`}
          >
            <span>Agente</span>
            <span>Etapa</span>
            <span>Onb</span>
            <span>CS</span>
            <span>IE</span>
            <span className="text-right">Estado</span>
          </div>

          <div className="divide-y divide-slate-200">
            {agents.map((a) => (
              <div key={a.id} className={`${GRID} px-3 py-2 text-sm`}>
                <Link
                  href={`/agents/${a.id}`}
                  className="truncate font-medium text-slate-900 hover:underline"
                  title={a.derivedName}
                >
                  {a.derivedName}
                </Link>
                <span>
                  <AgentStageBadge stage={a.currentStage} />
                </span>
                <span className="truncate text-slate-500" title={a.onb?.name ?? '—'}>
                  {a.onb?.name ?? '—'}
                </span>
                <span className="truncate text-slate-500" title={a.cs?.name ?? '—'}>
                  {a.cs?.name ?? '—'}
                </span>
                <span className="truncate text-slate-500" title={a.ie?.name ?? '—'}>
                  {a.ie?.name ?? '—'}
                </span>
                <span className="flex items-center justify-end gap-1">
                  {a.isLive && (
                    <Badge label="Live" className={AGENT_LIVE_BADGE} title={AGENT_LIVE_DESC} />
                  )}
                  {!a.isActive && (
                    <Badge label="Baja" className={AGENT_INACTIVE_BADGE} title={AGENT_INACTIVE_DESC} />
                  )}
                  {a.isActive && !a.isLive && <span className="text-slate-300">—</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
