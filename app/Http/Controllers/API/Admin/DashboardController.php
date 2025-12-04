<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Tableau de bord avec toutes les statistiques
     */
    public function index()
    {
        // Statistiques utilisateurs
        $totalUsers = User::count();
        $totalClients = User::clients()->count();
        $totalVendors = User::vendeurs()->count();
        $pendingVendors = User::vendeurs()->where('is_verified', false)->count();

        // Statistiques produits
        $totalProducts = Product::count();
        $activeProducts = Product::active()->count();
        $pendingProducts = Product::where('is_approved', false)->count();

        // Statistiques commandes
        $totalOrders = Order::count();
        $pendingOrders = Order::pending()->count();
        $completedOrders = Order::delivered()->count();

        // Chiffre d'affaires
        $totalRevenue = Payment::completed()->sum('amount');
        $monthlyRevenue = Payment::completed()
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'clients' => $totalClients,
                'vendors' => $totalVendors,
                'pending_vendors' => $pendingVendors,
            ],
            'products' => [
                'total' => $totalProducts,
                'active' => $activeProducts,
                'pending' => $pendingProducts,
            ],
            'orders' => [
                'total' => $totalOrders,
                'pending' => $pendingOrders,
                'completed' => $completedOrders,
            ],
            'revenue' => [
                'total' => $totalRevenue,
                'monthly' => $monthlyRevenue,
            ],
        ]);
    }

    /**
     * Statistiques de ventes
     */
    public function salesStats(Request $request)
    {
        $period = $request->get('period', 'month');

        $query = Order::whereIn('status', ['delivered'])
            ->whereHas('payment', function ($q) {
                $q->where('status', 'completed');
            });

        switch ($period) {
            case 'day':
                $stats = $query->selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(total) as total')
                    ->whereDate('created_at', '>=', now()->subDays(30))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get();
                break;
            case 'month':
                $stats = $query->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count, SUM(total) as total')
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

    /**
     * Logs de sécurité (simplifié)
     */
    public function securityLogs(Request $request)
    {
        // TODO: Implémenter un système de logs complet
        return response()->json([
            'message' => 'Fonctionnalité en cours de développement',
        ]);
    }

    /**
     * Vendeurs les plus performants
     */
    public function topSellers()
    {
        $topSellers = User::vendeurs()
            ->withCount('products')
            ->withSum('products as total_sales', 'stock')
            ->orderBy('total_sales', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'top_sellers' => $topSellers,
        ]);
    }
}
