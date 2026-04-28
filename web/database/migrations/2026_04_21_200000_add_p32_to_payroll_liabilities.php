<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_liabilities', function (Blueprint $table) {
            $table->string('p32_file_path')->nullable();
            $table->string('p32_filename')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('payroll_liabilities', function (Blueprint $table) {
            $table->dropColumn(['p32_file_path', 'p32_filename']);
        });
    }
};
