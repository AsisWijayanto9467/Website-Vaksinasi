<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConsultationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $consultations = [
            [
                'society_id' => 1,
                'doctor_id' => 1,
                'status' => 'accepted',
                'disease_history' => 'Tidak ada riwayat penyakit kronis',
                'current_symptoms' => 'Demam ringan, batuk kering, sakit tenggorokan',
                'doctor_notes' => 'Pasien mengalami gejala flu biasa. Istirahat cukup dan minum obat.',
                'user_id' => 1,
            ],
            [
                'society_id' => 2,
                'doctor_id' => 3,
                'status' => 'accepted',
                'disease_history' => 'Asma ringan',
                'current_symptoms' => 'Sesak napas, batuk berdahak, lemas',
                'doctor_notes' => 'Kemungkinan bronkitis. Perlu rontgen dada dan nebulizer.',
                'user_id' => 2,
            ],
            [
                'society_id' => 3,
                'doctor_id' => null,
                'status' => 'pending',
                'disease_history' => 'Diabetes tipe 2',
                'current_symptoms' => 'Sakit kepala, penglihatan kabur, sering haus',
                'doctor_notes' => null,
                'user_id' => null,
            ],
            [
                'society_id' => 4,
                'doctor_id' => 4,
                'status' => 'declined',
                'disease_history' => 'Hipertensi',
                'current_symptoms' => 'Pusing, mual, tekanan darah tinggi',
                'doctor_notes' => 'Pasien disarankan langsung ke IGD untuk penanganan intensif.',
                'user_id' => 2,
            ],
            [
                'society_id' => 5,
                'doctor_id' => 5,
                'status' => 'accepted',
                'disease_history' => 'Tidak ada',
                'current_symptoms' => 'Nyeri sendi, pegal-pegal, demam',
                'doctor_notes' => 'Gejala flu dan kelelahan. Perbanyak istirahat.',
                'user_id' => 1,
            ],
            [
                'society_id' => 6,
                'doctor_id' => 13,
                'status' => 'accepted',
                'disease_history' => 'Maag kronis',
                'current_symptoms' => 'Nyeri ulu hati, mual, kembung',
                'doctor_notes' => 'Kambuh maag. Diberikan obat maag dan diet khusus.',
                'user_id' => 3,
            ],
            [
                'society_id' => 7,
                'doctor_id' => null,
                'status' => 'pending',
                'disease_history' => 'Tidak ada',
                'current_symptoms' => 'Ruam kulit, gatal-gatal, bengkak',
                'doctor_notes' => null,
                'user_id' => null,
            ],
            [
                'society_id' => 8,
                'doctor_id' => 17,
                'status' => 'accepted',
                'disease_history' => 'Alergi debu',
                'current_symptoms' => 'Bersin-bersin, hidung tersumbat, mata gatal',
                'doctor_notes' => 'Alergi kambuh. Diberikan antihistamin.',
                'user_id' => 4,
            ],
            [
                'society_id' => 9,
                'doctor_id' => 19,
                'status' => 'accepted',
                'disease_history' => 'Tidak ada',
                'current_symptoms' => 'Sakit gigi, gusi bengkak',
                'doctor_notes' => 'Infeksi gusi. Perlu antibiotik dan rujukan ke dokter gigi.',
                'user_id' => 5,
            ],
            [
                'society_id' => 10,
                'doctor_id' => 21,
                'status' => 'pending',
                'disease_history' => 'Asam urat',
                'current_symptoms' => 'Nyeri jempol kaki, bengkak, kemerahan',
                'doctor_notes' => null,
                'user_id' => null,
            ],
        ];

        foreach ($consultations as $consultation) {
            DB::table('consultations')->insert(array_merge($consultation, [
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now(),
            ]));
        }
    }
}
