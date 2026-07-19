import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Agent, ClientUsage } from '@/types/api'

interface AgentsResponse {
  data: Agent[]
  meta: { usage: ClientUsage }
}

export function agentsQueryKey(clientId: number | null) {
  return ['clients', clientId, 'agents'] as const
}

export function useAgents(clientId: number | null) {
  return useQuery({
    queryKey: agentsQueryKey(clientId),
    enabled: clientId !== null,
    queryFn: async () => {
      const { data } = await api.get<AgentsResponse>(`/clients/${clientId}/agents`)
      return data
    },
  })
}
