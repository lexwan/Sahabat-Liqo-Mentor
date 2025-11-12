<?php

namespace App\Http\Controllers;

use App\Http\Requests\MeetingRequest;
use App\Http\Resources\MeetingResource;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MeetingsExport;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $query = Meeting::with(['group', 'mentor', 'attendances']);

            // Search
            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('topic', 'like', '%' . $request->search . '%')
                      ->orWhere('place', 'like', '%' . $request->search . '%')
                      ->orWhereHas('group', function($q) use ($request) {
                          $q->where('group_name', 'like', '%' . $request->search . '%');
                      });
                });
            }

            // Filters
            if ($request->meeting_type) {
                $query->where('meeting_type', $request->meeting_type);
            }

            if ($request->mentor_id) {
                $query->where('mentor_id', $request->mentor_id);
            }

            if ($request->group_id) {
                $query->where('group_id', $request->group_id);
            }

            if ($request->start_date && $request->end_date) {
                $query->whereBetween('meeting_date', [$request->start_date, $request->end_date]);
            }

            $meetings = $query->orderBy('meeting_date', 'desc')->paginate($perPage);
            
            // Get statistics
            $stats = $this->getStats($request);

            return response()->json([
                'status' => 'success',
                'message' => 'Meetings fetched successfully',
                'data' => MeetingResource::collection($meetings),
                'stats' => $stats,
                'meta' => [
                    'current_page' => $meetings->currentPage(),
                    'last_page' => $meetings->lastPage(),
                    'per_page' => $meetings->perPage(),
                    'total' => $meetings->total(),
                    'from' => $meetings->firstItem(),
                    'to' => $meetings->lastItem(),
                    'has_more_pages' => $meetings->hasMorePages(),
                    'prev_page_url' => $meetings->previousPageUrl(),
                    'next_page_url' => $meetings->nextPageUrl(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch meetings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(MeetingRequest $request)
    {
        $meeting = Meeting::create($request->validated());
        return response()->json([
            'status' => 'success',
            'message' => 'Meeting created successfully',
            'data' => new MeetingResource($meeting),
        ], 201);
    }

    public function show(Meeting $meeting)
    {
        $meeting->load([
            'group.mentor',
            'mentor',
            'attendances.mentee',
            'attendances' => function($query) {
                $query->with('mentee');
            }
        ]);
        
        $meeting->loadCount([
            'attendances',
            'attendances as present_count' => function($q) {
                $q->where('status', 'Present');
            },
            'attendances as sick_count' => function($q) {
                $q->where('status', 'Sick');
            },
            'attendances as permission_count' => function($q) {
                $q->where('status', 'Permission');
            },
            'attendances as absent_count' => function($q) {
                $q->where('status', 'Absent');
            }
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Meeting detail fetched successfully',
            'data' => new MeetingResource($meeting),
        ]);
    }

    public function update(MeetingRequest $request, Meeting $meeting)
    {
        $meeting->update($request->validated());
        return response()->json([
            'status' => 'success',
            'message' => 'Meeting updated successfully',
            'data' => new MeetingResource($meeting),
        ]);
    }

    public function destroy(Meeting $meeting)
    {
        $meeting->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Meeting deleted successfully',
        ]);
    }

    public function trashed(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = Meeting::onlyTrashed()->with(['group', 'mentor']);
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('topic', 'like', "%{$search}%")
                  ->orWhereHas('group', function($q) use ($search) {
                      $q->where('group_name', 'like', "%{$search}%");
                  });
            });
        }
        
        $meetings = $query->orderBy('deleted_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Trashed meetings fetched successfully',
            'data' => MeetingResource::collection($meetings),
            'meta' => [
                'current_page' => $meetings->currentPage(),
                'last_page' => $meetings->lastPage(),
                'per_page' => $meetings->perPage(),
                'total' => $meetings->total(),
                'from' => $meetings->firstItem(),
                'to' => $meetings->lastItem(),
                'has_more_pages' => $meetings->hasMorePages(),
                'prev_page_url' => $meetings->previousPageUrl(),
                'next_page_url' => $meetings->nextPageUrl(),
            ]
        ]);
    }

    public function restore($id)
    {
        $meeting = Meeting::onlyTrashed()->findOrFail($id);
        $meeting->restore();
        return response()->json([
            'status' => 'success',
            'message' => 'Meeting restored successfully',
        ]);
    }

    public function forceDelete($id)
    {
        $meeting = Meeting::onlyTrashed()->findOrFail($id);
        $meeting->forceDelete();
        return response()->json([
            'status' => 'success',
            'message' => 'Meeting permanently deleted',
        ]);
    }

    public function stats(Request $request)
    {
        $stats = $this->getStats($request);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Meeting statistics fetched successfully',
            'data' => $stats,
        ]);
    }
    
    private function getStats(Request $request)
    {
        $query = Meeting::query();
        
        // Apply same filters as index
        if ($request->group_id) {
            $query->where('group_id', $request->group_id);
        }
        
        if ($request->mentor_id) {
            $query->where('mentor_id', $request->mentor_id);
        }
        
        if ($request->meeting_type) {
            $query->where('meeting_type', $request->meeting_type);
        }
        
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('meeting_date', [$request->start_date, $request->end_date]);
        }
        
        $total = $query->count();
        $thisWeek = (clone $query)->whereBetween('meeting_date', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ])->count();
        
        $thisMonth = (clone $query)->whereMonth('meeting_date', Carbon::now()->month)
                                  ->whereYear('meeting_date', Carbon::now()->year)
                                  ->count();
        
        $online = (clone $query)->where('meeting_type', 'Online')->count();
        $offline = (clone $query)->where('meeting_type', 'Offline')->count();
        $assignment = (clone $query)->where('meeting_type', 'Assignment')->count();
        
        $activeMentors = (clone $query)->distinct('mentor_id')->count();
        $activeGroups = (clone $query)->distinct('group_id')->count();
        
        return [
            'total' => $total,
            'thisWeek' => $thisWeek,
            'thisMonth' => $thisMonth,
            'meeting_types' => [
                'online' => $online,
                'offline' => $offline,
                'assignment' => $assignment,
            ],
            'activeMentors' => $activeMentors,
            'activeGroups' => $activeGroups,
        ];
    }

    public function exportPdf(Request $request)
    {
        $query = \App\Models\Attendance::with([
            'meeting.mentor',
            'meeting.group',
            'mentee'
        ]);
        
        // Date range filter through meeting
        if ($request->start_date && $request->end_date) {
            $query->whereHas('meeting', function($q) use ($request) {
                $q->whereBetween('meeting_date', [$request->start_date, $request->end_date]);
            });
        } elseif ($request->month && $request->year) {
            $query->whereHas('meeting', function($q) use ($request) {
                $q->whereMonth('meeting_date', $request->month)
                  ->whereYear('meeting_date', $request->year);
            });
        } else {
            $query->whereHas('meeting', function($q) {
                $q->whereMonth('meeting_date', Carbon::now()->month)
                  ->whereYear('meeting_date', Carbon::now()->year);
            });
        }
        
        // Group filter
        if ($request->group_ids) {
            $groupIds = is_array($request->group_ids) ? $request->group_ids : explode(',', $request->group_ids);
            $query->whereHas('meeting', function($q) use ($groupIds) {
                $q->whereIn('group_id', $groupIds);
            });
        }
        
        // Meeting type filter
        if ($request->meeting_type) {
            $query->whereHas('meeting', function($q) use ($request) {
                $q->where('meeting_type', $request->meeting_type);
            });
        }
        
        $attendances = $query->orderBy('created_at', 'desc')->get();
        
        $stats = [
            'total_attendance' => $attendances->count(),
            'present' => $attendances->where('status', 'Present')->count(),
            'sick' => $attendances->where('status', 'Sick')->count(),
            'permission' => $attendances->where('status', 'Permission')->count(),
            'absent' => $attendances->where('status', 'Absent')->count(),
        ];
        
        $period = $request->start_date && $request->end_date 
            ? Carbon::parse($request->start_date)->format('d-m-Y') . ' sampai ' . Carbon::parse($request->end_date)->format('d-m-Y')
            : ($request->month ?? Carbon::now()->month) . '-' . ($request->year ?? Carbon::now()->year);
            
        $pdf = Pdf::loadView('reports.attendance-report', compact('attendances', 'stats', 'period'));
        
        return $pdf->download("laporan_kehadiran_mentee_{$period}.pdf");
    }

    public function exportExcel(Request $request)
    {
        $query = Meeting::with(['group', 'mentor', 'attendances.mentee']);
        
        // Date range filter
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('meeting_date', [$request->start_date, $request->end_date]);
        } elseif ($request->year) {
            $query->whereYear('meeting_date', $request->year);
        } else {
            $query->whereYear('meeting_date', Carbon::now()->year);
        }
        
        // Group filter
        if ($request->group_ids) {
            $groupIds = is_array($request->group_ids) ? $request->group_ids : explode(',', $request->group_ids);
            $query->whereIn('group_id', $groupIds);
        }
        
        // Meeting type filter
        if ($request->meeting_type) {
            $query->where('meeting_type', $request->meeting_type);
        }
        
        $meetings = $query->orderBy('meeting_date', 'desc')->get();
        
        $period = $request->start_date && $request->end_date 
            ? Carbon::parse($request->start_date)->format('d-m-Y') . '_to_' . Carbon::parse($request->end_date)->format('d-m-Y')
            : ($request->year ?? Carbon::now()->year);
            
        return Excel::download(new MeetingsExport($meetings), "laporan_kehadiran_mentee_{$period}.xlsx");
    }
    
    public function getFormOptions()
    {
        $groups = \App\Models\Group::select('id', 'group_name')->get();
        $mentors = \App\Models\User::where('role', 'mentor')
                                  ->select('id', 'email')
                                  ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'groups' => $groups,
                'mentors' => $mentors,
                'meeting_types' => [
                    ['value' => 'Online', 'label' => 'Online'],
                    ['value' => 'Offline', 'label' => 'Offline'],
                    ['value' => 'Assignment', 'label' => 'Assignment']
                ]
            ]
        ]);
    }
    
    public function attendanceReport(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $query = \App\Models\Attendance::with([
                'meeting.mentor',
                'meeting.group',
                'mentee'
            ]);
            
            // Search
            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->whereHas('mentee', function($q) use ($request) {
                        $q->where('full_name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('meeting', function($q) use ($request) {
                        $q->where('topic', 'like', '%' . $request->search . '%');
                    });
                });
            }
            
            // Filters
            if ($request->mentor_id) {
                $query->whereHas('meeting', function($q) use ($request) {
                    $q->where('mentor_id', $request->mentor_id);
                });
            }
            
            if ($request->group_id) {
                $query->whereHas('meeting', function($q) use ($request) {
                    $q->where('group_id', $request->group_id);
                });
            }
            
            if ($request->meeting_type) {
                $query->whereHas('meeting', function($q) use ($request) {
                    $q->where('meeting_type', $request->meeting_type);
                });
            }
            
            if ($request->status) {
                $query->where('status', $request->status);
            }
            
            if ($request->start_date && $request->end_date) {
                $query->whereHas('meeting', function($q) use ($request) {
                    $q->whereBetween('meeting_date', [$request->start_date, $request->end_date]);
                });
            }
            
            $attendances = $query->orderBy('created_at', 'desc')->paginate($perPage);
            
            // Get statistics
            $stats = [
                'total_attendance' => $query->count(),
                'present' => (clone $query)->where('status', 'Present')->count(),
                'sick' => (clone $query)->where('status', 'Sick')->count(),
                'permission' => (clone $query)->where('status', 'Permission')->count(),
                'absent' => (clone $query)->where('status', 'Absent')->count(),
            ];
            
            return response()->json([
                'status' => 'success',
                'message' => 'Attendance report fetched successfully',
                'data' => $attendances->items(),
                'stats' => $stats,
                'meta' => [
                    'current_page' => $attendances->currentPage(),
                    'last_page' => $attendances->lastPage(),
                    'per_page' => $attendances->perPage(),
                    'total' => $attendances->total(),
                    'from' => $attendances->firstItem(),
                    'to' => $attendances->lastItem(),
                    'has_more_pages' => $attendances->hasMorePages(),
                    'prev_page_url' => $attendances->previousPageUrl(),
                    'next_page_url' => $attendances->nextPageUrl(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch attendance report',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}