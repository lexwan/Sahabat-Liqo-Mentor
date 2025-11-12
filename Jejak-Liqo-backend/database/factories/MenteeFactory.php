<?php

namespace Database\Factories;

use App\Models\Mentee;
use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenteeFactory extends Factory
{
    protected $model = Mentee::class;

    public function definition(): array
    {
        return [
            'group_id' => Group::inRandomOrder()->first()->id ?? Group::factory(),
            'full_name' => fake()->name(),
            'nickname' => fake()->firstName(),
            'birth_date' => fake()->date(),
            'phone_number' => fake()->phoneNumber(),
            'activity_class' => fake()->word(),
            'hobby' => fake()->word(),
            'address' => fake()->address(),
            'status' => fake()->randomElement(['Aktif', 'Non-Aktif', 'Lulus']),
        ];
    }
}