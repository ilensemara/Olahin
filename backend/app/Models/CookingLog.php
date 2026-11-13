<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CookingLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'recipe_id',
        'recipe_title',
        'waste_prevented_kg',
        'cost_saved_rp',
        'cooked_at'
    ];

    protected $casts = [
        'cooked_at' => 'datetime',
        'waste_prevented_kg' => 'float',
        'cost_saved_rp' => 'integer'
    ];

    public function recipe()
    {
        return $this->belongsTo(Recipe::class, 'recipe_id');
    }
}
