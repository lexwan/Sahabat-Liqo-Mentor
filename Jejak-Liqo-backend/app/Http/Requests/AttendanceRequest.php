<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'meeting_id' => 'required|exists:meetings,id',
            'mentee_id' => 'required|exists:mentees,id',
            'status' => 'required|in:Hadir,Sakit,Izin,Alpa',
            'notes' => 'nullable|string',
        ];
    }
}