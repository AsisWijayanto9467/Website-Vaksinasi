<?php

namespace App\Http\Middleware;

use App\Models\Society;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->input("token");

        if(!$token) {
            return response()->json([
                "message" => "Unauthorized user"
            ], 401);
        }

        $checkToken = Society::where("login_tokens", $token)->first();

        if(!$checkToken) {
            return response()->json([
                "message" => "Unauthorized user"
            ], 401);
        }

        // Optional: Simpan data user yang sedang login ke request
        $request->merge(['auth_society' => $checkToken]);

        return $next($request);
    }
}
