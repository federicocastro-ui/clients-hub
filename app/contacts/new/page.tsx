import { ContactForm } from '@/components/ContactForm'
import { BackLink } from '@/components/detail-ui'
import { createContact_ } from '@/lib/actions'
import { getOrgsWithClients } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function NewContactPage() {
  const orgs = await getOrgsWithClients()

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href="/contacts" label="Volver a contactos" />
      </div>
      <header className="mb-5">
        <h1 className="text-lg font-semibold text-slate-900">Nuevo contacto</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pertenece a una organización y opcionalmente se vincula a sus clientes.
        </p>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-5">
        <ContactForm
          action={createContact_}
          orgs={orgs}
          submitLabel="Crear contacto"
          cancelHref="/contacts"
        />
      </div>
    </main>
  )
}
