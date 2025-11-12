<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('profile')->paginate(10);
        return response()->json([
            'status' => 'success',
            'message' => 'Users fetched successfully',
            'data' => UserResource::collection($users),
        ]);
    }

    public function show(User $user)
    {
        $user->load('profile');
        return response()->json([
            'status' => 'success',
            'message' => 'User fetched successfully',
            'data' => new UserResource($user),
        ]);
    }
}