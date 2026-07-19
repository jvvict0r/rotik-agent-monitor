<?php

namespace Tests\Feature;

use App\Enums\ExecutionStatus;
use App\Exceptions\PlanLimitReachedException;
use App\Models\Agent;
use App\Models\Client;
use App\Models\Plan;
use App\Services\ExecutionRecorder;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ExecutionRecorderConcurrencyTest extends TestCase
{
    use DatabaseTruncation;

    /**
     * Dispara dois processos reais disputando a última vaga do limite:
     * o lock no contador do cliente deve deixar exatamente um passar.
     */
    public function test_apenas_uma_de_duas_execucoes_simultaneas_ocupa_a_ultima_vaga(): void
    {
        if (! extension_loaded('pcntl')) {
            $this->markTestSkipped('Extensão pcntl indisponível.');
        }

        $plan = Plan::factory()->create(['monthly_execution_limit' => 1]);
        $client = Client::factory()->create(['plan_id' => $plan->id]);
        $agent = Agent::factory()->create(['client_id' => $client->id]);

        DB::disconnect();

        $pids = [];

        for ($i = 0; $i < 2; $i++) {
            $pid = pcntl_fork();

            if ($pid === 0) {
                usleep(30000);

                try {
                    app(ExecutionRecorder::class)->record($agent, ExecutionStatus::Success);
                    exit(0);
                } catch (PlanLimitReachedException) {
                    exit(1);
                } catch (\Throwable) {
                    exit(2);
                }
            }

            $pids[] = $pid;
        }

        $exitCodes = [];

        foreach ($pids as $pid) {
            pcntl_waitpid($pid, $status);
            $exitCodes[] = pcntl_wexitstatus($status);
        }

        sort($exitCodes);

        $this->assertSame([0, 1], $exitCodes, 'Esperava exatamente uma execução aceita e uma bloqueada.');
        $this->assertSame(1, $agent->executions()->count());
        $this->assertDatabaseHas('client_monthly_usages', [
            'client_id' => $client->id,
            'executions_count' => 1,
        ]);
    }
}
