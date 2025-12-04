<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Liste toutes les catégories actives
     */
    public function index()
    {
        $categories = Category::active()
            ->with(['children' => function ($query) {
                $query->active();
            }])
            ->parents() // Seulement les catégories parentes
            ->orderBy('name')
            ->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Afficher une catégorie spécifique avec ses produits
     */
    public function show($id)
    {
        $category = Category::with(['children' => function ($query) {
            $query->active();
        }])->findOrFail($id);

        return response()->json([
            'category' => $category,
        ]);
    }

    /**
     * Produits d'une catégorie
     */
    public function products(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $query = $category->products()
            ->with(['seller', 'reviews'])
            ->active()
            ->inStock();

        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }
}
