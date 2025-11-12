<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\SuperAdminStoreRequest;
use App\Http\Requests\SuperAdminUpdateRequest;

class SuperAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('profile')->where('role', 'super_admin');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $superAdmins = $query->paginate($perPage);

        // Add computed status
        $superAdmins->getCollection()->transform(function ($superAdmin) {
            $superAdmin->status = $superAdmin->blocked_at ? 'blocked' : 'active';
            return $superAdmin;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Super Admins retrieved successfully',
            'data' => $superAdmins,
        ]);
    }

    public function store(SuperAdminStoreRequest $request)
    {
        DB::beginTransaction();
        try {
            $user = User::create([
                'role' => 'super_admin',
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            Profile::create([
                'user_id' => $user->id,
                'full_name' => $request->full_name,
                'gender' => $request->gender,
                'nickname' => $request->nickname,
                'birth_date' => $request->birth_date,
                'phone_number' => $request->phone_number,
                'hobby' => $request->hobby,
                'address' => $request->address,
                'job' => $request->job,
                'profile_picture' => $request->profile_picture,
                'status' => $request->status ?? 'Aktif',
                'status_note' => $request->status_note,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Super Admin created successfully',
                'data' => $user->load('profile'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create super admin',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(User $superAdmin)
    {
        if ($superAdmin->role !== 'super_admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a super admin',
            ], 404);
        }

        // Add computed status
        $superAdmin->status = $superAdmin->blocked_at ? 'blocked' : 'active';

        return response()->json([
            'status' => 'success',
            'message' => 'Super Admin retrieved successfully',
            'data' => $superAdmin->load('profile'),
        ]);
    }

    public function update(SuperAdminUpdateRequest $request, User $superAdmin)
    {
        if ($superAdmin->role !== 'super_admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a super admin',
            ], 404);
        }

        DB::beginTransaction();
        try {
            $superAdmin->update([
                'email' => $request->email,
                'password' => $request->password ? Hash::make($request->password) : $superAdmin->password,
            ]);

            $superAdmin->profile->update([
                'full_name' => $request->full_name,
                'gender' => $request->gender,
                'nickname' => $request->nickname,
                'birth_date' => $request->birth_date,
                'phone_number' => $request->phone_number,
                'hobby' => $request->hobby,
                'address' => $request->address,
                'job' => $request->job,
                'profile_picture' => $request->profile_picture,
                'status' => $request->status,
                'status_note' => $request->status_note,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Super Admin updated successfully',
                'data' => $superAdmin->load('profile'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update super admin',
                'errors' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(User $superAdmin)
    {
        if ($superAdmin->role !== 'super_admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a super admin',
            ], 404);
        }

        // Prevent deleting self
        if ($superAdmin->id === Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete your own account',
            ], 403);
        }

        $superAdmin->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Super Admin deleted successfully',
        ]);
    }

    public function block(User $superAdmin)
    {
        if ($superAdmin->role !== 'super_admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a super admin',
            ], 404);
        }

        // Prevent blocking self
        if ($superAdmin->id === Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot block your own account',
            ], 403);
        }

        $superAdmin->update(['blocked_at' => now()]);

        return response()->json([
            'status' => 'success',
            'message' => 'Super Admin blocked successfully',
        ]);
    }

    public function unblock(User $superAdmin)
    {
        if ($superAdmin->role !== 'super_admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a super admin',
            ], 404);
        }

        $superAdmin->update(['blocked_at' => null]);

        return response()->json([
            'status' => 'success',
            'message' => 'Super Admin unblocked successfully',
        ]);
    }
}