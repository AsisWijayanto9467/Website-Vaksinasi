<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Spot;
use App\Models\SpotVaccine;
use App\Models\Vaccination;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OfficerController extends Controller
{
    public function verifyVaccination(Request $request)
    {
        DB::beginTransaction();
        try {
            $officer = $request->auth_medical;
            $spotId = $officer->spot_id;

            $request->validate([
                "vaccination_id" => "required|exists:vaccinations,id",
                "status" => "required|in:verified,rejected",
                "notes" => "nullable|string"
            ]);

            $vaccination = Vaccination::with(['society', 'vaccine', 'doctor', 'spot'])
                ->where("spot_id", $spotId)
                ->find($request->vaccination_id);

            if (!$vaccination) {
                return response()->json([
                    "message" => "Vaccination data not found in your spot"
                ], 404);
            }

            if ($vaccination->officer_id != $officer->id) {
                return response()->json([
                    "message" => "You are not assigned to this vaccination"
                ], 403);
            }

            $verificationData = [
                "vaccination_id" => $vaccination->id,
                "verified_by_officer" => true,
                "verification_status" => $request->status,
                "verification_notes" => $request->notes,
                "verified_at" => Carbon::now(),
                "verification_details" => [
                    "society" => [
                        "id" => $vaccination->society->id,
                        "name" => $vaccination->society->name,
                        "id_card_number" => $vaccination->society->id_card_number
                    ],
                    "vaccine" => [
                        "id" => $vaccination->vaccine->id,
                        "name" => $vaccination->vaccine->name
                    ],
                    "dose" => $vaccination->dose,
                    "date" => $vaccination->date,
                    "doctor" => [
                        "id" => $vaccination->doctor->id,
                        "name" => $vaccination->doctor->name
                    ],
                    "officer" => [
                        "id" => $officer->id,
                        "name" => $officer->name
                    ]
                ]
            ];

            DB::commit();

            return response()->json([
                "message" => "Vaccination " . $request->status . " successfully",
                "data" => $verificationData
            ], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function checkCapacity(Request $request, $spotId)
    {
        try {
            $officer = $request->auth_medical;
            $officerSpotId = $officer->spot_id;

            if ($spotId != $officerSpotId) {
                return response()->json([
                    "message" => "You can only check capacity for your assigned spot"
                ], 403);
            }

            $spot = Spot::with(['spotVaccines.vaccine', 'regional'])->find($spotId);

            if (!$spot) {
                return response()->json([
                    "message" => "Spot not found"
                ], 404);
            }

            $date = $request->date ?? Carbon::today()->toDateString();

            try {
                $dateObj = Carbon::parse($date);
            } catch (\Throwable $th) {
                return response()->json([
                    "message" => "Invalid date format"
                ], 400);
            }

            $vaccinationCount = Vaccination::where("spot_id", $spotId)
                ->where("date", $date)
                ->count();

            $dose1Count = Vaccination::where("spot_id", $spotId)
                ->where("date", $date)
                ->where("dose", 1)
                ->count();

            $dose2Count = Vaccination::where("spot_id", $spotId)
                ->where("date", $date)
                ->where("dose", 2)
                ->count();

            $remainingCapacity = $spot->capacity - $vaccinationCount;
            $utilizationPercentage = $spot->capacity > 0
                ? round(($vaccinationCount / $spot->capacity) * 100, 2)
                : 0;

            $availableVaccines = $spot->spotVaccines->map(function($sv) {
                return [
                    "id" => $sv->vaccine->id,
                    "name" => $sv->vaccine->name
                ];
            });

            $hourlyData = Vaccination::where("spot_id", $spotId)
                ->where("date", $date)
                ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
                ->groupBy('hour')
                ->orderBy('hour')
                ->get()
                ->map(function($item) {
                    return [
                        "hour" => $item->hour . ":00",
                        "count" => $item->count
                    ];
                });

            return response()->json([
                "date" => $date,
                "spot" => [
                    "id" => $spot->id,
                    "name" => $spot->name,
                    "address" => $spot->address,
                    "regional" => [
                        "id" => $spot->regional->id,
                        "province" => $spot->regional->province,
                        "district" => $spot->regional->district
                    ],
                    "serve" => $spot->serve,
                    "capacity" => $spot->capacity
                ],
                "capacity_status" => [
                    "total_capacity" => $spot->capacity,
                    "used_capacity" => $vaccinationCount,
                    "remaining_capacity" => $remainingCapacity,
                    "utilization_percentage" => $utilizationPercentage,
                    "is_full" => $remainingCapacity <= 0,
                    "breakdown" => [
                        "dose_1" => $dose1Count,
                        "dose_2" => $dose2Count
                    ]
                ],
                "available_vaccines" => $availableVaccines,
                "hourly_data" => $hourlyData
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function todayQueue(Request $request)
    {
        try {
            $officer = $request->auth_medical;
            $spotId = $officer->spot_id;

            $date = $request->date ?? Carbon::today()->toDateString();

            try {
                $dateObj = Carbon::parse($date);
            } catch (\Throwable $th) {
                return response()->json([
                    "message" => "Invalid date format"
                ], 400);
            }

            $spot = Spot::find($spotId);

            $vaccinations = Vaccination::with([
                    'society',
                    'vaccine',
                    'doctor',
                    'officer'
                ])
                ->where("spot_id", $spotId)
                ->where("date", $date)
                ->orderBy("created_at", "asc")
                ->get();

            $queue = $vaccinations->map(function($vac, $index) use($officer) {
                return [
                    "queue_number" => $index + 1,
                    "id" => $vac->id,
                    "dose" => $vac->dose,
                    "date" => $vac->date,
                    "registration_time" => $vac->created_at->format('H:i:s'),
                    "society" => [
                        "id" => $vac->society->id,
                        "name" => $vac->society->name,
                        "id_card_number" => $vac->society->id_card_number,
                        "gender" => $vac->society->gender,
                        "born_date" => $vac->society->born_date,
                        "address" => $vac->society->address
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
                        "name" => $vac->officer->name,
                        "is_me" => $vac->officer->id === $officer->id
                    ],
                    "status" => $vac->officer->id === $officer->id ? "assigned_to_me" : "assigned_to_other"
                ];
            });

            $dose1Queue = $vaccinations->where("dose", 1)->count();
            $dose2Queue = $vaccinations->where("dose", 2)->count();
            $myQueue = $vaccinations->where("officer_id", $officer->id)->count();

            return response()->json([
                "date" => $date,
                "spot" => [
                    "id" => $spot->id,
                    "name" => $spot->name,
                    "address" => $spot->address,
                    "capacity" => $spot->capacity
                ],
                "officer" => [
                    "id" => $officer->id,
                    "name" => $officer->name
                ],
                "statistics" => [
                    "total_queue" => $vaccinations->count(),
                    "dose_1_queue" => $dose1Queue,
                    "dose_2_queue" => $dose2Queue,
                    "my_queue" => $myQueue,
                    "other_queue" => $vaccinations->count() - $myQueue
                ],
                "queue" => $queue
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function dashboard(Request $request)
    {
        try {
            $officer = $request->auth_medical;
            $spotId = $officer->spot_id;
            $today = Carbon::today();

            $spot = Spot::with('regional')->find($spotId);

            $todayVaccinations = Vaccination::where("spot_id", $spotId)
                ->where("date", $today)
                ->count();
            $myTodayVaccinations = Vaccination::where("spot_id", $spotId)
                ->where("date", $today)
                ->where("officer_id", $officer->id)
                ->count();

            $remainingCapacity = $spot->capacity - $todayVaccinations;

            $availableVaccines = SpotVaccine::with('vaccine')
                ->where("spot_id", $spotId)
                ->get()
                ->map(function($sv) {
                    return [
                        "id" => $sv->vaccine->id,
                        "name" => $sv->vaccine->name
                    ];
                });

            $myPatients = Vaccination::with(['society', 'vaccine'])
                ->where("spot_id", $spotId)
                ->where("date", $today)
                ->where("officer_id", $officer->id)
                ->orderBy("created_at", "asc")
                ->get()
                ->map(function($vac, $index) {
                    return [
                        "queue_number" => $index + 1,
                        "id" => $vac->id,
                        "dose" => $vac->dose,
                        "society" => [
                            "id" => $vac->society->id,
                            "name" => $vac->society->name,
                            "id_card_number" => $vac->society->id_card_number,
                            "gender" => $vac->society->gender
                        ],
                        "vaccine" => [
                            "id" => $vac->vaccine->id,
                            "name" => $vac->vaccine->name
                        ],
                        "registration_time" => $vac->created_at->format('H:i:s')
                    ];
                });

            return response()->json([
                "officer" => [
                    "id" => $officer->id,
                    "name" => $officer->name,
                    "role" => $officer->role
                ],
                "spot" => [
                    "id" => $spot->id,
                    "name" => $spot->name,
                    "address" => $spot->address,
                    "capacity" => $spot->capacity,
                    "regional" => [
                        "id" => $spot->regional->id,
                        "province" => $spot->regional->province,
                        "district" => $spot->regional->district
                    ]
                ],
                "today_summary" => [
                    "date" => $today->toDateString(),
                    "total_vaccinations" => $todayVaccinations,
                    "my_vaccinations" => $myTodayVaccinations,
                    "remaining_capacity" => $remainingCapacity,
                    "utilization_percentage" => $spot->capacity > 0
                        ? round(($todayVaccinations / $spot->capacity) * 100, 2)
                        : 0
                ],
                "available_vaccines" => $availableVaccines,
                "my_patients_today" => $myPatients
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
