<?php

namespace App\Http\Controllers\API\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StockController extends Controller
{
    /**
     * Liste des produits avec leur stock
     */
    public function index(Request $request)
    {
        $products = $request->user()
            ->products()
            ->select('id', 'name', 'stock', 'stock_alert_threshold')
            ->orderBy('stock', 'asc')
            ->paginate(20);

        return response()->json($products);
    }

    /**
     * Produits en stock faible
     */
    public function lowStock(Request $request)
    {
        $products = $request->user()
            ->products()
            ->lowStock()
            ->with(['stockAlerts' => function ($query) {
                $query->unresolved();
            }])
            ->paginate(15);

        return response()->json($products);
    }

    /**
     * Alertes de stock
     */
    public function alerts(Request $request)
    {
        $alerts = $request->user()
            ->stockAlerts()
            ->with('product')
            ->unresolved()
            ->latest()
            ->paginate(15);

        return response()->json($alerts);
    }

    /**
     * Mettre à jour le stock d'un produit
     */
    public function update(Request $request, $productId)
    {
        $product = $request->user()->products()->findOrFail($productId);

        $validator = Validator::make($request->all(), [
            'stock' => ['required', 'integer', 'min:0'],
            'stock_alert_threshold' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStock = $product->stock;
        $product->update($request->only(['stock', 'stock_alert_threshold']));

        // Si le stock a augmenté au-dessus du seuil, résoudre les alertes
        if ($product->stock > $product->stock_alert_threshold && $oldStock <= $product->stock_alert_threshold) {
            StockAlert::where('product_id', $product->id)
                ->where('is_resolved', false)
                ->update([
                    'is_resolved' => true,
                    'resolved_at' => now(),
                ]);
        }

        // Si le stock est bas, créer une alerte
        if ($product->stock <= $product->stock_alert_threshold) {
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
            'message' => 'Stock mis à jour avec succès.',
            'product' => $product,
        ]);
    }

    /**
     * Résoudre une alerte de stock
     */
    public function resolveAlert(Request $request, $alertId)
    {
        $alert = $request->user()->stockAlerts()->findOrFail($alertId);
        $alert->resolve();

        return response()->json([
            'message' => 'Alerte résolue.',
            'alert' => $alert,
        ]);
    }

    /**
     * Import CSV pour mise à jour de stock en masse
     */
    public function importCsv(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        // TODO: Implémenter la logique d'import CSV
        // Format attendu: product_id, stock

        return response()->json([
            'message' => 'Import CSV en cours de développement.',
        ]);
    }
}
