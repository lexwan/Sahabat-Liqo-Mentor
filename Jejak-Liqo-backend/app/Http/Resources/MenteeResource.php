<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenteeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group' => $this->whenLoaded('group', function() {
                return [
                    'id' => $this->group->id,
                    'group_name' => $this->group->group_name,
                    'description' => $this->group->description ?? null,
                ];
            }),
            'full_name' => $this->full_name,
            'gender' => $this->gender,
            'nickname' => $this->nickname,
            'birth_date' => $this->birth_date,
            'phone_number' => $this->phone_number,
            'activity_class' => $this->activity_class,
            'hobby' => $this->hobby,
            'address' => $this->address,
            'status' => $this->status,
            'group_histories' => $this->whenLoaded('menteeGroupHistories', function() {
                return $this->menteeGroupHistories->map(function($history) {
                    return [
                        'id' => $history->id,
                        'from_group' => $history->fromGroup ? [
                            'id' => $history->fromGroup->id,
                            'group_name' => $history->fromGroup->group_name
                        ] : null,
                        'to_group' => $history->toGroup ? [
                            'id' => $history->toGroup->id,
                            'group_name' => $history->toGroup->group_name
                        ] : null,
                        'moved_by' => $history->movedBy ? [
                            'id' => $history->movedBy->id,
                            'name' => $history->movedBy->email
                        ] : null,
                        'moved_at' => $history->created_at
                    ];
                });
            }),
            'attendances' => $this->whenLoaded('attendances', function() {
                return $this->attendances->map(function($attendance) {
                    return [
                        'id' => $attendance->id,
                        'status' => $attendance->status,
                        'notes' => $attendance->notes,
                        'meeting' => [
                            'id' => $attendance->meeting->id,
                            'topic' => $attendance->meeting->topic,
                            'meeting_date' => $attendance->meeting->meeting_date,
                            'meeting_type' => $attendance->meeting->meeting_type,
                        ],
                        'created_at' => $attendance->created_at,
                    ];
                });
            }),
            'attendance_stats' => [
                'total_meetings' => $this->attendances_count ?? 0,
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