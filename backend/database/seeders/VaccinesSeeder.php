<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VaccinesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vaccines = [
            ['name' => 'Sinovac'],
            ['name' => 'AstraZeneca'],
            ['name' => 'Pfizer'],
            ['name' => 'Moderna'],
            ['name' => 'Sinopharm'],
            ['name' => 'Johnson & Johnson'],
        ];

        foreach ($vaccines as $vaccine) {
            DB::table('vaccines')->insert(array_merge($vaccine, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
