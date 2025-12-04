<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Afficher le panier de l'utilisateur
     */
    public function index(Request $request)
    {
        $cart = $request->user()->cart()->with(['items.product'])->first();

        if (!$cart) {
            $cart = Cart::create(['user_id' => $request->user()->id]);
        }

        return response()->json([
            'cart' => $cart,
            'total_items' => $cart->total_items,
            'subtotal' => $cart->subtotal,
        ]);
    }

    /**
     * Ajouter un produit au panier
     */
    public function add(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'size' => ['nullable', 'string'],
            'color' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $product = Product::active()->findOrFail($request->product_id);

        // Vérifier le stock disponible
        if ($product->stock < $request->quantity) {
            return response()->json([
                'message' => 'Stock insuffisant pour ce produit.',
            ], 400);
        }

        $cart = $request->user()->cart;

        if (!$cart) {
            $cart = Cart::create(['user_id' => $request->user()->id]);
        }

        // Vérifier si le produit avec les mêmes attributs existe déjà
        $existingItem = $cart->items()
            ->where('product_id', $request->product_id)
            ->where('size', $request->size)
            ->where('color', $request->color)
            ->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $request->quantity;

            if ($product->stock < $newQuantity) {
                return response()->json([
                    'message' => 'Stock insuffisant pour cette quantité.',
                ], 400);
            }

            $existingItem->update(['quantity' => $newQuantity]);
            $item = $existingItem;
        } else {
            $item = $cart->items()->create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'size' => $request->size,
                'color' => $request->color,
                'price' => $product->final_price,
            ]);
        }

        return response()->json([
            'message' => 'Produit ajouté au panier.',
            'cart_item' => $item->load('product'),
        ], 201);
    }

    /**
     * Mettre à jour la quantité d'un article du panier
     */
    public function update(Request $request, $itemId)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $cart = $request->user()->cart;
        $item = $cart->items()->findOrFail($itemId);

        // Vérifier le stock disponible
        if ($item->product->stock < $request->quantity) {
            return response()->json([
                'message' => 'Stock insuffisant pour cette quantité.',
            ], 400);
        }

        $item->update(['quantity' => $request->quantity]);

        return response()->json([
            'message' => 'Quantité mise à jour.',
            'cart_item' => $item->load('product'),
        ]);
    }

    /**
     * Retirer un article du panier
     */
    public function remove(Request $request, $itemId)
    {
        $cart = $request->user()->cart;
        $item = $cart->items()->findOrFail($itemId);
        $item->delete();

        return response()->json([
            'message' => 'Article retiré du panier.',
        ]);
    }

    /**
     * Vider le panier
     */
    public function clear(Request $request)
    {
        $cart = $request->user()->cart;
        $cart->items()->delete();

        return response()->json([
            'message' => 'Panier vidé.',
        ]);
    }
}
