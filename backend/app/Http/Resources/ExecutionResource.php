<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExecutionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'duration_ms' => $this->duration_ms,
            'error_message' => $this->error_message,
            'executed_at' => $this->executed_at?->toIso8601String(),
        ];
    }
}
