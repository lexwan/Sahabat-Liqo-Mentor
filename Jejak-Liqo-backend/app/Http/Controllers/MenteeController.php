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
}