import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { BrandMark } from '@/components/BrandMark'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="grid min-h-svh place-items-center bg-canvas">
        <div className="flex flex-col items-center gap-4 text-slate-muted">
          <BrandMark withWordmark={false} />
          <Spinner className="h-5 w-5 text-brand-500" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
