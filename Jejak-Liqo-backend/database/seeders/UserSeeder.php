<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Default super_admin
        User::create([
            'role' => 'super_admin',
            'email' => 'admin@jejakliqo.com',
            'password' => Hash::make('password'),
        ]);

        // Contoh users lainnya
        User::factory()->count(5)->create(['role' => 'admin']);
        User::factory()->count(10)->create(['role' => 'mentor']);
    }
}