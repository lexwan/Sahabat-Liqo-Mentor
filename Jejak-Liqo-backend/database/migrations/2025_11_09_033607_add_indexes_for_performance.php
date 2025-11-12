<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mentees', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
            $table->index(['gender', 'status']);
            $table->index(['group_id', 'status']);
            $table->index('full_name');
            $table->index('phone_number');
        });

        Schema::table('groups', function (Blueprint $table) {
            $table->index('group_name');
            $table->index(['mentor_id', 'created_at']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->index(['mentee_id', 'status']);
            $table->index(['meeting_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('mentees', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['gender', 'status']);
            $table->dropIndex(['group_id', 'status']);
            $table->dropIndex(['full_name']);
            $table->dropIndex(['phone_number']);
        });

        Schema::table('groups', function (Blueprint $table) {
            $table->dropIndex(['group_name']);
            $table->dropIndex(['mentor_id', 'created_at']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['mentee_id', 'status']);
            $table->dropIndex(['meeting_id', 'status']);
        });
    }
};