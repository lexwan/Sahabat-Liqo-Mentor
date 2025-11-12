<?php

namespace Database\Factories;

use App\Models\Meeting;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MeetingFactory extends Factory
{
    protected $model = Meeting::class;

    public function definition(): array
    {
        return [
            'group_id' => Group::inRandomOrder()->first()->id ?? Group::factory(),
            'mentor_id' => User::inRandomOrder()->where('role', 'mentor')->first()->id ?? User::factory()->mentor(),
            'meeting_date' => fake()->date(),
            'place' => fake()->city(),
            'topic' => fake()->sentence(),
            'notes' => fake()->paragraph(),
            'meeting_type' => fake()->randomElement(['Online', 'Offline', 'Assignment']),
        ];
    }
}