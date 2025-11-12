<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $query = Announcement::query();
            
            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            }
            
            // Filter by type if event_date column exists
            if ($request->has('type_filter') && $request->type_filter !== 'all') {
                if ($request->type_filter === 'event') {
                    $query->whereNotNull('event_date');
                } elseif ($request->type_filter === 'general') {
                    $query->whereNull('event_date');
                }
            }
            
            $announcements = $query->orderBy('created_at', 'desc')->paginate($perPage);
            
            // Calculate stats
            $total = Announcement::count();
            $eventCount = 0;
            $archivedCount = 0;
            
            try {
                $eventCount = Announcement::whereNotNull('event_date')->count();
            } catch (\Exception $e) {
                // Column doesn't exist yet
            }
            
            try {
                $archivedCount = Announcement::where('is_archived', true)->count();
            } catch (\Exception $e) {
                // Column doesn't exist yet
            }
            
            $stats = [
                'total' => $total,
                'event_announcements' => $eventCount,
                'general_announcements' => $total - $eventCount,
                'archived' => $archivedCount,
                'upcoming_events' => 0,
            ];
            
            return response()->json([
                'status' => 'success',
                'message' => 'Announcements fetched successfully',
                'data' => AnnouncementResource::collection($announcements),
                'stats' => $stats,
                'meta' => [
                    'current_page' => $announcements->currentPage(),
                    'last_page' => $announcements->lastPage(),
                    'per_page' => $announcements->perPage(),
                    'total' => $announcements->total(),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage(),
                'data' => [],
                'stats' => [
                    'total' => 0,
                    'event_announcements' => 0,
                    'general_announcements' => 0,
                    'archived' => 0,
                    'upcoming_events' => 0,
                ]
            ], 200);
        }
    }
    
    public function store(AnnouncementRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();
        
        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('announcements', 'public');
            $data['file_type'] = $request->file('file')->getClientMimeType();
        }

        $announcement = Announcement::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Announcement created successfully',
            'data' => new AnnouncementResource($announcement),
        ], 201);
    }

    public function show(Announcement $announcement)
    {
        $announcement->load('user');
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement fetched successfully',
            'data' => new AnnouncementResource($announcement),
        ]);
    }

    public function update(AnnouncementRequest $request, Announcement $announcement)
    {
        $data = $request->validated();
        
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($announcement->file_path) {
                Storage::delete('public/' . $announcement->file_path);
            }
            $data['file_path'] = $request->file('file')->store('announcements', 'public');
            $data['file_type'] = $request->file('file')->getClientMimeType();
        }
        
        $announcement->update($data);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement updated successfully',
            'data' => new AnnouncementResource($announcement),
        ]);
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->file_path) {
            Storage::delete('public/' . $announcement->file_path);
        }
        $announcement->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement deleted successfully',
        ]);
    }
    
    public function archived(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = Announcement::with(['user.profile'])->where('is_archived', true);
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
        
        $announcements = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Archived announcements fetched successfully',
            'data' => AnnouncementResource::collection($announcements),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
            ]
        ]);
    }
    
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'announcement_ids' => 'required|array',
            'announcement_ids.*' => 'exists:announcements,id'
        ]);
        
        $announcements = Announcement::whereIn('id', $request->announcement_ids)->get();
        
        foreach ($announcements as $announcement) {
            if ($announcement->file_path) {
                Storage::delete('public/' . $announcement->file_path);
            }
            $announcement->delete();
        }
        
        return response()->json([
            'status' => 'success',
            'message' => count($request->announcement_ids) . ' announcements deleted successfully',
        ]);
    }
    
    public function archive(Announcement $announcement)
    {
        $announcement->update(['is_archived' => true]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement archived successfully',
        ]);
    }
    
    public function unarchive(Announcement $announcement)
    {
        $announcement->update(['is_archived' => false]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Announcement unarchived successfully',
        ]);
    }
    

}