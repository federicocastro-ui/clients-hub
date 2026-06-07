import { notFound } from 'next/navigation'
import { BackLink } from '@/components/detail-ui'
import { CancelLink, SubmitButton } from '@/components/form'
import { SubAccountFormFields } from '@/components/entity-forms'
import { updateSubAccount_ } from '@/lib/actions'
import { getSubAccountDetail, getTeamMembers } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function EditSubAccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [sub, members] = await Promise.all([
    getSubAccountDetail(id),
    getTeamMembers(),
  ])
  if (!sub) notFound()

  const action = updateSubAccount_.bind(null, id)

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href={`/sub-accounts/${id}`} label="Volver al cliente" />
      </div>
      <h1 className="mb-5 text-lg font-semibold text-slate-900">Editar cliente</h1>

      <form action={action} className="flex flex-col gap-4">
        <SubAccountFormFields
          members={members}
          defaults={{
            name: sub.name,
            tier: sub.tier,
            status: sub.status,
            vendedorId: sub.vendedor?.id ?? null,
          }}
        />
        <div className="flex gap-2">
          <SubmitButton />
          <CancelLink href={`/sub-accounts/${id}`} />
        </div>
      </form>
    </main>
  )
}
