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

    // society
    public function showSpot()
    {
        try {
            $spots = Spot::with(['regional', 'spotVaccines.vaccine'])
                        ->withCount('medicals')
                        ->get();

            return response()->json([
                "data" => $spots
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }


    // Untuk Admin
    public function index()
    {
        try {
            $spots = Spot::with(['regional', 'spotVaccines.vaccine'])
                        ->withCount('medicals')
                        ->get();

            return response()->json([
                "data" => $spots
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function createSpot(Request $request)
    {
        try {
            $request->validate([
                "regional_id" => "required|exists:regionals,id",
                "name" => "required|string|max:255",
                "address" => "required|string",
                "serve" => "required|integer|min:1|max:3",
                "capacity" => "required|integer|min:1"
            ]);

            $spot = Spot::create([
                "regional_id" => $request->regional_id,
                "name" => $request->name,
                "address" => $request->address,
                "serve" => $request->serve,
                "capacity" => $request->capacity
            ]);

            return response()->json([
                "message" => "Spot created successfully",
                "data" => $spot->load('regional')
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function updateSpot(Request $request, $id)
    {
        try {
            $request->validate([
                "regional_id" => "required|exists:regionals,id",
                "name" => "required|string|max:255",
                "address" => "required|string",
                "serve" => "required|integer|min:1|max:3",
                "capacity" => "required|integer|min:1"
            ]);

            $spot = Spot::find($id);

            if (!$spot) {
                return response()->json([
                    "message" => "Spot not found"
                ], 404);
            }

            $spot->update([
                "regional_id" => $request->regional_id,
                "name" => $request->name,
                "address" => $request->address,
                "serve" => $request->serve,
                "capacity" => $request->capacity
            ]);

            return response()->json([
                "message" => "Spot updated successfully",
                "data" => $spot->load('regional')
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $spot = Spot::find($id);

            if (!$spot) {
                return response()->json([
                    "message" => "Spot not found"
                ], 404);
            }

            $spot->delete();

            return response()->json([
                "message" => "Spot deleted successfully"
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function manageSpotVaccines(Request $request)
    {
        try {
            $request->validate([
                "spot_id" => "required|exists:spots,id",
                "vaccine_ids" => "required|array",
                "vaccine_ids.*" => "required|exists:vaccines,id"
            ]);

            // Remove existing vaccines for this spot
            SpotVaccine::where("spot_id", $request->spot_id)->delete();

            // Add new vaccines
            foreach ($request->vaccine_ids as $vaccineId) {
                SpotVaccine::create([
                    "spot_id" => $request->spot_id,
                    "vaccine_id" => $vaccineId
                ]);
            }

            $spotVaccines = SpotVaccine::with('vaccine')
                ->where("spot_id", $request->spot_id)
                ->get();

            return response()->json([
                "message" => "Spot vaccines updated successfully",
                "data" => $spotVaccines
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
