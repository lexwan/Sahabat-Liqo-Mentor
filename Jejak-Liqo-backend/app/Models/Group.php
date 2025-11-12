<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Group extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'group_name',
        'description',
        'mentor_id',
    ];

    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function mentees()
    {
        return $this->hasMany(Mentee::class);
    }

    public function groupMentorHistories()
    {
        return $this->hasMany(GroupMentorHistory::class);
    }

    public function meetings()
    {
        return $this->hasMany(Meeting::class);
    }
}