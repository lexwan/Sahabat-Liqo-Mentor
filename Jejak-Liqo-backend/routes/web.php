<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Named login route to prevent RouteNotFoundException
Route::get('/login', function () {
    return response()->json([
        'message' => 'Please login via POST /api/login',
        'status' => 'unauthenticated'
    ], 401);
})->name('login');

Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    
    if (!file_exists($fullPath)) {
        return response('File not found', 404);
    }
    
    return response()->file($fullPath);
})->where('path', '.*');