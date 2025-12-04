<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vendeurs = User::where('role', 'vendeur')->where('is_verified', true)->get();
        $categories = Category::whereNotNull('parent_id')->get();

        if ($vendeurs->isEmpty() || $categories->isEmpty()) {
            $this->command->warn('No verified sellers or categories found. Skipping product seeding.');
            return;
        }

        $products = [
            [
                'name' => 'Robe élégante en soie',
                'description' => 'Magnifique robe en soie pour occasions spéciales. Coupe élégante et confortable.',
                'price' => 45000,
                'discount_price' => 38000,
                'brand' => 'Elegance Paris',
                'sizes' => ['S', 'M', 'L', 'XL'],
                'colors' => ['Rouge', 'Noir', 'Bleu'],
                'stock' => 25,
            ],
            [
                'name' => 'Baskets sport Nike',
                'description' => 'Baskets de sport confortables et durables. Parfaites pour la course et le fitness.',
                'price' => 35000,
                'brand' => 'Nike',
                'sizes' => ['38', '39', '40', '41', '42', '43'],
                'colors' => ['Blanc', 'Noir', 'Gris'],
                'stock' => 50,
            ],
            [
                'name' => 'Sac à main cuir véritable',
                'description' => 'Sac à main en cuir véritable, spacieux et élégant.',
                'price' => 55000,
                'discount_price' => 45000,
                'brand' => 'Luxury Bags',
                'colors' => ['Marron', 'Noir', 'Beige'],
                'stock' => 15,
            ],
            [
                'name' => 'Montre connectée SmartWatch',
                'description' => 'Montre connectée avec suivi d\'activité et notifications.',
                'price' => 75000,
                'brand' => 'TechWatch',
                'colors' => ['Noir', 'Argent', 'Or Rose'],
                'stock' => 30,
            ],
            [
                'name' => 'Jean slim homme',
                'description' => 'Jean slim confortable pour homme, coupe moderne.',
                'price' => 28000,
                'brand' => 'Denim Co',
                'sizes' => ['30', '32', '34', '36', '38'],
                'colors' => ['Bleu foncé', 'Noir', 'Bleu clair'],
                'stock' => 40,
            ],
            [
                'name' => 'Sandales cuir femme',
                'description' => 'Sandales élégantes en cuir pour femme.',
                'price' => 22000,
                'brand' => 'Comfort Shoes',
                'sizes' => ['36', '37', '38', '39', '40'],
                'colors' => ['Noir', 'Marron', 'Beige'],
                'stock' => 20,
            ],
            [
                'name' => 'Collier doré',
                'description' => 'Collier élégant plaqué or 18 carats.',
                'price' => 18000,
                'discount_price' => 15000,
                'brand' => 'Gold Jewelry',
                'colors' => ['Or'],
                'stock' => 10,
            ],
            [
                'name' => 'Chemise business homme',
                'description' => 'Chemise professionnelle pour homme, tissu premium.',
                'price' => 25000,
                'brand' => 'Business Wear',
                'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
                'colors' => ['Blanc', 'Bleu ciel', 'Rose'],
                'stock' => 35,
            ],
            [
                'name' => 'Sac à dos étudiant',
                'description' => 'Sac à dos spacieux idéal pour étudiants.',
                'price' => 18000,
                'brand' => 'Student Bags',
                'colors' => ['Noir', 'Gris', 'Bleu'],
                'stock' => 45,
            ],
            [
                'name' => 'T-shirt basique unisexe',
                'description' => 'T-shirt en coton confortable, parfait pour tous les jours.',
                'price' => 8000,
                'brand' => 'Basic Wear',
                'sizes' => ['XS', 'S', 'M', 'L', 'XL'],
                'colors' => ['Blanc', 'Noir', 'Gris', 'Rouge', 'Bleu'],
                'stock' => 100,
            ],
        ];

        foreach ($products as $index => $productData) {
            $vendeur = $vendeurs->random();
            $category = $categories->random();

            // Générer des images fictives
            $imageCount = rand(3, 5);
            $images = [];
            for ($i = 1; $i <= $imageCount; $i++) {
                $images[] = "https://via.placeholder.com/800x800/cccccc/000000?text=Product+" . ($index + 1) . "+-+Image+" . $i;
            }

            Product::create([
                'user_id' => $vendeur->id,
                'category_id' => $category->id,
                'name' => $productData['name'],
                'slug' => \Illuminate\Support\Str::slug($productData['name']) . '-' . uniqid(),
                'description' => $productData['description'],
                'price' => $productData['price'],
                'discount_price' => $productData['discount_price'] ?? null,
                'brand' => $productData['brand'],
                'sizes' => $productData['sizes'] ?? null,
                'colors' => $productData['colors'],
                'images' => $images,
                'stock' => $productData['stock'],
                'stock_alert_threshold' => 5,
                'is_visible' => true,
                'is_approved' => true, // Approuvé par défaut pour les tests
            ]);
        }

        // Créer quelques produits en attente d'approbation
        for ($i = 0; $i < 3; $i++) {
            $vendeur = $vendeurs->random();
            $category = $categories->random();

            Product::create([
                'user_id' => $vendeur->id,
                'category_id' => $category->id,
                'name' => 'Produit en attente ' . ($i + 1),
                'slug' => 'produit-attente-' . uniqid(),
                'description' => 'Ce produit est en attente d\'approbation par l\'administrateur.',
                'price' => rand(10000, 50000),
                'brand' => 'Test Brand',
                'colors' => ['Couleur Test'],
                'images' => ['https://via.placeholder.com/800x800/ff0000/ffffff?text=Pending+' . ($i + 1)],
                'stock' => rand(10, 50),
                'stock_alert_threshold' => 5,
                'is_visible' => true,
                'is_approved' => false, // En attente d'approbation
            ]);
        }

        $this->command->info('Products seeded successfully!');
    }
}
