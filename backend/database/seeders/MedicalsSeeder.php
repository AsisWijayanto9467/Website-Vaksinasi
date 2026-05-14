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
            // Doctors (user_id 6-17)
            ['spot_id' => 1, 'user_id' => 6, 'role' => 'doctor', 'name' => 'Dr. Ahmad Fauzi'],
            ['spot_id' => 2, 'user_id' => 7, 'role' => 'doctor', 'name' => 'Dr. Sarah Amalia'],
            ['spot_id' => 3, 'user_id' => 8, 'role' => 'doctor', 'name' => 'Dr. Rudi Hartono'],
            ['spot_id' => 4, 'user_id' => 9, 'role' => 'doctor', 'name' => 'Dr. Maya Indah'],
            ['spot_id' => 5, 'user_id' => 10, 'role' => 'doctor', 'name' => 'Dr. Hendra Gunawan'],
            ['spot_id' => 6, 'user_id' => 11, 'role' => 'doctor', 'name' => 'Dr. Kartika Sari'],
            ['spot_id' => 7, 'user_id' => 12, 'role' => 'doctor', 'name' => 'Dr. Lukman Hakim'],
            ['spot_id' => 8, 'user_id' => 13, 'role' => 'doctor', 'name' => 'Dr. Nina Marlina'],
            ['spot_id' => 9, 'user_id' => 14, 'role' => 'doctor', 'name' => 'Dr. Purnomo Adi'],
            ['spot_id' => 10, 'user_id' => 15, 'role' => 'doctor', 'name' => 'Dr. Ratna Dewi'],
            ['spot_id' => 11, 'user_id' => 16, 'role' => 'doctor', 'name' => 'Dr. Surya Utama'],
            ['spot_id' => 12, 'user_id' => 17, 'role' => 'doctor', 'name' => 'Dr. Taufik Hidayat'],

            // Officers (user_id 18-29)
            ['spot_id' => 1, 'user_id' => 18, 'role' => 'officer', 'name' => 'Petugas Budi Waluyo'],
            ['spot_id' => 2, 'user_id' => 19, 'role' => 'officer', 'name' => 'Petugas Citra Dewi'],
            ['spot_id' => 3, 'user_id' => 20, 'role' => 'officer', 'name' => 'Petugas Dodi Supriadi'],
            ['spot_id' => 4, 'user_id' => 21, 'role' => 'officer', 'name' => 'Petugas Eka Putri'],
            ['spot_id' => 5, 'user_id' => 22, 'role' => 'officer', 'name' => 'Petugas Fajar Nugroho'],
            ['spot_id' => 6, 'user_id' => 23, 'role' => 'officer', 'name' => 'Petugas Gilang Ramadhan'],
            ['spot_id' => 7, 'user_id' => 24, 'role' => 'officer', 'name' => 'Petugas Heri Susanto'],
            ['spot_id' => 8, 'user_id' => 25, 'role' => 'officer', 'name' => 'Petugas Indra Kusuma'],
            ['spot_id' => 9, 'user_id' => 26, 'role' => 'officer', 'name' => 'Petugas Joko Widodo'],
            ['spot_id' => 10, 'user_id' => 27, 'role' => 'officer', 'name' => 'Petugas Kurniawan Adi'],
            ['spot_id' => 11, 'user_id' => 28, 'role' => 'officer', 'name' => 'Petugas Lestari Wati'],
            ['spot_id' => 12, 'user_id' => 29, 'role' => 'officer', 'name' => 'Petugas Maman Abdurahman'],
        ];

        foreach ($medicals as $medical) {
            DB::table('medicals')->insert(array_merge($medical, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
