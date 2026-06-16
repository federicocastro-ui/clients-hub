export const dynamic = 'force-dynamic'

export default function ContactsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5">
        <h1 className="text-lg font-semibold text-slate-900">Contactos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Registro de las personas que forman parte de cada organización.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-8">
        <span className="inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
          En construcción
        </span>
        <h2 className="mt-3 text-base font-semibold text-slate-900">
          Próxima fase
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Modelo propuesto: cada contacto pertenece a una organización y opcionalmente se vincula a
          varios de sus clientes (sub-cuentas). Campos: nombre, email, teléfono, cargo y notas.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Confirmá el modelo (o ajustalo) y lo construimos.
        </p>
      </div>
    </main>
  )
}
