<?php

namespace App\Http\Controllers;

use App\Enums\ExecutionStatus;
use App\Http\Requests\ListExecutionsRequest;
use App\Http\Requests\StoreExecutionRequest;
use App\Http\Resources\ExecutionResource;
use App\Models\Agent;
use App\Services\ExecutionRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExecutionController extends Controller
{
    public function index(ListExecutionsRequest $request, Agent $agent): AnonymousResourceCollection
    {
        $executions = $agent->executions()
            ->orderByDesc('executed_at')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 15));

        return ExecutionResource::collection($executions);
    }

    public function store(StoreExecutionRequest $request, Agent $agent, ExecutionRecorder $recorder): JsonResponse
    {
        $execution = $recorder->record(
            $agent,
            ExecutionStatus::from($request->validated('status')),
            $request->validated('duration_ms'),
            $request->validated('error_message'),
        );

        return ExecutionResource::make($execution)->response()->setStatusCode(201);
    }
}
