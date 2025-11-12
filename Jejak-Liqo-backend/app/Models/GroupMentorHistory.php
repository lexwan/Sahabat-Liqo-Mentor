<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupMentorHistory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'group_id',
        'from_mentor_id',
        'to_mentor_id',
        'changed_at',
        'changed_by',
        'notes',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function fromMentor()
    {
        return $this->belongsTo(User::class, 'from_mentor_id');
    }

    public function toMentor()
    {
        return $this->belongsTo(User::class, 'to_mentor_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}