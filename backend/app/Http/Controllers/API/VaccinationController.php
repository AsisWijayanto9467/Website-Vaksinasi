<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Medical;
use App\Models\Society;
use App\Models\Spot;
use App\Models\Vaccination;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VaccinationController extends Controller
{
    public function registerVaccination(Request $request)
    {
        DB::beginTransaction();
        try {
            $token = $request->query("token");
            $society = Society::where("login_tokens", $token)->first();

            if (!$society) {
                return response()->json([
                    "message" => "Unauthorized user"
                ], 401);
            }

            $request->validate([
                "spot_id" => "required|exists:spots,id",
                "vaccine_id" => "required|exists:vaccines,id",
                "date" => "required|date|after_or_equal:today",
                "dose" => "required|integer|min:1|max:10" // Maksimum 10 dosis
            ]);

            // Cek konsultasi harus accepted
            $consultation = Consultation::where("society_id", $society->id)
                ->where("status", "accepted")
                ->first();

            if (!$consultation) {
                return response()->json([
                    "message" => "Your consultation must be accepted by doctor before registration"
                ], 400);
            }

            // Ambil riwayat vaksinasi user
            $existingVaccinations = Vaccination::where("society_id", $society->id)
                ->orderBy("dose", "asc")
                ->get();

            // ===== VALIDASI BERDASARKAN DOSIS =====

            // Validasi dosis harus berurutan
            $maxExistingDose = $existingVaccinations->max("dose");

            if ($request->dose > 1) {
                // Cek apakah dosis sebelumnya sudah ada
                $previousDose = $existingVaccinations->where("dose", $request->dose - 1)->first();

                if (!$previousDose) {
                    return response()->json([
                        "message" => "You must receive dose " . ($request->dose - 1) . " first"
                    ], 400);
                }

                // Cek duplikasi dosis
                if ($existingVaccinations->where("dose", $request->dose)->count() > 0) {
                    return response()->json([
                        "message" => "You have already received dose " . $request->dose
                    ], 400);
                }

                // ===== ATURAN JARAK ANTAR DOSIS =====
                $previousDate = Carbon::parse($previousDose->date);
                $requestDate = Carbon::parse($request->date);
                $daysDiff = $previousDate->diffInDays($requestDate);

                // Aturan jarak berbeda untuk setiap dosis
                $minimumInterval = $this->getMinimumInterval($request->dose);

                if ($daysDiff < $minimumInterval) {
                    return response()->json([
                        "message" => "Dose {$request->dose} must be at least {$minimumInterval} days after dose " . ($request->dose - 1)
                    ], 400);
                }

                // Untuk dosis 2, vaksin harus sama dengan dosis 1
                if ($request->dose == 2) {
                    if ($previousDose->vaccine_id != $request->vaccine_id) {
                        return response()->json([
                            "message" => "Dose 2 must use the same vaccine as dose 1"
                        ], 400);
                    }
                }

                // Untuk booster (dosis >= 3), vaksin bisa berbeda (heterologous booster)
                if ($request->dose >= 3) {
                    // Optional: Bisa ditambahkan validasi jenis vaksin booster yang direkomendasikan
                }
            } else {
                // Dosis 1
                if ($existingVaccinations->where("dose", 1)->count() > 0) {
                    return response()->json([
                        "message" => "You have already received dose 1"
                    ], 400);
                }
            }

            // ===== VALIDASI SPOT & KAPASITAS =====
            $spot = Spot::find($request->spot_id);
            $vaccinationCount = Vaccination::where("spot_id", $request->spot_id)
                ->where("date", $request->date)
                ->count();

            if ($vaccinationCount >= $spot->capacity) {
                return response()->json([
                    "message" => "Spot capacity is full for this date"
                ], 400);
            }

            // ===== VALIDASI VAKSIN DI SPOT =====
            $spotVaccine = DB::table("spot_vaccines")
                ->where("spot_id", $request->spot_id)
                ->where("vaccine_id", $request->vaccine_id)
                ->exists();

            if (!$spotVaccine) {
                return response()->json([
                    "message" => "Vaccine is not available at this spot"
                ], 400);
            }

            // ===== VALIDASI TANGGAL YANG SAMA =====
            $existingRegistration = Vaccination::where("society_id", $society->id)
                ->where("date", $request->date)
                ->first();

            if ($existingRegistration) {
                return response()->json([
                    "message" => "You already have a vaccination registered on this date"
                ], 400);
            }

            // ===== VALIDASI TENAGA MEDIS =====
            $doctor = Medical::where("spot_id", $request->spot_id)
                ->where("role", "doctor")
                ->first();

            $officer = Medical::where("spot_id", $request->spot_id)
                ->where("role", "officer")
                ->first();

            if (!$doctor || !$officer) {
                return response()->json([
                    "message" => "Medical staff not available at this spot"
                ], 400);
            }

            // ===== SIMPAN VAKSINASI =====
            $vaccination = Vaccination::create([
                "dose" => $request->dose,
                "date" => $request->date,
                "society_id" => $society->id,
                "spot_id" => $request->spot_id,
                "vaccine_id" => $request->vaccine_id,
                "doctor_id" => $doctor->id,
                "officer_id" => $officer->id
            ]);

            DB::commit();

            return response()->json([
                "message" => "Vaccination registered successfully",
                "data" => $vaccination->load(['spot', 'vaccine', 'doctor', 'officer'])
            ], 201);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    private function getMinimumInterval($dose)
    {
        return match ($dose) {
            2 => 14,
            3 => 90,
            4 => 180,
            5 => 365,
            default => 30,
        };
    }
    public function getVaccinationHistory(Request $request)
    {
        try {
            $token = $request->query("token");

            $society = Society::where("login_tokens", $token)->first();

            if (!$society) {
                return response()->json([
                    "message" => "Unauthorized user"
                ], 401);
            }

            $vaccinations = Vaccination::with([
                'spot.regional',
                'vaccine',
                'doctor',
                'officer'
            ])
                ->where("society_id", $society->id)
                ->orderBy("date", "desc")
                ->orderBy("dose", "asc")
                ->get();

            if ($vaccinations->isEmpty()) {
                return response()->json([
                    "message" => "No vaccination history found"
                ], 404);
            }

            $data = $vaccinations->map(function ($vac) {
                return [
                    "id" => $vac->id,
                    "dose" => $vac->dose,
                    "date" => $vac->date,
                    "spot" => [
                        "id" => $vac->spot->id,
                        "name" => $vac->spot->name,
                        "address" => $vac->spot->address,
                        "serve" => $vac->spot->serve,
                        "capacity" => $vac->spot->capacity,
                        "regional" => [
                            "id" => $vac->spot->regional->id ?? null,
                            "province" => $vac->spot->regional->province ?? null,
                            "district" => $vac->spot->regional->district ?? null,
                        ]
                    ],
                    "vaccine" => [
                        "id" => $vac->vaccine->id,
                        "name" => $vac->vaccine->name
                    ],
                    "doctor" => [
                        "id" => $vac->doctor->id,
                        "name" => $vac->doctor->name
                    ],
                    "officer" => [
                        "id" => $vac->officer->id,
                        "name" => $vac->officer->name
                    ],
                    "created_at" => $vac->created_at
                ];
            });

            return response()->json([
                "vaccinations" => $data,
                "total" => $vaccinations->count()
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    // Role Doctor
    public function recordVaccination(Request $request)
    {
        DB::beginTransaction();
        try {
            $medical = $request->auth_medical;
            $spotId = $medical->spot_id;

            $request->validate([
                "society_id" => "required|exists:societies,id",
                "vaccine_id" => "required|exists:vaccines,id",
                "date" => "required|date",
                "dose" => "required|integer|in:1,2",
                "officer_id" => "required|exists:medicals,id"
            ]);

            // Cek apakah society ada
            $society = Society::find($request->society_id);
            if (!$society) {
                return response()->json([
                    "message" => "Society not found"
                ], 404);
            }

            // Cek apakah society sudah konsultasi & diterima
            $consultation = Consultation::where("society_id", $society->id)
                ->where("status", "accepted")
                ->first();

            if (!$consultation) {
                return response()->json([
                    "message" => "Society must have an accepted consultation first"
                ], 400);
            }

            // Cek urutan dosis
            $existingVaccinations = Vaccination::where("society_id", $society->id)
                ->orderBy("dose", "asc")
                ->get();

            // Validasi dosis 1
            if ($request->dose == 1 && $existingVaccinations->where("dose", 1)->count() > 0) {
                return response()->json([
                    "message" => "Society has already received dose 1"
                ], 400);
            }

            // Validasi dosis 2
            if ($request->dose == 2) {
                $dose1 = $existingVaccinations->where("dose", 1)->first();

                if (!$dose1) {
                    return response()->json([
                        "message" => "Society must receive dose 1 first"
                    ], 400);
                }

                if ($existingVaccinations->where("dose", 2)->count() > 0) {
                    return response()->json([
                        "message" => "Society has already received dose 2"
                    ], 400);
                }

                // Cek jarak minimal 14 hari dari dosis 1
                $dose1Date = Carbon::parse($dose1->date);
                $requestDate = Carbon::parse($request->date);

                if ($dose1Date->diffInDays($requestDate) < 14) {
                    return response()->json([
                        "message" => "Dose 2 must be at least 14 days after dose 1"
                    ], 400);
                }

                // Cek vaccine harus sama dengan dosis 1
                if ($dose1->vaccine_id != $request->vaccine_id) {
                    return response()->json([
                        "message" => "Dose 2 must use the same vaccine as dose 1"
                    ], 400);
                }
            }

            // Cek kapasitas spot pada tanggal tersebut
            $spot = Spot::find($spotId);
            $vaccinationCount = Vaccination::where("spot_id", $spotId)
                ->where("date", $request->date)
                ->count();

            if ($vaccinationCount >= $spot->capacity) {
                return response()->json([
                    "message" => "Spot capacity is full for this date"
                ], 400);
            }

            // Cek apakah vaccine tersedia di spot
            $spotVaccine = DB::table("spot_vaccines")
                ->where("spot_id", $spotId)
                ->where("vaccine_id", $request->vaccine_id)
                ->exists();

            if (!$spotVaccine) {
                return response()->json([
                    "message" => "Vaccine is not available at this spot"
                ], 400);
            }

            // Cek apakah officer valid dan di spot yang sama
            $officer = Medical::where("id", $request->officer_id)
                ->where("spot_id", $spotId)
                ->where("role", "officer")
                ->first();

            if (!$officer) {
                return response()->json([
                    "message" => "Officer not found or not in the same spot"
                ], 400);
            }

            // Buat record vaksinasi
            $vaccination = Vaccination::create([
                "dose" => $request->dose,
                "date" => $request->date,
                "society_id" => $society->id,
                "spot_id" => $spotId,
                "vaccine_id" => $request->vaccine_id,
                "doctor_id" => $medical->id,
                "officer_id" => $request->officer_id
            ]);

            DB::commit();

            return response()->json([
                "message" => "Vaccination recorded successfully",
                "data" => $vaccination->load(['society', 'spot', 'vaccine', 'doctor', 'officer'])
            ], 201);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function getTodayVaccinations(Request $request)
    {
        try {
            $medical = $request->auth_medical;
            $spotId = $medical->spot_id;

            $date = $request->date ?? Carbon::today()->toDateString();

            $vaccinations = Vaccination::with(['society', 'vaccine', 'officer'])
                ->where("spot_id", $spotId)
                ->where("date", $date)
                ->orderBy("created_at", "asc")
                ->get();

            return response()->json([
                "date" => $date,
                "vaccinations" => $vaccinations->map(function ($vac) {
                    return [
                        "id" => $vac->id,
                        "dose" => $vac->dose,
                        "date" => $vac->date,
                        "society" => [
                            "id" => $vac->society->id,
                            "name" => $vac->society->name,
                            "id_card_number" => $vac->society->id_card_number,
                            "gender" => $vac->society->gender,
                            "born_date" => $vac->society->born_date
                        ],
                        "vaccine" => [
                            "id" => $vac->vaccine->id,
                            "name" => $vac->vaccine->name
                        ],
                        "officer" => [
                            "id" => $vac->officer->id,
                            "name" => $vac->officer->name
                        ],
                        "created_at" => $vac->created_at
                    ];
                }),
                "total" => $vaccinations->count()
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
