<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Medical;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MedicalController extends Controller
{
    public function index()
    {
        try {
            $medicals = Medical::with(['user.regional', 'spot'])
                              ->get();

            return response()->json([
                "data" => $medicals
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                "name" => "required|string|max:255",
                "id_card_number" => "required|integer|unique:users,id_card_number",
                "password" => "required|string|min:6",
                "gender" => "required|in:male,female",
                "address" => "required|string",
                "born_date" => "required|date",
                "regional_id" => "required|exists:regionals,id",
                "role" => "required|in:doctor,officer",
                "spot_id" => "required|exists:spots,id"
            ]);

            $user = User::create([
                "name" => $request->name,
                "password" => Hash::make($request->password),
                "id_card_number" => $request->id_card_number,
                "regional_id" => $request->regional_id,
                "gender" => $request->gender,
                "address" => $request->address,
                "born_date" => $request->born_date,
                "role" => "medical"
            ]);

            $medical = Medical::create([
                "spot_id" => $request->spot_id,
                "user_id" => $user->id,
                "role" => $request->role,
                "name" => $request->name
            ]);

            return response()->json([
                "message" => "Medical staff created successfully",
                "data" => $medical->load(['user.regional', 'spot'])
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function assignToSpot(Request $request)
    {
        try {
            $request->validate([
                "medical_id" => "required|exists:medicals,id",
                "spot_id" => "required|exists:spots,id"
            ]);

            $medical = Medical::find($request->medical_id);

            if (!$medical) {
                return response()->json([
                    "message" => "Medical staff not found"
                ], 404);
            }

            $medical->update([
                "spot_id" => $request->spot_id
            ]);

            return response()->json([
                "message" => "Medical staff assigned to spot successfully",
                "data" => $medical->load(['user.regional', 'spot'])
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
            $medical = Medical::find($id);

            if (!$medical) {
                return response()->json([
                    "message" => "Medical staff not found"
                ], 404);
            }

            $user = User::find($medical->user_id);
            $medical->delete();
            if ($user) {
                $user->delete();
            }

            return response()->json([
                "message" => "Medical staff deleted successfully"
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
