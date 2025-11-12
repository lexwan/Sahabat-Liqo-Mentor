<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'file_path' => $this->file_path,
            'file_type' => $this->file_type,
            'event_date' => $this->event_date ?? null,
            'is_event' => false,
            'is_priority' => false,
            'is_expired' => false,
            'is_archived' => $this->is_archived ?? false,
            'created_at' => $this->created_at,
        ];
    }

}