<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MonthlyReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'group_ids' => 'nullable|array',
            'group_ids.*' => 'integer|exists:groups,id',
        ];
    }

    public function messages(): array
    {
        return [
            'month.required' => 'Bulan harus diisi.',
            'month.between' => 'Bulan harus antara 1 sampai 12.',
            'year.required' => 'Tahun harus diisi.',
            'year.min' => 'Tahun minimal 2020.',
            'year.max' => 'Tahun maksimal ' . (date('Y') + 1) . '.',
            'group_ids.array' => 'Group IDs harus berupa array.',
            'group_ids.*.exists' => 'Group ID tidak valid.',
        ];
    }
}
