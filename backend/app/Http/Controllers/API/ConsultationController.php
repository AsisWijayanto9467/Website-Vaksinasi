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

            $cons = Consultation::where("society_id", $user->id)->first();

            return response()->json([
                "consultation" => [
                    "id" => $cons->id,
                    "status" => $cons->status,
                    "disease_history" => $cons->disease_history,
                    "current_symptoms" => $cons->current_symptoms,
                    "doctor_notes" => $cons->doctor_notes,
                    "doctor" => $cons->doctor,
                ]
            ], 200);
        } catch (\Throwable $th) {
            Log::error("Terjadi kesalahan di logout", ["error", $th->getMessage()]);
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ]);
        }
    }
}
