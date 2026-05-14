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

    public function users()
    {
        return $this->hasMany(User::class, 'regional_id');
    }

    public function spots() {
        return $this->hasMany(Spot::class);
    }

    public function societies() {
        return $this->hasMany(Society::class);
    }
}
