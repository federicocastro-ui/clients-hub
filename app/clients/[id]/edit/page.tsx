import { notFound } from 'next/navigation'
import { BackLink } from '@/components/detail-ui'
import { CancelLink, FieldLabel, SubmitButton, inputCls } from '@/components/form'
import { updateClient_ } from '@/lib/actions'
import { getClientDetail } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await getClientDetail(id)
  if (!client) notFound()

  const action = updateClient_.bind(null, id)

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href={`/clients/${id}`} label="Volver a la organización" />
      </div>
      <h1 className="mb-5 text-lg font-semibold text-zinc-100">Editar organización</h1>

      <form action={action} className="flex flex-col gap-4">
        <FieldLabel label="Nombre">
          <input name="name" required defaultValue={client.name} className={inputCls} />
        </FieldLabel>
        <div className="flex gap-2">
          <SubmitButton />
          <CancelLink href={`/clients/${id}`} />
        </div>
      </form>
    </main>
  )
}
