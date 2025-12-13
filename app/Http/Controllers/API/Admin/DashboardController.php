<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obtenir les statistiques du dashboard admin
     */
    public function stats(Request $request)
    {
        $stats = [
            'total_products' => Product::count(),
            'pending_products' => Product::where('is_approved', false)->count(),
            'total_orders' => Order::count(),
            'total_users' => User::where('role', 'client')->count(),
            'total_sellers' => User::where('role', 'vendeur')->count(),
            'pending_sellers' => User::where('role', 'vendeur')->where('is_verified', false)->count(),
            'total_revenue' => Order::where('status', 'delivered')->sum('total') ?? 0,
            'total_categories' => Category::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'confirmed_orders' => Order::where('status', 'confirmed')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Obtenir les commandes récentes
     */
    public function recentOrders(Request $request)
    {
        $orders = Order::with(['user', 'items.product'])
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'data' => $orders
        ]);
    }

    /**
     * Obtenir les statistiques de ventes par mois
     */
    public function salesByMonth(Request $request)
    {
        try {
            // Si aucune année spécifiée, chercher l'année la plus récente avec des commandes
            $year = $request->input('year');

            if (!$year) {
                // Trouver l'année la plus récente avec des commandes
                $latestOrder = DB::table('orders')
                    ->where('status', '!=', 'cancelled')
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($latestOrder) {
                    $year = date('Y', strtotime($latestOrder->created_at));
                } else {
                    $year = date('Y'); // Année actuelle par défaut
                }
            }

            // Récupérer les ventes par mois (toutes les commandes sauf annulées)
            $salesData = DB::table('orders')
                ->where('status', '!=', 'cancelled')
                ->whereYear('created_at', $year)
                ->select(
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('COALESCE(SUM(total), 0) as total_revenue')
                )
                ->groupBy(DB::raw('MONTH(created_at)'))
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

            \Log::error('Erreur salesByMonth: ' . $e->getMessage());
            return response()->json([
                'year' => (int) date('Y'),
                'data' => $allMonths
            ]);
        }
    }

    /**
     * Obtenir les statistiques de ventes par jour
     */
    public function salesByDay(Request $request)
    {
        try {
            // Récupérer les paramètres de période (par défaut: 30 derniers jours)
            $days = $request->input('days', 30);
            $endDate = now();
            $startDate = now()->subDays($days - 1)->startOfDay();

            // Récupérer les ventes par jour (toutes les commandes sauf annulées)
            $salesData = DB::table('orders')
                ->where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('COALESCE(SUM(total), 0) as total_revenue')
                )
                ->groupBy(DB::raw('DATE(created_at)'))
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
            \Log::error('Erreur salesByDay: ' . $e->getMessage());
            return response()->json([
                'period' => 30,
                'start_date' => now()->subDays(29)->format('Y-m-d'),
                'end_date' => now()->format('Y-m-d'),
                'data' => []
            ], 500);
        }
    }

    /**
     * Obtenir les produits les plus vendus
     */
    public function topProducts(Request $request)
    {
        $limit = $request->input('limit', 10);

        $products = Product::with(['category', 'seller'])
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
