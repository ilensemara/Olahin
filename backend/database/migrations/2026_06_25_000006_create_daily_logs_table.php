<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('daily_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->float('calories_consumed')->default(0);
            $table->float('carbs_consumed')->default(0);
            $table->float('protein_consumed')->default(0);
            $table->float('fat_consumed')->default(0);
            $table->timestamps();
            
            // Ensure unique log per user per day
            $table->unique(['user_id', 'date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('daily_logs');
    }
};
