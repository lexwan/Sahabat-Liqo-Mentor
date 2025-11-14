<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MenteeController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\MonthlyReportController;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsSuperAdmin;

// Autetikasi
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware(['auth:sanctum', 'token.valid'])->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'index']);
        Route::get('/stats-comparison', [DashboardController::class, 'statsComparison']);
        Route::get('/total-reports', [DashboardController::class, 'totalReports']);
        Route::get('/recent-admins', [DashboardController::class, 'recentAdmins']);
    });
    
    // Profiles
    Route::put('/profiles/{profile}', [ProfileController::class, 'update']);
    
    // Mentee
    Route::prefix('mentees')->group(function () {
        Route::get('/', [MenteeController::class, 'index']);
        Route::get('/{id}', [MenteeController::class, 'show']);
        Route::put('/{id}', [MenteeController::class, 'update']);

        Route::get('/stats', [MenteeController::class, 'stats']);
        Route::get('/form-options', [MenteeController::class, 'getFormOptions']);
        Route::get('/{mentee}/edit', [MenteeController::class, 'edit']);
        
        // hanya admin
        Route::middleware('is_admin')->group(function () {
            Route::post('/', [MenteeController::class, 'store']);
            Route::delete('/{mentee}', [MenteeController::class, 'destroy']);
            Route::get('/trashed', [MenteeController::class, 'trashed']);
            Route::post('/restore/{id}', [MenteeController::class, 'restore']);
            Route::delete('/force-delete/{id}', [MenteeController::class, 'forceDelete']);
        });
    });
    
    // Groups
    Route::prefix('groups')->group(function () {
        Route::get('/', [GroupController::class, 'index']);
        Route::get('/options', [GroupController::class, 'getGroupOptions']);
        Route::get('/form-options', [GroupController::class, 'getFormOptions']);
        Route::get('/search-mentors', [GroupController::class, 'searchMentors']);
        Route::get('/mentees-by-gender', [GroupController::class, 'getMenteesByGender']);
        Route::get('/{group}', [GroupController::class, 'show']);

        Route::middleware('is_admin')->group(function () {
            Route::post('/', [GroupController::class, 'store']);
            Route::put('/{group}', [GroupController::class, 'update']);
            Route::delete('/{group}', [GroupController::class, 'destroy']);
            Route::get('/{group}/delete-info', [GroupController::class, 'getDeleteInfo']);
            Route::post('/move-mentees', [GroupController::class, 'moveMentees']);
            Route::get('/trashed', [GroupController::class, 'trashed']);
            Route::post('/restore/{id}', [GroupController::class, 'restore']);
            Route::delete('/force-delete/{id}', [GroupController::class, 'forceDelete']);
            Route::post('/bulk-delete', [GroupController::class, 'bulkDelete']);
        });
    });
    
    // Mentor
    Route::prefix('mentors')->group(function () {
        Route::get('/', [MentorController::class, 'index']);
        Route::get('/stats', [MentorController::class, 'stats']);
        Route::get('/{mentor}', [MentorController::class, 'show']);
        Route::get('/{mentor}/edit', [MentorController::class, 'edit']);
        
        // Hanya admin
        Route::middleware('is_admin')->group(function () {
            Route::post('/', [MentorController::class, 'store']);
            Route::put('/{mentor}', [MentorController::class, 'update']);
            Route::delete('/{mentor}', [MentorController::class, 'destroy']);
            Route::get('/trashed', [MentorController::class, 'trashed']);
            Route::post('/restore/{id}', [MentorController::class, 'restore']);
            Route::delete('/force-delete/{id}', [MentorController::class, 'forceDelete']);
            Route::post('/{mentor}/block', [MentorController::class, 'block']);
            Route::post('/{mentor}/unblock', [MentorController::class, 'unblock']);
        });
    });

    // Dashboard Mentor
    Route::prefix('mentor')->group(function () {
        Route::get('/profile', [MentorController::class, 'getProfile']);
        Route::put('/profile', [MentorController::class, 'updateProfile']);
        Route::get('/groups', [MentorController::class, 'getGroups']);
        Route::get('/groups/trashed', [MentorController::class, 'getTrashedGroups']);
        Route::post('/groups', [MentorController::class, 'createGroup']);
        Route::get('/groups/{groupId}', [MentorController::class, 'getGroupDetail']);
        Route::get('/groups/{groupId}/mentees', [MentorController::class, 'getGroupMentees']);
        Route::get('/groups/{groupId}/all-mentees', [MentorController::class, 'getGroupAllMentees']);
        Route::put('/groups/{groupId}', [MentorController::class, 'updateGroup']);
        Route::delete('/groups/{groupId}', [MentorController::class, 'deleteGroup']);
        Route::post('/groups/{groupId}/restore', [MentorController::class, 'restoreGroup']);
        Route::post('/groups/{groupId}/mentees', [MentorController::class, 'addMentees']);
        Route::patch('/groups/{groupId}/add-mentees', [MentorController::class, 'addExistingMenteesToGroup']);
        Route::put('/groups/{groupId}/move-mentees', [MentorController::class, 'moveMentees']);
        Route::get('/meetings', [MentorController::class, 'getMeetings']);
        Route::get('/meetings/trashed', [MentorController::class, 'getTrashedMeetings']);
        Route::get('/meetings/{meetingId}', [MentorController::class, 'getMeetingDetail']);
        Route::post('/meetings', [MentorController::class, 'createMeeting']);
        Route::put('/meetings/{meetingId}', [MentorController::class, 'updateMeeting']);
        Route::post('/meetings/{meetingId}', [MentorController::class, 'updateMeeting']);
        Route::delete('/meetings/{meetingId}', [MentorController::class, 'deleteMeeting']);
        Route::post('/meetings/{meetingId}/restore', [MentorController::class, 'restoreMeeting']);

        Route::get('/dashboard/stats', [MentorController::class, 'getDashboardStats']);
        Route::get('/announcements', [MentorController::class, 'getAnnouncements']);
        Route::get('/test', function() {
            return response()->json(['message' => 'Mentor routes working']);
        });
    });

    // Pertemuan
    Route::prefix('meetings')->group(function () {
        Route::get('/', [MeetingController::class, 'index']);
        Route::get('/stats', [MeetingController::class, 'stats']);
        Route::get('/form-options', [MeetingController::class, 'getFormOptions']);
        Route::get('/attendance-report', [MeetingController::class, 'attendanceReport']);
        Route::get('/export/pdf', [MeetingController::class, 'exportPdf']);
        Route::get('/export/excel', [MeetingController::class, 'exportExcel']);
        Route::get('/{meeting}', [MeetingController::class, 'show']);
        
        // hanya admin
        Route::middleware('is_admin')->group(function () {
            Route::post('/', [MeetingController::class, 'store']);
            Route::put('/{meeting}', [MeetingController::class, 'update']);
            Route::delete('/{meeting}', [MeetingController::class, 'destroy']);
            Route::get('/trashed', [MeetingController::class, 'trashed']);
            Route::post('/restore/{id}', [MeetingController::class, 'restore']);
            Route::delete('/force-delete/{id}', [MeetingController::class, 'forceDelete']);
        });
    });

    // Kehadiran
    Route::post('/attendances', [AttendanceController::class, 'store']);

    // Pengumuman
    Route::prefix('announcements')->group(function () {
        Route::get('/', [AnnouncementController::class, 'index']);
        Route::get('/{announcement}', [AnnouncementController::class, 'show']);
        Route::get('/archived', [AnnouncementController::class, 'archived']);
        
        // hanya admin yang dapat mengoperasikan
        Route::middleware('is_admin')->group(function () {
            Route::post('/', [AnnouncementController::class, 'store']);
            Route::put('/{announcement}', [AnnouncementController::class, 'update']);
            Route::delete('/{announcement}', [AnnouncementController::class, 'destroy']);
            Route::post('/bulk-delete', [AnnouncementController::class, 'bulkDelete']);
            Route::post('/{announcement}/archive', [AnnouncementController::class, 'archive']);
            Route::post('/{announcement}/unarchive', [AnnouncementController::class, 'unarchive']);
        });
    });

    // Laporan
    Route::get('/monthly-reports', [MonthlyReportController::class, 'getReport']);

    // users
    Route::prefix('users')->middleware('is_admin')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{user}', [UserController::class, 'show']);
    });
    
    // Admin only
    Route::prefix('admins')->middleware(IsSuperAdmin::class)->group(function () {
        Route::get('/', [AdminController::class, 'index']);
        Route::post('/', [AdminController::class, 'store']);
        Route::get('/{admin}', [AdminController::class, 'show']);
        Route::put('/{admin}', [AdminController::class, 'update']);
        Route::delete('/{admin}', [AdminController::class, 'destroy']);
        Route::get('/trashed', [AdminController::class, 'trashed']);
        Route::post('/restore/{id}', [AdminController::class, 'restore']);
        Route::delete('/force-delete/{id}', [AdminController::class, 'forceDelete']);
        Route::put('/{admin}/block', [AdminController::class, 'block']);
        Route::put('/{admin}/unblock', [AdminController::class, 'unblock']);
    });

    // Super Admin
    Route::prefix('super-admins')->middleware(IsSuperAdmin::class)->group(function () {
        Route::get('/', [SuperAdminController::class, 'index']);
        Route::post('/', [SuperAdminController::class, 'store']);
        Route::get('/{superAdmin}', [SuperAdminController::class, 'show']);
        Route::put('/{superAdmin}', [SuperAdminController::class, 'update']);
        Route::delete('/{superAdmin}', [SuperAdminController::class, 'destroy']);
        Route::put('/{superAdmin}/block', [SuperAdminController::class, 'block']);
        Route::put('/{superAdmin}/unblock', [SuperAdminController::class, 'unblock']);
    });

 
});