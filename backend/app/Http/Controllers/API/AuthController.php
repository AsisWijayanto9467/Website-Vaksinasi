<?php
/** @disregard P1005 */

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Society;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request) {
        try {
            $request->validate([
                "id_card_number" => "required|string|min:6",
                "password" => "required"
            ]);

            $user = Society::with("regional")->where("id_card_number", $request->id_card_number)->first();

            if(!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    "message" => "ID Card Number or password incorrect"
                ], 403);
            }

            $loginToken = md5($request->id_card_number . "_token_" . time());

            $user->update([
                "login_tokens" => $loginToken
            ]);

            return response()->json([
                "name" => $user->name,
                "born_date" => $user->born_date,
                "gender" => $user->gender,
                "address" => $user->address,
                "token" => $loginToken,
                "regional" => [
                    "id" => $user->regional?->id,
                    "province" => $user->regional?->province,
                    "district" => $user->regional?->district
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request) {
        try {
            $token = $request->input("token");

            $user = Society::where("login_tokens", $token)->first();

            if (!$user) {
                return response()->json([
                    "message" => "Invalid token"
                ], 401);
            }

            $user->update([
                "login_tokens" => null
            ]);

            return response()->json([
                "message" => "Logout success"
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
