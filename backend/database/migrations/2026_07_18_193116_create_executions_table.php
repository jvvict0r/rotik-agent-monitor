<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('executions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained();
            $table->enum('status', ['success', 'failed']);
            $table->unsignedInteger('duration_ms')->nullable();
            $table->text('error_message')->nullable();
            $table->timestampTz('executed_at');
            $table->timestampTz('created_at')->nullable();
            $table->index(['agent_id', 'executed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('executions');
    }
};
