<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'service' => 'Rotik Agent Monitor API',
    'status' => 'ok',
]));
