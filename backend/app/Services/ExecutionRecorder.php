<?php

namespace App\Services;

use App\Enums\AgentStatus;
use App\Enums\ExecutionStatus;
use App\Exceptions\InactiveAgentException;
use App\Exceptions\PlanLimitReachedException;
use App\Models\Agent;
use App\Models\AgentMonthlyUsage;
use App\Models\ClientMonthlyUsage;
use App\Models\Execution;
use App\Support\MonthlyPeriod;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExecutionRecorder
{
    public function record(Agent $agent, ExecutionStatus $status, ?int $durationMs = null, ?string $errorMessage = null): Execution
    {
        if ($agent->status === AgentStatus::Inactive) {
            throw new InactiveAgentException;
        }

        $agent->loadMissing('client.plan');
        $period = MonthlyPeriod::current();

        return DB::transaction(function () use ($agent, $status, $durationMs, $errorMessage, $period) {
            $usage = $this->lockClientUsage($agent->client_id, $period);
            $limit = $agent->client->plan->monthly_execution_limit;

            if ($usage->executions_count >= $limit) {
                Log::warning('Execução bloqueada por limite do plano', [
                    'client_id' => $agent->client_id,
                    'agent_id' => $agent->id,
                    'period' => $period,
                    'limit' => $limit,
                ]);

                throw new PlanLimitReachedException;
            }

            $execution = $agent->executions()->create([
                'status' => $status,
                'duration_ms' => $durationMs,
                'error_message' => $errorMessage,
                'executed_at' => now(),
            ]);

            if ($status === ExecutionStatus::Success) {
                $usage->increment('executions_count');
            }

            $this->incrementAgentUsage($agent->id, $period, $status);

            return $execution;
        });
    }

    private function lockClientUsage(int $clientId, string $period): ClientMonthlyUsage
    {
        ClientMonthlyUsage::query()->insertOrIgnore([
            'client_id' => $clientId,
            'period' => $period,
            'executions_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return ClientMonthlyUsage::query()
            ->where('client_id', $clientId)
            ->where('period', $period)
            ->lockForUpdate()
            ->firstOrFail();
    }

    private function incrementAgentUsage(int $agentId, string $period, ExecutionStatus $status): void
    {
        AgentMonthlyUsage::query()->insertOrIgnore([
            'agent_id' => $agentId,
            'period' => $period,
            'success_count' => 0,
            'failed_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        AgentMonthlyUsage::query()
            ->where('agent_id', $agentId)
            ->where('period', $period)
            ->increment($status === ExecutionStatus::Success ? 'success_count' : 'failed_count');
    }
}
