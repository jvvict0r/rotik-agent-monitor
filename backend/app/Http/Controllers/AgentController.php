<?php

namespace App\Http\Controllers;

use App\Enums\AgentStatus;
use App\Http\Requests\StoreAgentRequest;
use App\Http\Resources\AgentResource;
use App\Models\Client;
use App\Support\MonthlyPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class AgentController extends Controller
{
    public function index(Client $client): AnonymousResourceCollection
    {
        Gate::authorize('view', $client);

        $period = MonthlyPeriod::current();
        $client->load('plan');

        $agents = $client->agents()
            ->with(['monthlyUsages' => fn ($query) => $query->where('period', $period)])
            ->orderBy('name')
            ->get();

        $used = $client->monthlyUsages()->where('period', $period)->value('executions_count') ?? 0;
        $limit = $client->plan->monthly_execution_limit;

        return AgentResource::collection($agents)->additional([
            'meta' => [
                'usage' => [
                    'used' => $used,
                    'limit' => $limit,
                    'percentage' => $limit > 0 ? (int) round(100 * $used / $limit) : 100,
                    'is_blocked' => $used >= $limit,
                ],
            ],
        ]);
    }

    public function store(StoreAgentRequest $request, Client $client): JsonResponse
    {
        $agent = $client->agents()->create([
            ...$request->validated(),
            'status' => AgentStatus::Active,
        ]);
        $agent->setRelation('monthlyUsages', collect());

        return AgentResource::make($agent)->response()->setStatusCode(201);
    }
}
