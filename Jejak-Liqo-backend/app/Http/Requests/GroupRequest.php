<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'mentor_id' => 'required|exists:users,id',
            'mentee_ids' => 'nullable|array',
            'mentee_ids.*' => 'exists:mentees,id',
        ];
    }
    
    public function messages(): array
    {
        return [
            'group_name.required' => 'Nama kelompok wajib diisi',
            'mentor_id.required' => 'Mentor wajib dipilih',
            'mentor_id.exists' => 'Mentor yang dipilih tidak valid',
            'mentee_ids.array' => 'Data mentee harus berupa array',
            'mentee_ids.*.exists' => 'Salah satu mentee yang dipilih tidak valid',
        ];
    }
}