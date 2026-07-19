import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Client } from '@/types/api'

export function useClients(enabled: boolean) {
  return useQuery({
    queryKey: ['clients'],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<{ data: Client[] }>('/clients')
      return data.data
    },
  })
}
