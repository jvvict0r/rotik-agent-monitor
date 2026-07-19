import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Execution, ExecutionStatus } from '@/types/api'
import { agentsQueryKey } from '@/features/agents/useAgents'

interface CreateExecutionInput {
  status: ExecutionStatus
  duration_ms?: number
  error_message?: string
}

export function useCreateExecution(agentId: number, clientId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateExecutionInput) => {
      const { data } = await api.post<{ data: Execution }>(`/agents/${agentId}/executions`, input)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', agentId, 'executions'] })
      queryClient.invalidateQueries({ queryKey: agentsQueryKey(clientId) })
    },
  })
}
