export type UserRole = 'cs' | 'client'
export type AgentStatus = 'active' | 'inactive'
export type ExecutionStatus = 'success' | 'failed'

export interface Plan {
  id: number
  name: string
  monthly_execution_limit: number
}

export interface ClientSummary {
  id: number
  name: string
}

export interface Client {
  id: number
  name: string
  plan?: Plan
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  client?: ClientSummary
}

export interface Agent {
  id: number
  name: string
  description: string | null
  status: AgentStatus
  executions_this_month: {
    success: number
    failed: number
  }
}

export interface ClientUsage {
  used: number
  limit: number
  percentage: number
  is_blocked: boolean
}

export interface Execution {
  id: number
  status: ExecutionStatus
  duration_ms: number | null
  error_message: string | null
  executed_at: string | null
}

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
