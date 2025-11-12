<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\MenteeResource;

class GroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group_name' => $this->group_name,
            'description' => $this->description,
            'mentor' => $this->whenLoaded('mentor', function() {
                return [
                    'id' => $this->mentor->id,
                    'email' => $this->mentor->email,
                    'profile' => $this->mentor->profile ? [
                        'full_name' => $this->mentor->profile->full_name,
                        'gender' => $this->mentor->profile->gender,
                    ] : null,
                ];
            }),
            'mentees' => $this->whenLoaded('mentees', function() {
                return $this->mentees->map(function ($mentee) {
                    return [
                        'id' => $mentee->id,
                        'full_name' => $mentee->full_name,
                        'nickname' => $mentee->nickname,
                        'gender' => $mentee->gender,
                        'status' => $mentee->status,
                    ];
                });
            }),
            'mentees_count' => $this->mentees_count ?? $this->mentees->count(),
            'meetings_count' => $this->meetings_count ?? 0,
            'mentor_gender' => $this->whenLoaded('mentor', function() {
                return $this->mentor->profile ? $this->mentor->profile->gender : null;
            }),
            'created_at' => $this->created_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}