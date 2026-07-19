import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { AgentIcon, PlusIcon } from '@/components/icons'
import type { Agent } from '@/types/api'
import { AgentCard } from './AgentCard'

const gridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'

export function AgentGridSkeleton() {
  return (
    <div className={gridClass} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-hairline bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <div className="mt-5 flex gap-5 border-t border-hairline pt-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface AgentListProps {
  agents: Agent[]
  isClientBlocked: boolean
  onCreateAgent: () => void
  onOpenHistory?: (agent: Agent) => void
}

export function AgentList({ agents, isClientBlocked, onCreateAgent, onOpenHistory }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <EmptyState
        icon={<AgentIcon className="h-6 w-6" />}
        title="Nenhum agente cadastrado"
        description="Este cliente ainda não tem agentes. Cadastre o primeiro para começar a acompanhar as execuções."
        action={
          <Button onClick={onCreateAgent}>
            <PlusIcon className="h-4 w-4" />
            Cadastrar primeiro agente
          </Button>
        }
      />
    )
  }

  return (
    <div className={gridClass}>
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          isClientBlocked={isClientBlocked}
          onOpenHistory={onOpenHistory}
        />
      ))}
    </div>
  )
}
