import type { ReactNode } from 'react'
import { BrandMark } from '@/components/BrandMark'
import { useAuth } from '@/features/auth/auth-context'

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

export function AppShell({ children, toolbar }: { children: ReactNode; toolbar?: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-svh bg-canvas">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <BrandMark tone="dark" />
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="hidden items-center gap-2.5 sm:flex">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-white">{user.name}</span>
                  <span className="text-xs text-brand-300">
                    {user.role === 'cs' ? 'Time interno' : user.client?.name}
                  </span>
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {toolbar}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
