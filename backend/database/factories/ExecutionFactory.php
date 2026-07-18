<?php

namespace Database\Factories;

use App\Enums\ExecutionStatus;
use App\Models\Agent;
use App\Models\Execution;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Execution>
 */
class ExecutionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'agent_id' => Agent::factory(),
            'status' => ExecutionStatus::Success,
            'duration_ms' => fake()->numberBetween(180, 9000),
            'error_message' => null,
            'executed_at' => now(),
        ];
    }

    public function failed(): static
    {
        return $this->state([
            'status' => ExecutionStatus::Failed,
            'error_message' => fake()->randomElement([
                'Timeout ao consultar o modelo',
                'Limite de tokens excedido na resposta',
                'Falha de conexão com a base de conhecimento',
            ]),
        ]);
    }
}
