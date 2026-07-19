<?php

namespace Tests\Feature;

use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ActsAsUsers;
use Tests\TestCase;

class ClientEndpointsTest extends TestCase
{
    use ActsAsUsers, RefreshDatabase;

    public function test_cs_lista_todos_os_clientes_com_plano(): void
    {
        Client::factory()->count(3)->create();
        $this->actingAsCs();

        $this->getJson('/api/clients')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'plan' => ['id', 'name', 'monthly_execution_limit']]]]);
    }

    public function test_usuario_de_cliente_nao_acessa_a_lista_de_clientes(): void
    {
        $client = Client::factory()->create();
        $this->actingAsClientUser($client);

        $this->getJson('/api/clients')->assertForbidden();
    }

    public function test_lista_de_clientes_exige_autenticacao(): void
    {
        $this->getJson('/api/clients')->assertUnauthorized();
    }
}
