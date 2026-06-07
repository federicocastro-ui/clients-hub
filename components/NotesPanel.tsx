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
    <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-200 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-800">Notas internas</h2>
        <p className="mt-0.5 text-xs text-slate-500">Comentarios del equipo. No los ve el cliente.</p>
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
          <p className="text-sm text-slate-500">Sin notas todavía.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">
                      {note.author ?? 'Anónimo'}
                    </div>
                    <div className="text-xs text-slate-500">{fmtDateTime(note.createdAt)}</div>
                  </div>
                  <form action={removeSubAccountNote_.bind(null, subAccountId, note.id)}>
                    <button
                      type="submit"
                      className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:text-rose-600"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
                <p className="text-sm whitespace-pre-wrap text-slate-700">{note.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
