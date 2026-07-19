export type UsageState = 'healthy' | 'warning' | 'blocked'

export const WARNING_THRESHOLD = 80

export function usageState(percentage: number, isBlocked: boolean): UsageState {
  if (isBlocked || percentage >= 100) return 'blocked'
  if (percentage >= WARNING_THRESHOLD) return 'warning'
  return 'healthy'
}

export const usageLabel: Record<UsageState, string> = {
  healthy: 'Dentro do limite',
  warning: 'Perto do limite',
  blocked: 'Limite atingido',
}
