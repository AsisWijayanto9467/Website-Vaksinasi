<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ConsultationController;
use App\Http\Controllers\API\SpotController;
use Illuminate\Support\Facades\Route;


Route::prefix("v1")->group(function() {
    Route::prefix("auth")->group(function() {
        Route::post("/login", [AuthController::class, "login"]);
        Route::post("/logout", [AuthController::class, "logout"])->middleware("auth");
    });

    Route::middleware("auth")->group(function() {
        Route::prefix("consultations")->group(function() {
            Route::post("/", [ConsultationController::class, "createConsultation"]);
            Route::get("/", [ConsultationController::class, "getConsultation"]);
        });

        Route::prefix("spots")->group(function() {
            Route::get("/", [SpotController::class, "getSpots"]);
            Route::get("/{id}", [SpotController::class, "getDetailSpot"]);
        });
    });
});
