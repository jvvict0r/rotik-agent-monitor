<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_com_credenciais_validas_devolve_token_e_perfil(): void
    {
        $user = User::factory()->create(['email' => 'cs@rotik.com']);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'cs@rotik.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.role', 'cs');

        $this->assertSame(1, $user->tokens()->count());
    }

    public function test_usuario_de_cliente_recebe_os_dados_do_proprio_cliente_no_login(): void
    {
        $client = Client::factory()->create(['name' => 'Acme Atendimentos']);
        User::factory()->forClient($client)->create(['email' => 'ana@acme.com']);

        $this->postJson('/api/auth/login', [
            'email' => 'ana@acme.com',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('user.role', 'client')
            ->assertJsonPath('user.client.name', 'Acme Atendimentos');
    }

    public function test_senha_incorreta_devolve_422_sem_criar_token(): void
    {
        $user = User::factory()->create(['email' => 'cs@rotik.com']);

        $this->postJson('/api/auth/login', [
            'email' => 'cs@rotik.com',
            'password' => 'senha-errada',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_login_valida_os_campos_de_entrada(): void
    {
        $this->postJson('/api/auth/login', ['email' => 'nao-e-email'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_rota_protegida_sem_token_devolve_401(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_rota_protegida_sem_token_devolve_401_mesmo_sem_pedir_json(): void
    {
        $this->post('/api/auth/logout')
            ->assertUnauthorized()
            ->assertJson(['message' => 'Não autenticado.']);
    }

    public function test_me_devolve_o_usuario_do_token(): void
    {
        User::factory()->create(['email' => 'cs@rotik.com']);
        $token = $this->postJson('/api/auth/login', [
            'email' => 'cs@rotik.com',
            'password' => 'password',
        ])->json('token');

        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'cs@rotik.com');
    }

    public function test_logout_revoga_o_token_atual(): void
    {
        User::factory()->create(['email' => 'cs@rotik.com']);
        $token = $this->postJson('/api/auth/login', [
            'email' => 'cs@rotik.com',
            'password' => 'password',
        ])->json('token');

        $this->withToken($token)->postJson('/api/auth/logout')->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_excesso_de_tentativas_de_login_devolve_429(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'cs@rotik.com',
                'password' => 'senha-errada',
            ])->assertUnprocessable();
        }

        $this->postJson('/api/auth/login', [
            'email' => 'cs@rotik.com',
            'password' => 'senha-errada',
        ])->assertTooManyRequests();
    }
}
