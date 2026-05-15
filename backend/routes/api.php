<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ConsultationController;
use App\Http\Controllers\API\DoctorController;
use App\Http\Controllers\API\MedicalController;
use App\Http\Controllers\API\OfficerController;
use App\Http\Controllers\API\RegionalController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\SpotController;
use App\Http\Controllers\API\VaccinationController;
use App\Http\Controllers\API\VaccineController;
use Illuminate\Support\Facades\Route;


Route::prefix("v1")->group(function() {
    Route::prefix("auth")->group(function() {
        Route::post("/login", [AuthController::class, "login"]);
        Route::post("/logout", [AuthController::class, "logout"])->middleware("auth");

        // society role
        Route::post("/register", [AuthController::class, "register"]);
    });

    Route::middleware("auth")->group(function() {
        Route::prefix("spots")->group(function() {
            Route::get("/", [SpotController::class, "getSpots"]);
            Route::get("/{id}", [SpotController::class, "getDetailSpot"]);
        });

        // society role
        Route::prefix("consultations")->group(function() {
            Route::post("/", [ConsultationController::class, "createConsultation"]);
            Route::get("/", [ConsultationController::class, "getConsultation"]);
        });

        Route::prefix("profile")->group(function() {
            Route::get("/", [AuthController::class, "getProfile"]);
            Route::put("/", [AuthController::class, "updateProfile"]);
        });

        Route::prefix("vaccinations")->group(function() {
            Route::post("/", [VaccinationController::class, "registerVaccination"]);
            Route::get("/", [VaccinationController::class, "getVaccinationHistory"]);
        });
    });


    Route::prefix("doctor")->middleware("doctor")->group(function() {
        Route::get("/dashboard", [DoctorController::class, "dashboard"]);

        Route::get("/consultations/pending", [ConsultationController::class, "getPendingConsultations"]);
        Route::put("/consultations/{id}", [ConsultationController::class, "handleConsultation"]);

        Route::post("/vaccinations/record", [VaccinationController::class, "recordVaccination"]);
        Route::get("/vaccinations/today", [VaccinationController::class, "getTodayVaccinations"]);

        Route::get("/patients/{societyId}/history", [DoctorController::class, "getPatientHistory"]);
    });

    Route::prefix("officer")->middleware("officer")->group(function() {
        Route::get("/dashboard", [OfficerController::class, "dashboard"]);
        Route::post("/vaccinations/verify", [OfficerController::class, "verifyVaccination"]);
        Route::get("/spots/{spotId}/capacity", [OfficerController::class, "checkCapacity"]);
        Route::get("/queue/today", [OfficerController::class, "todayQueue"]);
    });

    Route::prefix("admin")->middleware("admin")->group(function() {
        // CRUD Vaccines
        Route::get("/vaccines", [VaccineController::class, "index"]);
        Route::post("/vaccines", [VaccineController::class, "store"]);
        Route::put("/vaccines/{id}", [VaccineController::class, "update"]);
        Route::delete("/vaccines/{id}", [VaccineController::class, "destroy"]);

        // CRUD Regionals
        Route::get("/regionals", [RegionalController::class, "index"]);
        Route::post("/regionals", [RegionalController::class, "store"]);
        Route::put("/regionals/{id}", [RegionalController::class, "update"]);
        Route::delete("/regionals/{id}", [RegionalController::class, "destroy"]);

        // CRUD Spots (Admin)
        Route::get("/spots", [SpotController::class, "index"]);
        Route::post("/spots", [SpotController::class, "createSpot"]);
        Route::put("/spots/{id}", [SpotController::class, "updateSpot"]);
        Route::delete("/spots/{id}", [SpotController::class, "destroy"]);
        Route::post("/spots/manage-vaccines", [SpotController::class, "manageSpotVaccines"]);

        // Manage Medical Staff
        Route::get("/medicals", [MedicalController::class, "index"]);
        Route::post("/medicals", [MedicalController::class, "store"]);
        Route::delete("/medicals/{id}", [MedicalController::class, "destroy"]);
        Route::put("/medicals/{id}", [MedicalController::class, "update"]);

        // Reports & Statistics
        Route::get("/reports/vaccinations", [ReportController::class, "vaccinationReport"]);
        Route::get("/reports/consultations", [ReportController::class, "consultationReport"]);
        Route::get("/reports/capacity", [ReportController::class, "capacityReport"]);
    });
});
