import { useState, type FormEvent } from 'react'
import { BrandMark } from '@/components/BrandMark'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { useAuth } from './auth-context'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível entrar. Confira suas credenciais.'))
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-ink-950 px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 0%, rgba(79,70,229,0.35), transparent 70%), radial-gradient(40% 40% at 85% 90%, rgba(91,91,240,0.18), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md min-w-0">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <BrandMark tone="dark" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
              Painel de monitoramento
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white">Entrar no painel</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface p-6 shadow-pop sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {error && (
              <Banner tone="danger" role="alert">
                {error}
              </Banner>
            )}

            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <TextField
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={submitting} className="mt-1 w-full">
              {submitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-5 border-t border-hairline pt-4 text-center text-xs text-slate-muted">
            Acesso de demonstração:{' '}
            <span className="font-mono text-slate-ink">cs@rotik.com</span> /{' '}
            <span className="font-mono text-slate-ink">password</span>
          </p>
        </div>
      </div>
    </main>
  )
}
