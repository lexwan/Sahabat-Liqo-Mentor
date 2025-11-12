<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenteeGroupHistory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'mentee_id',
        'from_group_id',
        'to_group_id',
        'moved_at',
        'moved_by',
        'notes',
    ];

    public function mentee()
    {
        return $this->belongsTo(Mentee::class);
    }

    public function fromGroup()
    {
        return $this->belongsTo(Group::class, 'from_group_id');
    }

    public function toGroup()
    {
        return $this->belongsTo(Group::class, 'to_group_id');
    }

    public function movedBy()
    {
        return $this->belongsTo(User::class, 'moved_by');
    }
}