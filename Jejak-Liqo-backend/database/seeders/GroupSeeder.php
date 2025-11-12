<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
    public function run(): void
    {
        $mentorIds = User::where('role', 'mentor')->pluck('id');
        
        foreach ($mentorIds as $mentorId) {
            Group::factory()->create([
                'mentor_id' => $mentorId
            ]);
        }
    }
}