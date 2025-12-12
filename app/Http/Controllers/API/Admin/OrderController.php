<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Liste toutes les commandes
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.product', 'payment']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $orders = $query->latest()->paginate(20);

        return response()->json($orders);
    }

    /**
     * Afficher une commande
     */
    public function show($id)
    {
        $order = Order::with(['user', 'items.product', 'items.seller', 'address', 'payment'])
            ->findOrFail($id);

        return response()->json([
            'order' => $order,
        ]);
    }

    /**
     * Statistiques des commandes
     */
    public function stats()
    {
        $total = Order::count();
        $pending = Order::pending()->count();
        $confirmed = Order::confirmed()->count();
        $processing = Order::processing()->count();
        $shipped = Order::shipped()->count();
        $delivered = Order::delivered()->count();
        $cancelled = Order::cancelled()->count();

        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'confirmed' => $confirmed,
            'processing' => $processing,
            'shipped' => $shipped,
            'delivered' => $delivered,
            'cancelled' => $cancelled,
        ]);
    }

    /**
     * Marquer une commande comme livrée
     */
    public function markAsDelivered($id)
    {
        $order = Order::with('payment')->findOrFail($id);

        if ($order->status !== 'shipped') {
            return response()->json([
                'message' => 'La commande doit être expédiée avant d\'être marquée comme livrée.',
            ], 400);
        }

        $order->update(['status' => 'delivered']);

        // Si le paiement est en cash et encore en pending, le marquer comme completed
        if ($order->payment &&
            $order->payment->payment_method === 'cash' &&
            $order->payment->status === 'pending') {
            $order->payment->markAsCompleted();
        }

        // TODO: Envoyer une notification

        return response()->json([
            'message' => 'Commande marquée comme livrée.',
            'order' => $order->fresh(['payment']),
        ]);
    }
}
