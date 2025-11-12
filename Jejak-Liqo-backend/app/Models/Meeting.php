<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meeting extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'group_id',
        'mentor_id',
        'meeting_date',
        'place',
        'topic',
        'notes',
        'meeting_type',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}