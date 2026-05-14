<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Regional extends Model
{
    protected $table = "regionals";

    protected $fillable = [
        "province",
        "district"
    ];

    public function users() {
        return $this->hasMany(User::class);
    }

    public function spots() {
        return $this->belongsTo(Spot::class);
    }

    public function societies() {
        return $this->hasMany(Society::class);
    }
}
