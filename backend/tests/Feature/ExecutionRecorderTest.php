<?php

namespace Tests\Feature;

use App\Enums\ExecutionStatus;
use App\Exceptions\InactiveAgentException;
use App\Exceptions\PlanLimitReachedException;
use App\Models\Agent;
use App\Models\Client;
use App\Models\Plan;
use App\Services\ExecutionRecorder;
use App\Support\MonthlyPeriod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ExecutionRecorderTest extends TestCase
{
    use RefreshDatabase;

    private ExecutionRecorder $recorder;

    protected function setUp(): void
    {
        parent::setUp();

        $this->recorder = app(ExecutionRecorder::class);
    }

    private function makeAgent(int $monthlyLimit): Agent
    {
        $plan = Plan::factory()->create(['monthly_execution_limit' => $monthlyLimit]);
        $client = Client::factory()->create(['plan_id' => $plan->id]);

        return Agent::factory()->create(['client_id' => $client->id]);
    }

    public function test_execucao_com_sucesso_grava_historico_e_incrementa_contadores(): void
    {
        $agent = $this->makeAgent(10);

        $execution = $this->recorder->record($agent, ExecutionStatus::Success, 850);

        $this->assertDatabaseHas('executions', [
            'id' => $execution->id,
            'agent_id' => $agent->id,
            'status' => 'success',
        ]);
        $this->assertDatabaseHas('client_monthly_usages', [
            'client_id' => $agent->client_id,
            'period' => MonthlyPeriod::current(),
            'executions_count' => 1,
        ]);
        $this->assertDatabaseHas('agent_monthly_usages', [
            'agent_id' => $agent->id,
            'period' => MonthlyPeriod::current(),
            'success_count' => 1,
            'failed_count' => 0,
        ]);
    }

    public function test_bloqueia_e_loga_a_execucao_seguinte_ao_atingir_o_limite(): void
    {
        $agent = $this->makeAgent(3);

        for ($i = 0; $i < 3; $i++) {
            $this->recorder->record($agent, ExecutionStatus::Success);
        }

        Log::spy();

        try {
            $this->recorder->record($agent, ExecutionStatus::Success);
            $this->fail('A execução acima do limite deveria ter sido bloqueada.');
        } catch (PlanLimitReachedException) {
        }

        Log::shouldHaveReceived('warning')
            ->once()
            ->withArgs(fn (string $message) => $message === 'Execução bloqueada por limite do plano');

        $this->assertSame(3, $agent->executions()->count());
        $this->assertDatabaseHas('client_monthly_usages', [
            'client_id' => $agent->client_id,
            'executions_count' => 3,
        ]);
    }

    public function test_falha_fica_no_historico_sem_consumir_cota(): void
    {
        $agent = $this->makeAgent(10);

        $this->recorder->record($agent, ExecutionStatus::Failed, 4200, 'Timeout ao consultar o modelo');

        $this->assertDatabaseHas('executions', [
            'agent_id' => $agent->id,
            'status' => 'failed',
            'error_message' => 'Timeout ao consultar o modelo',
        ]);
        $this->assertDatabaseHas('client_monthly_usages', [
            'client_id' => $agent->client_id,
            'executions_count' => 0,
        ]);
        $this->assertDatabaseHas('agent_monthly_usages', [
            'agent_id' => $agent->id,
            'success_count' => 0,
            'failed_count' => 1,
        ]);
    }

    public function test_cliente_no_limite_recusa_ate_execucoes_com_falha(): void
    {
        $agent = $this->makeAgent(1);

        $this->recorder->record($agent, ExecutionStatus::Success);

        $this->expectException(PlanLimitReachedException::class);
        $this->recorder->record($agent, ExecutionStatus::Failed);
    }

    public function test_virada_de_mes_libera_novas_execucoes(): void
    {
        Carbon::setTestNow('2026-06-30 23:50:00');
        $agent = $this->makeAgent(2);

        $this->recorder->record($agent, ExecutionStatus::Success);
        $this->recorder->record($agent, ExecutionStatus::Success);

        Carbon::setTestNow('2026-07-01 00:10:00');

        $this->recorder->record($agent, ExecutionStatus::Success);

        $this->assertDatabaseHas('client_monthly_usages', [
            'client_id' => $agent->client_id,
            'period' => '2026-06',
            'executions_count' => 2,
        ]);
        $this->assertDatabaseHas('client_monthly_usages', [
            'client_id' => $agent->client_id,
            'period' => '2026-07',
            'executions_count' => 1,
        ]);
    }

    public function test_agente_inativo_nao_registra_execucao(): void
    {
        $agent = Agent::factory()->inactive()->create();

        try {
            $this->recorder->record($agent, ExecutionStatus::Success);
            $this->fail('Agente inativo não deveria registrar execução.');
        } catch (InactiveAgentException) {
        }

        $this->assertSame(0, $agent->executions()->count());
    }
}
