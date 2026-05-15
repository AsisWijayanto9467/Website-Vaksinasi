<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Vaccine;
use Illuminate\Http\Request;

class VaccineController extends Controller
{
    public function showVaccine()
    {
        try {
            $vaccines = Vaccine::all();

            return response()->json([
                "data" => $vaccines
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            $vaccines = Vaccine::all();

            return response()->json([
                "data" => $vaccines
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
                "name" => "required|string|max:255"
            ]);

            $vaccine = Vaccine::create([
                "name" => $request->name
            ]);

            return response()->json([
                "message" => "Vaccine created successfully",
                "data" => $vaccine
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
                "name" => "required|string|max:255"
            ]);

            $vaccine = Vaccine::find($id);

            if (!$vaccine) {
                return response()->json([
                    "message" => "Vaccine not found"
                ], 404);
            }

            $vaccine->update([
                "name" => $request->name
            ]);

            return response()->json([
                "message" => "Vaccine updated successfully",
                "data" => $vaccine
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
            $vaccine = Vaccine::find($id);

            if (!$vaccine) {
                return response()->json([
                    "message" => "Vaccine not found"
                ], 404);
            }

            $vaccine->delete();

            return response()->json([
                "message" => "Vaccine deleted successfully"
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
