import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/app/AppShell'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { PlusIcon } from '@/components/icons'
import { extractErrorMessage } from '@/lib/api'
import { useAuth } from '@/features/auth/auth-context'
import { useClients } from '@/features/clients/useClients'
import { ClientSelector } from '@/features/clients/ClientSelector'
import { useAgents } from '@/features/agents/useAgents'
import { AgentGridSkeleton, AgentList } from '@/features/agents/AgentList'
import { CreateAgentModal } from '@/features/agents/CreateAgentModal'
import { ExecutionHistoryDrawer } from '@/features/executions/ExecutionHistoryDrawer'
import type { Agent } from '@/types/api'
import { ClientOverview } from './ClientOverview'

function OverviewSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="mt-3 h-4 w-64" />
      <Skeleton className="mt-6 h-3 w-full rounded-full" />
    </Card>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const isCs = user?.role === 'cs'

  const clientsQuery = useClients(isCs)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    user?.role === 'client' ? (user.client?.id ?? null) : null,
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [createdNotice, setCreatedNotice] = useState<string | null>(null)
  const [historyAgent, setHistoryAgent] = useState<Agent | null>(null)

  useEffect(() => {
    if (isCs && selectedClientId === null && clientsQuery.data?.length) {
      setSelectedClientId(clientsQuery.data[0].id)
    }
  }, [isCs, selectedClientId, clientsQuery.data])

  const agentsQuery = useAgents(selectedClientId)

  const selectedClient = useMemo(() => {
    if (!isCs) return null
    return clientsQuery.data?.find((client) => client.id === selectedClientId) ?? null
  }, [isCs, clientsQuery.data, selectedClientId])

  const clientName = isCs ? (selectedClient?.name ?? '') : (user?.client?.name ?? '')
  const planName = selectedClient?.plan?.name

  const toolbar =
    isCs && clientsQuery.data && clientsQuery.data.length > 0 ? (
      <div className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3 sm:px-6">
          <ClientSelector
            clients={clientsQuery.data}
            selectedId={selectedClientId}
            onSelect={(id) => {
              setSelectedClientId(id)
              setCreatedNotice(null)
            }}
          />
        </div>
      </div>
    ) : undefined

  return (
    <AppShell toolbar={toolbar}>
      {isCs && clientsQuery.isError ? (
        <ErrorState
          message={extractErrorMessage(clientsQuery.error, 'Não foi possível carregar os clientes.')}
          onRetry={() => void clientsQuery.refetch()}
        />
      ) : (isCs && clientsQuery.isLoading) || selectedClientId === null ? (
        <div className="flex flex-col gap-8">
          <OverviewSkeleton />
          <AgentGridSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {agentsQuery.isError ? (
            <ErrorState
              message={extractErrorMessage(agentsQuery.error, 'Não foi possível carregar os agentes.')}
              onRetry={() => void agentsQuery.refetch()}
            />
          ) : agentsQuery.isPending ? (
            <>
              <OverviewSkeleton />
              <AgentGridSkeleton />
            </>
          ) : (
            <>
              <ClientOverview
                clientName={clientName}
                planName={planName}
                usage={agentsQuery.data.meta.usage}
                agents={agentsQuery.data.data}
              />

              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-lg font-bold text-slate-ink">
                    Agentes
                    <span className="ml-2 font-mono text-sm font-medium text-slate-muted tabular">
                      {agentsQuery.data.data.length}
                    </span>
                  </h2>
                  <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <PlusIcon className="h-4 w-4" />
                    Novo agente
                  </Button>
                </div>

                {createdNotice && (
                  <Banner tone="info">Agente "{createdNotice}" cadastrado com sucesso.</Banner>
                )}

                <AgentList
                  agents={agentsQuery.data.data}
                  isClientBlocked={agentsQuery.data.meta.usage.is_blocked}
                  onCreateAgent={() => setCreateOpen(true)}
                  onOpenHistory={setHistoryAgent}
                />
              </section>
            </>
          )}
        </div>
      )}

      {selectedClientId !== null && (
        <>
          <CreateAgentModal
            clientId={selectedClientId}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={(name) => {
              setCreateOpen(false)
              setCreatedNotice(name)
            }}
          />
          <ExecutionHistoryDrawer
            agent={historyAgent}
            clientId={selectedClientId}
            isClientBlocked={agentsQuery.data?.meta.usage.is_blocked ?? false}
            open={historyAgent !== null}
            onClose={() => setHistoryAgent(null)}
          />
        </>
      )}
    </AppShell>
  )
}
