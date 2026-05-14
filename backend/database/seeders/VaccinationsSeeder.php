<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VaccinationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vaccinations = [
            // Society 1 - Andi Pratama (2 dosis Sinovac di spot 1)
            [
                'dose' => 1,
                'date' => '2024-01-15',
                'society_id' => 1,
                'spot_id' => 1,
                'vaccine_id' => 1,
                'doctor_id' => 1,
                'officer_id' => 2,
            ],
            [
                'dose' => 2,
                'date' => '2024-02-15',
                'society_id' => 1,
                'spot_id' => 1,
                'vaccine_id' => 1,
                'doctor_id' => 1,
                'officer_id' => 2,
            ],

            // Society 2 - Siti Nurhaliza (2 dosis AstraZeneca di spot 3)
            [
                'dose' => 1,
                'date' => '2024-01-20',
                'society_id' => 2,
                'spot_id' => 3,
                'vaccine_id' => 2,
                'doctor_id' => 5,
                'officer_id' => 6,
            ],
            [
                'dose' => 2,
                'date' => '2024-03-20',
                'society_id' => 2,
                'spot_id' => 3,
                'vaccine_id' => 2,
                'doctor_id' => 5,
                'officer_id' => 6,
            ],

            // Society 3 - Budi Santoso (1 dosis Pfizer di spot 5)
            [
                'dose' => 1,
                'date' => '2024-02-01',
                'society_id' => 3,
                'spot_id' => 5,
                'vaccine_id' => 3,
                'doctor_id' => 9,
                'officer_id' => 10,
            ],

            // Society 4 - Dewi Lestari (2 dosis Moderna di spot 4)
            [
                'dose' => 1,
                'date' => '2024-01-10',
                'society_id' => 4,
                'spot_id' => 4,
                'vaccine_id' => 4,
                'doctor_id' => 7,
                'officer_id' => 8,
            ],
            [
                'dose' => 2,
                'date' => '2024-02-10',
                'society_id' => 4,
                'spot_id' => 4,
                'vaccine_id' => 4,
                'doctor_id' => 7,
                'officer_id' => 8,
            ],

            // Society 6 - Fitri Handayani (2 dosis Sinovac di spot 7)
            [
                'dose' => 1,
                'date' => '2024-01-25',
                'society_id' => 6,
                'spot_id' => 7,
                'vaccine_id' => 1,
                'doctor_id' => 13,
                'officer_id' => 14,
            ],
            [
                'dose' => 2,
                'date' => '2024-02-25',
                'society_id' => 6,
                'spot_id' => 7,
                'vaccine_id' => 1,
                'doctor_id' => 13,
                'officer_id' => 14,
            ],

            // Society 8 - Hana Puspita (2 dosis Sinopharm di spot 9)
            [
                'dose' => 1,
                'date' => '2024-02-05',
                'society_id' => 8,
                'spot_id' => 9,
                'vaccine_id' => 5,
                'doctor_id' => 17,
                'officer_id' => 18,
            ],
            [
                'dose' => 2,
                'date' => '2024-03-05',
                'society_id' => 8,
                'spot_id' => 9,
                'vaccine_id' => 5,
                'doctor_id' => 17,
                'officer_id' => 18,
            ],

            // Society 10 - Jessica Amanda (1 dosis Johnson & Johnson di spot 11)
            [
                'dose' => 1,
                'date' => '2024-03-01',
                'society_id' => 10,
                'spot_id' => 11,
                'vaccine_id' => 6,
                'doctor_id' => 21,
                'officer_id' => 22,
            ],
        ];

        foreach ($vaccinations as $vaccination) {
            DB::table('vaccinations')->insert(array_merge($vaccination, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
