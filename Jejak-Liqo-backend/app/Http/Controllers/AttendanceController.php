<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function store(AttendanceRequest $request)
    {
        $attendance = Attendance::create($request->validated());
        return response()->json([
            'status' => 'success',
            'message' => 'Attendance created successfully',
            'data' => new AttendanceResource($attendance),
        ], 201);
    }

    // Metode lain untuk update, show, destroy, jika dibutuhkan
}