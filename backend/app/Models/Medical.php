<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medical extends Model
{
    protected $table = "medicals";

    protected $fillable = [
        "spot_id",
        "user_id",
        "role",
        "name"
    ];

    public function spot() {
        return $this->belongsTo(Spot::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function consultations() {
        return $this->hasMany(Consultation::class);
    }

    public function Dvaccinations() {
        return $this->hasMany(Vaccination::class, "doctor_id");
    }

    public function Ovaccinations() {
        return $this->hasMany(Vaccination::class, "officer_id");
    }
}
