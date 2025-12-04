<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Créer une notification pour un utilisateur
     */
    public function create(User $user, string $type, string $title, string $message, ?array $data = null)
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Notifier une nouvelle commande au client
     */
    public function notifyOrderCreated($order)
    {
        return $this->create(
            $order->user,
            'order_created',
            'Commande créée',
            "Votre commande #{$order->order_number} a été créée avec succès.",
            ['order_id' => $order->id]
        );
    }

    /**
     * Notifier le changement de statut de commande
     */
    public function notifyOrderStatusChanged($order, $oldStatus, $newStatus)
    {
        $messages = [
            'confirmed' => "Votre commande #{$order->order_number} a été confirmée.",
            'processing' => "Votre commande #{$order->order_number} est en cours de préparation.",
            'shipped' => "Votre commande #{$order->order_number} a été expédiée.",
            'delivered' => "Votre commande #{$order->order_number} a été livrée.",
            'cancelled' => "Votre commande #{$order->order_number} a été annulée.",
        ];

        return $this->create(
            $order->user,
            'order_status_changed',
            'Statut de commande modifié',
            $messages[$newStatus] ?? "Le statut de votre commande a changé.",
            ['order_id' => $order->id, 'status' => $newStatus]
        );
    }

    /**
     * Notifier le paiement reçu
     */
    public function notifyPaymentReceived($payment)
    {
        return $this->create(
            $payment->user,
            'payment_received',
            'Paiement reçu',
            "Votre paiement de {$payment->amount} FCFA a été reçu avec succès.",
            ['payment_id' => $payment->id, 'order_id' => $payment->order_id]
        );
    }

    /**
     * Notifier un stock faible au vendeur
     */
    public function notifyLowStock($product)
    {
        return $this->create(
            $product->user,
            'low_stock',
            'Stock faible',
            "Le produit '{$product->name}' a un stock faible ({$product->stock} unités).",
            ['product_id' => $product->id]
        );
    }

    /**
     * Notifier qu'un vendeur a été vérifié
     */
    public function notifySellerVerified(User $seller)
    {
        return $this->create(
            $seller,
            'seller_verified',
            'Compte vérifié',
            'Votre compte vendeur a été vérifié. Vous pouvez maintenant vendre vos produits.',
            []
        );
    }

    /**
     * Notifier qu'un produit a été approuvé
     */
    public function notifyProductApproved($product)
    {
        return $this->create(
            $product->user,
            'product_approved',
            'Produit approuvé',
            "Votre produit '{$product->name}' a été approuvé et est maintenant visible.",
            ['product_id' => $product->id]
        );
    }

    /**
     * Notifier une nouvelle vente au vendeur
     */
    public function notifyNewSale($seller, $order, $items)
    {
        $itemsCount = $items->sum('quantity');
        $total = $items->sum('subtotal');

        return $this->create(
            $seller,
            'new_sale',
            'Nouvelle vente',
            "Vous avez une nouvelle vente de {$itemsCount} article(s) pour un total de {$total} FCFA.",
            ['order_id' => $order->id]
        );
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(User $user)
    {
        return $user->notifications()->unread()->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }
}
