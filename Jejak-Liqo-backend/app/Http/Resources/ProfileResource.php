<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'full_name' => $this->full_name,
            'nickname' => $this->nickname,
            'birth_date' => $this->birth_date,
            'phone_number' => $this->phone_number,
            'hobby' => $this->hobby,
            'address' => $this->address,
            'job' => $this->job,
            'profile_picture' => $this->profile_picture,
            'status' => $this->status,
            'status_note' => $this->status_note,
        ];
    }
}