<?php

namespace Database\Seeders;

use App\Enums\AgentStatus;
use App\Enums\UserRole;
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
        if (Client::query()->exists()) {
            return;
        }

        User::create([
            'name' => 'Equipe CS',
            'email' => 'cs@rotik.com',
            'password' => 'password',
            'role' => UserRole::Cs,
            'client_id' => null,
        ]);

        $this->seedClient('Acme Atendimentos', 'Pro', 'Ana Souza', 'ana@acme.com', [
            ['Suporte N1', 'Atende as dúvidas de primeiro nível dos clientes no chat.', 900],
            ['Qualificação de Leads', 'Faz as perguntas iniciais e classifica os leads recebidos.', 450],
            ['FAQ Interno', 'Responde as perguntas frequentes da equipe sobre processos.', 150],
        ]);

        $this->seedClient('Beta Logística', 'Starter', 'Bruno Lima', 'bruno@betalogistica.com', [
            ['Rastreio de Pedidos', 'Informa o status de entrega a partir do código do pedido.', 280],
            ['SAC WhatsApp', 'Recebe e encaminha as solicitações de atendimento no WhatsApp.', 145],
        ]);

        $this->seedClient('Gama Fintech', 'Starter', 'Carla Nunes', 'carla@gamafintech.com', [
            ['Antifraude', 'Analisa transações suspeitas e sinaliza possíveis fraudes.', 320],
            ['Onboarding PJ', 'Conduz a abertura de conta para clientes pessoa jurídica.', 180],
        ]);
    }

    /**
     * Cria um cliente completo: usuário, agentes e execuções do mês corrente,
     * com os contadores mensais reconstruídos a partir das execuções geradas.
     */
    private function seedClient(string $name, string $planName, string $userName, string $userEmail, array $agents): void
    {
        $client = Client::create([
            'name' => $name,
            'plan_id' => Plan::where('name', $planName)->firstOrFail()->id,
        ]);

        User::create([
            'name' => $userName,
            'email' => $userEmail,
            'password' => 'password',
            'role' => UserRole::Client,
            'client_id' => $client->id,
        ]);

        foreach ($agents as [$agentName, $description, $successCount]) {
            $agent = Agent::create([
                'client_id' => $client->id,
                'name' => $agentName,
                'description' => $description,
                'status' => AgentStatus::Active,
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
