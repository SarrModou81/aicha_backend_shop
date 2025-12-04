<?php

namespace App\Http\Controllers\API\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Liste des commandes du vendeur
     */
    public function index(Request $request)
    {
        $status = $request->get('status');

        $query = OrderItem::where('seller_id', $request->user()->id)
            ->with(['order.user', 'order.address', 'product']);

        if ($status) {
            $query->whereHas('order', function ($q) use ($status) {
                $q->where('status', $status);
            });
        }

        $orderItems = $query->latest()->paginate(15);

        return response()->json($orderItems);
    }

    /**
     * Nouvelles commandes
     */
    public function newOrders(Request $request)
    {
        $orderItems = OrderItem::where('seller_id', $request->user()->id)
            ->whereHas('order', function ($query) {
                $query->where('status', 'pending');
            })
            ->with(['order.user', 'order.address', 'product'])
            ->latest()
            ->paginate(15);

        return response()->json($orderItems);
    }

    /**
     * Afficher les détails d'une commande
     */
    public function show(Request $request, $orderId)
    {
        $order = Order::with(['items' => function ($query) use ($request) {
            $query->where('seller_id', $request->user()->id);
        }, 'items.product', 'user', 'address', 'payment'])
            ->findOrFail($orderId);

        // Vérifier que le vendeur a au moins un article dans cette commande
        if ($order->items->isEmpty()) {
            return response()->json([
                'message' => 'Vous n\'avez pas d\'articles dans cette commande.',
            ], 403);
        }

        return response()->json([
            'order' => $order,
        ]);
    }

    /**
     * Confirmer une commande (vendeur accepte la commande)
     */
    public function confirm(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        // Vérifier que le vendeur a des articles dans cette commande
        $hasItems = $order->items()->where('seller_id', $request->user()->id)->exists();

        if (!$hasItems) {
            return response()->json([
                'message' => 'Vous n\'avez pas d\'articles dans cette commande.',
            ], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Cette commande ne peut pas être confirmée.',
            ], 400);
        }

        $order->update(['status' => 'confirmed']);

        // TODO: Envoyer une notification au client

        return response()->json([
            'message' => 'Commande confirmée avec succès.',
            'order' => $order,
        ]);
    }

    /**
     * Marquer une commande comme en préparation
     */
    public function markAsProcessing(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        $hasItems = $order->items()->where('seller_id', $request->user()->id)->exists();

        if (!$hasItems) {
            return response()->json([
                'message' => 'Vous n\'avez pas d\'articles dans cette commande.',
            ], 403);
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'message' => 'Cette commande ne peut pas être mise en préparation.',
            ], 400);
        }

        $order->update(['status' => 'processing']);

        // TODO: Envoyer une notification au client

        return response()->json([
            'message' => 'Commande marquée comme en préparation.',
            'order' => $order,
        ]);
    }

    /**
     * Marquer une commande comme expédiée
     */
    public function markAsShipped(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'tracking_number' => ['nullable', 'string', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $order = Order::findOrFail($orderId);

        $hasItems = $order->items()->where('seller_id', $request->user()->id)->exists();

        if (!$hasItems) {
            return response()->json([
                'message' => 'Vous n\'avez pas d\'articles dans cette commande.',
            ], 403);
        }

        if ($order->status !== 'processing') {
            return response()->json([
                'message' => 'Cette commande doit d\'abord être en préparation.',
            ], 400);
        }

        $order->update([
            'status' => 'shipped',
            'tracking_number' => $request->tracking_number,
        ]);

        // TODO: Envoyer une notification au client

        return response()->json([
            'message' => 'Commande marquée comme expédiée.',
            'order' => $order,
        ]);
    }
}
