<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\AdminStoreRequest;
use App\Http\Requests\AdminUpdateRequest;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('profile')->where('role', 'admin')->whereNull('deleted_at');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $admins = $query->paginate($perPage);

        // Add computed status and create profile if missing
        $admins->getCollection()->transform(function ($admin) {
            // Create profile if missing
            if (!$admin->profile) {
                Profile::create([
                    'user_id' => $admin->id,
                    'full_name' => 'Admin User',
                    'status' => 'Aktif'
                ]);
                $admin->load('profile');
            }
            
            $admin->status = $admin->blocked_at ? 'blocked' : 'active';
            return $admin;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Admins retrieved successfully',
            'data' => $admins,
        ]);
    }

    public function debug()
    {
        $allAdmins = User::where('role', 'admin')->with('profile')->get();
        $activeAdmins = User::where('role', 'admin')->whereNull('deleted_at')->with('profile')->get();
        $trashedAdmins = User::onlyTrashed()->where('role', 'admin')->with('profile')->get();
        
        return response()->json([
            'all_admins' => $allAdmins,
            'active_admins' => $activeAdmins,
            'trashed_admins' => $trashedAdmins,
            'counts' => [
                'total' => $allAdmins->count(),
                'active' => $activeAdmins->count(),
                'trashed' => $trashedAdmins->count()
            ]
        ]);
    }

    public function store(AdminStoreRequest $request)
    {
        DB::beginTransaction();
        try {
            \Log::info('Creating admin', [
                'request_data' => $request->except(['password', 'profile_picture'])
            ]);
            
            $user = User::create([
                'role' => 'admin',
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $profilePicturePath = null;
            if ($request->hasFile('profile_picture')) {
                $profilePicturePath = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            Profile::create([
                'user_id' => $user->id,
                'full_name' => $request->full_name,
                'nickname' => $request->nickname,
                'birth_date' => $request->birth_date,
                'phone_number' => $request->phone_number,
                'hobby' => $request->hobby,
                'address' => $request->address,
                'job' => $request->job,
                'profile_picture' => $profilePicturePath,
                'status' => $request->status ?? 'Aktif',
                'status_note' => $request->status_note,
                'gender' => $request->gender,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Admin created successfully',
                'data' => $user->load('profile'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Admin creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create admin',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(User $admin)
    {
        if ($admin->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not an admin',
            ], 404);
        }

        // Add computed status
        $admin->status = $admin->blocked_at ? 'blocked' : 'active';

        return response()->json([
            'status' => 'success',
            'message' => 'Admin retrieved successfully',
            'data' => $admin->load('profile'),
        ]);
    }

    public function update(AdminUpdateRequest $request, User $admin)
    {
        if ($admin->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not an admin',
            ], 404);
        }

        DB::beginTransaction();
        try {
            \Log::info('Updating admin', [
                'admin_id' => $admin->id,
                'request_data' => $request->except(['password', 'profile_picture']),
                'gender_value' => $request->gender
            ]);
            
            // Update user data
            $userData = ['email' => $request->email];
            if ($request->password) {
                $userData['password'] = Hash::make($request->password);
            }
            $admin->update($userData);

            // Ensure profile exists
            if (!$admin->profile) {
                Profile::create([
                    'user_id' => $admin->id,
                    'full_name' => $request->full_name ?? 'Admin User',
                    'status' => 'Aktif'
                ]);
                $admin->load('profile');
            }

            $profileData = [
                'full_name' => $request->full_name,
                'nickname' => $request->nickname,
                'birth_date' => $request->birth_date,
                'phone_number' => $request->phone_number,
                'hobby' => $request->hobby,
                'address' => $request->address,
                'job' => $request->job,
                'status' => $request->status,
                'status_note' => $request->status_note,
                'gender' => $request->gender,
            ];

            if ($request->hasFile('profile_picture')) {
                // Delete old profile picture if exists
                if ($admin->profile && $admin->profile->profile_picture) {
                    \Storage::disk('public')->delete($admin->profile->profile_picture);
                }
                $profileData['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            $admin->profile->update($profileData);
            
            \Log::info('Profile updated', [
                'admin_id' => $admin->id,
                'updated_gender' => $admin->profile->fresh()->gender,
                'profile_data' => $profileData
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Admin updated successfully',
                'data' => $admin->load('profile'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Admin update failed', [
                'admin_id' => $admin->id ?? 'unknown',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update admin',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(User $admin)
    {
        if ($admin->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not an admin',
            ], 404);
        }

        // Prevent deleting self
        if ($admin->id === Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete your own account',
            ], 403);
        }

        $admin->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Admin deleted successfully',
        ]);
    }

    public function block(User $admin)
    {
        if ($admin->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not an admin',
            ], 404);
        }

        // Prevent blocking self
        if ($admin->id === Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot block your own account',
            ], 403);
        }

        $admin->update(['blocked_at' => now()]);

        return response()->json([
            'status' => 'success',
            'message' => 'Admin blocked successfully',
        ]);
    }

    public function unblock(User $admin)
    {
        if ($admin->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not an admin',
            ], 404);
        }

        $admin->update(['blocked_at' => null]);

        return response()->json([
            'status' => 'success',
            'message' => 'Admin unblocked successfully',
        ]);
    }

    public function trashed()
    {
        $trashedAdmins = User::onlyTrashed()
            ->with('profile')
            ->where('role', 'admin')
            ->orderBy('deleted_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Trashed admins retrieved successfully',
            'data' => $trashedAdmins,
        ]);
    }

    public function restore($id)
    {
        $admin = User::onlyTrashed()->where('role', 'admin')->findOrFail($id);
        $admin->restore();

        return response()->json([
            'status' => 'success',
            'message' => 'Admin restored successfully',
        ]);
    }

    public function forceDelete($id)
    {
        $admin = User::onlyTrashed()->where('role', 'admin')->findOrFail($id);
        
        // Delete related profile first
        if ($admin->profile) {
            $admin->profile->forceDelete();
        }
        
        $admin->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => 'Admin permanently deleted',
        ]);
    }
}
