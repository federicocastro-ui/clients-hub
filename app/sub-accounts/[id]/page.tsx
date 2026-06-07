import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/Badge'
import { AgentStageBadge, ClientStatusBadge } from '@/components/StatusBadge'
import { Breadcrumb, Field, Section, people } from '@/components/detail-ui'
import { NotesPanel } from '@/components/NotesPanel'
import { getSubAccountDetail, getSubAccountNotes } from '@/lib/queries'
import {
  AGENT_INACTIVE_BADGE,
  AGENT_INACTIVE_DESC,
  AGENT_LIVE_BADGE,
  AGENT_LIVE_DESC,
} from '@/lib/display'

export const dynamic = 'force-dynamic'

export default async function SubAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sub = await getSubAccountDetail(id)
  if (!sub) notFound()
  const notes = await getSubAccountNotes(id)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: 'Hub', href: '/' },
            { label: sub.clientName, href: `/clients/${sub.clientId}` },
            { label: sub.name },
          ]}
        />
      </div>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">{sub.name}</h1>
            <ClientStatusBadge status={sub.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Organización:{' '}
            <Link
              href={`/clients/${sub.clientId}`}
              className="text-slate-700 hover:text-slate-900 hover:underline"
            >
              {sub.clientName}
            </Link>
          </p>
        </div>
        <Link
          href={`/sub-accounts/${sub.id}/edit`}
          className="shrink-0 rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100"
        >
          Editar
        </Link>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="flex flex-col gap-4">
        <Section title="Información">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Tier">T{sub.tier}</Field>
            <Field label="Vendedor">{sub.vendedor?.name ?? '—'}</Field>
            <Field label="Agentes">{sub.agents.length}</Field>
            <Field label="Onb">{people(sub.onbSet)}</Field>
            <Field label="CS">{people(sub.csSet)}</Field>
            <Field label="IE">{people(sub.ieSet)}</Field>
          </div>
        </Section>

        <Section
          title="Agentes"
          action={
            <Link
              href={`/agents/new?subAccountId=${sub.id}`}
              aria-label="Nuevo agente"
              title="Nuevo agente"
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-hover"
            >
              <PlusIcon />
            </Link>
          }
        >
          {sub.agents.length === 0 ? (
            <p className="text-sm text-slate-500">Sin agentes.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-200">
              {sub.agents.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-2 hover:bg-white"
                >
                  <Link
                    href={`/agents/${a.id}`}
                    className="truncate text-sm font-medium text-slate-800 hover:text-slate-900 hover:underline"
                  >
                    {a.derivedName}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    {a.isLive && (
                      <Badge label="Live" className={AGENT_LIVE_BADGE} title={AGENT_LIVE_DESC} />
                    )}
                    {!a.isActive && (
                      <Badge
                        label="Baja"
                        className={AGENT_INACTIVE_BADGE}
                        title={AGENT_INACTIVE_DESC}
                      />
                    )}
                    <AgentStageBadge stage={a.currentStage} />
                    <Link
                      href={`/agents/${a.id}/edit`}
                      aria-label="Editar agente"
                      title="Editar agente"
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <PencilIcon />
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        </div>

        <div className="lg:sticky lg:top-6">
          <NotesPanel subAccountId={sub.id} notes={notes} />
        </div>
      </div>
    </main>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2L6 12l-2.5.5L4 10l7.5-7.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
