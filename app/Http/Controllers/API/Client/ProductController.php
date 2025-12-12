<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Liste tous les produits actifs avec filtres
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'seller', 'reviews'])
            ->active() // Visible et approuvé
            ->inStock();

        // Recherche par mot-clé
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        // Filtre par catégorie
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filtre par marque
        if ($request->has('brand')) {
            $query->where('brand', $request->brand);
        }

        // Filtre par prix
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filtre par taille
        if ($request->has('size')) {
            $query->whereJsonContains('sizes', $request->size);
        }

        // Filtre par couleur
        if ($request->has('color')) {
            $query->whereJsonContains('colors', $request->color);
        }

        // Filtre promo/soldes
        if ($request->has('on_sale') && $request->on_sale) {
            $query->whereNotNull('discount_price');
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        switch ($sortBy) {
            case 'price_asc':
                $query->orderByRaw('COALESCE(discount_price, price) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(discount_price, price) DESC');
                break;
            case 'name':
                $query->orderBy('name', $sortOrder);
                break;
            case 'rating':
                $query->withAvg('reviews', 'rating')
                    ->orderBy('reviews_avg_rating', 'desc');
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Afficher un produit spécifique
     */
    public function show($id)
    {
        $product = Product::with([
            'category',
            'seller' => function ($query) {
                $query->select('id', 'name', 'shop_name', 'shop_description');
            },
            'reviews' => function ($query) {
                $query->approved()->with('user:id,name')->latest();
            }
        ])
            ->active()
            ->findOrFail($id);

        return response()->json([
            'product' => $product,
            'average_rating' => $product->average_rating,
            'reviews_count' => $product->reviews_count,
        ]);
    }

    /**
     * Produits similaires
     */
    public function similar($id)
    {
        $product = Product::findOrFail($id);

        $similarProducts = Product::with(['category', 'seller'])
            ->active()
            ->inStock()
            ->where('id', '!=', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('category_id', $product->category_id)
                    ->orWhere('brand', $product->brand);
            })
            ->limit(8)
            ->get();

        return response()->json([
            'products' => $similarProducts,
        ]);
    }

    /**
     * Produits en promotion
     */
    public function onSale(Request $request)
    {
        $products = Product::with(['category', 'seller'])
            ->active()
            ->inStock()
            ->whereNotNull('discount_price')
            ->orderByRaw('((price - discount_price) / price) DESC') // Trier par % de réduction
            ->paginate($request->get('per_page', 15));

        return response()->json($products);
    }

    /**
     * Nouveautés
     */
    public function newArrivals(Request $request)
    {
        $products = Product::with(['category', 'seller'])
            ->active()
            ->inStock()
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json($products);
    }

    /**
     * Produits populaires (les plus vendus)
     */
    public function popular(Request $request)
    {
        $products = Product::with(['category', 'seller'])
            ->active()
            ->inStock()
            ->withCount(['orderItems as total_sold' => function ($query) {
                $query->select(DB::raw('COALESCE(SUM(quantity), 0)'));
            }])
            ->orderBy('total_sold', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($products);
    }
}
