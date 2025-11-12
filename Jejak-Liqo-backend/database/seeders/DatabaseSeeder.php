<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Group;
use App\Models\Mentee;
use App\Models\Meeting;
use App\Models\Announcement;
use App\Models\Profile; // Impor model Profile

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Buat user super_admin dengan profil
        User::factory()->superAdmin()->has(Profile::factory())->create();

        // Buat 5 user admin dan profilnya
        User::factory()->count(5)->create(['role' => 'admin'])->each(function ($user) {
            Profile::factory()->create(['user_id' => $user->id]);
        });

        // Buat 10 user mentor dan profilnya
        User::factory()->count(10)->create(['role' => 'mentor'])->each(function ($user) {
            Profile::factory()->create(['user_id' => $user->id]);
        });

        // Buat 5 grup, setiap grup memiliki 5-10 mentee
        Group::factory()->count(5)->create()->each(function ($group) {
            Mentee::factory()->count(rand(5, 10))->create(['group_id' => $group->id]);
        });

        // Buat 20 meeting secara acak
        Meeting::factory()->count(20)->create();

        // Buat 15 pengumuman secara acak
        Announcement::factory()->count(15)->create();
    }
}