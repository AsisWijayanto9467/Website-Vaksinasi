<?php
/** @disregard P1005 */

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Medical;
use App\Models\Society;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                "id_card_number" => "required|string|min:6",
                "password" => "required"
            ]);

            $idCardNumber = $request->id_card_number;
            $password = $request->password;
            $loginToken = md5($idCardNumber . "_token_" . time());

            $society = Society::with("regional")
                ->where("id_card_number", $idCardNumber)
                ->first();

            if ($society && Hash::check($password, $society->password)) {
                $society->update(["login_tokens" => $loginToken]);

                return response()->json([
                    "role" => "society",
                    "name" => $society->name,
                    "born_date" => $society->born_date,
                    "gender" => $society->gender,
                    "address" => $society->address,
                    "token" => $loginToken,
                    "regional" => [
                        "id" => $society->regional->id ?? null,
                        "province" => $society->regional->province ?? null,
                        "district" => $society->regional->district ?? null,
                    ]
                ], 200);
            }

            $user = User::with("regional")
                ->where("id_card_number", $idCardNumber)
                ->first();

            if ($user && Hash::check($password, $user->password)) {
                $user->update(["login_tokens" => $loginToken]);

                // 2A. ROLE ADMIN
                if ($user->role === "admin") {
                    return response()->json([
                        "role" => "admin",
                        "user_id" => $user->id,
                        "name" => $user->name,
                        "born_date" => $user->born_date,
                        "gender" => $user->gender,
                        "address" => $user->address,
                        "token" => $loginToken,
                        "regional" => [
                            "id" => $user->regional->id ?? null,
                            "province" => $user->regional->province ?? null,
                            "district" => $user->regional->district ?? null,
                        ]
                    ], 200);
                }

                if ($user->role === "medical") {
                    $medical = Medical::with("spot")
                        ->where("user_id", $user->id)
                        ->first();

                    if (!$medical) {
                        return response()->json([
                            "message" => "Medical data not found"
                        ], 404);
                    }

                    return response()->json([
                        "role" => $medical->role,
                        "medical_id" => $medical->id,
                        "user_id" => $user->id,
                        "name" => $medical->name,
                        "born_date" => $user->born_date,
                        "gender" => $user->gender,
                        "address" => $user->address,
                        "token" => $loginToken,
                        "regional" => [
                            "id" => $user->regional->id ?? null,
                            "province" => $user->regional->province ?? null,
                            "district" => $user->regional->district ?? null,
                        ],
                        "spot" => [
                            "id" => $medical->spot->id ?? null,
                            "name" => $medical->spot->name ?? null,
                            "address" => $medical->spot->address ?? null,
                            "serve" => $medical->spot->serve ?? null,
                            "capacity" => $medical->spot->capacity ?? null,
                        ]
                    ], 200);
                }
            }

            return response()->json([
                "message" => "ID Card Number or password incorrect"
            ], 403);

        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $token = $request->input("token");

            if (!$token) {
                return response()->json([
                    "message" => "Token is required"
                ], 400);
            }

            // 1. Logout Society
            $society = Society::where("login_tokens", $token)->first();
            if ($society) {
                $society->update(["login_tokens" => null]);
                return response()->json([
                    "message" => "Logout success",
                    "role" => "society"
                ], 200);
            }

            // 2. Logout User (Admin / Medical)
            $user = User::where("login_tokens", $token)->first();
            if ($user) {
                $user->update(["login_tokens" => null]);

                $role = $user->role;
                if ($role === "medical") {
                    $medical = Medical::where("user_id", $user->id)->first();
                    $role = $medical ? $medical->role : "medical";
                }

                return response()->json([
                    "message" => "Logout success",
                    "role" => $role
                ], 200);
            }

            // 3. Token tidak valid
            return response()->json([
                "message" => "Invalid token"
            ], 401);

        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }


    // Bagian User / Masyarakat
    public function register(Request $request) {
        try {
            $request->validate([
                "id_card_number" => "required|string|min:6|unique:societies,id_card_number",
                "password" => "required|string|min:6",
                "name" => "required|string|max:255",
                "born_date" => "required|date",
                "gender" => "required|in:male,female",
                "address" => "required|string",
                "regional_id" => "required|exists:regionals,id"
            ]);

            $society = Society::create([
                "id_card_number" => $request->id_card_number,
                "password" => Hash::make($request->password),
                "name" => $request->name,
                "born_date" => $request->born_date,
                "gender" => $request->gender,
                "address" => $request->address,
                "regional_id" => $request->regional_id
            ]);

            // Generate token untuk langsung login setelah register
            $loginToken = md5($request->id_card_number . "_token_" . time());
            $society->update(["login_tokens" => $loginToken]);

            return response()->json([
                "message" => "Registration successful",
                "data" => [
                    "role" => "society",
                    "name" => $society->name,
                    "born_date" => $society->born_date,
                    "gender" => $society->gender,
                    "address" => $society->address,
                    "token" => $loginToken,
                    "regional" => [
                        "id" => $society->regional->id ?? null,
                        "province" => $society->regional->province ?? null,
                        "district" => $society->regional->district ?? null,
                    ]
                ]
            ], 201);

        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function getProfile(Request $request)
    {
        try {
            $token = $request->query("token");

            $society = Society::with("regional")
                ->where("login_tokens", $token)
                ->first();

            if (!$society) {
                return response()->json([
                    "message" => "Unauthorized user"
                ], 401);
            }

            return response()->json([
                "data" => [
                    "id" => $society->id,
                    "id_card_number" => $society->id_card_number,
                    "name" => $society->name,
                    "born_date" => $society->born_date,
                    "gender" => $society->gender,
                    "address" => $society->address,
                    "regional" => [
                        "id" => $society->regional->id ?? null,
                        "province" => $society->regional->province ?? null,
                        "district" => $society->regional->district ?? null,
                    ],
                    "created_at" => $society->created_at,
                    "updated_at" => $society->updated_at
                ]
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $token = $request->query("token");

            $society = Society::where("login_tokens", $token)->first();

            if (!$society) {
                return response()->json([
                    "message" => "Unauthorized user"
                ], 401);
            }

            $request->validate([
                "name" => "sometimes|string|max:255",
                "born_date" => "sometimes|date",
                "gender" => "sometimes|in:male,female",
                "address" => "sometimes|string",
                "regional_id" => "sometimes|exists:regionals,id",
                "password" => "sometimes|string|min:6"
            ]);

            $updateData = [];

            if ($request->has("name")) {
                $updateData["name"] = $request->name;
            }
            if ($request->has("born_date")) {
                $updateData["born_date"] = $request->born_date;
            }
            if ($request->has("gender")) {
                $updateData["gender"] = $request->gender;
            }
            if ($request->has("address")) {
                $updateData["address"] = $request->address;
            }
            if ($request->has("regional_id")) {
                $updateData["regional_id"] = $request->regional_id;
            }
            if ($request->has("password")) {
                $updateData["password"] = Hash::make($request->password);
            }

            $society->update($updateData);

            return response()->json([
                "message" => "Profile updated successfully",
                "data" => $society->fresh()->load("regional")
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
