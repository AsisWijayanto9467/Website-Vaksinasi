<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MedicalsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medicals = [
            // Spot 1 - RSUD Tanah Abang
            ['spot_id' => 1, 'user_id' => 1, 'role' => 'doctor', 'name' => 'Dr. Ahmad Fauzi'],
            ['spot_id' => 1, 'user_id' => 1, 'role' => 'officer', 'name' => 'Petugas Budi Waluyo'],

            // Spot 2 - Puskesmas Menteng
            ['spot_id' => 2, 'user_id' => 1, 'role' => 'doctor', 'name' => 'Dr. Sarah Amalia'],
            ['spot_id' => 2, 'user_id' => 1, 'role' => 'officer', 'name' => 'Petugas Citra Dewi'],

            // Spot 3 - RSUD Pasar Minggu
            ['spot_id' => 3, 'user_id' => 2, 'role' => 'doctor', 'name' => 'Dr. Rudi Hartono'],
            ['spot_id' => 3, 'user_id' => 2, 'role' => 'officer', 'name' => 'Petugas Dodi Supriadi'],

            // Spot 4 - Puskesmas Kebayoran Baru
            ['spot_id' => 4, 'user_id' => 2, 'role' => 'doctor', 'name' => 'Dr. Maya Indah'],
            ['spot_id' => 4, 'user_id' => 2, 'role' => 'officer', 'name' => 'Petugas Eka Putri'],

            // Spot 5 - RSUD Cipayung
            ['spot_id' => 5, 'user_id' => 1, 'role' => 'doctor', 'name' => 'Dr. Hendra Gunawan'],
            ['spot_id' => 5, 'user_id' => 1, 'role' => 'officer', 'name' => 'Petugas Fajar Nugroho'],

            // Spot 6 - Puskesmas Cengkareng
            ['spot_id' => 6, 'user_id' => 1, 'role' => 'doctor', 'name' => 'Dr. Kartika Sari'],
            ['spot_id' => 6, 'user_id' => 1, 'role' => 'officer', 'name' => 'Petugas Gilang Ramadhan'],

            // Spot 7 - RS Hasan Sadikin
            ['spot_id' => 7, 'user_id' => 3, 'role' => 'doctor', 'name' => 'Dr. Lukman Hakim'],
            ['spot_id' => 7, 'user_id' => 3, 'role' => 'officer', 'name' => 'Petugas Heri Susanto'],

            // Spot 8 - Puskesmas Dago
            ['spot_id' => 8, 'user_id' => 3, 'role' => 'doctor', 'name' => 'Dr. Nina Marlina'],
            ['spot_id' => 8, 'user_id' => 3, 'role' => 'officer', 'name' => 'Petugas Indra Kusuma'],

            // Spot 9 - RSUD Dr. Soetomo
            ['spot_id' => 9, 'user_id' => 4, 'role' => 'doctor', 'name' => 'Dr. Purnomo Adi'],
            ['spot_id' => 9, 'user_id' => 4, 'role' => 'officer', 'name' => 'Petugas Joko Widodo'],

            // Spot 10 - RS Kariadi
            ['spot_id' => 10, 'user_id' => 5, 'role' => 'doctor', 'name' => 'Dr. Ratna Dewi'],
            ['spot_id' => 10, 'user_id' => 5, 'role' => 'officer', 'name' => 'Petugas Kurniawan Adi'],

            // Spot 11 - RS Sardjito
            ['spot_id' => 11, 'user_id' => 5, 'role' => 'doctor', 'name' => 'Dr. Surya Utama'],
            ['spot_id' => 11, 'user_id' => 5, 'role' => 'officer', 'name' => 'Petugas Lestari Wati'],

            // Spot 12 - RSUD Tangerang
            ['spot_id' => 12, 'user_id' => 1, 'role' => 'doctor', 'name' => 'Dr. Taufik Hidayat'],
            ['spot_id' => 12, 'user_id' => 1, 'role' => 'officer', 'name' => 'Petugas Maman Abdurahman'],
        ];

        foreach ($medicals as $medical) {
            DB::table('medicals')->insert(array_merge($medical, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
