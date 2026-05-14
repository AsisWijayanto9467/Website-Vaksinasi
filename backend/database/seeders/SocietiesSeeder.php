<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SocietiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $societies = [
            [
                'id_card_number' => '3201010101900001',
                'password' => Hash::make('password123'),
                'name' => 'Andi Pratama',
                'born_date' => '1990-01-01',
                'gender' => 'male',
                'address' => 'Jl. Melati No. 10, Jakarta Pusat',
                'regional_id' => 1,
            ],
            [
                'id_card_number' => '3202020202850002',
                'password' => Hash::make('password123'),
                'name' => 'Siti Nurhaliza',
                'born_date' => '1985-02-02',
                'gender' => 'female',
                'address' => 'Jl. Mawar No. 15, Jakarta Selatan',
                'regional_id' => 2,
            ],
            [
                'id_card_number' => '3203030303920003',
                'password' => Hash::make('password123'),
                'name' => 'Budi Santoso',
                'born_date' => '1992-03-03',
                'gender' => 'male',
                'address' => 'Jl. Anggrek No. 20, Jakarta Timur',
                'regional_id' => 3,
            ],
            [
                'id_card_number' => '3204040404880004',
                'password' => Hash::make('password123'),
                'name' => 'Dewi Lestari',
                'born_date' => '1988-04-04',
                'gender' => 'female',
                'address' => 'Jl. Kenanga No. 25, Jakarta Barat',
                'regional_id' => 4,
            ],
            [
                'id_card_number' => '3205050505950005',
                'password' => Hash::make('password123'),
                'name' => 'Eko Prasetyo',
                'born_date' => '1995-05-05',
                'gender' => 'male',
                'address' => 'Jl. Dahlia No. 30, Jakarta Utara',
                'regional_id' => 5,
            ],
            [
                'id_card_number' => '3273010606900006',
                'password' => Hash::make('password123'),
                'name' => 'Fitri Handayani',
                'born_date' => '1990-06-06',
                'gender' => 'female',
                'address' => 'Jl. Cihampelas No. 40, Bandung',
                'regional_id' => 6,
            ],
            [
                'id_card_number' => '3273020707870007',
                'password' => Hash::make('password123'),
                'name' => 'Gunawan Wibisono',
                'born_date' => '1987-07-07',
                'gender' => 'male',
                'address' => 'Jl. Pasteur No. 45, Bandung',
                'regional_id' => 6,
            ],
            [
                'id_card_number' => '3578010808930008',
                'password' => Hash::make('password123'),
                'name' => 'Hana Puspita',
                'born_date' => '1993-08-08',
                'gender' => 'female',
                'address' => 'Jl. Diponegoro No. 50, Surabaya',
                'regional_id' => 10,
            ],
            [
                'id_card_number' => '3374010909910009',
                'password' => Hash::make('password123'),
                'name' => 'Irfan Hakim',
                'born_date' => '1991-09-09',
                'gender' => 'male',
                'address' => 'Jl. Pemuda No. 55, Semarang',
                'regional_id' => 12,
            ],
            [
                'id_card_number' => '3403011001940010',
                'password' => Hash::make('password123'),
                'name' => 'Jessica Amanda',
                'born_date' => '1994-10-10',
                'gender' => 'female',
                'address' => 'Jl. Kaliurang No. 60, Sleman',
                'regional_id' => 13,
            ],
        ];

        foreach ($societies as $society) {
            DB::table('societies')->insert(array_merge($society, [
                'login_tokens' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
