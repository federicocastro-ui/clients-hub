import { notFound } from 'next/navigation'
import { BackLink } from '@/components/detail-ui'
import { CancelLink, SubmitButton } from '@/components/form'
import { AgentFormFields } from '@/components/entity-forms'
import { updateAgent_ } from '@/lib/actions'
import { getAgentForEdit, getCountries, getTeamMembers } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [agent, countries, members] = await Promise.all([
    getAgentForEdit(id),
    getCountries(),
    getTeamMembers(),
  ])
  if (!agent) notFound()

  const action = updateAgent_.bind(null, id)

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href={`/agents/${id}`} label="Volver al agente" />
      </div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Editar agente</h1>
      <p className="mb-5 text-sm text-slate-500">
        La etapa se cambia desde el detalle (registra un log).
      </p>

      <form action={action} className="flex flex-col gap-4">
        <AgentFormFields
          countries={countries}
          members={members}
          showStage={false}
          defaults={agent}
        />
        <div className="flex gap-2">
          <SubmitButton />
          <CancelLink href={`/agents/${id}`} />
        </div>
      </form>
    </main>
  )
}
