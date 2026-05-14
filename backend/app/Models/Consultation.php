<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $table = "consultations";

    protected $fillable = [
        "society_id",
        "doctor_id",
        "status",
        "disease_history",
        "current_symptoms",
        "doctor_notes",
        "user_id"
    ];

    public function society() {
        return $this->belongsTo(Society::class);
    }

    public function doctor() {
        return $this->belongsTo(Medical::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
