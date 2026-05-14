<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Spot extends Model
{
    protected $table = "spots";

    protected $fillable = [
        "regional_id",
        "name",
        "address",
        "serve",
        "capacity"
    ];

    public function regional() {
        return $this->belongsTo(Regional::class);
    }

    public function spotVaccines() {
        return $this->hasMany(SpotVaccine::class);
    }

    public function medicals() {
        return $this->hasMany(Medical::class);
    }

    public function vaccinations() {
        return $this->hasMany(Vaccination::class);
    }
}
