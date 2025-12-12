<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Liste des commandes de l'utilisateur
     */
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with(['items.product', 'address', 'payment'])
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    /**
     * Afficher les détails d'une commande
     */
    public function show(Request $request, $id)
    {
        $order = $request->user()
            ->orders()
            ->with(['items.product', 'items.seller', 'address', 'payment'])
            ->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Passer une commande
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'address_id' => ['required', 'exists:addresses,id'],
            'payment_method' => ['required', 'in:cash,card,wave,orange_money,free_money'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $cart = $user->cart()->with('items.product')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Votre panier est vide.',
            ], 400);
        }

        // Vérifier que l'adresse appartient à l'utilisateur
        $address = $user->addresses()->findOrFail($request->address_id);

        try {
            DB::beginTransaction();

            // Calculer le total
            $subtotal = $cart->subtotal;
            $shippingCost = 0; // TODO: Calculer selon la zone de livraison
            $total = $subtotal + $shippingCost;

            // Créer la commande
            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $address->id,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            // Créer les articles de la commande
            foreach ($cart->items as $cartItem) {
                // Vérifier le stock
                if ($cartItem->product->stock < $cartItem->quantity) {
                    throw new \Exception("Stock insuffisant pour le produit: {$cartItem->product->name}");
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'seller_id' => $cartItem->product->user_id,
                    'product_name' => $cartItem->product->name,
                    'quantity' => $cartItem->quantity,
                    'size' => $cartItem->size,
                    'color' => $cartItem->color,
                    'price' => $cartItem->price,
                    'subtotal' => $cartItem->subtotal,
                ]);

                // Déduire du stock
                $cartItem->product->decrement('stock', $cartItem->quantity);
            }

            // Créer le paiement
            // Si c'est cash, le paiement reste en 'pending' jusqu'à la livraison
            // Sinon, le paiement est marqué comme 'completed' car payé en ligne
            $paymentStatus = $request->payment_method === 'cash' ? 'pending' : 'completed';
            $paidAt = $request->payment_method === 'cash' ? null : now();

            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_method' => $request->payment_method,
                'amount' => $total,
                'status' => $paymentStatus,
                'paid_at' => $paidAt,
            ]);

            // Vider le panier
            $cart->items()->delete();

            DB::commit();

            // TODO: Envoyer des notifications
            // TODO: Traiter le paiement selon la méthode choisie

            return response()->json([
                'message' => 'Commande créée avec succès.',
                'order' => $order->load(['items', 'payment', 'address']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erreur lors de la création de la commande.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Annuler une commande
     */
    public function cancel(Request $request, $id)
    {
        $order = $request->user()->orders()->findOrFail($id);

        if (!$order->canBeCancelled()) {
            return response()->json([
                'message' => 'Cette commande ne peut plus être annulée.',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'reason' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Remettre les quantités en stock
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            $order->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->reason,
            ]);

            // Si le paiement était complété, marquer comme à rembourser
            if ($order->payment && $order->payment->status === 'completed') {
                $order->payment->update(['status' => 'refunded']);
            }

            DB::commit();

            // TODO: Envoyer des notifications

            return response()->json([
                'message' => 'Commande annulée avec succès.',
                'order' => $order,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erreur lors de l\'annulation de la commande.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
