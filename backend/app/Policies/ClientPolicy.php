<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isCs();
    }

    public function view(User $user, Client $client): Response
    {
        return $user->isCs() || $user->client_id === $client->id
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}
