<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'calories_consumed',
        'carbs_consumed',
        'protein_consumed',
        'fat_consumed'
    ];

    protected $casts = [
        'date' => 'date',
        'calories_consumed' => 'float',
        'carbs_consumed' => 'float',
        'protein_consumed' => 'float',
        'fat_consumed' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
