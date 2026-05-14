<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
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
            ->where("role", "admin")
            ->first();

        if (!$user) {
            return response()->json([
                "message" => "Unauthorized user"
            ], 401);
        }

        $request->merge(['auth_admin' => $user]);

        return $next($request);
    }
}
