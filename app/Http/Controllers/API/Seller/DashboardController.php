<?php

namespace App\Http\Controllers\API\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obtenir les statistiques du dashboard vendeur
     */
    public function stats(Request $request)
    {
        $sellerId = $request->user()->id;

        // Récupérer les produits du vendeur
        $sellerProducts = Product::where('user_id', $sellerId)->pluck('id');

        // Calculer les statistiques
        $stats = [
            'total_products' => Product::where('user_id', $sellerId)->count(),
            'active_products' => Product::where('user_id', $sellerId)
                ->where('is_visible', true)
                ->where('is_approved', true)
                ->count(),
            'total_orders' => Order::whereHas('items', function ($query) use ($sellerProducts) {
                $query->whereIn('product_id', $sellerProducts);
            })->count(),
            'pending_orders' => Order::whereHas('items', function ($query) use ($sellerProducts) {
                $query->whereIn('product_id', $sellerProducts);
            })->where('status', 'pending')->count(),
            'confirmed_orders' => Order::whereHas('items', function ($query) use ($sellerProducts) {
                $query->whereIn('product_id', $sellerProducts);
            })->where('status', 'confirmed')->count(),
            'total_revenue' => DB::table('order_items')
                ->whereIn('product_id', $sellerProducts)
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'delivered')
                ->sum(DB::raw('order_items.quantity * order_items.price')),
        ];

        return response()->json($stats);
    }

    /**
     * Obtenir les commandes récentes du vendeur
     */
    public function recentOrders(Request $request)
    {
        $sellerId = $request->user()->id;
        $sellerProducts = Product::where('user_id', $sellerId)->pluck('id');

        $orders = Order::with(['user', 'items' => function ($query) use ($sellerProducts) {
            $query->whereIn('product_id', $sellerProducts)->with('product');
        }])
            ->whereHas('items', function ($query) use ($sellerProducts) {
                $query->whereIn('product_id', $sellerProducts);
            })
            ->latest()
            ->take(10)
            ->get();

        return response()->json($orders);
    }

    /**
     * Obtenir les statistiques de ventes par mois
     */
    public function salesByMonth(Request $request)
    {
        try {
            $sellerId = $request->user()->id;
            $sellerProducts = Product::where('user_id', $sellerId)->pluck('id');

            // Si le vendeur n'a pas de produits, retourner 12 mois vides
            if ($sellerProducts->isEmpty()) {
                $allMonths = [];
                for ($month = 1; $month <= 12; $month++) {
                    $allMonths[] = [
                        'month' => $month,
                        'total_orders' => 0,
                        'total_revenue' => 0,
                    ];
                }
                return response()->json([
                    'year' => (int) date('Y'),
                    'data' => $allMonths
                ]);
            }

            // Si aucune année spécifiée, chercher l'année la plus récente avec des commandes
            $year = $request->input('year');

            if (!$year) {
                // Trouver l'année la plus récente avec des commandes pour ce vendeur
                $latestOrder = DB::table('order_items')
                    ->whereIn('product_id', $sellerProducts->toArray())
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.status', '!=', 'cancelled')
                    ->orderBy('orders.created_at', 'desc')
                    ->first();

                if ($latestOrder) {
                    $year = date('Y', strtotime($latestOrder->created_at));
                } else {
                    $year = date('Y');
                }
            }

            // Récupérer les ventes par mois (toutes les commandes sauf annulées)
            $salesData = DB::table('order_items')
                ->whereIn('product_id', $sellerProducts->toArray())
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', '!=', 'cancelled')
                ->whereYear('orders.created_at', $year)
                ->select(
                    DB::raw('MONTH(orders.created_at) as month'),
                    DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                    DB::raw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as total_revenue')
                )
                ->groupBy(DB::raw('MONTH(orders.created_at)'))
                ->get()
                ->keyBy('month');

            // Créer un tableau avec tous les mois (1-12)
            $allMonths = [];
            for ($month = 1; $month <= 12; $month++) {
                $allMonths[] = [
                    'month' => $month,
                    'total_orders' => isset($salesData[$month]) ? (int) $salesData[$month]->total_orders : 0,
                    'total_revenue' => isset($salesData[$month]) ? (float) $salesData[$month]->total_revenue : 0,
                ];
            }

            return response()->json([
                'year' => (int) $year,
                'data' => $allMonths
            ]);
        } catch (\Exception $e) {
            // En cas d'erreur, retourner 12 mois vides
            $allMonths = [];
            for ($month = 1; $month <= 12; $month++) {
                $allMonths[] = [
                    'month' => $month,
                    'total_orders' => 0,
                    'total_revenue' => 0,
                ];
            }

            \Log::error('Erreur salesByMonth (Seller): ' . $e->getMessage());
            return response()->json([
                'year' => (int) date('Y'),
                'data' => $allMonths
            ]);
        }
    }

    /**
     * Obtenir les statistiques de ventes par jour du vendeur
     */
    public function salesByDay(Request $request)
    {
        try {
            $sellerId = $request->user()->id;
            $sellerProducts = Product::where('user_id', $sellerId)->pluck('id');

            // Si le vendeur n'a pas de produits, retourner données vides
            if ($sellerProducts->isEmpty()) {
                return response()->json([
                    'period' => 30,
                    'start_date' => now()->subDays(29)->format('Y-m-d'),
                    'end_date' => now()->format('Y-m-d'),
                    'data' => []
                ]);
            }

            // Récupérer les paramètres de période (par défaut: 30 derniers jours)
            $days = $request->input('days', 30);
            $endDate = now();
            $startDate = now()->subDays($days - 1)->startOfDay();

            // Récupérer les ventes par jour (toutes les commandes sauf annulées)
            $salesData = DB::table('order_items')
                ->whereIn('product_id', $sellerProducts->toArray())
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', '!=', 'cancelled')
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->select(
                    DB::raw('DATE(orders.created_at) as date'),
                    DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                    DB::raw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as total_revenue')
                )
                ->groupBy(DB::raw('DATE(orders.created_at)'))
                ->orderBy('date')
                ->get()
                ->keyBy('date');

            // Créer un tableau avec tous les jours de la période
            $allDays = [];
            $currentDate = $startDate->copy();

            while ($currentDate <= $endDate) {
                $dateStr = $currentDate->format('Y-m-d');
                $allDays[] = [
                    'date' => $dateStr,
                    'total_orders' => isset($salesData[$dateStr]) ? (int) $salesData[$dateStr]->total_orders : 0,
                    'total_revenue' => isset($salesData[$dateStr]) ? (float) $salesData[$dateStr]->total_revenue : 0,
                ];
                $currentDate->addDay();
            }

            return response()->json([
                'period' => $days,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'data' => $allDays
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur salesByDay (Seller): ' . $e->getMessage());
            return response()->json([
                'period' => 30,
                'start_date' => now()->subDays(29)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
                'data' => []
            ], 500);
        }
    }

    /**
     * Obtenir les produits les plus vendus du vendeur
     */
    public function topProducts(Request $request)
    {
        $sellerId = $request->user()->id;
        $limit = $request->input('limit', 10);

        $products = Product::where('user_id', $sellerId)
            ->withCount(['orderItems as total_sold' => function ($query) {
                $query->select(DB::raw('COALESCE(SUM(quantity), 0)'))
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.status', '!=', 'cancelled');
            }])
            ->orderBy('total_sold', 'desc')
            ->take($limit)
            ->get();

        return response()->json($products);
    }
}
