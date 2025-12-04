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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Vendeur
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->decimal('discount_price', 10, 2)->nullable();
            $table->string('brand')->nullable();
            $table->json('sizes')->nullable(); // ['S', 'M', 'L', 'XL']
            $table->json('colors')->nullable(); // ['Rouge', 'Bleu', 'Vert']
            $table->json('images'); // URLs des images
            $table->integer('stock')->default(0);
            $table->integer('stock_alert_threshold')->default(5); // Seuil d'alerte stock
            $table->boolean('is_visible')->default(true); // Pour masquer/afficher
            $table->boolean('is_approved')->default(false); // Validation par admin
            $table->timestamps();

            $table->index(['user_id', 'category_id', 'is_visible', 'is_approved']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
