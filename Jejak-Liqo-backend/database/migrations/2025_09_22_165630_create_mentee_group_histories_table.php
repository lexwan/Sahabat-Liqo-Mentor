<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mentee_group_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentee_id')->constrained()->onDelete('cascade');
            $table->foreignId('from_group_id')->nullable()->constrained('groups')->onDelete('set null');
            $table->foreignId('to_group_id')->constrained('groups')->onDelete('cascade');
            $table->timestamp('moved_at')->useCurrent();
            $table->foreignId('moved_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mentee_group_histories');
    }
};