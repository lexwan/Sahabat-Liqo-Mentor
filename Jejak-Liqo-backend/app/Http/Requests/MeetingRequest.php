<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_id' => 'required|exists:groups,id',
            'mentor_id' => 'required|exists:users,id',
            'meeting_date' => 'required|date',
            'place' => 'nullable|string|max:255',
            'topic' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'meeting_type' => 'required|in:Online,Offline,Assignment',
        ];
    }
}