<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            if (!$request->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authentication required.',
                ], 401);
            }

            if (!$request->user()->isAdmin()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Admin access required.',
                ], 403);
            }

            return $next($request);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authorization failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}