<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Regional;
use Illuminate\Http\Request;

class RegionalController extends Controller
{
    public function index()
    {
        try {
            $regionals = Regional::withCount('spots')->get();

            return response()->json([
                "data" => $regionals
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
                "province" => "required|string|max:255",
                "district" => "required|string|max:255"
            ]);

            $regional = Regional::create([
                "province" => $request->province,
                "district" => $request->district
            ]);

            return response()->json([
                "message" => "Regional created successfully",
                "data" => $regional
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                "province" => "required|string|max:255",
                "district" => "required|string|max:255"
            ]);

            $regional = Regional::find($id);

            if (!$regional) {
                return response()->json([
                    "message" => "Regional not found"
                ], 404);
            }

            $regional->update([
                "province" => $request->province,
                "district" => $request->district
            ]);

            return response()->json([
                "message" => "Regional updated successfully",
                "data" => $regional
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
            $regional = Regional::find($id);

            if (!$regional) {
                return response()->json([
                    "message" => "Regional not found"
                ], 404);
            }

            $regional->delete();

            return response()->json([
                "message" => "Regional deleted successfully"
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
