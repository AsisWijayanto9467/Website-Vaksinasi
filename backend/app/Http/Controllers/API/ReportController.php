<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Spot;
use App\Models\Vaccination;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function vaccinationReport(Request $request)
    {
        try {
            $query = Vaccination::with(['spot.regional', 'vaccine', 'doctor', 'officer', 'society']);

            if ($request->start_date && $request->end_date) {
                $query->whereBetween('date', [
                    Carbon::parse($request->start_date)->startOfDay(),
                    Carbon::parse($request->end_date)->endOfDay()
                ]);
            }

            if ($request->regional_id) {
                $query->whereHas('spot', function($q) use ($request) {
                    $q->where('regional_id', $request->regional_id);
                });
            }

            if ($request->spot_id) {
                $query->where('spot_id', $request->spot_id);
            }

            if ($request->vaccine_id) {
                $query->where('vaccine_id', $request->vaccine_id);
            }

            $vaccinations = $query->get();

            $totalBySpot = $vaccinations->groupBy('spot_id')->map(function($group) {
                return [
                    'spot_name' => $group->first()->spot->name,
                    'total' => $group->count(),
                    'dose_1' => $group->where('dose', 1)->count(),
                    'dose_2' => $group->where('dose', 2)->count(),
                ];
            })->values();

            $totalByVaccine = $vaccinations->groupBy('vaccine_id')->map(function($group) {
                return [
                    'vaccine_name' => $group->first()->vaccine->name,
                    'total' => $group->count(),
                ];
            })->values();

            $totalByDate = $vaccinations->groupBy('date')->map(function($group) {
                return [
                    'date' => $group->first()->date,
                    'total' => $group->count(),
                ];
            })->values();

            return response()->json([
                "data" => [
                    "total_vaccinations" => $vaccinations->count(),
                    "by_spot" => $totalBySpot,
                    "by_vaccine" => $totalByVaccine,
                    "by_date" => $totalByDate,
                    "detailed_data" => $vaccinations
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function consultationReport(Request $request)
    {
        try {
            $query = Consultation::with(['society', 'doctor.user']);

            if ($request->start_date && $request->end_date) {
                $query->whereBetween('created_at', [
                    Carbon::parse($request->start_date)->startOfDay(),
                    Carbon::parse($request->end_date)->endOfDay()
                ]);
            }

            if ($request->doctor_id) {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            $consultations = $query->get();

            $totalConsultations = $consultations->count();
            $acceptedCount = $consultations->where('status', 'accepted')->count();
            $declinedCount = $consultations->where('status', 'declined')->count();
            $pendingCount = $consultations->where('status', 'pending')->count();

            $byDoctor = $consultations->groupBy('doctor_id')->map(function($group) {
                $doctor = $group->first()->doctor;
                return [
                    'doctor_name' => $doctor ? $doctor->name : 'Unassigned',
                    'total' => $group->count(),
                    'accepted' => $group->where('status', 'accepted')->count(),
                    'declined' => $group->where('status', 'declined')->count(),
                    'pending' => $group->where('status', 'pending')->count(),
                ];
            })->values();

            return response()->json([
                "data" => [
                    "total_consultations" => $totalConsultations,
                    "accepted_count" => $acceptedCount,
                    "declined_count" => $declinedCount,
                    "pending_count" => $pendingCount,
                    "acceptance_rate" => $totalConsultations > 0 ?
                        round(($acceptedCount / $totalConsultations) * 100, 2) : 0,
                    "by_doctor" => $byDoctor,
                    "detailed_data" => $consultations
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function capacityReport(Request $request)
    {
        try {
            $query = Spot::with(['regional', 'vaccinations']);

            if ($request->regional_id) {
                $query->where('regional_id', $request->regional_id);
            }

            if ($request->spot_id) {
                $query->where('id', $request->spot_id);
            }

            $spots = $query->get()->map(function($spot) {
                $recentVaccinations = $spot->vaccinations()
                    ->where('date', '>=', Carbon::now()->subDays(30))
                    ->count();

                $utilizationRate = $spot->capacity > 0 ?
                    round(($recentVaccinations / $spot->capacity) * 100, 2) : 0;

                // Get pending consultations queue
                $queueCount = Consultation::whereHas('doctor', function($q) use ($spot) {
                    $q->where('spot_id', $spot->id);
                })->where('status', 'pending')->count();

                return [
                    'spot_id' => $spot->id,
                    'spot_name' => $spot->name,
                    'regional' => $spot->regional->province . ', ' . $spot->regional->district,
                    'capacity' => $spot->capacity,
                    'serve' => $spot->serve,
                    'recent_vaccinations_30days' => $recentVaccinations,
                    'utilization_rate' => $utilizationRate,
                    'pending_queue' => $queueCount,
                ];
            });

            $sortedSpots = $spots->sortByDesc('pending_queue')->values();

            return response()->json([
                "data" => [
                    "spots" => $sortedSpots,
                    "summary" => [
                        "total_spots" => $spots->count(),
                        "total_capacity" => $spots->sum('capacity'),
                        "average_utilization" => $spots->avg('utilization_rate'),
                        "total_pending_queue" => $spots->sum('pending_queue')
                    ]
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
