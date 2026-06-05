import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/Badge'
import { BackLink, Field, Section, people } from '@/components/detail-ui'
import { getSubAccountDetail } from '@/lib/queries'
import { markChurned_ } from '@/lib/actions'
import {
  AGENT_INACTIVE_BADGE,
  AGENT_LIVE_BADGE,
  AGENT_STAGE_BADGE,
  AGENT_STAGE_LABELS,
  SUB_ACCOUNT_STATUS_BADGE,
  SUB_ACCOUNT_STATUS_LABELS,
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
            <Badge
              label={SUB_ACCOUNT_STATUS_LABELS[sub.status]}
              className={SUB_ACCOUNT_STATUS_BADGE[sub.status]}
            />
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
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/sub-accounts/${sub.id}/edit`}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Editar
          </Link>
          {sub.status !== 'churned' && (
            <form action={markChurned_.bind(null, sub.id)}>
              <button
                type="submit"
                className="rounded-md border border-rose-500/40 px-3 py-1.5 text-sm text-rose-300 hover:bg-rose-500/10"
              >
                Marcar churned
              </button>
            </form>
          )}
          <Link
            href={`/agents/new?subAccountId=${sub.id}`}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
          >
            + Nuevo agente
          </Link>
        </div>
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

        <Section title="Agentes">
          {sub.agents.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin agentes.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-800/60">
              {sub.agents.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/agents/${a.id}`}
                    className="flex items-center justify-between gap-3 py-2 hover:bg-zinc-800/30"
                  >
                    <span className="truncate text-sm font-medium text-zinc-200">
                      {a.derivedName}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {a.isLive && <Badge label="Live" className={AGENT_LIVE_BADGE} />}
                      {!a.isActive && (
                        <Badge label="Baja" className={AGENT_INACTIVE_BADGE} />
                      )}
                      <Badge
                        label={AGENT_STAGE_LABELS[a.currentStage]}
                        className={AGENT_STAGE_BADGE[a.currentStage]}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </main>
  )
}
