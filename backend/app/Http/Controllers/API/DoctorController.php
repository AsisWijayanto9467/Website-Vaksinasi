<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Society;
use App\Models\Vaccination;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function dashboard(Request $request)
    {
        try {
            $medical = $request->auth_medical;
            $spotId = $medical->spot_id;

            $pendingConsultations = Consultation::where("status", "pending")
                ->whereHas("society", function($q) use ($spotId) {
                })
                ->count();

            $spotPendingConsultations = Consultation::where("status", "pending")
                ->whereHas("society", function($q) use ($medical) {
                    $q->whereHas("regional", function($r) use ($medical) {
                        $r->whereHas("spots", function($s) use ($medical) {
                            $s->where("id", $medical->spot_id);
                        });
                    });
                })
                ->count();

            $todayVaccinations = Vaccination::where("spot_id", $spotId)
                ->where("date", Carbon::today())
                ->with(['society', 'vaccine', 'officer'])
                ->get();

            $totalTodayVaccinations = $todayVaccinations->count();

            $totalHandledConsultations = Consultation::where("doctor_id", $medical->id)
                ->whereIn("status", ["accepted", "declined"])
                ->count();
            $acceptedConsultations = Consultation::where("doctor_id", $medical->id)
                ->where("status", "accepted")
                ->count();
            $declinedConsultations = Consultation::where("doctor_id", $medical->id)
                ->where("status", "declined")
                ->count();

            return response()->json([
                "doctor" => [
                    "id" => $medical->id,
                    "name" => $medical->name,
                    "spot" => [
                        "id" => $medical->spot->id,
                        "name" => $medical->spot->name,
                        "address" => $medical->spot->address,
                        "capacity" => $medical->spot->capacity
                    ]
                ],
                "statistics" => [
                    "pending_consultations" => $pendingConsultations,
                    "spot_pending_consultations" => $spotPendingConsultations,
                    "today_vaccinations" => $totalTodayVaccinations,
                    "total_handled_consultations" => $totalHandledConsultations,
                    "accepted_consultations" => $acceptedConsultations,
                    "declined_consultations" => $declinedConsultations
                ],
                "today_vaccinations" => $todayVaccinations->map(function($vac) {
                    return [
                        "id" => $vac->id,
                        "dose" => $vac->dose,
                        "date" => $vac->date,
                        "society" => [
                            "id" => $vac->society->id,
                            "name" => $vac->society->name,
                            "id_card_number" => $vac->society->id_card_number
                        ],
                        "vaccine" => [
                            "id" => $vac->vaccine->id,
                            "name" => $vac->vaccine->name
                        ],
                        "officer" => [
                            "id" => $vac->officer->id,
                            "name" => $vac->officer->name
                        ]
                    ];
                })
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function getPatientHistory(Request $request, $societyId)
    {
        try {
            $medical = $request->auth_medical;

            $society = Society::find($societyId);
            if (!$society) {
                return response()->json([
                    "message" => "Patient not found"
                ], 404);
            }

            $consultations = Consultation::with('doctor')
                ->where("society_id", $societyId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($cons) {
                    return [
                        "id" => $cons->id,
                        "status" => $cons->status,
                        "disease_history" => $cons->disease_history,
                        "current_symptoms" => $cons->current_symptoms,
                        "doctor_notes" => $cons->doctor_notes,
                        "doctor" => $cons->doctor ? [
                            "id" => $cons->doctor->id,
                            "name" => $cons->doctor->name,
                            "role" => $cons->doctor->role,
                        ] : null,
                        "created_at" => $cons->created_at,
                        "updated_at" => $cons->updated_at,
                    ];
                });

            $vaccinations = Vaccination::with(['spot', 'vaccine', 'doctor', 'officer'])
                ->where("society_id", $societyId)
                ->orderBy("date", "desc")
                ->orderBy("dose", "asc")
                ->get()
                ->map(function ($vac) {
                    return [
                        "id" => $vac->id,
                        "dose" => $vac->dose,
                        "date" => $vac->date,
                        "spot" => [
                            "id" => $vac->spot->id,
                            "name" => $vac->spot->name,
                            "address" => $vac->spot->address
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
                "patient" => [
                    "id" => $society->id,
                    "name" => $society->name,
                    "id_card_number" => $society->id_card_number,
                    "born_date" => $society->born_date,
                    "gender" => $society->gender,
                    "address" => $society->address
                ],
                "consultations" => [
                    "data" => $consultations,
                    "total" => $consultations->count()
                ],
                "vaccinations" => [
                    "data" => $vaccinations,
                    "total" => $vaccinations->count()
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
