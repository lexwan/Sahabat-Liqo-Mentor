<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Mentee;

class UpdateMenteeGenderSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Update mentees without gender to have random gender
        $menteesWithoutGender = Mentee::whereNull('gender')->orWhere('gender', '')->get();
        
        foreach ($menteesWithoutGender as $mentee) {
            $mentee->update([
                'gender' => fake()->randomElement(['ikhwan', 'akhwat'])
            ]);
        }
        
        $this->command->info('Updated ' . $menteesWithoutGender->count() . ' mentees with gender data.');
    }
}