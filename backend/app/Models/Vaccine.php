<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vaccine extends Model
{
    protected $table = "vaccines";

    protected $fillable = [
        "name"
    ];

    public function spotVaccines() {
        return $this->hasMany(SpotVaccine::class);
    }

    public function vaccinations() {
        return $this->hasMany(Vaccination::class);
    }
}
