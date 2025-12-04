<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Cart;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Administrateur
        User::create([
            'name' => 'Admin AICHA SHOP',
            'email' => 'admin@aichashop.sn',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '+221771234567',
            'is_active' => true,
            'is_verified' => true,
        ]);

        // Vendeur 1
        $vendeur1 = User::create([
            'name' => 'Fatou Diop',
            'email' => 'fatou@aichashop.sn',
            'password' => Hash::make('password123'),
            'role' => 'vendeur',
            'phone' => '+221771234568',
            'shop_name' => 'Boutique Fatou Mode',
            'shop_description' => 'Vêtements et accessoires pour femmes élégantes',
            'is_active' => true,
            'is_verified' => true,
        ]);

        // Vendeur 2
        $vendeur2 = User::create([
            'name' => 'Mamadou Ndiaye',
            'email' => 'mamadou@aichashop.sn',
            'password' => Hash::make('password123'),
            'role' => 'vendeur',
            'phone' => '+221771234569',
            'shop_name' => 'Ndiaye Style',
            'shop_description' => 'Chaussures et sacs de qualité',
            'is_active' => true,
            'is_verified' => true,
        ]);

        // Vendeur en attente de validation
        $vendeur3 = User::create([
            'name' => 'Aminata Sow',
            'email' => 'aminata@aichashop.sn',
            'password' => Hash::make('password123'),
            'role' => 'vendeur',
            'phone' => '+221771234570',
            'shop_name' => 'Aminata Collection',
            'shop_description' => 'Accessoires tendance',
            'is_active' => true,
            'is_verified' => false, // En attente de validation
        ]);

        // Clients
        for ($i = 1; $i <= 5; $i++) {
            $client = User::create([
                'name' => "Client Test {$i}",
                'email' => "client{$i}@example.com",
                'password' => Hash::make('password123'),
                'role' => 'client',
                'phone' => '+22177123456' . $i,
                'is_active' => true,
                'is_verified' => true,
            ]);

            // Créer un panier pour chaque client
            Cart::create(['user_id' => $client->id]);
        }

        $this->command->info('Users seeded successfully!');
    }
}
