<?php

namespace App\Policies;

use App\Models\Agent;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AgentPolicy
{
    public function view(User $user, Agent $agent): Response
    {
        return $user->isCs() || $user->client_id === $agent->client_id
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}
