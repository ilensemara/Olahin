<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->integer('prep_time'); // in minutes
            $table->float('calories');
            $table->float('carbs');
            $table->float('protein');
            $table->float('fat');
            $table->string('youtube_video_url')->nullable();
            $table->string('youtube_id')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('recipes');
    }
};
