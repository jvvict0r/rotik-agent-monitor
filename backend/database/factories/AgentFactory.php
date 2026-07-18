<?php

namespace Database\Factories;

use App\Enums\AgentStatus;
use App\Models\Agent;
use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Agent>
 */
class AgentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'name' => 'Agente '.fake()->unique()->words(2, true),
            'description' => fake()->sentence(),
            'status' => AgentStatus::Active,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['status' => AgentStatus::Inactive]);
    }
}
