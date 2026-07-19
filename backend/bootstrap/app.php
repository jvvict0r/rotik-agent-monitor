<?php

use App\Exceptions\InactiveAgentException;
use App\Exceptions\PlanLimitReachedException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->dontReport([
            InactiveAgentException::class,
            PlanLimitReachedException::class,
        ]);

        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if (! $request->is('api/*') || method_exists($exception, 'render')) {
                return $response;
            }

            $status = $response->getStatusCode();

            if ($status === 500 && config('app.debug')) {
                return $response;
            }

            $messages = [
                401 => 'Não autenticado.',
                403 => 'Ação não autorizada.',
                404 => 'Recurso não encontrado.',
                405 => 'Método não permitido para esta rota.',
                429 => 'Muitas requisições. Tente novamente em instantes.',
                500 => 'Erro interno. Tente novamente mais tarde.',
            ];

            if (! isset($messages[$status])) {
                return $response;
            }

            $headers = array_filter([
                'Retry-After' => $response->headers->get('Retry-After'),
            ], fn ($value) => $value !== null);

            return response()->json(['message' => $messages[$status]], $status)->withHeaders($headers);
        });
    })->create();
