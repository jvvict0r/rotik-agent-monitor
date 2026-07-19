<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\Client;
use App\Models\Execution;
use App\Models\Plan;
use App\Support\MonthlyPeriod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ActsAsUsers;
use Tests\TestCase;

class ExecutionEndpointsTest extends TestCase
{
    use ActsAsUsers, RefreshDatabase;

    private function makeAgent(int $monthlyLimit): Agent
    {
        $plan = Plan::factory()->create(['monthly_execution_limit' => $monthlyLimit]);
        $client = Client::factory()->create(['plan_id' => $plan->id]);

        return Agent::factory()->create(['client_id' => $client->id]);
    }

    public function test_registra_execucao_com_sucesso_pela_api(): void
    {
        $agent = $this->makeAgent(10);
        $this->actingAsCs();

        $this->postJson("/api/agents/{$agent->id}/executions", [
            'status' => 'success',
            'duration_ms' => 850,
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'success');

        $this->assertDatabaseHas('client_monthly_usages', [
            'client_id' => $agent->client_id,
            'period' => MonthlyPeriod::current(),
            'executions_count' => 1,
        ]);
    }

    public function test_registra_falha_sem_consumir_cota(): void
    {
        $agent = $this->makeAgent(10);
        $this->actingAsCs();

        $this->postJson("/api/agents/{$agent->id}/executions", [
            'status' => 'failed',
            'error_message' => 'Timeout ao consultar o modelo',
        ])->assertCreated();

        $this->assertDatabaseHas('client_monthly_usages', [
            'client_id' => $agent->client_id,
            'executions_count' => 0,
        ]);
        $this->assertDatabaseHas('agent_monthly_usages', [
            'agent_id' => $agent->id,
            'failed_count' => 1,
        ]);
    }

    public function test_cliente_no_limite_recebe_429_e_nada_e_registrado(): void
    {
        $agent = $this->makeAgent(1);
        $this->actingAsCs();

        $this->postJson("/api/agents/{$agent->id}/executions", ['status' => 'success'])
            ->assertCreated();

        $this->postJson("/api/agents/{$agent->id}/executions", ['status' => 'success'])
            ->assertStatus(429)
            ->assertJsonPath('message', 'O limite mensal de execuções do plano foi atingido.');

        $this->assertSame(1, $agent->executions()->count());
    }

    public function test_agente_inativo_recebe_409(): void
    {
        $plan = Plan::factory()->create(['monthly_execution_limit' => 10]);
        $client = Client::factory()->create(['plan_id' => $plan->id]);
        $agent = Agent::factory()->inactive()->create(['client_id' => $client->id]);
        $this->actingAsCs();

        $this->postJson("/api/agents/{$agent->id}/executions", ['status' => 'success'])
            ->assertStatus(409);

        $this->assertSame(0, $agent->executions()->count());
    }

    public function test_registro_valida_os_campos_de_entrada(): void
    {
        $agent = $this->makeAgent(10);
        $this->actingAsCs();

        $this->postJson("/api/agents/{$agent->id}/executions", [
            'status' => 'invalido',
            'duration_ms' => -5,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status', 'duration_ms']);

        $this->postJson("/api/agents/{$agent->id}/executions", [
            'status' => 'success',
            'error_message' => 'não deveria estar aqui',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('error_message');
    }

    public function test_usuario_de_cliente_registra_execucao_no_proprio_agente(): void
    {
        $agent = $this->makeAgent(10);
        $this->actingAsClientUser($agent->client);

        $this->postJson("/api/agents/{$agent->id}/executions", ['status' => 'success'])
            ->assertCreated();
    }

    public function test_usuario_de_cliente_nao_acessa_execucoes_de_agente_alheio(): void
    {
        $mine = Client::factory()->create();
        $otherAgent = $this->makeAgent(10);
        $this->actingAsClientUser($mine);

        $this->postJson("/api/agents/{$otherAgent->id}/executions", ['status' => 'success'])
            ->assertNotFound();
        $this->getJson("/api/agents/{$otherAgent->id}/executions")
            ->assertNotFound();
    }

    public function test_historico_e_paginado_do_mais_recente_para_o_mais_antigo(): void
    {
        $agent = $this->makeAgent(100);
        Execution::factory()->count(25)->create([
            'agent_id' => $agent->id,
            'executed_at' => now()->subHour(),
        ]);
        $latest = Execution::factory()->create([
            'agent_id' => $agent->id,
            'executed_at' => now(),
        ]);
        $this->actingAsCs();

        $this->getJson("/api/agents/{$agent->id}/executions")
            ->assertOk()
            ->assertJsonCount(15, 'data')
            ->assertJsonPath('data.0.id', $latest->id)
            ->assertJsonPath('meta.total', 26);

        $this->getJson("/api/agents/{$agent->id}/executions?page=2")
            ->assertOk()
            ->assertJsonCount(11, 'data');

        $this->getJson("/api/agents/{$agent->id}/executions?per_page=5")
            ->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_paginacao_valida_o_tamanho_da_pagina(): void
    {
        $agent = $this->makeAgent(10);
        $this->actingAsCs();

        $this->getJson("/api/agents/{$agent->id}/executions?per_page=500")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('per_page');
    }

    public function test_rotas_de_execucao_exigem_autenticacao(): void
    {
        $agent = $this->makeAgent(10);

        $this->getJson("/api/agents/{$agent->id}/executions")->assertUnauthorized();
        $this->postJson("/api/agents/{$agent->id}/executions", ['status' => 'success'])->assertUnauthorized();
    }
}
