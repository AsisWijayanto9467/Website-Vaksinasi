<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpotVaccine extends Model
{
    protected $table = "spot_vaccines";

    protected $fillable = [
        "spot_id",
        "vaccine_id"
    ];

    public function spot() {
        return $this->belongsTo(Spot::class);
    }

    public function vaccine() {
        return $this->belongsTo(Vaccine::class);
    }
}
