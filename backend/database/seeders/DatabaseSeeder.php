<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RegionalSeeder::class,
            UserSeeder::class,
            VaccinesSeeder::class,
            SpotsSeeder::class,
            SpotVaccinesSeeder::class,
            SocietiesSeeder::class,
            MedicalsSeeder::class,
            ConsultationSeeder::class,
            VaccinationsSeeder::class
        ]);
    }
}
