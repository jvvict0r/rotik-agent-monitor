<?php

namespace Tests\Feature;

use App\Models\Agent;
use App\Models\AgentMonthlyUsage;
use App\Models\Client;
use App\Models\ClientMonthlyUsage;
use App\Models\Plan;
use App\Support\MonthlyPeriod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ActsAsUsers;
use Tests\TestCase;

class AgentEndpointsTest extends TestCase
{
    use ActsAsUsers, RefreshDatabase;

    private function makeClient(int $monthlyLimit): Client
    {
        $plan = Plan::factory()->create(['monthly_execution_limit' => $monthlyLimit]);

        return Client::factory()->create(['plan_id' => $plan->id]);
    }

    private function seedUsage(Client $client, Agent $agent, int $success, int $failed = 0): void
    {
        ClientMonthlyUsage::create([
            'client_id' => $client->id,
            'period' => MonthlyPeriod::current(),
            'executions_count' => $success,
        ]);

        AgentMonthlyUsage::create([
            'agent_id' => $agent->id,
            'period' => MonthlyPeriod::current(),
            'success_count' => $success,
            'failed_count' => $failed,
        ]);
    }

    public function test_cs_lista_agentes_de_qualquer_cliente_com_consumo_do_mes(): void
    {
        $client = $this->makeClient(10);
        $agent = Agent::factory()->create(['client_id' => $client->id, 'name' => 'Suporte N1']);
        Agent::factory()->create(['client_id' => $client->id, 'name' => 'Vendas']);
        $this->seedUsage($client, $agent, 3, 1);

        $this->actingAsCs();

        $this->getJson("/api/clients/{$client->id}/agents")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Suporte N1')
            ->assertJsonPath('data.0.executions_this_month.success', 3)
            ->assertJsonPath('data.0.executions_this_month.failed', 1)
            ->assertJsonPath('meta.usage.used', 3)
            ->assertJsonPath('meta.usage.limit', 10)
            ->assertJsonPath('meta.usage.percentage', 30)
            ->assertJsonPath('meta.usage.is_blocked', false);
    }

    public function test_usuario_de_cliente_lista_os_proprios_agentes(): void
    {
        $client = $this->makeClient(10);
        Agent::factory()->create(['client_id' => $client->id]);
        $this->actingAsClientUser($client);

        $this->getJson("/api/clients/{$client->id}/agents")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_usuario_de_cliente_nao_enxerga_agentes_de_outro_cliente(): void
    {
        $mine = $this->makeClient(10);
        $other = $this->makeClient(10);
        Agent::factory()->create(['client_id' => $other->id]);
        $this->actingAsClientUser($mine);

        $this->getJson("/api/clients/{$other->id}/agents")->assertNotFound();
    }

    public function test_cliente_no_limite_aparece_como_bloqueado(): void
    {
        $client = $this->makeClient(5);
        $agent = Agent::factory()->create(['client_id' => $client->id]);
        $this->seedUsage($client, $agent, 5);

        $this->actingAsCs();

        $this->getJson("/api/clients/{$client->id}/agents")
            ->assertOk()
            ->assertJsonPath('meta.usage.percentage', 100)
            ->assertJsonPath('meta.usage.is_blocked', true);
    }

    public function test_cadastra_agente_para_um_cliente(): void
    {
        $client = $this->makeClient(10);
        $this->actingAsCs();

        $this->postJson("/api/clients/{$client->id}/agents", [
            'name' => 'Novo Agente',
            'description' => 'Atende o WhatsApp da loja',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Novo Agente')
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.executions_this_month.success', 0);

        $this->assertDatabaseHas('agents', [
            'client_id' => $client->id,
            'name' => 'Novo Agente',
        ]);
    }

    public function test_cadastro_valida_os_campos_de_entrada(): void
    {
        $client = $this->makeClient(10);
        $this->actingAsCs();

        $this->postJson("/api/clients/{$client->id}/agents", ['description' => str_repeat('x', 1001)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'description']);
    }

    public function test_cadastro_rejeita_nome_duplicado_no_mesmo_cliente(): void
    {
        $client = $this->makeClient(10);
        Agent::factory()->create(['client_id' => $client->id, 'name' => 'Suporte N1']);
        $this->actingAsCs();

        $this->postJson("/api/clients/{$client->id}/agents", ['name' => 'Suporte N1'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_clientes_diferentes_podem_ter_agentes_com_o_mesmo_nome(): void
    {
        $clientA = $this->makeClient(10);
        $clientB = $this->makeClient(10);
        Agent::factory()->create(['client_id' => $clientA->id, 'name' => 'Suporte N1']);
        $this->actingAsCs();

        $this->postJson("/api/clients/{$clientB->id}/agents", ['name' => 'Suporte N1'])
            ->assertCreated();
    }

    public function test_usuario_de_cliente_nao_cadastra_agente_em_outro_cliente(): void
    {
        $mine = $this->makeClient(10);
        $other = $this->makeClient(10);
        $this->actingAsClientUser($mine);

        $this->postJson("/api/clients/{$other->id}/agents", ['name' => 'Invasor'])
            ->assertNotFound();

        $this->assertDatabaseMissing('agents', ['name' => 'Invasor']);
    }

    public function test_cliente_inexistente_devolve_404(): void
    {
        $this->actingAsCs();

        $this->getJson('/api/clients/999999/agents')->assertNotFound();
    }

    public function test_rotas_de_agentes_exigem_autenticacao(): void
    {
        $client = $this->makeClient(10);

        $this->getJson("/api/clients/{$client->id}/agents")->assertUnauthorized();
        $this->postJson("/api/clients/{$client->id}/agents", ['name' => 'X'])->assertUnauthorized();
    }
}
