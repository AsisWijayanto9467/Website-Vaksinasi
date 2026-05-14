<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Society;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ConsultationController extends Controller
{
    public function createConsultation(Request $request) {
        DB::beginTransaction();
        try {
            $user = Society::where("login_tokens", $request->query("token"))->first();

            $request->validate([
                "disease_history" => "required|string",
                "current_symptoms" => "required|string",
            ]);

            Consultation::create([
                "society_id" => $user->id,
                "doctor_id" => null,
                "status" => "pending",
                "disease_history" => $request->disease_history,
                "current_symptoms" => $request->current_symptoms,
                "doctor_notes" => null,
                "user_id" => null,
            ]);

            DB::commit();

            return response()->json([
                "message" => "Request consultation sent"
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ]);
        }
    }

    public function getConsultation(Request $request) {
        try {
            $user = Society::where("login_tokens", $request->query("token"))->first();

            if (!$user) {
                return response()->json([
                    "message" => "User not found"
                ], 404);
            }

            $consultations = Consultation::with('doctor')
                ->where("society_id", $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            if ($consultations->isEmpty()) {
                return response()->json([
                    "message" => "No consultations found"
                ], 404);
            }

            $data = $consultations->map(function ($cons) {
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

            return response()->json([
                "consultations" => $data,
                "total" => $consultations->count()
            ], 200);

        } catch (\Throwable $th) {
            Log::error("Terjadi kesalahan di getConsultation", [
                "error" => $th->getMessage(),
                "trace" => $th->getTraceAsString()
            ]);

            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }


    // Role Doctor
    public function getPendingConsultations(Request $request)
    {
        try {
            $medical = $request->auth_medical;

            $consultations = Consultation::with(['society.regional'])
                ->where("status", "pending")
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($cons) {
                    return [
                        "id" => $cons->id,
                        "status" => $cons->status,
                        "disease_history" => $cons->disease_history,
                        "current_symptoms" => $cons->current_symptoms,
                        "society" => [
                            "id" => $cons->society->id,
                            "name" => $cons->society->name,
                            "id_card_number" => $cons->society->id_card_number,
                            "born_date" => $cons->society->born_date,
                            "gender" => $cons->society->gender,
                            "address" => $cons->society->address,
                            "regional" => [
                                "id" => $cons->society->regional->id ?? null,
                                "province" => $cons->society->regional->province ?? null,
                                "district" => $cons->society->regional->district ?? null,
                            ]
                        ],
                        "created_at" => $cons->created_at
                    ];
                });

            if ($consultations->isEmpty()) {
                return response()->json([
                    "message" => "No pending consultations"
                ], 404);
            }

            return response()->json([
                "consultations" => $consultations,
                "total" => $consultations->count()
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function handleConsultation(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $medical = $request->auth_medical;
            $user = $request->auth_user;

            $request->validate([
                "status" => "required|in:accepted,declined",
                "doctor_notes" => "required|string"
            ]);

            $consultation = Consultation::with('society')->find($id);

            if (!$consultation) {
                return response()->json([
                    "message" => "Consultation not found"
                ], 404);
            }

            if ($consultation->status !== "pending") {
                return response()->json([
                    "message" => "Consultation has already been handled"
                ], 400);
            }
            $consultation->update([
                "status" => $request->status,
                "doctor_notes" => $request->doctor_notes,
                "doctor_id" => $medical->id,
                "user_id" => $user->id
            ]);

            DB::commit();

            return response()->json([
                "message" => "Consultation " . $request->status . " successfully",
                "data" => [
                    "id" => $consultation->id,
                    "status" => $consultation->status,
                    "disease_history" => $consultation->disease_history,
                    "current_symptoms" => $consultation->current_symptoms,
                    "doctor_notes" => $consultation->doctor_notes,
                    "society" => [
                        "id" => $consultation->society->id,
                        "name" => $consultation->society->name
                    ],
                    "doctor" => [
                        "id" => $medical->id,
                        "name" => $medical->name
                    ],
                    "updated_at" => $consultation->updated_at
                ]
            ], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
