interface BadgeProps {
  label: string
  className?: string
  /** Tooltip nativo (hover). Si se pasa, muestra cursor de ayuda. */
  title?: string
}

export function Badge({ label, className = '', title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${title ? 'cursor-help' : ''} ${className}`}
    >
      {label}
    </span>
  )
}
