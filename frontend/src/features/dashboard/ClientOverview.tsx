import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatNumber } from '@/lib/format'
import { UsageMeter } from '@/features/agents/UsageMeter'
import type { Agent, ClientUsage } from '@/types/api'

interface ClientOverviewProps {
  clientName: string
  planName?: string
  usage: ClientUsage
  agents: Agent[]
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-muted">{label}</span>
      <span className={`font-display text-2xl font-bold tabular ${tone === 'danger' ? 'text-danger-600' : 'text-slate-ink'}`}>
        {value}
      </span>
    </div>
  )
}

export function ClientOverview({ clientName, planName, usage, agents }: ClientOverviewProps) {
  const stats = useMemo(() => {
    const active = agents.filter((agent) => agent.status === 'active').length
    const failed = agents.reduce((sum, agent) => sum + agent.executions_this_month.failed, 0)
    return { total: agents.length, active, failed }
  }, [agents])

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-slate-ink">{clientName}</h1>
            {planName && <Badge tone="neutral">Plano {planName}</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-muted">Consumo de execuções no mês corrente.</p>
          <div className="mt-5">
            <UsageMeter
              used={usage.used}
              limit={usage.limit}
              percentage={usage.percentage}
              isBlocked={usage.is_blocked}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 rounded-xl bg-canvas p-5 lg:grid-cols-1 lg:content-center">
          <Stat label="Agentes" value={formatNumber(stats.total)} />
          <Stat label="Ativos" value={formatNumber(stats.active)} />
          <Stat label="Falhas no mês" value={formatNumber(stats.failed)} tone={stats.failed > 0 ? 'danger' : undefined} />
        </div>
      </div>
    </Card>
  )
}
