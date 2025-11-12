<?php

namespace Database\Seeders;

use App\Models\Mentee;
use App\Models\Group;
use Illuminate\Database\Seeder;

class MenteeSeeder extends Seeder
{
    public function run(): void
    {
        $groupIds = Group::pluck('id');
        
        foreach ($groupIds as $groupId) {
            Mentee::factory()->count(rand(5, 10))->create([
                'group_id' => $groupId
            ]);
        }
    }
}