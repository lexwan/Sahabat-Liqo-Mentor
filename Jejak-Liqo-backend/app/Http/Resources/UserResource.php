<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role,
            'email' => $this->email,
            'profile' => $this->whenLoaded('profile', function() {
                return [
                    'id' => $this->profile->id,
                    'full_name' => $this->profile->full_name,
                    'gender' => $this->profile->gender,
                    'phone_number' => $this->profile->phone_number,
                    'address' => $this->profile->address,
                    'birth_date' => $this->profile->birth_date,
                ];
            }),
            'created_at' => $this->created_at,
        ];
    }
}