<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureTokenNotExpired
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken && $accessToken->expires_at && $accessToken->expires_at->isPast()) {
                // Token sudah kadaluarsa → hapus dan beri respon 401
                $accessToken->delete();
                return response()->json([
                    'message' => 'Token kadaluarsa. Silakan login ulang.',
                ], 401);
            }
        }
        return $next($request);
    }
}
