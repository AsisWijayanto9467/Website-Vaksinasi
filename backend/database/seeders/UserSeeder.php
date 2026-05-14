<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin Pusat',
                'password' => Hash::make('password123'),
                'id_card_number' => '100001',
                'regional_id' => 1,
                'gender' => 'male',
                'address' => 'Jl. Merdeka No. 1, Jakarta Pusat',
                'born_date' => '1990-01-15',
            ],
            [
                'name' => 'Admin Selatan',
                'password' => Hash::make('password123'),
                'id_card_number' => '100002',
                'regional_id' => 2,
                'gender' => 'female',
                'address' => 'Jl. Sudirman No. 10, Jakarta Selatan',
                'born_date' => '1991-05-20',
            ],
            [
                'name' => 'Admin Bandung',
                'password' => Hash::make('password123'),
                'id_card_number' => '100003',
                'regional_id' => 6,
                'gender' => 'male',
                'address' => 'Jl. Asia Afrika No. 5, Bandung',
                'born_date' => '1988-08-10',
            ],
            [
                'name' => 'Admin Surabaya',
                'password' => Hash::make('password123'),
                'id_card_number' => '100004',
                'regional_id' => 10,
                'gender' => 'female',
                'address' => 'Jl. Tunjungan No. 20, Surabaya',
                'born_date' => '1992-03-25',
            ],
            [
                'name' => 'Admin Semarang',
                'password' => Hash::make('password123'),
                'id_card_number' => '100005',
                'regional_id' => 12,
                'gender' => 'male',
                'address' => 'Jl. Pemuda No. 15, Semarang',
                'born_date' => '1993-11-30',
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->insert(array_merge($user, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
