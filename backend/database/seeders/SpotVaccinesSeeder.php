<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpotVaccinesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $spotVaccines = [
            // Spot 1 - RSUD Tanah Abang (Sinovac, AstraZeneca, Pfizer)
            ['spot_id' => 1, 'vaccine_id' => 1],
            ['spot_id' => 1, 'vaccine_id' => 2],
            ['spot_id' => 1, 'vaccine_id' => 3],

            // Spot 2 - Puskesmas Menteng (Sinovac, Moderna)
            ['spot_id' => 2, 'vaccine_id' => 1],
            ['spot_id' => 2, 'vaccine_id' => 4],

            // Spot 3 - RSUD Pasar Minggu (Sinovac, AstraZeneca, Pfizer, Moderna)
            ['spot_id' => 3, 'vaccine_id' => 1],
            ['spot_id' => 3, 'vaccine_id' => 2],
            ['spot_id' => 3, 'vaccine_id' => 3],
            ['spot_id' => 3, 'vaccine_id' => 4],

            // Spot 4 - Puskesmas Kebayoran Baru (Sinovac, Sinopharm)
            ['spot_id' => 4, 'vaccine_id' => 1],
            ['spot_id' => 4, 'vaccine_id' => 5],

            // Spot 5 - RSUD Cipayung (AstraZeneca, Pfizer)
            ['spot_id' => 5, 'vaccine_id' => 2],
            ['spot_id' => 5, 'vaccine_id' => 3],

            // Spot 6 - Puskesmas Cengkareng (Sinovac, Johnson & Johnson)
            ['spot_id' => 6, 'vaccine_id' => 1],
            ['spot_id' => 6, 'vaccine_id' => 6],

            // Spot 7 - RS Hasan Sadikin (Semua vaksin)
            ['spot_id' => 7, 'vaccine_id' => 1],
            ['spot_id' => 7, 'vaccine_id' => 2],
            ['spot_id' => 7, 'vaccine_id' => 3],
            ['spot_id' => 7, 'vaccine_id' => 4],
            ['spot_id' => 7, 'vaccine_id' => 5],

            // Spot 8 - Puskesmas Dago (Sinovac, AstraZeneca)
            ['spot_id' => 8, 'vaccine_id' => 1],
            ['spot_id' => 8, 'vaccine_id' => 2],

            // Spot 9 - RSUD Dr. Soetomo (Pfizer, Moderna, Johnson & Johnson)
            ['spot_id' => 9, 'vaccine_id' => 3],
            ['spot_id' => 9, 'vaccine_id' => 4],
            ['spot_id' => 9, 'vaccine_id' => 6],

            // Spot 10 - RS Kariadi (Sinovac, AstraZeneca, Sinopharm)
            ['spot_id' => 10, 'vaccine_id' => 1],
            ['spot_id' => 10, 'vaccine_id' => 2],
            ['spot_id' => 10, 'vaccine_id' => 5],

            // Spot 11 - RS Sardjito (Semua vaksin)
            ['spot_id' => 11, 'vaccine_id' => 1],
            ['spot_id' => 11, 'vaccine_id' => 2],
            ['spot_id' => 11, 'vaccine_id' => 3],
            ['spot_id' => 11, 'vaccine_id' => 4],

            // Spot 12 - RSUD Tangerang (Sinovac, Pfizer)
            ['spot_id' => 12, 'vaccine_id' => 1],
            ['spot_id' => 12, 'vaccine_id' => 3],
        ];

        foreach ($spotVaccines as $sv) {
            DB::table('spot_vaccines')->insert(array_merge($sv, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
