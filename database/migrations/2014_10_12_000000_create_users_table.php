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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['client', 'vendeur', 'admin'])->default('client');
            $table->string('phone')->nullable();
            $table->string('shop_name')->nullable(); // Pour les vendeurs
            $table->text('shop_description')->nullable(); // Pour les vendeurs
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false); // Pour validation des vendeurs par admin
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
