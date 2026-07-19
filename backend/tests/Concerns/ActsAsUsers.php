<?php

namespace Tests\Concerns;

use App\Models\Client;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

trait ActsAsUsers
{
    protected function actingAsCs(): User
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        return $user;
    }

    protected function actingAsClientUser(Client $client): User
    {
        $user = User::factory()->forClient($client)->create();
        Sanctum::actingAs($user);

        return $user;
    }
}
