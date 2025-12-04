<?php

namespace App\Http\Controllers\API\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Liste des produits du vendeur
     */
    public function index(Request $request)
    {
        $products = $request->user()
            ->products()
            ->with(['category'])
            ->latest()
            ->paginate(15);

        return response()->json($products);
    }

    /**
     * Créer un nouveau produit
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'brand' => ['nullable', 'string', 'max:100'],
            'sizes' => ['nullable', 'array'],
            'colors' => ['nullable', 'array'],
            'images' => ['required', 'array', 'min:1'],
            'stock' => ['required', 'integer', 'min:0'],
            'stock_alert_threshold' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $product = $request->user()->products()->create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(6),
            'description' => $request->description,
            'price' => $request->price,
            'discount_price' => $request->discount_price,
            'brand' => $request->brand,
            'sizes' => $request->sizes,
            'colors' => $request->colors,
            'images' => $request->images,
            'stock' => $request->stock,
            'stock_alert_threshold' => $request->stock_alert_threshold ?? 5,
            'is_visible' => true,
            'is_approved' => false, // Doit être approuvé par l'admin
        ]);

        // Créer une alerte si le stock est déjà bas
        if ($product->stock <= $product->stock_alert_threshold) {
            StockAlert::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'current_stock' => $product->stock,
                'threshold' => $product->stock_alert_threshold,
            ]);
        }

        return response()->json([
            'message' => 'Produit créé avec succès. En attente d\'approbation.',
            'product' => $product,
        ], 201);
    }

    /**
     * Afficher un produit
     */
    public function show(Request $request, $id)
    {
        $product = $request->user()
            ->products()
            ->with(['category', 'reviews', 'stockAlerts'])
            ->findOrFail($id);

        return response()->json([
            'product' => $product,
        ]);
    }

    /**
     * Mettre à jour un produit
     */
    public function update(Request $request, $id)
    {
        $product = $request->user()->products()->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'brand' => ['nullable', 'string', 'max:100'],
            'sizes' => ['nullable', 'array'],
            'colors' => ['nullable', 'array'],
            'images' => ['sometimes', 'array', 'min:1'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'stock_alert_threshold' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->except(['user_id', 'slug', 'is_approved']);

        // Regénérer le slug si le nom change
        if ($request->has('name') && $request->name !== $product->name) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(6);
        }

        $product->update($data);

        // Vérifier si une alerte de stock doit être créée
        if ($request->has('stock') && $product->stock <= $product->stock_alert_threshold) {
            $existingAlert = StockAlert::where('product_id', $product->id)
                ->where('is_resolved', false)
                ->first();

            if (!$existingAlert) {
                StockAlert::create([
                    'product_id' => $product->id,
                    'user_id' => $request->user()->id,
                    'current_stock' => $product->stock,
                    'threshold' => $product->stock_alert_threshold,
                ]);
            }
        }

        return response()->json([
            'message' => 'Produit mis à jour avec succès.',
            'product' => $product,
        ]);
    }

    /**
     * Supprimer un produit
     */
    public function destroy(Request $request, $id)
    {
        $product = $request->user()->products()->findOrFail($id);

        // Vérifier qu'il n'y a pas de commandes en cours
        if ($product->orderItems()->whereHas('order', function ($query) {
            $query->whereIn('status', ['pending', 'confirmed', 'processing', 'shipped']);
        })->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce produit car il a des commandes en cours.',
            ], 400);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produit supprimé avec succès.',
        ]);
    }

    /**
     * Masquer/Afficher un produit
     */
    public function toggleVisibility(Request $request, $id)
    {
        $product = $request->user()->products()->findOrFail($id);
        $product->update(['is_visible' => !$product->is_visible]);

        return response()->json([
            'message' => $product->is_visible ? 'Produit affiché.' : 'Produit masqué.',
            'product' => $product,
        ]);
    }
}
