<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Group;
use App\Models\Mentee;
use App\Models\Meeting;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Hitung total untuk setiap kategori
        $startOfWeek = now()->startOfWeek(); // Senin minggu ini
        $total_reports = Meeting::where('created_at', '>=', $startOfWeek)->count(); // Total Laporan minggu ini (Senin-Minggu)
        $total_mentors = User::where('role', 'mentor')->count();
        $total_mentees = Mentee::count();
        $total_admins = User::where('role', 'admin')->whereNull('deleted_at')->count();

        $stats = [
            'totalLaporan' => $total_reports,
            'totalMentor' => $total_mentors,
            'totalMentee' => $total_mentees,
            'totalAdmin' => $total_admins,
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Dashboard statistics fetched successfully',
            'data' => $stats,
        ]);
    }

    public function statsComparison()
    {
        $startOfWeek = now()->startOfWeek();
        $startOfMonth = now()->startOfMonth();
        
        // TOTAL KESELURUHAN (angka besar utama)
        $totals = [
            'totalMentee' => Mentee::count(),                           // Total keseluruhan
            'totalLaporan' => Meeting::where('created_at', '>=', $startOfWeek)->count(), // Total minggu ini saja
            'totalAdmin' => User::where('role', 'admin')->whereNull('deleted_at')->count(),      // Total keseluruhan
            'totalMentor' => User::where('role', 'mentor')->count(),    // Total keseluruhan
        ];

        // PENAMBAHAN PERIODE INI (angka kecil trend)
        $additions = [
            'totalMentee' => Mentee::where('created_at', '>=', $startOfMonth)->count(),                    // Penambahan bulan ini (reset tiap bulan)
            'totalLaporan' => Meeting::where('created_at', '>=', $startOfWeek)->count(),                  // Penambahan minggu ini (reset tiap minggu)
            'totalAdmin' => User::where('role', 'admin')->whereNull('deleted_at')->where('created_at', '>=', $startOfMonth)->count(),   // Penambahan bulan ini (reset tiap bulan)
            'totalMentor' => User::where('role', 'mentor')->where('created_at', '>=', $startOfMonth)->count(), // Penambahan bulan ini (reset tiap bulan)
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Dashboard statistics with additions fetched successfully',
            'data' => [
                'totals' => $totals,        // Angka besar utama
                'additions' => $additions,  // Angka kecil penambahan
            ],
        ]);
    }

    public function totalReports()
    {
        $totalAll = Meeting::count();
        $totalThisWeek = Meeting::where('created_at', '>=', now()->startOfWeek())->count();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Total reports fetched successfully',
            'data' => [
                'totalAll' => $totalAll,
                'totalThisWeek' => $totalThisWeek,
            ],
        ]);
    }

    public function recentAdmins()
    {
        $recentAdmins = User::with('profile')
            ->where('role', 'admin')
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'name' => $admin->profile->full_name ?? 'Admin User',
                    'email' => $admin->email,
                    'joinDate' => $admin->created_at->format('d M Y'),
                    'profile_picture' => $admin->profile->profile_picture ? url('storage/' . $admin->profile->profile_picture) : null
                ];
            });

        return response()->json([
            'status' => 'success',
            'message' => 'Recent admins fetched successfully',
            'data' => $recentAdmins,
        ]);
    }
}