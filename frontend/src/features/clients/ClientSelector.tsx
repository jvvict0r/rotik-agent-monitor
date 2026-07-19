import { ChevronDownIcon } from '@/components/icons'
import type { Client } from '@/types/api'

interface ClientSelectorProps {
  clients: Client[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ClientSelector({ clients, selectedId, onSelect }: ClientSelectorProps) {
  return (
    <label className="flex items-center gap-2.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-muted">Cliente</span>
      <span className="relative">
        <select
          value={selectedId ?? ''}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="h-10 min-w-52 appearance-none rounded-lg border border-hairline bg-surface pl-3.5 pr-10 text-sm font-semibold text-slate-ink shadow-card transition hover:border-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
        >
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-muted" />
      </span>
    </label>
  )
}
