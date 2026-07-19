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
        'youtube_video_url',
        'youtube_id'
    ];

    public function ingredients()
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    public function steps()
    {
        return $this->hasMany(RecipeStep::class)->orderBy('step_number', 'asc');
    }
}
