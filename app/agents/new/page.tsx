import { notFound } from 'next/navigation'
import { BackLink } from '@/components/detail-ui'
import { CancelLink, SubmitButton } from '@/components/form'
import { AgentFormFields } from '@/components/entity-forms'
import { createAgent_ } from '@/lib/actions'
import { getCountries, getSubAccountDetail, getTeamMembers } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function NewAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ subAccountId?: string }>
}) {
  const { subAccountId } = await searchParams
  if (!subAccountId) notFound()
  const [sub, countries, members] = await Promise.all([
    getSubAccountDetail(subAccountId),
    getCountries(),
    getTeamMembers(),
  ])
  if (!sub) notFound()

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href={`/sub-accounts/${subAccountId}`} label={`Volver a ${sub.name}`} />
      </div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Nuevo agente</h1>
      <p className="mb-5 text-sm text-slate-500">
        {sub.clientName}: {sub.name} — el nombre del agente se genera solo.
      </p>

      <form action={createAgent_} className="flex flex-col gap-4">
        <input type="hidden" name="sub_account_id" value={subAccountId} />
        <AgentFormFields countries={countries} members={members} showStage />
        <div className="flex gap-2">
          <SubmitButton label="Crear agente" />
          <CancelLink href={`/sub-accounts/${subAccountId}`} />
        </div>
      </form>
    </main>
  )
}
