<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['agent_id', 'period', 'success_count', 'failed_count'])]
class AgentMonthlyUsage extends Model
{
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }
}
