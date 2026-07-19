<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'plan' => $this->whenLoaded('plan', fn () => [
                'id' => $this->plan->id,
                'name' => $this->plan->name,
                'monthly_execution_limit' => $this->plan->monthly_execution_limit,
            ]),
        ];
    }
}
