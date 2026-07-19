<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class PlanLimitReachedException extends Exception
{
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => 'O limite mensal de execuções do plano foi atingido.',
        ], 429);
    }
}
