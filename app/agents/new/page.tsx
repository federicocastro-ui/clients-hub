import { notFound } from 'next/navigation'
import { BackLink } from '@/components/detail-ui'
import { CancelLink, FieldLabel, SubmitButton, inputCls } from '@/components/form'
import { AgentFormFields } from '@/components/entity-forms'
import { createAgent_ } from '@/lib/actions'
import {
  getCountries,
  getOrgsWithClients,
  getSubAccountDetail,
  getTeamMembers,
} from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function NewAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ subAccountId?: string }>
}) {
  const { subAccountId } = await searchParams
  const [countries, members] = await Promise.all([getCountries(), getTeamMembers()])

  // Sub-cuenta fija (viene desde el detalle de un cliente) vs selector global.
  const sub = subAccountId ? await getSubAccountDetail(subAccountId) : null
  if (subAccountId && !sub) notFound()

  const orgs = sub ? [] : await getOrgsWithClients()
  const hasClients = sub ? true : orgs.some((o) => o.clients.length > 0)
  const backHref = sub ? `/sub-accounts/${subAccountId}` : '/agents'

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href={backHref} label={sub ? `Volver a ${sub.name}` : 'Volver a agentes'} />
      </div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Nuevo agente</h1>
      <p className="mb-5 text-sm text-slate-500">
        {sub
          ? `${sub.clientName}: ${sub.name} — el nombre del agente se genera solo.`
          : 'Elegí el cliente al que pertenece. El nombre del agente se genera solo.'}
      </p>

      {!hasClients ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-8 text-center text-sm text-slate-500">
          No hay clientes todavía. Creá primero un cliente para poder agregarle un agente.
        </div>
      ) : (
        <form action={createAgent_} className="flex flex-col gap-4">
          {sub ? (
            <input type="hidden" name="sub_account_id" value={subAccountId} />
          ) : (
            <FieldLabel label="Cliente">
              <select name="sub_account_id" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  — elegí un cliente —
                </option>
                {orgs
                  .filter((o) => o.clients.length > 0)
                  .map((o) => (
                    <optgroup key={o.id} label={o.name}>
                      {o.clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
            </FieldLabel>
          )}
          <AgentFormFields countries={countries} members={members} showStage />
          <div className="flex gap-2">
            <SubmitButton label="Crear agente" />
            <CancelLink href={backHref} />
          </div>
        </form>
      )}
    </main>
  )
}
