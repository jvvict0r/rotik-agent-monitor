<?php

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'Plano '.fake()->unique()->word(),
            'monthly_execution_limit' => fake()->numberBetween(100, 10000),
        ];
    }
}
