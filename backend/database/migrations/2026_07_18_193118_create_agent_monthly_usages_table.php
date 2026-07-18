<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_monthly_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained();
            $table->string('period', 7);
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->timestamps();
            $table->unique(['agent_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_monthly_usages');
    }
};
