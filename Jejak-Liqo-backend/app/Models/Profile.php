<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Profile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'full_name',
        'nickname',
        'birth_date',
        'phone_number',
        'hobby',
        'address',
        'job',
        'profile_picture',
        'status',
        'status_note',
        'gender',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}