<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupRequest;
use App\Http\Resources\GroupResource;
use App\Models\Group;
use App\Models\GroupMentorHistory;
use App\Models\Mentee;
use App\Models\MenteeGroupHistory;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 50);
        
        // Optimize query - don't load all mentees by default
        $loadMentees = $request->get('include_mentees', false);
        $with = ['mentor:id,email', 'mentor.profile:user_id,full_name,gender'];
        
        if ($loadMentees) {
            $with[] = 'mentees:id,group_id,full_name,gender,status';
        }
        
        $query = Group::with($with)->withCount(['mentees', 'meetings']);
        
        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('group_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('mentor.profile', function($q) use ($search) {
                      $q->where('full_name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Filter by mentor gender (Ikhwan/Akhwat)
        if ($request->has('gender_filter') && $request->gender_filter !== 'all') {
            $query->whereHas('mentor.profile', function($q) use ($request) {
                $q->where('gender', $request->gender_filter);
            });
        }
        
        // Filter by specific group
        if ($request->has('group_filter') && $request->group_filter !== 'all') {
            $query->where('id', $request->group_filter);
        }
        
        $groups = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Statistics - only load if requested
        $stats = null;
        if ($request->get('include_stats', true)) {
            $stats = $this->getGroupStats();
        }
        
        $response = [
            'status' => 'success',
            'message' => 'Groups fetched successfully',
            'data' => GroupResource::collection($groups),
            'meta' => [
                'current_page' => $groups->currentPage(),
                'last_page' => $groups->lastPage(),
                'per_page' => $groups->perPage(),
                'total' => $groups->total(),
            ]
        ];
        
        if ($stats) {
            $response['stats'] = $stats;
        }
        
        return response()->json($response);
    }

    public function store(GroupRequest $request)
    {
        try {
            \DB::beginTransaction();
            
            // Create group
            $groupData = $request->validated();
            $group = Group::create([
                'group_name' => $groupData['group_name'],
                'description' => $groupData['description'] ?? null,
                'mentor_id' => $groupData['mentor_id']
            ]);
            
            // Handle mentees if provided
            if ($request->has('mentee_ids') && is_array($request->mentee_ids) && !empty($request->mentee_ids)) {
                $mentees = Mentee::whereIn('id', $request->mentee_ids)->get();
                
                foreach ($mentees as $mentee) {
                    $oldGroupId = $mentee->group_id;
                    
                    // Update mentee group
                    $mentee->update(['group_id' => $group->id]);
                    
                    // Create history record
                    MenteeGroupHistory::create([
                        'mentee_id' => $mentee->id,
                        'from_group_id' => $oldGroupId,
                        'to_group_id' => $group->id,
                        'moved_by' => auth()->id() ?? 1,
                    ]);
                }
            }
            
            \DB::commit();
            
            // Load relationships for response
            $group->load(['mentor.profile', 'mentees']);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Group created successfully',
                'data' => new GroupResource($group),
            ], 201);
        } catch (\Exception $e) {
            \DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Group $group)
    {
        $group->load([
            'mentor:id,email',
            'mentor.profile:user_id,full_name,gender',
            'mentees:id,group_id,full_name,nickname,gender,status'
        ])->loadCount(['mentees', 'meetings']);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Group fetched successfully',
            'data' => new GroupResource($group),
        ]);
    }

    public function update(GroupRequest $request, Group $group)
    {
        $oldMentorId = $group->mentor_id;
        $group->update($request->validated());

        if ($request->mentor_id != $oldMentorId) {
            GroupMentorHistory::create([
                'group_id' => $group->id,
                'from_mentor_id' => $oldMentorId,
                'to_mentor_id' => $request->mentor_id,
                'changed_by' => auth()->id(),
            ]);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Group updated successfully',
            'data' => new GroupResource($group),
        ]);
    }

    public function destroy(Group $group)
    {
        try {
            \DB::beginTransaction();
            
            // Get mentees info before deletion
            $mentees = $group->mentees;
            $menteesCount = $mentees->count();
            $menteeNames = $mentees->pluck('full_name')->toArray();
            
            // Unassign mentees from group
            if ($menteesCount > 0) {
                Mentee::where('group_id', $group->id)->update(['group_id' => null]);
                
                // Create history records
                foreach ($mentees as $mentee) {
                    MenteeGroupHistory::create([
                        'mentee_id' => $mentee->id,
                        'from_group_id' => $group->id,
                        'to_group_id' => null,
                        'moved_by' => 1, // Default user ID
                    ]);
                }
            }
            
            // Soft delete the group
            $group->delete();
            
            \DB::commit();
            
            $message = "Group '{$group->group_name}' deleted successfully.";
            if ($menteesCount > 0) {
                $message .= " {$menteesCount} mentee(s) have been unassigned: " . implode(', ', $menteeNames) . ".";
            }
            
            return response()->json([
                'status' => 'success',
                'message' => $message,
                'unassigned_mentees' => $menteesCount,
                'mentee_names' => $menteeNames
            ]);
        } catch (\Exception $e) {
            \DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete group: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function trashed(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = Group::onlyTrashed()->with(['mentor:id,email', 'mentor.profile:user_id,full_name,gender'])->withCount(['mentees', 'meetings']);
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('group_name', 'like', "%{$search}%")
                  ->orWhereHas('mentor.profile', function($q) use ($search) {
                      $q->where('full_name', 'like', "%{$search}%");
                  });
            });
        }
        
        $groups = $query->orderBy('deleted_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Trashed groups fetched successfully',
            'data' => GroupResource::collection($groups),
            'meta' => [
                'current_page' => $groups->currentPage(),
                'last_page' => $groups->lastPage(),
                'per_page' => $groups->perPage(),
                'total' => $groups->total(),
            ]
        ]);
    }
    
    public function restore($id)
    {
        $group = Group::onlyTrashed()->findOrFail($id);
        
        // Restore the group
        $group->restore();
        
        // Re-assign mentees that were unassigned when group was deleted
        // This assumes mentees still exist and were not assigned to other groups
        Mentee::whereNull('group_id')
            ->whereHas('menteeGroupHistories', function($q) use ($group) {
                $q->where('to_group_id', $group->id)
                  ->whereNull('from_group_id');
            })
            ->update(['group_id' => $group->id]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Group restored successfully. Related mentees have been re-assigned.',
        ]);
    }
    
    public function forceDelete($id)
    {
        $group = Group::onlyTrashed()->findOrFail($id);
        $group->forceDelete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Group permanently deleted',
        ]);
    }
    
    private function getGroupStats()
    {
        return [
            'total_groups' => Group::count(),
            'active_groups' => Group::whereHas('mentees')->count(),
            'empty_groups' => Group::whereDoesntHave('mentees')->count(),
            'ikhwan_groups' => Group::whereHas('mentor.profile', function($q) {
                $q->where('gender', 'Ikhwan');
            })->count(),
            'akhwat_groups' => Group::whereHas('mentor.profile', function($q) {
                $q->where('gender', 'Akhwat');
            })->count(),
            'total_mentees_in_groups' => \App\Models\Mentee::whereNotNull('group_id')->count(),
            'unassigned_mentees' => \App\Models\Mentee::whereNull('group_id')->count(),
        ];
    }
    
    public function getGroupOptions()
    {
        try {
            $groups = Group::select('id', 'group_name')
                ->orderBy('group_name')
                ->get()
                ->map(function($group) {
                    return [
                        'id' => $group->id,
                        'group_name' => $group->group_name,
                        'value' => $group->id,
                        'label' => $group->group_name
                    ];
                })
                ->values() // Ensure it's a proper array
                ->toArray();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'groups' => $groups
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch group options',
                'data' => [
                    'groups' => []
                ],
            ], 500);
        }
    }
    
    public function getFormOptions()
    {
        try {
            $mentors = \App\Models\User::where('role', 'mentor')
                ->whereNull('deleted_at')
                ->with('profile:user_id,full_name,gender')
                ->get()
                ->map(function($mentor) {
                    return [
                        'id' => $mentor->id,
                        'value' => $mentor->id,
                        'label' => $mentor->profile ? $mentor->profile->full_name : $mentor->email,
                        'gender' => $mentor->profile ? $mentor->profile->gender : null,
                        'full_name' => $mentor->profile ? $mentor->profile->full_name : $mentor->email
                    ];
                })
                ->values()
                ->toArray();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'mentors' => $mentors
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch form options',
                'data' => [
                    'mentors' => []
                ],
            ], 500);
        }
    }
    
    public function getMenteesByGender(Request $request)
    {
        try {
            $gender = $request->get('gender');
            $search = $request->get('search', '');
            
            if (!$gender) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gender parameter is required',
                    'data' => []
                ], 400);
            }
            
            $query = Mentee::select('id', 'full_name', 'nickname', 'gender', 'group_id')
                ->where('gender', $gender)
                ->with('group:id,group_name');
            
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('nickname', 'like', "%{$search}%");
                });
            }
            
            $mentees = $query->orderBy('full_name')
                ->get()
                ->map(function($mentee) {
                    return [
                        'id' => $mentee->id,
                        'value' => $mentee->id,
                        'label' => $mentee->full_name . ($mentee->nickname ? ' (' . $mentee->nickname . ')' : ''),
                        'full_name' => $mentee->full_name,
                        'nickname' => $mentee->nickname,
                        'gender' => $mentee->gender,
                        'group_id' => $mentee->group_id,
                        'group_name' => $mentee->group ? $mentee->group->group_name : null,
                        'is_available' => $mentee->group_id === null
                    ];
                })
                ->values()
                ->toArray();
            
            return response()->json([
                'status' => 'success',
                'data' => $mentees,
                'total' => count($mentees)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch mentees',
                'data' => []
            ], 500);
        }
    }
    
    public function moveMentees(Request $request)
    {
        $request->validate([
            'mentee_ids' => 'required|array',
            'mentee_ids.*' => 'exists:mentees,id',
            'to_group_id' => 'required|exists:groups,id'
        ]);
        
        try {
            \DB::beginTransaction();
            
            $mentees = Mentee::whereIn('id', $request->mentee_ids)->get();
            $toGroup = Group::findOrFail($request->to_group_id);
            
            foreach ($mentees as $mentee) {
                $oldGroupId = $mentee->group_id;
                
                // Update mentee group
                $mentee->update(['group_id' => $request->to_group_id]);
                
                // Create history
                MenteeGroupHistory::create([
                    'mentee_id' => $mentee->id,
                    'from_group_id' => $oldGroupId,
                    'to_group_id' => $request->to_group_id,
                    'moved_by' => auth()->id() ?? 1, // Default to 1 if no auth
                ]);
            }
            
            \DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => count($request->mentee_ids) . ' mentee berhasil dipindahkan ke ' . $toGroup->group_name,
            ]);
        } catch (\Exception $e) {
            \DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to move mentees',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getDeleteInfo(Group $group)
    {
        $mentees = $group->mentees()->select('id', 'full_name', 'nickname')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'group_name' => $group->group_name,
                'mentees_count' => $mentees->count(),
                'mentees' => $mentees->map(function($mentee) {
                    return [
                        'id' => $mentee->id,
                        'full_name' => $mentee->full_name,
                        'nickname' => $mentee->nickname,
                        'display_name' => $mentee->full_name . ($mentee->nickname ? ' (' . $mentee->nickname . ')' : '')
                    ];
                })
            ]
        ]);
    }
    
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'group_ids' => 'required|array',
            'group_ids.*' => 'exists:groups,id'
        ]);
        
        $groups = Group::whereIn('id', $request->group_ids)->get();
        
        foreach ($groups as $group) {
            // Set group_id to null for related mentees
            $group->mentees()->update(['group_id' => null]);
            $group->delete();
        }
        
        return response()->json([
            'status' => 'success',
            'message' => count($request->group_ids) . ' groups deleted successfully',
        ]);
    }
    
    public function debugGender()
    {
        $groups = Group::with(['mentor:id,email', 'mentor.profile:user_id,full_name,gender'])
            ->get()
            ->map(function($group) {
                return [
                    'id' => $group->id,
                    'group_name' => $group->group_name,
                    'mentor_id' => $group->mentor_id,
                    'mentor_email' => $group->mentor ? $group->mentor->email : null,
                    'mentor_profile_exists' => $group->mentor && $group->mentor->profile ? true : false,
                    'mentor_gender' => $group->mentor && $group->mentor->profile ? $group->mentor->profile->gender : null,
                    'raw_mentor' => $group->mentor,
                ];
            });
            
        return response()->json([
            'status' => 'success',
            'data' => $groups
        ]);
    }
    
    public function searchMentors(Request $request)
    {
        $search = $request->get('search', '');
        $limit = min($request->get('limit', 10), 20);
        
        $query = \App\Models\User::where('role', 'mentor')
            ->whereNull('deleted_at')
            ->with('profile:user_id,full_name,gender,phone_number');
            
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhereHas('profile', function($q) use ($search) {
                      $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%");
                  });
            });
        }
        
        $mentors = $query->limit($limit)
            ->get()
            ->map(function($mentor) {
                return [
                    'id' => $mentor->id,
                    'value' => $mentor->id,
                    'label' => $mentor->profile ? 
                        $mentor->profile->full_name . ' (' . $mentor->email . ')' : 
                        $mentor->email,
                    'email' => $mentor->email,
                    'full_name' => $mentor->profile ? $mentor->profile->full_name : null,
                    'gender' => $mentor->profile ? $mentor->profile->gender : null,
                    'phone_number' => $mentor->profile ? $mentor->profile->phone_number : null,
                ];
            });
            
        return response()->json([
            'status' => 'success',
            'data' => $mentors,
            'total' => $mentors->count()
        ]);
    }
}