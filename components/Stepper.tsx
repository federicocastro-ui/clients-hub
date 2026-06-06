const STEPS = [
  { key: 'org', label: 'Organización' },
  { key: 'clients', label: 'Clientes' },
  { key: 'agents', label: 'Agentes' },
] as const

export type WizardStep = (typeof STEPS)[number]['key']

export function Stepper({ current }: { current: WizardStep }) {
  const idx = STEPS.findIndex((s) => s.key === current)
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              i <= idx ? 'bg-accent text-white' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {i + 1}
          </span>
          <span className={i === idx ? 'font-medium text-zinc-100' : 'text-zinc-500'}>
            {s.label}
          </span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-zinc-700" />}
        </li>
      ))}
    </ol>
  )
}
