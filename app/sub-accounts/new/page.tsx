import { notFound } from 'next/navigation'
import { BackLink } from '@/components/detail-ui'
import { CancelLink, SubmitButton } from '@/components/form'
import { SubAccountFormFields } from '@/components/entity-forms'
import { createSubAccount_ } from '@/lib/actions'
import { getClientDetail, getTeamMembers } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function NewSubAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const { clientId } = await searchParams
  if (!clientId) notFound()
  const [client, members] = await Promise.all([
    getClientDetail(clientId),
    getTeamMembers(),
  ])
  if (!client) notFound()

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href={`/clients/${clientId}`} label={`Volver a ${client.name}`} />
      </div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Nuevo cliente</h1>
      <p className="mb-5 text-sm text-slate-500">Organización: {client.name}</p>

      <form action={createSubAccount_} className="flex flex-col gap-4">
        <input type="hidden" name="client_id" value={clientId} />
        <SubAccountFormFields members={members} />
        <div className="flex gap-2">
          <SubmitButton label="Crear cliente" />
          <CancelLink href={`/clients/${clientId}`} />
        </div>
      </form>
    </main>
  )
}
