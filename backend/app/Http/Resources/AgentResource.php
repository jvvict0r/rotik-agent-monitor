<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'executions_this_month' => $this->whenLoaded('monthlyUsages', fn () => [
                'success' => $this->monthlyUsages->first()?->success_count ?? 0,
                'failed' => $this->monthlyUsages->first()?->failed_count ?? 0,
            ]),
        ];
    }
}
