import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactForm } from '@/components/ContactForm'
import { Breadcrumb, Field, Section } from '@/components/detail-ui'
import { removeContact_, updateContact_ } from '@/lib/actions'
import { getContactDetail, getContactForEdit, getOrgsWithClients } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { id } = await params
  const { edit } = await searchParams
  const isEdit = edit === '1'

  const detail = await getContactDetail(id)
  if (!detail) notFound()

  const editData = isEdit ? await getContactForEdit(id) : null
  const orgs = isEdit ? await getOrgsWithClients() : []

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <Breadcrumb
          items={[
            { label: 'Hub', href: '/' },
            { label: 'Contactos', href: '/contacts' },
            { label: detail.name },
          ]}
        />
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
        {isEdit ? (
          <Link
            href={`/contacts/${id}`}
            className="shrink-0 rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-100"
          >
            ← Listo
          </Link>
        ) : (
          <Link
            href={`/contacts/${id}?edit=1`}
            className="shrink-0 rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
          >
            Editar
          </Link>
        )}
      </header>

      {isEdit && editData ? (
        // ───────────────────────── Modo edición ─────────────────────────
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-5">
            <ContactForm
              action={updateContact_.bind(null, id)}
              orgs={orgs}
              submitLabel="Guardar cambios"
              cancelHref={`/contacts/${id}`}
              defaultValues={{
                name: editData.name,
                email: editData.email,
                phone: editData.phone,
                role: editData.role,
                notes: editData.notes,
                clientId: editData.clientId,
                subAccountIds: editData.subAccountIds,
              }}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Eliminar contacto</p>
              <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
            </div>
            <form action={removeContact_.bind(null, id)}>
              <button
                type="submit"
                className="shrink-0 rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-rose-300 hover:text-rose-600"
              >
                Eliminar
              </button>
            </form>
          </div>
        </div>
      ) : (
        // ───────────────────────── Modo visión ─────────────────────────
        <div className="flex flex-col gap-4">
          <Section title="Información">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Cargo">{detail.role ?? '—'}</Field>
              <Field label="Email">
                {detail.email ? (
                  <a href={`mailto:${detail.email}`} className="text-slate-800 hover:underline">
                    {detail.email}
                  </a>
                ) : (
                  '—'
                )}
              </Field>
              <Field label="Teléfono">{detail.phone ?? '—'}</Field>
              <Field label="Organización">
                <Link
                  href={`/clients/${detail.clientId}`}
                  className="text-slate-800 hover:text-slate-900 hover:underline"
                >
                  {detail.clientName}
                </Link>
              </Field>
            </div>
          </Section>

          <Section title="Clientes vinculados">
            {detail.linkedClients.length === 0 ? (
              <p className="text-sm text-slate-500">Sin clientes vinculados.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {detail.linkedClients.map((c) => (
                  <Link
                    key={c.id}
                    href={`/sub-accounts/${c.id}`}
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 hover:bg-slate-100"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </Section>

          <Section title="Notas">
            {detail.notes ? (
              <p className="text-sm whitespace-pre-wrap text-slate-700">{detail.notes}</p>
            ) : (
              <p className="text-sm text-slate-500">Sin notas.</p>
            )}
          </Section>
        </div>
      )}
    </main>
  )
}
