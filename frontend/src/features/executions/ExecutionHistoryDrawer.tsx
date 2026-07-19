import { useEffect, useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Banner } from '@/components/ui/Banner'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { HistoryIcon } from '@/components/icons'
import { useToast } from '@/components/toast/toast-context'
import { extractErrorMessage } from '@/lib/api'
import { formatDateTime, formatDuration, formatNumber } from '@/lib/format'
import type { Agent, Execution } from '@/types/api'
import { useExecutions } from './useExecutions'
import { useCreateExecution } from './useCreateExecution'

interface ExecutionHistoryDrawerProps {
  agent: Agent | null
  clientId: number
  isClientBlocked: boolean
  open: boolean
  onClose: () => void
}

function ExecutionRow({ execution }: { execution: Execution }) {
  const failed = execution.status === 'failed'
  return (
    <li className="flex flex-col gap-1 py-3">
      <div className="flex items-center justify-between gap-3">
        <Badge tone={failed ? 'danger' : 'healthy'}>{failed ? 'Falha' : 'Sucesso'}</Badge>
        <span className="font-mono text-xs text-slate-muted tabular">{formatDateTime(execution.executed_at)}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-muted">
          {failed ? execution.error_message : 'Execução concluída'}
        </span>
        <span className="font-mono text-xs text-slate-muted tabular">{formatDuration(execution.duration_ms)}</span>
      </div>
    </li>
  )
}

function HistorySkeleton() {
  return (
    <ul className="divide-y divide-hairline" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index} className="flex flex-col gap-2 py-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-40" />
        </li>
      ))}
    </ul>
  )
}

export function ExecutionHistoryDrawer({
  agent,
  clientId,
  isClientBlocked,
  open,
  onClose,
}: ExecutionHistoryDrawerProps) {
  const { notify } = useToast()
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [agent?.id])

  const executionsQuery = useExecutions(agent?.id ?? null, page, open)
  const createExecution = useCreateExecution(agent?.id ?? 0, clientId)

  async function register(status: 'success' | 'failed') {
    if (!agent) return
    try {
      await createExecution.mutateAsync(
        status === 'success'
          ? { status, duration_ms: 200 + Math.floor(Math.random() * 3000) }
          : { status, duration_ms: 200 + Math.floor(Math.random() * 3000), error_message: 'Timeout ao consultar o modelo' },
      )
      setPage(1)
      notify(status === 'success' ? 'Execução registrada.' : 'Falha registrada (não consome cota).', 'success')
    } catch (err) {
      notify(extractErrorMessage(err, 'Não foi possível registrar a execução.'), 'error')
    }
  }

  const meta = executionsQuery.data?.meta
  const executions = executionsQuery.data?.data ?? []

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={agent?.name ?? 'Histórico'}
      subtitle={<span>Histórico de execuções do mês</span>}
      footer={
        <div className="flex flex-col gap-2">
          {isClientBlocked && (
            <p className="text-xs font-medium text-danger-600">
              Cliente no limite do plano: novas execuções são bloqueadas.
            </p>
          )}
          <div className="flex gap-2">
            <Button className="flex-1" loading={createExecution.isPending} onClick={() => void register('success')}>
              Registrar execução
            </Button>
            <Button variant="secondary" disabled={createExecution.isPending} onClick={() => void register('failed')}>
              Registrar falha
            </Button>
          </div>
        </div>
      }
    >
      {executionsQuery.isError ? (
        <Banner tone="danger" role="alert" className="items-center">
          <span className="flex-1">{extractErrorMessage(executionsQuery.error, 'Não foi possível carregar o histórico.')}</span>
          <button type="button" onClick={() => void executionsQuery.refetch()} className="font-semibold underline underline-offset-2">
            Tentar de novo
          </button>
        </Banner>
      ) : executionsQuery.isPending ? (
        <HistorySkeleton />
      ) : executions.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="h-6 w-6" />}
          title="Nenhuma execução ainda"
          description="Assim que este agente registrar execuções, elas aparecem aqui. Você pode registrar uma agora para testar."
        />
      ) : (
        <>
          <ul className="divide-y divide-hairline">
            {executions.map((execution) => (
              <ExecutionRow key={execution.id} execution={execution} />
            ))}
          </ul>

          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
              <span className="text-xs text-slate-muted tabular">
                {formatNumber(meta.total)} execuções · página {meta.current_page} de {meta.last_page}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={meta.current_page <= 1 || executionsQuery.isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={meta.current_page >= meta.last_page || executionsQuery.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Drawer>
  )
}
