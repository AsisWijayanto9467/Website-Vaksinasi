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
        Route::post("/consultations", [ConsultationController::class, "createConsultation"]);
        Route::get("/consultations", [ConsultationController::class, "getConsultation"]);

        Route::get("/spots", [SpotController::class, "getSpots"]);
        Route::get("/spots/{id}", [SpotController::class, "getDetailSpot"]);
    });
});
