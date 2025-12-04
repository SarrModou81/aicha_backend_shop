<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\StockAlert;
use Illuminate\Support\Facades\DB;

class OrderService
{
    protected $notificationService;
    protected $paymentService;

    public function __construct(NotificationService $notificationService, PaymentService $paymentService)
    {
        $this->notificationService = $notificationService;
        $this->paymentService = $paymentService;
    }

    /**
     * Créer une commande à partir du panier
     */
    public function createOrderFromCart(Cart $cart, $addressId, $paymentMethod, ?string $notes = null)
    {
        if ($cart->items->isEmpty()) {
            throw new \Exception('Le panier est vide');
        }

        return DB::transaction(function () use ($cart, $addressId, $paymentMethod, $notes) {
            // Calculer les totaux
            $subtotal = $cart->subtotal;
            $shippingCost = $this->calculateShippingCost($addressId);
            $total = $subtotal + $shippingCost;

            // Créer la commande
            $order = Order::create([
                'user_id' => $cart->user_id,
                'address_id' => $addressId,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'status' => 'pending',
                'notes' => $notes,
            ]);

            // Créer les articles de la commande et déduire du stock
            foreach ($cart->items as $cartItem) {
                // Vérifier le stock
                if ($cartItem->product->stock < $cartItem->quantity) {
                    throw new \Exception("Stock insuffisant pour {$cartItem->product->name}");
                }

                // Créer l'article de commande
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

                // Créer une alerte si le stock devient faible
                $product = $cartItem->product->fresh();
                if ($product->stock <= $product->stock_alert_threshold) {
                    $existingAlert = StockAlert::where('product_id', $product->id)
                        ->where('is_resolved', false)
                        ->first();

                    if (!$existingAlert) {
                        StockAlert::create([
                            'product_id' => $product->id,
                            'user_id' => $product->user_id,
                            'current_stock' => $product->stock,
                            'threshold' => $product->stock_alert_threshold,
                        ]);

                        // Notifier le vendeur
                        $this->notificationService->notifyLowStock($product);
                    }
                }
            }

            // Vider le panier
            $cart->items()->delete();

            // Créer le paiement
            $paymentResult = $this->paymentService->processPayment($order, $paymentMethod);

            // Notifier le client
            $this->notificationService->notifyOrderCreated($order);

            // Notifier les vendeurs concernés
            $this->notifySellerNewOrders($order);

            return [
                'order' => $order->fresh(['items', 'address', 'payment']),
                'payment' => $paymentResult,
            ];
        });
    }

    /**
     * Calculer les frais de livraison
     */
    protected function calculateShippingCost($addressId)
    {
        // TODO: Calculer selon la zone de livraison
        // Pour l'instant, retourner un coût fixe
        return 2000; // 2000 FCFA
    }

    /**
     * Notifier les vendeurs d'une nouvelle commande
     */
    protected function notifySellerNewOrders(Order $order)
    {
        // Grouper les articles par vendeur
        $itemsBySeller = $order->items->groupBy('seller_id');

        foreach ($itemsBySeller as $sellerId => $items) {
            $seller = \App\Models\User::find($sellerId);
            if ($seller) {
                $this->notificationService->notifyNewSale($seller, $order, $items);
            }
        }
    }

    /**
     * Changer le statut d'une commande
     */
    public function changeOrderStatus(Order $order, string $newStatus, ?string $reason = null)
    {
        $oldStatus = $order->status;

        $order->update([
            'status' => $newStatus,
            'cancellation_reason' => $reason,
        ]);

        // Notifier le client
        $this->notificationService->notifyOrderStatusChanged($order, $oldStatus, $newStatus);

        return $order;
    }

    /**
     * Annuler une commande et remettre en stock
     */
    public function cancelOrder(Order $order, string $reason)
    {
        if (!$order->canBeCancelled()) {
            throw new \Exception('Cette commande ne peut pas être annulée');
        }

        return DB::transaction(function () use ($order, $reason) {
            // Remettre les quantités en stock
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            // Mettre à jour le statut
            $this->changeOrderStatus($order, 'cancelled', $reason);

            // Gérer le remboursement si nécessaire
            if ($order->payment && $order->payment->status === 'completed') {
                $this->paymentService->refundPayment($order->payment);
            }

            return $order;
        });
    }
}
