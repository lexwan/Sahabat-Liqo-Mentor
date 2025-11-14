<?php

namespace App\Http\Controllers;

use App\Models\Mentee;
use Illuminate\Http\Request;

class MenteeController extends Controller
{
    public function index()
    {
        $mentees = Mentee::with(['group'])->get();
        
        return response()->json([
            'success' => true,
            'data' => $mentees
        ]);
    }

    public function show($id)
    {
        try {
            $mentee = Mentee::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $mentee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mentee tidak ditemukan'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'activity_class' => 'nullable|string|max:255',
            'hobby' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'status' => 'required|in:Aktif,Non-Aktif'
        ]);

        try {
            $mentee = Mentee::findOrFail($id);
            $mentee->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Data mentee berhasil diperbarui',
                'data' => $mentee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data mentee'
            ], 500);
        }
    }


}