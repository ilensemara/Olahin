<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cooking_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->nullable()->constrained()->onDelete('set null');
            $table->string('recipe_title');
            $table->float('waste_prevented_kg'); // prevented food waste in kilograms
            $table->integer('cost_saved_rp'); // cost saved in Rupiah
            $table->timestamp('cooked_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cooking_logs');
    }
};
