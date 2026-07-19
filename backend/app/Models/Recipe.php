<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'prep_time',
        'calories',
        'carbs',
        'protein',
        'fat',
        'video_url',
        'steps'
    ];

    protected $casts = [
        'steps' => 'array'
    ];

    public function ingredients()
    {
        return $this->hasMany(RecipeIngredient::class);
    }
}
