import { FieldLabel, SubmitButton, inputCls } from './form'
import { addSubAccountNote_, removeSubAccountNote_ } from '@/lib/actions'
import type { Note } from '@/lib/view-model'

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotesPanel({
  subAccountId,
  notes,
}: {
  subAccountId: string
  notes: Note[]
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40">
      <div className="border-b border-zinc-800 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-zinc-200">Notas internas</h2>
        <p className="mt-0.5 text-xs text-zinc-500">Comentarios del equipo. No los ve el cliente.</p>
      </div>

      <div className="p-4">
        <form action={addSubAccountNote_.bind(null, subAccountId)} className="mb-4 flex flex-col gap-2">
          <textarea
            name="body"
            required
            rows={3}
            placeholder="Escribí una nota…"
            className={`${inputCls} resize-y`}
          />
          <div className="flex flex-col gap-2">
            <FieldLabel label="Autor (opcional)">
              <input name="author" placeholder="Tu nombre" className={inputCls} />
            </FieldLabel>
            <div>
              <SubmitButton label="Agregar nota" />
            </div>
          </div>
        </form>

        {notes.length === 0 ? (
          <p className="text-sm text-zinc-500">Sin notas todavía.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-100">
                      {note.author ?? 'Anónimo'}
                    </div>
                    <div className="text-xs text-zinc-500">{fmtDateTime(note.createdAt)}</div>
                  </div>
                  <form action={removeSubAccountNote_.bind(null, subAccountId, note.id)}>
                    <button
                      type="submit"
                      className="rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:text-rose-300"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
                <p className="text-sm whitespace-pre-wrap text-zinc-300">{note.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
