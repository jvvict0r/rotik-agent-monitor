import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Execution, Paginated } from '@/types/api'

const PER_PAGE = 8

export function executionsQueryKey(agentId: number, page: number) {
  return ['agents', agentId, 'executions', page] as const
}

export function useExecutions(agentId: number | null, page: number, enabled: boolean) {
  return useQuery({
    queryKey: executionsQueryKey(agentId ?? 0, page),
    enabled: enabled && agentId !== null,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data } = await api.get<Paginated<Execution>>(`/agents/${agentId}/executions`, {
        params: { page, per_page: PER_PAGE },
      })
      return data
    },
  })
}
