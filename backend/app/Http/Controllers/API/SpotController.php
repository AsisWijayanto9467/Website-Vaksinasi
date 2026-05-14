<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Society;
use App\Models\Spot;
use App\Models\SpotVaccine;
use App\Models\Vaccination;
use App\Models\Vaccine;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SpotController extends Controller
{
    public function getSpots(Request $request) {
        try {
            $user = Society::where("login_tokens", $request->query("token"))->first();

            $con = Consultation::where("society_id", $user->id)->where("status", "accepted")->first();

            if(!$con) {
                return response()->json([
                    "message" => "consultation must be accepted by doctor"
                ]);
            }

            $spots = Spot::with("spotVaccines.vaccine")->where("regional_id", $user->regional_id)->get();

            $vaccines  = Vaccine::all();

            $data = $spots->map(function($spot) use($vaccines) {

                $available = [];
                foreach($vaccines as $vac) {
                    $available[$vac->name] = false;
                }

                foreach($spot->spotVaccines as $sv) {
                    if($sv->vaccine) {
                        $available[$sv->vaccine->name] = true;
                    }
                }

                return [
                    "id" => $spot->id,
                    "name" => $spot->name,
                    "address" => $spot->address,
                    "serve" => $spot->serve,
                    "capacity" => $spot->capacity,
                    "available_vaccines" => $available
                ];
            });

            return response()->json([
                "spots" => $data
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ]);
        }
    }

    public function getDetailSpot(Request $request, $id) {
        try {
            $spot = Spot::find($id);

            if(!$spot) {
                return response()->json([
                    "message" => "spot not found"
                ], 403);
            }

            $dateParam = $request->query("date");

            $date = Carbon::today();

            if($dateParam) {
                try {
                    $date = Carbon::parse($dateParam);
                } catch (\Throwable $th) {
                    return response()->json([
                        "message" => "Invalid format"
                    ]);
                }
            }

            $vaccination = Vaccination::where("spot_id", $spot->id)->where("date", $date)->get();

            return response()->json([
                "date" => $date,
                "spot" => [
                    "id" => $spot->id,
                    "name" => $spot->name,
                    "address" => $spot->address,
                    "serve" => $spot->serve,
                    "capacity" => $spot->capacity
                ],
                "vaccination_count" => $vaccination->count(),
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ]);
        }
    }
}
