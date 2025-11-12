<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'role' => fake()->randomElement(['admin', 'mentor']),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
        ];
    }

    public function superAdmin()
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'super_admin',
            'email' => 'admin@jejakliqo.com',
        ]);
    }
}