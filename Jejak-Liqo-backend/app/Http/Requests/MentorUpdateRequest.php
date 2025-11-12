<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MentorUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $mentorId = $this->route('mentor')->id;
        
        return [
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($mentorId)
            ],
            'password' => 'nullable|min:8',
            'full_name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'hobby' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'job' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'status' => 'nullable|in:Aktif,Non-aktif',
            'status_note' => 'nullable|string',
            'gender' => 'required|in:Ikhwan,Akhwat',
        ];
    }

    public function messages()
    {
        return [
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah digunakan',
            'password.min' => 'Password minimal 8 karakter',
            'full_name.required' => 'Nama lengkap wajib diisi',
            'gender.required' => 'Gender wajib dipilih',
            'gender.in' => 'Gender harus Ikhwan atau Akhwat',
            'profile_picture.image' => 'File harus berupa gambar',
            'profile_picture.mimes' => 'Format gambar harus jpeg, png, atau jpg',
            'profile_picture.max' => 'Ukuran gambar maksimal 2MB',
        ];
    }
}