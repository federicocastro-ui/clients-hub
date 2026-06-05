import { BackLink } from '@/components/detail-ui'
import { CancelLink, FieldLabel, SubmitButton, inputCls } from '@/components/form'
import { createClient_ } from '@/lib/actions'

export const dynamic = 'force-dynamic'

export default function NewClientPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 sm:px-6">
      <div className="mb-4">
        <BackLink href="/" label="Volver a la lista" />
      </div>
      <h1 className="mb-5 text-lg font-semibold text-zinc-100">Nueva organización</h1>

      <form action={createClient_} className="flex flex-col gap-4">
        <FieldLabel label="Nombre">
          <input name="name" required autoFocus className={inputCls} />
        </FieldLabel>
        <div className="flex gap-2">
          <SubmitButton label="Crear organización" />
          <CancelLink href="/" />
        </div>
      </form>
    </main>
  )
}
