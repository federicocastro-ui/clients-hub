import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/Badge'
import { AgentStageBadge, ClientStatusBadge } from '@/components/StatusBadge'
import { BackLink, Field, Section, people } from '@/components/detail-ui'
import { getSubAccountDetail } from '@/lib/queries'
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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href="/" label="Volver a la lista" />
      </div>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-100">{sub.name}</h1>
            <ClientStatusBadge status={sub.status} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Organización:{' '}
            <Link
              href={`/clients/${sub.clientId}`}
              className="text-zinc-300 hover:text-white hover:underline"
            >
              {sub.clientName}
            </Link>
          </p>
        </div>
        <Link
          href={`/sub-accounts/${sub.id}/edit`}
          className="shrink-0 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
        >
          Editar
        </Link>
      </header>

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
              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white hover:bg-accent-hover"
            >
              <PlusIcon />
            </Link>
          }
        >
          {sub.agents.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin agentes.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-800/60">
              {sub.agents.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-2 hover:bg-zinc-800/20"
                >
                  <Link
                    href={`/agents/${a.id}`}
                    className="truncate text-sm font-medium text-zinc-200 hover:text-white hover:underline"
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
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-100"
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
