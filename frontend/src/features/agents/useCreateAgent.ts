import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Agent } from '@/types/api'
import { agentsQueryKey } from './useAgents'

interface CreateAgentInput {
  name: string
  description?: string
}

export function useCreateAgent(clientId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateAgentInput) => {
      const { data } = await api.post<{ data: Agent }>(`/clients/${clientId}/agents`, input)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentsQueryKey(clientId) })
    },
  })
}
