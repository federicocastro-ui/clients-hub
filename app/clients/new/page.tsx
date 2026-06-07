import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackLink } from '@/components/detail-ui'
import { FieldLabel, SubmitButton, inputCls } from '@/components/form'
import { Stepper } from '@/components/Stepper'
import { AgentFormFields, SubAccountFormFields } from '@/components/entity-forms'
import { AgentStageBadge, ClientStatusBadge } from '@/components/StatusBadge'
import {
  createAgent_,
  createOrganizationStep_,
  createSubAccount_,
} from '@/lib/actions'
import { getCountries, getOrganizationManageData, getTeamMembers } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function NewOrgWizardPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; orgId?: string }>
}) {
  const { step = 'org', orgId } = await searchParams

  // ── Paso 1: Organización ───────────────────────────────────
  if (step === 'org' || !orgId) {
    return (
      <Shell>
        <Stepper current="org" />
        <h1 className="mb-1 text-lg font-semibold text-slate-900">Nueva organización</h1>
        <p className="mb-5 text-sm text-slate-500">
          Empecemos por la organización. Después vas a poder sumar clientes y agentes.
        </p>
        <form action={createOrganizationStep_} className="flex flex-col gap-4">
          <FieldLabel label="Nombre">
            <input name="name" required autoFocus className={inputCls} />
          </FieldLabel>
          <div className="flex gap-2">
            <SubmitButton label="Crear y continuar" />
          </div>
        </form>
      </Shell>
    )
  }

  const [org, members, countries] = await Promise.all([
    getOrganizationManageData(orgId),
    getTeamMembers(),
    getCountries(),
  ])
  if (!org) notFound()

  // ── Paso 2: Clientes ───────────────────────────────────────
  if (step === 'clients') {
    return (
      <Shell>
        <Stepper current="clients" />
        <h1 className="mb-1 text-lg font-semibold text-slate-900">
          Clientes de {org.name}
        </h1>
        <p className="mb-5 text-sm text-slate-500">
          Agregá uno o más clientes. Podés saltar este paso si todavía no los tenés.
        </p>

        {org.clients.length > 0 && (
          <ul className="mb-4 flex flex-col gap-1.5">
            {org.clients.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <span className="text-slate-800">{c.name}</span>
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  T{c.tier} · {c.agents.length} agentes
                  <ClientStatusBadge status={c.status} />
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-4">
          <p className="mb-3 text-xs font-medium tracking-wide text-slate-500 uppercase">
            Agregar cliente
          </p>
          <form action={createSubAccount_} className="flex flex-col gap-4">
            <input type="hidden" name="client_id" value={orgId} />
            <input type="hidden" name="__redirect" value={`/clients/new?step=clients&orgId=${orgId}`} />
            <SubAccountFormFields members={members} />
            <SubmitButton label="Agregar cliente" />
          </form>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <Link href={`/clients/${orgId}`} className="text-sm text-slate-500 hover:text-slate-800">
            Saltar y finalizar
          </Link>
          <Link
            href={`/clients/new?step=agents&orgId=${orgId}`}
            className="rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
          >
            Continuar a agentes →
          </Link>
        </div>
      </Shell>
    )
  }

  // ── Paso 3: Agentes ────────────────────────────────────────
  return (
    <Shell>
      <Stepper current="agents" />
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Agentes</h1>
      <p className="mb-5 text-sm text-slate-500">
        Sumá agentes a cada cliente de {org.name}. Podés saltar y hacerlo después.
      </p>

      {org.clients.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-6 text-sm text-slate-500">
          Esta organización no tiene clientes.{' '}
          <Link
            href={`/clients/new?step=clients&orgId=${orgId}`}
            className="text-accent hover:underline"
          >
            Volver a agregar clientes
          </Link>
          .
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {org.clients.map((client) => (
            <section key={client.id} className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">{client.name}</h2>
                <ClientStatusBadge status={client.status} />
              </div>

              {client.agents.length > 0 && (
                <ul className="mb-3 flex flex-col gap-1.5">
                  {client.agents.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
                    >
                      <span className="truncate text-slate-800">{a.label}</span>
                      <AgentStageBadge stage={a.currentStage} />
                    </li>
                  ))}
                </ul>
              )}

              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-accent hover:underline">
                  + Agregar agente a {client.name}
                </summary>
                <form action={createAgent_} className="mt-3 flex flex-col gap-4">
                  <input type="hidden" name="sub_account_id" value={client.id} />
                  <input
                    type="hidden"
                    name="__redirect"
                    value={`/clients/new?step=agents&orgId=${orgId}`}
                  />
                  <AgentFormFields countries={countries} members={members} showStage />
                  <SubmitButton label="Agregar agente" />
                </form>
              </details>
            </section>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-2">
        <Link
          href={`/clients/new?step=clients&orgId=${orgId}`}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Clientes
        </Link>
        <Link
          href={`/clients/${orgId}`}
          className="rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
        >
          Finalizar
        </Link>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href="/" label="Volver al hub" />
      </div>
      {children}
    </main>
  )
}
