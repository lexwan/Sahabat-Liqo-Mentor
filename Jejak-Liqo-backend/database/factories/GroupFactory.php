<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GroupFactory extends Factory
{
    protected $model = Group::class;

    public function definition(): array
    {
        return [
            'group_name' => 'Grup ' . fake()->company(),
            'description' => fake()->sentence(),
            // PERBAIKI BARIS INI
            'mentor_id' => User::factory()->create(['role' => 'mentor'])->id,
        ];
    }
}