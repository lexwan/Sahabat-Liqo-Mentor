<?php

use App\Http\Middleware\CorsMiddleware;
use App\Http\Middleware\EnsureTokenNotExpired;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsSuperAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', 
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // 1. Daftarkan alias agar bisa dipanggil lewat string di route
        $middleware->alias([
            'cors' => CorsMiddleware::class,
            'token.valid' => EnsureTokenNotExpired::class,
            'is_admin' => IsAdmin::class,
            'is_super_admin' => IsSuperAdmin::class,
        ]);

        // 2. Tambahkan ke group API agar otomatis diterapkan ke semua route api
        $middleware->api(prepend: [
            CorsMiddleware::class,
            \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
            \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
        ]);
        
        $middleware->web(append: [
            \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        ]);
        
        $middleware->api(append: [
            EnsureTokenNotExpired::class,
        ]);
        
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
