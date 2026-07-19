<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'quantity',
        'unit',
        'expiry_date',
        'category'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'quantity' => 'float'
    ];
}
