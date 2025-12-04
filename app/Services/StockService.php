<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockAlert;

class StockService
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Mettre à jour le stock d'un produit
     */
    public function updateStock(Product $product, int $newStock)
    {
        $oldStock = $product->stock;
        $product->update(['stock' => $newStock]);

        // Vérifier si une alerte doit être créée ou résolue
        if ($newStock <= $product->stock_alert_threshold) {
            $this->createStockAlert($product);
        } elseif ($oldStock <= $product->stock_alert_threshold && $newStock > $product->stock_alert_threshold) {
            $this->resolveStockAlerts($product);
        }

        return $product;
    }

    /**
     * Ajouter du stock
     */
    public function addStock(Product $product, int $quantity)
    {
        return $this->updateStock($product, $product->stock + $quantity);
    }

    /**
     * Retirer du stock
     */
    public function removeStock(Product $product, int $quantity)
    {
        if ($product->stock < $quantity) {
            throw new \Exception('Stock insuffisant');
        }

        return $this->updateStock($product, $product->stock - $quantity);
    }

    /**
     * Créer une alerte de stock faible
     */
    protected function createStockAlert(Product $product)
    {
        // Vérifier s'il n'y a pas déjà une alerte non résolue
        $existingAlert = StockAlert::where('product_id', $product->id)
            ->where('is_resolved', false)
            ->first();

        if (!$existingAlert) {
            $alert = StockAlert::create([
                'product_id' => $product->id,
                'user_id' => $product->user_id,
                'current_stock' => $product->stock,
                'threshold' => $product->stock_alert_threshold,
            ]);

            // Notifier le vendeur
            $this->notificationService->notifyLowStock($product);

            return $alert;
        }

        return $existingAlert;
    }

    /**
     * Résoudre les alertes de stock
     */
    protected function resolveStockAlerts(Product $product)
    {
        StockAlert::where('product_id', $product->id)
            ->where('is_resolved', false)
            ->update([
                'is_resolved' => true,
                'resolved_at' => now(),
            ]);
    }

    /**
     * Obtenir les produits en stock faible pour un vendeur
     */
    public function getLowStockProducts($userId)
    {
        return Product::where('user_id', $userId)
            ->lowStock()
            ->with('stockAlerts')
            ->get();
    }

    /**
     * Importer des stocks via CSV
     */
    public function importFromCsv($filePath, $userId)
    {
        // TODO: Implémenter l'import CSV
        // Format attendu: product_id, stock

        $results = [
            'success' => 0,
            'errors' => [],
        ];

        if (!file_exists($filePath)) {
            throw new \Exception('Fichier introuvable');
        }

        $file = fopen($filePath, 'r');
        $header = fgetcsv($file);

        while (($row = fgetcsv($file)) !== false) {
            try {
                $productId = $row[0];
                $stock = (int) $row[1];

                $product = Product::where('id', $productId)
                    ->where('user_id', $userId)
                    ->first();

                if (!$product) {
                    $results['errors'][] = "Produit {$productId} introuvable";
                    continue;
                }

                $this->updateStock($product, $stock);
                $results['success']++;
            } catch (\Exception $e) {
                $results['errors'][] = "Ligne: " . implode(',', $row) . " - Erreur: " . $e->getMessage();
            }
        }

        fclose($file);

        return $results;
    }

    /**
     * Vérifier tous les stocks et créer des alertes si nécessaire
     */
    public function checkAllStocks($userId = null)
    {
        $query = Product::lowStock();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $lowStockProducts = $query->get();

        foreach ($lowStockProducts as $product) {
            $this->createStockAlert($product);
        }

        return $lowStockProducts;
    }
}
