<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfileFactory extends Factory
{
    protected $model = Profile::class;

    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'nickname' => fake()->firstName(),
            'birth_date' => fake()->date(),
            'phone_number' => fake()->phoneNumber(),
            'hobby' => fake()->word(),
            'address' => fake()->address(),
            'job' => fake()->jobTitle(),
            'profile_picture' => null,
            'status' => fake()->randomElement(['Aktif', 'Non-Aktif']),
            'status_note' => null,
        ];
    }
}