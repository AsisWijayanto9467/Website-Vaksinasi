<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Society extends Model
{
    use HasApiTokens;

    protected $table = "societies";

    protected $fillable = [
        "id_card_number",
        "password",
        "name",
        "born_date",
        "gender",
        "address",
        "regional_id",
        "login_tokens"
    ];

    public function regional() {
        return $this->belongsTo(Regional::class);
    }

    public function consultations() {
        return $this->hasMany(Consultation::class);
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
