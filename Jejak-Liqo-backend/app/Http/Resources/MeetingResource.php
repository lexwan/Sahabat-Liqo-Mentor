<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MeetingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group' => $this->whenLoaded('group', function() {
                return [
                    'id' => $this->group->id,
                    'group_name' => $this->group->group_name,
                    'description' => $this->group->description,
                    'mentor' => $this->group->mentor ? [
                        'id' => $this->group->mentor->id,
                        'name' => $this->group->mentor->email,
                        'email' => $this->group->mentor->email,
                    ] : null
                ];
            }),
            'mentor' => $this->whenLoaded('mentor', function() {
                return [
                    'id' => $this->mentor->id,
                    'name' => $this->mentor->email,
                    'email' => $this->mentor->email,
                ];
            }),
            'meeting_date' => $this->meeting_date,
            'place' => $this->place,
            'topic' => $this->topic,
            'notes' => $this->notes,
            'meeting_type' => $this->meeting_type,
            'attendances' => $this->whenLoaded('attendances', function() {
                return $this->attendances->map(function($attendance) {
                    return [
                        'id' => $attendance->id,
                        'mentee' => [
                            'id' => $attendance->mentee->id,
                            'full_name' => $attendance->mentee->full_name,
                            'nickname' => $attendance->mentee->nickname,
                        ],
                        'status' => $attendance->status,
                        'notes' => $attendance->notes,
                        'created_at' => $attendance->created_at,
                    ];
                });
            }),
            'attendance_stats' => [
                'total_mentees' => $this->attendances_count ?? 0,
                'present_count' => $this->present_count ?? 0,
                'sick_count' => $this->sick_count ?? 0,
                'permission_count' => $this->permission_count ?? 0,
                'absent_count' => $this->absent_count ?? 0,
                'attendance_rate' => $this->attendances_count > 0 ? 
                    round(($this->present_count / $this->attendances_count) * 100, 2) : 0
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}