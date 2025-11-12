<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\LoginAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\UserResource;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::with('profile')->where('email', $request->email)->first();

        $status = 'Failed';

        if ($user) {
            if ($user->blocked_at) {
                $contact = $user->role === 'mentor' ? 'admin' : 'super admin';
                $blockedAt = $user->blocked_at->format('d/m/Y H:i:s');

                throw ValidationException::withMessages([
                    'email' => ["Akun {$user->role} telah diblokir pada {$blockedAt}, silahkan hubungi {$contact}"],
                ]);
            }

            if (Hash::check($request->password, $user->password)) {
                $status = 'Success';

                // 🔒 Strict Single Session
                $user->tokens()->delete();

                $token = $user->tokens()->create([
                    'name' => 'auth-token',
                    'token' => hash('sha256', $plainTextToken = Str::random(80)),
                    'abilities' => ['*'],
                    'expires_at' => now()->addHours(3), // langsung isi di sini
                ]);

                // 🧠 Catat login attempt berhasil
                LoginAttempt::create([
                    'user_id' => $user->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                    'status' => $status,
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Login successful',
                    'data' => [
                        'user' => new UserResource($user),
                        'token' => $plainTextToken,
                        'token_expires_at' => $token->expires_at->timestamp,
                    ],
                ]);
            }
        }

        // Hanya catat login attempt jika user ditemukan
        if ($user) {
            LoginAttempt::create([
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'status' => $status,
            ]);
        }

        throw ValidationException::withMessages([
            'email' => ['Invalid credentials'],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout successful',
        ]);
    }

    public function logoutAll(Request $request)
    {
        $user = $request->user();

        // Hapus semua token milik user ini
        $user->tokens()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'All sessions have been logged out.',
        ]);
    }
    
    public function me(Request $request)
    {
        $user = $request->user()->load('profile');
        
        return response()->json([
            'status' => 'success',
            'data' => new UserResource($user)
        ]);
    }
}