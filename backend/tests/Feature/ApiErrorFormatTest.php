<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use RuntimeException;
use Tests\Concerns\ActsAsUsers;
use Tests\TestCase;

class ApiErrorFormatTest extends TestCase
{
    use ActsAsUsers, RefreshDatabase;

    public function test_rota_inexistente_devolve_404_padronizado(): void
    {
        $this->getJson('/api/rota-que-nao-existe')
            ->assertNotFound()
            ->assertExactJson(['message' => 'Recurso não encontrado.']);
    }

    public function test_id_inexistente_devolve_404_sem_vazar_o_nome_do_model(): void
    {
        $this->actingAsCs();

        $response = $this->getJson('/api/clients/999999/agents')->assertNotFound();

        $response->assertExactJson(['message' => 'Recurso não encontrado.']);
        $this->assertStringNotContainsString('App\\Models', $response->getContent());
    }

    public function test_metodo_nao_permitido_devolve_405_padronizado(): void
    {
        $this->deleteJson('/api/clients')
            ->assertStatus(405)
            ->assertExactJson(['message' => 'Método não permitido para esta rota.']);
    }

    public function test_requisicao_sem_token_devolve_401_padronizado(): void
    {
        $this->getJson('/api/clients')
            ->assertUnauthorized()
            ->assertExactJson(['message' => 'Não autenticado.']);
    }

    public function test_erro_interno_nao_vaza_detalhes_com_debug_desligado(): void
    {
        config(['app.debug' => false]);

        Route::get('/api/rota-que-quebra', fn () => throw new RuntimeException('segredo interno'));

        $response = $this->getJson('/api/rota-que-quebra')->assertStatus(500);

        $response->assertExactJson(['message' => 'Erro interno. Tente novamente mais tarde.']);
        $this->assertStringNotContainsString('segredo interno', $response->getContent());
    }

    public function test_erro_de_validacao_mantem_o_formato_detalhado(): void
    {
        $this->postJson('/api/auth/login', [])
            ->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors' => ['email', 'password']]);
    }
}
