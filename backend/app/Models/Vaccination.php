<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vaccination extends Model
{
    protected $table = "vaccinations";

    protected $fillable = [
        "dose",
        "date",
        "society_id",
        "spot_id",
        "vaccine_id",
        "doctor_id",
        "officer_id"
    ];

    public function society() {
        return $this->belongsTo(Society::class);
    }

    public function spot() {
        return $this->belongsTo(Spot::class);
    }

    public function vaccine() {
        return $this->belongsTo(Vaccine::class);
    }

    public function doctor() {
        return $this->belongsTo(Medical::class, "doctor_id");
    }

    public function officer() {
        return $this->belongsTo(Medical::class, "officer_id");
    }
}
