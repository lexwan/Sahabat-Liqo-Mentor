<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\MentorStoreRequest;
use App\Http\Requests\MentorUpdateRequest;
use App\Http\Resources\MentorResource;

class MentorController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('profile')->where('role', 'mentor')->whereNull('deleted_at');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhereHas('profile', function($q) use ($search) {
                      $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('nickname', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by gender
        if ($request->has('gender')) {
            $query->whereHas('profile', function($q) use ($request) {
                $q->where('gender', $request->gender);
            });
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'blocked') {
                $query->whereNotNull('blocked_at');
            } elseif ($request->status === 'active') {
                $query->whereNull('blocked_at');
            } else {
                $query->whereHas('profile', function($q) use ($request) {
                    $q->where('status', $request->status);
                });
            }
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $mentors = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Add computed status and create profile if missing
        $mentors->getCollection()->transform(function ($mentor) {
            // Create profile if missing
            if (!$mentor->profile) {
                Profile::create([
                    'user_id' => $mentor->id,
                    'full_name' => 'Mentor User',
                    'status' => 'Aktif'
                ]);
                $mentor->load('profile');
            }
            
            $mentor->status = $mentor->blocked_at ? 'blocked' : 'active';
            return $mentor;
        });

        // Get statistics
        $stats = $this->getStats();

        return response()->json([
            'status' => 'success',
            'message' => 'Mentors retrieved successfully',
            'data' => MentorResource::collection($mentors),
            'stats' => $stats,
            'meta' => [
                'current_page' => $mentors->currentPage(),
                'last_page' => $mentors->lastPage(),
                'per_page' => $mentors->perPage(),
                'total' => $mentors->total(),
                'from' => $mentors->firstItem(),
                'to' => $mentors->lastItem(),
                'has_more_pages' => $mentors->hasMorePages(),
                'prev_page_url' => $mentors->previousPageUrl(),
                'next_page_url' => $mentors->nextPageUrl(),
            ]
        ]);
    }

    public function store(MentorStoreRequest $request)
    {
        // Debug: Log received data
        \Log::info('Mentor store request data:', $request->all());
        
        DB::beginTransaction();
        try {
            // Normalize gender value
            $gender = $request->gender;
            if (in_array(strtolower($gender), ['ikhwan', 'laki-laki'])) {
                $gender = 'Ikhwan';
            } elseif (in_array(strtolower($gender), ['akhwat', 'perempuan'])) {
                $gender = 'Akhwat';
            }
            
            $user = User::create([
                'role' => 'mentor',
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
                'gender' => $gender,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Mentor created successfully',
                'data' => new MentorResource($user->load('profile')),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create mentor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        // Load relationships
        $mentor->load([
            'profile',
            'groups.mentees',
            'groups' => function($query) {
                $query->withCount('mentees');
            }
        ]);

        // Add computed status
        $mentor->status = $mentor->blocked_at ? 'blocked' : 'active';

        // Add statistics
        $mentor->loadCount([
            'groups',
            'groups as active_groups_count' => function($query) {
                $query->whereNull('deleted_at');
            }
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor retrieved successfully',
            'data' => new MentorResource($mentor),
        ]);
    }

    public function edit(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor data for edit fetched successfully',
            'data' => new MentorResource($mentor->load('profile')),
        ]);
    }

    public function update(MentorUpdateRequest $request, User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        DB::beginTransaction();
        try {
            // Update user data
            $userData = ['email' => $request->email];
            if ($request->password) {
                $userData['password'] = Hash::make($request->password);
            }
            $mentor->update($userData);

            // Ensure profile exists
            if (!$mentor->profile) {
                Profile::create([
                    'user_id' => $mentor->id,
                    'full_name' => $request->full_name ?? 'Mentor User',
                    'status' => 'Aktif'
                ]);
                $mentor->load('profile');
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
                if ($mentor->profile && $mentor->profile->profile_picture) {
                    \Storage::disk('public')->delete($mentor->profile->profile_picture);
                }
                $profileData['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            $mentor->profile->update($profileData);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Mentor updated successfully',
                'data' => new MentorResource($mentor->load('profile')),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update mentor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        // Prevent deleting self
        if ($mentor->id === Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete your own account',
            ], 403);
        }

        $mentor->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor deleted successfully',
        ]);
    }

    public function block(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        // Prevent blocking self
        if ($mentor->id === Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot block your own account',
            ], 403);
        }

        $mentor->update([
            'blocked_at' => now(),
            'blocked_by' => Auth::id()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor blocked successfully',
        ]);
    }

    public function unblock(User $mentor)
    {
        if ($mentor->role !== 'mentor') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a mentor',
            ], 404);
        }

        $mentor->update([
            'blocked_at' => null,
            'blocked_by' => null,
            'unblocked_at' => now(),
            'unblocked_by' => Auth::id()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor unblocked successfully',
        ]);
    }

    public function trashed(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $query = User::onlyTrashed()
            ->with('profile')
            ->where('role', 'mentor');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhereHas('profile', function($q) use ($search) {
                      $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('nickname', 'like', "%{$search}%");
                  });
            });
        }

        $mentors = $query->orderBy('deleted_at', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'message' => 'Trashed mentors retrieved successfully',
            'data' => MentorResource::collection($mentors),
            'meta' => [
                'current_page' => $mentors->currentPage(),
                'last_page' => $mentors->lastPage(),
                'per_page' => $mentors->perPage(),
                'total' => $mentors->total(),
            ]
        ]);
    }

    public function restore($id)
    {
        $mentor = User::onlyTrashed()->where('role', 'mentor')->findOrFail($id);
        $mentor->restore();

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor restored successfully',
        ]);
    }

    public function forceDelete($id)
    {
        $mentor = User::onlyTrashed()->where('role', 'mentor')->findOrFail($id);
        
        // Delete related profile first
        if ($mentor->profile) {
            $mentor->profile->forceDelete();
        }
        
        $mentor->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mentor permanently deleted',
        ]);
    }

    public function stats()
    {
        $stats = $this->getStats();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Mentor statistics fetched successfully',
            'data' => $stats,
        ]);
    }

    public function debug(Request $request)
    {
        return response()->json([
            'received_data' => $request->all(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
            'gender_value' => $request->get('gender'),
            'gender_type' => gettype($request->get('gender')),
        ]);
    }
    
    // ============================================
    // MENTOR DASHBOARD METHODS (for mentor role)
    // ============================================
    
    public function getGroups()
    {
        try {
            $mentorId = Auth::id();
            
            $groups = \App\Models\Group::with(['mentor.profile'])
                ->where('mentor_id', $mentorId)
                ->orderBy('created_at', 'desc')
                ->get();

            // Add category based on mentor's gender
            $groups->each(function ($group) {
                if ($group->mentor && $group->mentor->profile) {
                    $group->category = strtolower($group->mentor->profile->gender) === 'akhwat' ? 'akhwat' : 'ikhwan';
                }
            });

            return response()->json([
                'status' => 'success',
                'data' => $groups
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data kelompok'
            ], 500);
        }
    }

    public function getGroupDetail($groupId)
    {
        try {
            $mentorId = Auth::id();
            
            $group = \App\Models\Group::with(['mentor.profile', 'mentees'])
                ->where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            // Add category based on mentor's gender
            if ($group->mentor && $group->mentor->profile) {
                $group->category = strtolower($group->mentor->profile->gender) === 'akhwat' ? 'akhwat' : 'ikhwan';
            }

            return response()->json([
                'status' => 'success',
                'data' => $group
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil detail kelompok'
            ], 500);
        }
    }

    public function getDashboardStats()
    {
        try {
            $mentorId = Auth::id();
            
            // Get total groups for this mentor
            $totalGroups = \App\Models\Group::where('mentor_id', $mentorId)->count();
            
            // Get total mentees in mentor's groups
            $totalMentees = \App\Models\Group::where('mentor_id', $mentorId)
                ->withCount('mentees')
                ->get()
                ->sum('mentees_count');
            
            // Get monthly activities (meetings this month)
            $monthlyActivities = \App\Models\Group::where('mentor_id', $mentorId)
                ->whereHas('meetings', function($query) {
                    $query->whereMonth('meeting_date', now()->month)
                          ->whereYear('meeting_date', now()->year);
                })
                ->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'totalGroups' => $totalGroups,
                    'totalMentees' => $totalMentees,
                    'monthlyActivities' => $monthlyActivities
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil statistik dashboard'
            ], 500);
        }
    }

    public function createGroup(Request $request)
    {
        $request->validate([
            'group_name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        try {
            $mentorId = Auth::id();
            $mentor = User::with('profile')->find($mentorId);
            
            if (!$mentor || !$mentor->profile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $group = \App\Models\Group::create([
                'group_name' => $request->group_name,
                'description' => $request->description,
                'mentor_id' => $mentorId
            ]);

            // Load mentor data and add category based on gender
            $group->load('mentor.profile');
            $group->category = strtolower($mentor->profile->gender) === 'akhwat' ? 'akhwat' : 'ikhwan';

            return response()->json([
                'status' => 'success',
                'message' => 'Kelompok berhasil dibuat',
                'data' => $group
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat kelompok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addMentees(Request $request, $groupId)
    {
        $request->validate([
            'mentees' => 'required|array',
            'mentees.*.full_name' => 'required|string|max:255',
            'mentees.*.gender' => 'required|string',
        ]);

        try {
            $mentorId = Auth::id();
            
            // Verify group belongs to mentor
            $group = \App\Models\Group::where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            $results = [];
            foreach ($request->mentees as $menteeData) {
                // Map status values
                $status = 'Aktif';
                if (isset($menteeData['status'])) {
                    $status = $menteeData['status'] === 'active' ? 'Aktif' : 'Non-Aktif';
                }

                $mentee = \App\Models\Mentee::create([
                    'full_name' => $menteeData['full_name'],
                    'nickname' => $menteeData['nickname'] ?? null,
                    'gender' => $menteeData['gender'],
                    'phone_number' => $menteeData['phone_number'] ?? null,
                    'birth_date' => $menteeData['birth_date'] ?? null,
                    'activity_class' => $menteeData['class'] ?? null,
                    'hobby' => $menteeData['hobby'] ?? null,
                    'address' => $menteeData['address'] ?? null,
                    'status' => $status,
                    'group_id' => $groupId,
                ]);
                $results[] = $mentee;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Mentee berhasil ditambahkan',
                'data' => $results
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan mentee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteMentee(Request $request, $menteeId)
    {
        try {
            $mentorId = Auth::id();
            $action = $request->query('action');
            
            // Find mentee and verify it belongs to mentor's group
            $mentee = \App\Models\Mentee::whereHas('group', function($query) use ($mentorId) {
                $query->where('mentor_id', $mentorId);
            })->findOrFail($menteeId);

            if ($action === 'remove') {
                // Remove from group: set group_id to null
                $mentee->update(['group_id' => null]);
                $message = 'Mentee berhasil dikeluarkan dari kelompok';
            } else {
                // Soft delete
                $mentee->delete();
                $message = 'Mentee berhasil dihapus';
            }

            return response()->json([
                'status' => 'success',
                'message' => $message
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses mentee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addExistingMenteesToGroup(Request $request, $groupId)
    {
        \Log::info('addExistingMenteesToGroup called', [
            'groupId' => $groupId,
            'request_data' => $request->all(),
            'user_id' => Auth::id()
        ]);

        try {
            $request->validate([
                'mentee_ids' => 'required|array',
                'mentee_ids.*' => 'integer|exists:mentees,id'
            ]);

            $mentorId = Auth::id();
            
            // Verify group belongs to mentor
            $group = \App\Models\Group::where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                \Log::warning('Group not found or access denied', [
                    'groupId' => $groupId,
                    'mentorId' => $mentorId
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            // Only add mentees that don't have a group (available mentees)
            $updated = \App\Models\Mentee::whereIn('id', $request->mentee_ids)
                ->whereNull('group_id')
                ->update(['group_id' => $groupId]);

            \Log::info('Mentees updated successfully', [
                'updated_count' => $updated,
                'group_id' => $groupId
            ]);

            return response()->json([
                'status' => 'success',
                'message' => "Berhasil menambahkan {$updated} mentee ke kelompok",
                'data' => [
                    'updated_count' => $updated,
                    'group_id' => $groupId
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in addExistingMenteesToGroup', [
                'errors' => $e->errors()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in addExistingMenteesToGroup', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan mentee ke kelompok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function moveMentees(Request $request, $groupId)
    {
        try {
            $request->validate([
                'mentee_ids' => 'required|array',
                'mentee_ids.*' => 'integer|exists:mentees,id'
            ]);

            $mentorId = Auth::id();
            
            // Verify group belongs to mentor
            $group = \App\Models\Group::where('id', $groupId)
                ->where('mentor_id', $mentorId)
                ->first();

            if (!$group) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kelompok tidak ditemukan atau Anda tidak memiliki akses'
                ], 404);
            }

            // Move mentees from other groups to this group
            $updated = \App\Models\Mentee::whereIn('id', $request->mentee_ids)
                ->whereNotNull('group_id')
                ->update(['group_id' => $groupId]);

            return response()->json([
                'status' => 'success',
                'message' => "Berhasil memindahkan {$updated} mentee ke kelompok",
                'data' => [
                    'updated_count' => $updated,
                    'group_id' => $groupId
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in moveMentees: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memindahkan mentee ke kelompok',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    private function getStats()
    {
        $totalMentors = User::where('role', 'mentor')->whereNull('deleted_at')->count();
        $activeMentors = User::where('role', 'mentor')->whereNull('deleted_at')->whereNull('blocked_at')->count();
        $blockedMentors = User::where('role', 'mentor')->whereNull('deleted_at')->whereNotNull('blocked_at')->count();
        $trashedMentors = User::onlyTrashed()->where('role', 'mentor')->count();
        
        $genderStats = User::where('role', 'mentor')
            ->whereNull('users.deleted_at')
            ->join('profiles', 'users.id', '=', 'profiles.user_id')
            ->selectRaw('profiles.gender, COUNT(*) as count')
            ->groupBy('profiles.gender')
            ->pluck('count', 'gender')
            ->toArray();

        return [
            'totalMentors' => $totalMentors,
            'activeMentors' => $activeMentors,
            'blockedMentors' => $blockedMentors,
            'trashedMentors' => $trashedMentors,
            'ikhwanCount' => $genderStats['Ikhwan'] ?? 0,
            'akhwatCount' => $genderStats['Akhwat'] ?? 0,
        ];
    }
}