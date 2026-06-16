import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactForm } from '@/components/ContactForm'
import { BackLink } from '@/components/detail-ui'
import { removeContact_, updateContact_ } from '@/lib/actions'
import { getContactDetail, getContactForEdit, getOrgsWithClients } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [detail, edit, orgs] = await Promise.all([
    getContactDetail(id),
    getContactForEdit(id),
    getOrgsWithClients(),
  ])
  if (!detail || !edit) notFound()

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href="/contacts" label="Volver a contactos" />
      </div>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{detail.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {detail.role ? `${detail.role} · ` : ''}
            <Link href={`/clients/${detail.clientId}`} className="hover:underline">
              {detail.clientName}
            </Link>
          </p>
        </div>
        <form action={removeContact_.bind(null, id)}>
          <button
            type="submit"
            className="shrink-0 rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-rose-300 hover:text-rose-600"
          >
            Eliminar
          </button>
        </form>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-5">
        <ContactForm
          action={updateContact_.bind(null, id)}
          orgs={orgs}
          submitLabel="Guardar cambios"
          cancelHref="/contacts"
          defaultValues={{
            name: detail.name,
            email: edit.email,
            phone: edit.phone,
            role: edit.role,
            notes: edit.notes,
            clientId: edit.clientId,
            subAccountIds: edit.subAccountIds,
          }}
        />
      </div>
    </main>
  )
}
