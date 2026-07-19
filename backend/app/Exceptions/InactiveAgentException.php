<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class InactiveAgentException extends Exception
{
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => 'O agente está inativo e não registra novas execuções.',
        ], 409);
    }
}
