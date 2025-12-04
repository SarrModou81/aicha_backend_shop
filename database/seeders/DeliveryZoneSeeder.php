<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DeliveryZone;

class DeliveryZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zones = [
            [
                'name' => 'Dakar Centre',
                'description' => 'Livraison rapide dans le centre de Dakar',
                'shipping_cost' => 1500,
                'estimated_days' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Dakar Banlieue',
                'description' => 'Livraison dans la banlieue de Dakar',
                'shipping_cost' => 2000,
                'estimated_days' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Thiès',
                'description' => 'Livraison vers la région de Thiès',
                'shipping_cost' => 3000,
                'estimated_days' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Saint-Louis',
                'description' => 'Livraison vers Saint-Louis',
                'shipping_cost' => 4000,
                'estimated_days' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Kaolack',
                'description' => 'Livraison vers Kaolack',
                'shipping_cost' => 3500,
                'estimated_days' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Autres régions',
                'description' => 'Livraison vers les autres régions du Sénégal',
                'shipping_cost' => 5000,
                'estimated_days' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($zones as $zone) {
            DeliveryZone::create($zone);
        }

        $this->command->info('Delivery zones seeded successfully!');
    }
}
