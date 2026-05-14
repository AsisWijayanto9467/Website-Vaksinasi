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
}
