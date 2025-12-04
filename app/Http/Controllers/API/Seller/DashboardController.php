<?php

namespace App\Http\Controllers\API\Seller;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Statistiques du vendeur
     */
    public function stats(Request $request)
    {
        $userId = $request->user()->id;

        // Total des produits
        $totalProducts = Product::where('user_id', $userId)->count();

        // Produits actifs
        $activeProducts = Product::where('user_id', $userId)->active()->count();

        // Produits en stock faible
        $lowStockProducts = Product::where('user_id', $userId)->lowStock()->count();

        // Total des commandes
        $totalOrders = OrderItem::where('seller_id', $userId)->distinct('order_id')->count();

        // Commandes en attente
        $pendingOrders = OrderItem::where('seller_id', $userId)
            ->whereHas('order', function ($query) {
                $query->where('status', 'pending');
            })
            ->distinct('order_id')
            ->count();

        // Chiffre d'affaires total
        $totalRevenue = OrderItem::where('seller_id', $userId)
            ->whereHas('order', function ($query) {
                $query->whereIn('status', ['delivered']);
            })
            ->whereHas('order.payment', function ($query) {
                $query->where('status', 'completed');
            })
            ->sum('subtotal');

        // Chiffre d'affaires du mois
        $monthlyRevenue = OrderItem::where('seller_id', $userId)
            ->whereHas('order', function ($query) {
                $query->whereIn('status', ['delivered'])
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
            })
            ->whereHas('order.payment', function ($query) {
                $query->where('status', 'completed');
            })
            ->sum('subtotal');

        return response()->json([
            'total_products' => $totalProducts,
            'active_products' => $activeProducts,
            'low_stock_products' => $lowStockProducts,
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'total_revenue' => $totalRevenue,
            'monthly_revenue' => $monthlyRevenue,
        ]);
    }

    /**
     * Produits les plus vendus
     */
    public function topProducts(Request $request)
    {
        $topProducts = Product::where('user_id', $request->user()->id)
            ->withCount('orderItems')
            ->having('order_items_count', '>', 0)
            ->orderBy('order_items_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'top_products' => $topProducts,
        ]);
    }

    /**
     * Statistiques de ventes par période
     */
    public function salesStats(Request $request)
    {
        $period = $request->get('period', 'month'); // day, week, month, year

        $query = OrderItem::where('seller_id', $request->user()->id)
            ->whereHas('order', function ($q) {
                $q->whereIn('status', ['delivered']);
            })
            ->whereHas('order.payment', function ($q) {
                $q->where('status', 'completed');
            });

        switch ($period) {
            case 'day':
                $stats = $query->selectRaw('DATE(created_at) as date, SUM(subtotal) as total, COUNT(*) as count')
                    ->whereDate('created_at', '>=', now()->subDays(30))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get();
                break;
            case 'week':
                $stats = $query->selectRaw('YEARWEEK(created_at) as week, SUM(subtotal) as total, COUNT(*) as count')
                    ->whereDate('created_at', '>=', now()->subWeeks(12))
                    ->groupBy('week')
                    ->orderBy('week')
                    ->get();
                break;
            case 'month':
                $stats = $query->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(subtotal) as total, COUNT(*) as count')
                    ->whereDate('created_at', '>=', now()->subMonths(12))
                    ->groupBy('year', 'month')
                    ->orderBy('year')
                    ->orderBy('month')
                    ->get();
                break;
            default:
                $stats = [];
        }

        return response()->json([
            'period' => $period,
            'stats' => $stats,
        ]);
    }
}
