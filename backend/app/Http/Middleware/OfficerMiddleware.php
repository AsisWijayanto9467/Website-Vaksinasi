<?php

namespace App\Http\Middleware;

use App\Models\Medical;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OfficerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->input("token");

        if (!$token) {
            return response()->json([
                "message" => "Unauthorized user"
            ], 401);
        }

        $user = User::where("login_tokens", $token)
            ->where("role", "medical")
            ->first();

        if (!$user) {
            return response()->json([
                "message" => "Unauthorized user"
            ], 401);
        }

        $medical = Medical::where("user_id", $user->id)
            ->where("role", "officer")
            ->first();

        if (!$medical) {
            return response()->json([
                "message" => "Unauthorized user"
            ], 401);
        }

        $request->merge([
            'auth_user' => $user,
            'auth_medical' => $medical
        ]);

        return $next($request);
    }
}
