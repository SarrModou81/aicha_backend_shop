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
        $sellerId = $request->user()->id;

        // Récupérer les commandes qui contiennent des articles du vendeur
        $query = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })->with(['user', 'address', 'items' => function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId)->with('product');
        }, 'payment']);

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->latest()->paginate(15);

        // Ajouter le nombre d'items pour chaque commande
        $orders->getCollection()->transform(function ($order) {
            $order->items_count = $order->items->count();
            return $order;
        });

        return response()->json($orders);
    }

    /**
     * Nouvelles commandes
     */
    public function newOrders(Request $request)
    {
        $sellerId = $request->user()->id;

        $orders = Order::where('status', 'pending')
            ->whereHas('items', function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            })
            ->with(['user', 'address', 'items' => function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId)->with('product');
            }, 'payment'])
            ->latest()
            ->paginate(15);

        // Ajouter le nombre d'items pour chaque commande
        $orders->getCollection()->transform(function ($order) {
            $order->items_count = $order->items->count();
            return $order;
        });

        return response()->json($orders);
    }

    /**
     * Afficher les détails d'une commande
     */
    public function show(Request $request, $orderId)
    {
        $sellerId = $request->user()->id;

        $order = Order::with(['items' => function ($query) use ($sellerId) {
            $query->where('seller_id', $sellerId);
        }, 'items.product', 'user', 'address', 'payment'])
            ->findOrFail($orderId);

        // Vérifier que le vendeur a au moins un article dans cette commande
        if ($order->items->isEmpty()) {
            return response()->json([
                'message' => 'Vous n\'avez pas d\'articles dans cette commande.',
            ], 403);
        }

        // Calculer le sous-total du vendeur (uniquement ses articles)
        $sellerSubtotal = $order->items->sum('subtotal');
        $sellerItemsCount = $order->items->count();

        // Déterminer les actions disponibles pour ce vendeur
        $availableActions = $this->getAvailableActions($order);

        return response()->json([
            'order' => $order,
            'seller_summary' => [
                'items_count' => $sellerItemsCount,
                'subtotal' => $sellerSubtotal,
            ],
            'available_actions' => $availableActions,
        ]);
    }

    /**
     * Détermine les actions disponibles selon le statut de la commande
     */
    private function getAvailableActions(Order $order): array
    {
        $actions = [];

        switch ($order->status) {
            case 'pending':
                $actions[] = [
                    'name' => 'confirm',
                    'label' => 'Confirmer la commande',
                    'method' => 'POST',
                    'endpoint' => "/api/v1/seller/orders/{$order->id}/confirm",
                    'color' => 'success',
                ];
                break;

            case 'confirmed':
                $actions[] = [
                    'name' => 'processing',
                    'label' => 'Marquer en préparation',
                    'method' => 'POST',
                    'endpoint' => "/api/v1/seller/orders/{$order->id}/processing",
                    'color' => 'info',
                ];
                break;

            case 'processing':
                $actions[] = [
                    'name' => 'shipped',
                    'label' => 'Marquer comme expédiée',
                    'method' => 'POST',
                    'endpoint' => "/api/v1/seller/orders/{$order->id}/shipped",
                    'color' => 'primary',
                    'requires_tracking' => true,
                ];
                break;
        }

        return $actions;
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
