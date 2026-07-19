<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\AgentMonthlyUsage;
use App\Models\Client;
use App\Models\ClientMonthlyUsage;
use App\Models\Execution;
use App\Models\Plan;
use App\Models\User;
use App\Support\MonthlyPeriod;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Equipe CS',
            'email' => 'cs@rotik.com',
        ]);

        $this->seedClient('Acme Atendimentos', 'Pro', 'Ana Souza', 'ana@acme.com', [
            'Suporte N1' => 900,
            'Qualificação de Leads' => 450,
            'FAQ Interno' => 150,
        ]);

        $this->seedClient('Beta Logística', 'Starter', 'Bruno Lima', 'bruno@betalogistica.com', [
            'Rastreio de Pedidos' => 280,
            'SAC WhatsApp' => 145,
        ]);

        $this->seedClient('Gama Fintech', 'Starter', 'Carla Nunes', 'carla@gamafintech.com', [
            'Antifraude' => 320,
            'Onboarding PJ' => 180,
        ]);
    }

    /**
     * Cria um cliente completo: usuário, agentes e execuções do mês corrente,
     * com os contadores mensais reconstruídos a partir das execuções geradas.
     */
    private function seedClient(string $name, string $planName, string $userName, string $userEmail, array $successesPerAgent): void
    {
        $client = Client::factory()->create([
            'name' => $name,
            'plan_id' => Plan::where('name', $planName)->firstOrFail()->id,
        ]);

        User::factory()->forClient($client)->create([
            'name' => $userName,
            'email' => $userEmail,
        ]);

        foreach ($successesPerAgent as $agentName => $successCount) {
            $agent = Agent::factory()->create([
                'client_id' => $client->id,
                'name' => $agentName,
            ]);

            $this->seedExecutions($agent, $successCount);
        }

        $this->rebuildUsageCounters($client);
    }

    private function seedExecutions(Agent $agent, int $successCount): void
    {
        $failedCount = intdiv($successCount, 12);
        $monthStart = now()->startOfMonth();
        $secondsSoFar = $monthStart->diffInSeconds(now());

        $rows = [];

        for ($i = 0; $i < $successCount + $failedCount; $i++) {
            $failed = $i >= $successCount;
            $executedAt = $monthStart->copy()->addSeconds(random_int(0, $secondsSoFar));

            $rows[] = [
                'agent_id' => $agent->id,
                'status' => $failed ? 'failed' : 'success',
                'duration_ms' => random_int(180, 9000),
                'error_message' => $failed ? 'Timeout ao consultar o modelo' : null,
                'executed_at' => $executedAt,
                'created_at' => $executedAt,
            ];
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            Execution::insert($chunk);
        }
    }

    private function rebuildUsageCounters(Client $client): void
    {
        $period = MonthlyPeriod::current();

        foreach ($client->agents as $agent) {
            $totals = $agent->executions()
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            AgentMonthlyUsage::create([
                'agent_id' => $agent->id,
                'period' => $period,
                'success_count' => $totals['success'] ?? 0,
                'failed_count' => $totals['failed'] ?? 0,
            ]);
        }

        ClientMonthlyUsage::create([
            'client_id' => $client->id,
            'period' => $period,
            'executions_count' => AgentMonthlyUsage::query()
                ->whereIn('agent_id', $client->agents->pluck('id'))
                ->where('period', $period)
                ->sum('success_count'),
        ]);
    }
}
