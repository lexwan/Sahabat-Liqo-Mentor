<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'event_date' => 'nullable|date|after:now',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpeg,png,jpg,gif,zip,rar|max:10240', // 10MB
        ];
    }
    
    public function messages(): array
    {
        return [
            'event_date.after' => 'Event date must be in the future.',
            'file.max' => 'File size must not exceed 10MB.',
        ];
    }
}