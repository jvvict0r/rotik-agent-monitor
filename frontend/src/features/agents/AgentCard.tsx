import { cx } from '@/lib/cx'
import { formatNumber } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { HistoryIcon, LockIcon } from '@/components/icons'
import type { Agent } from '@/types/api'

interface AgentCardProps {
  agent: Agent
  isClientBlocked: boolean
  onOpenHistory?: (agent: Agent) => void
}

export function AgentCard({ agent, isClientBlocked, onOpenHistory }: AgentCardProps) {
  const inactive = agent.status === 'inactive'
  const { success, failed } = agent.executions_this_month

  return (
    <article
      className={cx(
        'group flex flex-col rounded-xl border bg-surface p-5 shadow-card transition duration-150 hover:-translate-y-0.5 hover:shadow-lift',
        isClientBlocked ? 'border-danger-500/30' : 'border-hairline hover:border-brand-200',
      )}
    >
      {isClientBlocked && (
        <span className="mb-3 -mt-1 block h-1 w-10 rounded-full bg-danger-500" aria-hidden="true" />
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-bold text-slate-ink">{agent.name}</h3>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {isClientBlocked ? (
            <Badge tone="danger">
              <LockIcon className="h-3 w-3" />
              Bloqueado
            </Badge>
          ) : (
            <Badge tone={inactive ? 'neutral' : 'healthy'}>{inactive ? 'Inativo' : 'Ativo'}</Badge>
          )}
        </div>
      </div>

      <p className="mt-1.5 line-clamp-2 min-h-10 text-sm text-slate-muted">
        {agent.description || 'Sem descrição.'}
      </p>

      <div className="mt-4 flex items-center gap-5 border-t border-hairline pt-4">
        <span className="flex items-center gap-1.5 text-sm">
          <span className="h-2 w-2 rounded-full bg-healthy-500" aria-hidden="true" />
          <span className="font-mono font-semibold tabular text-slate-ink">{formatNumber(success)}</span>
          <span className="text-slate-muted">sucessos</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <span className="h-2 w-2 rounded-full bg-danger-500" aria-hidden="true" />
          <span className="font-mono font-semibold tabular text-slate-ink">{formatNumber(failed)}</span>
          <span className="text-slate-muted">falhas</span>
        </span>
      </div>

      {onOpenHistory && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => onOpenHistory(agent)}
          >
            <HistoryIcon className="h-4 w-4" />
            Ver histórico
          </Button>
        </div>
      )}
    </article>
  )
}
