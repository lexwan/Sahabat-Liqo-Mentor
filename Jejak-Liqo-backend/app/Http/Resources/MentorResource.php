<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\GroupResource;

class MentorResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status ?? ($this->blocked_at ? 'blocked' : 'active'),
            'blocked_at' => $this->blocked_at,
            'blocked_by' => $this->blocked_by,
            'unblocked_at' => $this->unblocked_at,
            'unblocked_by' => $this->unblocked_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Profile information
            'profile' => $this->when($this->profile, [
                'id' => $this->profile?->id,
                'full_name' => $this->profile?->full_name,
                'nickname' => $this->profile?->nickname,
                'birth_date' => $this->profile?->birth_date,
                'phone_number' => $this->profile?->phone_number,
                'hobby' => $this->profile?->hobby,
                'address' => $this->profile?->address,
                'job' => $this->profile?->job,
                'profile_picture' => $this->profile?->profile_picture ? asset('storage/' . $this->profile->profile_picture) : null,
                'status' => $this->profile?->status,
                'status_note' => $this->profile?->status_note,
                'gender' => $this->profile?->gender,
            ]),
            
            // Groups information (when loaded)
            'groups' => GroupResource::collection($this->whenLoaded('groups')),
            'groups_count' => $this->when(isset($this->groups_count), $this->groups_count),
            'active_groups_count' => $this->when(isset($this->active_groups_count), $this->active_groups_count),
        ];
    }
}