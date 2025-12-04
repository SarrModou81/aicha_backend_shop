<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Liste tous les produits
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'seller']);

        if ($request->has('approved')) {
            $query->where('is_approved', $request->approved);
        }

        if ($request->has('visible')) {
            $query->where('is_visible', $request->visible);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $query->latest()->paginate(20);

        return response()->json($products);
    }

    /**
     * Produits en attente d'approbation
     */
    public function pending()
    {
        $products = Product::with(['category', 'seller'])
            ->where('is_approved', false)
            ->latest()
            ->paginate(15);

        return response()->json($products);
    }

    /**
     * Approuver un produit
     */
    public function approve($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_approved' => true]);

        // TODO: Notifier le vendeur

        return response()->json([
            'message' => 'Produit approuvé avec succès.',
            'product' => $product,
        ]);
    }

    /**
     * Rejeter un produit
     */
    public function reject(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_approved' => false]);

        // TODO: Notifier le vendeur avec la raison du rejet

        return response()->json([
            'message' => 'Produit rejeté.',
            'product' => $product,
        ]);
    }

    /**
     * Supprimer un produit inapproprié
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        // TODO: Notifier le vendeur

        return response()->json([
            'message' => 'Produit supprimé avec succès.',
        ]);
    }

    /**
     * Afficher un produit
     */
    public function show($id)
    {
        $product = Product::with(['category', 'seller', 'reviews'])->findOrFail($id);

        return response()->json([
            'product' => $product,
        ]);
    }
}
