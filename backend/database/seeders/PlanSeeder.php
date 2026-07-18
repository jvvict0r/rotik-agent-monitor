<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['Starter', 500],
            ['Pro', 5000],
            ['Enterprise', 50000],
        ] as [$name, $limit]) {
            Plan::firstOrCreate(['name' => $name], ['monthly_execution_limit' => $limit]);
        }
    }
}
