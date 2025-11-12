<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SuperAdminUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $superAdminId = $this->route('superAdmin')->id;

        return [
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($superAdminId)],
            'password' => 'nullable|string|min:8',
            'full_name' => 'required|string|max:255',
            'gender' => 'nullable|in:Ikhwan,Akhwat',
            'nickname' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'phone_number' => 'nullable|string|max:20',
            'hobby' => 'nullable|string',
            'address' => 'nullable|string',
            'job' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'nullable|string|max:255',
            'status_note' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email is required',
            'email.email' => 'Email must be a valid email address',
            'email.unique' => 'Email has already been taken',
            'password.min' => 'Password must be at least 8 characters',
            'full_name.required' => 'Full name is required',
            'gender.in' => 'Gender must be either Ikhwan or Akhwat',
            'profile_picture.image' => 'Profile picture must be an image',
            'profile_picture.mimes' => 'Profile picture must be a file of type: jpeg, png, jpg, gif',
            'profile_picture.max' => 'Profile picture may not be greater than 2MB',
        ];
    }
}