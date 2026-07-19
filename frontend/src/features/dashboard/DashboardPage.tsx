import { AppShell } from '@/app/AppShell'
import { Card } from '@/components/ui/Card'

export function DashboardPage() {
  return (
    <AppShell>
      <Card className="p-8">
        <h1 className="font-display text-xl font-bold text-slate-ink">Painel em construção</h1>
        <p className="mt-2 max-w-prose text-sm text-slate-muted">
          A autenticação e a fundação visual estão prontas. As próximas entregas trazem o seletor de
          clientes, a lista de agentes com consumo do mês e o histórico de execuções.
        </p>
      </Card>
    </AppShell>
  )
}
