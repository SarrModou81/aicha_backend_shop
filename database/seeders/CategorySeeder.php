<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Vêtements',
                'slug' => 'vetements',
                'description' => 'Tous les vêtements pour hommes, femmes et enfants',
                'icon' => 'shirt',
                'parent_id' => null,
                'children' => [
                    ['name' => 'Femmes', 'slug' => 'vetements-femmes', 'icon' => 'female'],
                    ['name' => 'Hommes', 'slug' => 'vetements-hommes', 'icon' => 'male'],
                    ['name' => 'Enfants', 'slug' => 'vetements-enfants', 'icon' => 'child'],
                ]
            ],
            [
                'name' => 'Chaussures',
                'slug' => 'chaussures',
                'description' => 'Toutes les chaussures pour tous les styles',
                'icon' => 'shoe',
                'parent_id' => null,
                'children' => [
                    ['name' => 'Baskets', 'slug' => 'baskets', 'icon' => 'sneaker'],
                    ['name' => 'Sandales', 'slug' => 'sandales', 'icon' => 'sandal'],
                    ['name' => 'Talons', 'slug' => 'talons', 'icon' => 'heel'],
                ]
            ],
            [
                'name' => 'Sacs',
                'slug' => 'sacs',
                'description' => 'Sacs à main, sacs à dos et plus',
                'icon' => 'bag',
                'parent_id' => null,
                'children' => [
                    ['name' => 'Sacs à main', 'slug' => 'sacs-a-main', 'icon' => 'handbag'],
                    ['name' => 'Sacs à dos', 'slug' => 'sacs-a-dos', 'icon' => 'backpack'],
                    ['name' => 'Pochettes', 'slug' => 'pochettes', 'icon' => 'clutch'],
                ]
            ],
            [
                'name' => 'Accessoires',
                'slug' => 'accessoires',
                'description' => 'Bijoux, montres, ceintures et plus',
                'icon' => 'accessories',
                'parent_id' => null,
                'children' => [
                    ['name' => 'Bijoux', 'slug' => 'bijoux', 'icon' => 'jewelry'],
                    ['name' => 'Montres', 'slug' => 'montres', 'icon' => 'watch'],
                    ['name' => 'Ceintures', 'slug' => 'ceintures', 'icon' => 'belt'],
                ]
            ],
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $category = Category::create($categoryData);

            foreach ($children as $childData) {
                $childData['parent_id'] = $category->id;
                $childData['description'] = $childData['description'] ?? null;
                $childData['is_active'] = true;
                Category::create($childData);
            }
        }

        $this->command->info('Categories seeded successfully!');
    }
}
