<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpotsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $spots = [
            // Jakarta Pusat (regional_id: 1)
            [
                'regional_id' => 1,
                'name' => 'RSUD Tanah Abang',
                'address' => 'Jl. KH Mas Mansyur No. 30, Tanah Abang',
                'serve' => 1,
                'capacity' => 100,
            ],
            [
                'regional_id' => 1,
                'name' => 'Puskesmas Menteng',
                'address' => 'Jl. Cikini Raya No. 12, Menteng',
                'serve' => 2,
                'capacity' => 50,
            ],
            // Jakarta Selatan (regional_id: 2)
            [
                'regional_id' => 2,
                'name' => 'RSUD Pasar Minggu',
                'address' => 'Jl. TB Simatupang No. 1, Pasar Minggu',
                'serve' => 1,
                'capacity' => 150,
            ],
            [
                'regional_id' => 2,
                'name' => 'Puskesmas Kebayoran Baru',
                'address' => 'Jl. Radio Dalam No. 5, Kebayoran Baru',
                'serve' => 2,
                'capacity' => 75,
            ],
            // Jakarta Timur (regional_id: 3)
            [
                'regional_id' => 3,
                'name' => 'RSUD Cipayung',
                'address' => 'Jl. Mini Park No. 8, Cipayung',
                'serve' => 1,
                'capacity' => 120,
            ],
            // Jakarta Barat (regional_id: 4)
            [
                'regional_id' => 4,
                'name' => 'Puskesmas Cengkareng',
                'address' => 'Jl. Daan Mogot No. 20, Cengkareng',
                'serve' => 2,
                'capacity' => 80,
            ],
            // Bandung (regional_id: 6)
            [
                'regional_id' => 6,
                'name' => 'RS Hasan Sadikin',
                'address' => 'Jl. Pasteur No. 38, Bandung',
                'serve' => 1,
                'capacity' => 200,
            ],
            [
                'regional_id' => 6,
                'name' => 'Puskesmas Dago',
                'address' => 'Jl. Ir H Juanda No. 100, Dago',
                'serve' => 3,
                'capacity' => 60,
            ],
            // Surabaya (regional_id: 10)
            [
                'regional_id' => 10,
                'name' => 'RSUD Dr. Soetomo',
                'address' => 'Jl. Mayjen Prof Dr Moestopo No. 6-8, Surabaya',
                'serve' => 1,
                'capacity' => 250,
            ],
            // Semarang (regional_id: 12)
            [
                'regional_id' => 12,
                'name' => 'RS Kariadi',
                'address' => 'Jl. Dr. Sutomo No. 16, Semarang',
                'serve' => 1,
                'capacity' => 180,
            ],
            // Yogyakarta (regional_id: 13)
            [
                'regional_id' => 13,
                'name' => 'RS Sardjito',
                'address' => 'Jl. Kesehatan No. 1, Sleman',
                'serve' => 1,
                'capacity' => 160,
            ],
            // Tangerang (regional_id: 14)
            [
                'regional_id' => 14,
                'name' => 'RSUD Tangerang',
                'address' => 'Jl. Jend Sudirman No. 50, Tangerang',
                'serve' => 2,
                'capacity' => 90,
            ],
        ];

        foreach ($spots as $spot) {
            DB::table('spots')->insert(array_merge($spot, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
