<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MenteeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_id' => 'nullable|exists:groups,id',
            'full_name' => 'required|string|max:255',
            'gender' => 'required|in:ikhwan,akhwat|not_in:null,""',
            'nickname' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:255',
            'activity_class' => 'nullable|string|max:255',
            'hobby' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'status' => 'nullable|in:Aktif,Non-Aktif,Lulus',
        ];
    }

    public function messages(): array
    {
        return [
            'group_id.exists' => 'Selected group does not exist',
            'full_name.required' => 'Full name is required',
            'gender.required' => 'Gender is required and cannot be empty',
            'gender.in' => 'Gender must be either ikhwan or akhwat',
            'gender.not_in' => 'Gender cannot be empty or null',
            'status.in' => 'Status must be Aktif, Non-Aktif, or Lulus',
        ];
    }
}