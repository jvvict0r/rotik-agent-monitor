<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ExecutionController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/clients', [ClientController::class, 'index']);
    Route::get('/clients/{client}/agents', [AgentController::class, 'index']);
    Route::post('/clients/{client}/agents', [AgentController::class, 'store']);

    Route::get('/agents/{agent}/executions', [ExecutionController::class, 'index']);
    Route::post('/agents/{agent}/executions', [ExecutionController::class, 'store']);
});
