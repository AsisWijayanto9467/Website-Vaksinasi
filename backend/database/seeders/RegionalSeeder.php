<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regionals = [
            ['province' => 'DKI Jakarta', 'district' => 'Jakarta Pusat'],
            ['province' => 'DKI Jakarta', 'district' => 'Jakarta Selatan'],
            ['province' => 'DKI Jakarta', 'district' => 'Jakarta Timur'],
            ['province' => 'DKI Jakarta', 'district' => 'Jakarta Barat'],
            ['province' => 'DKI Jakarta', 'district' => 'Jakarta Utara'],
            ['province' => 'Jawa Barat', 'district' => 'Bandung'],
            ['province' => 'Jawa Barat', 'district' => 'Bekasi'],
            ['province' => 'Jawa Barat', 'district' => 'Depok'],
            ['province' => 'Jawa Barat', 'district' => 'Bogor'],
            ['province' => 'Jawa Timur', 'district' => 'Surabaya'],
            ['province' => 'Jawa Timur', 'district' => 'Malang'],
            ['province' => 'Jawa Tengah', 'district' => 'Semarang'],
            ['province' => 'DI Yogyakarta', 'district' => 'Sleman'],
            ['province' => 'Banten', 'district' => 'Tangerang'],
            ['province' => 'Bali', 'district' => 'Denpasar'],
        ];

        DB::table('regionals')->insert(
            array_map(function ($regional) {
                return array_merge($regional, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }, $regionals)
        );
    }
}
