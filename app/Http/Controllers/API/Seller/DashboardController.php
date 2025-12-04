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
        $sellerProducts = Product::where('seller_id', $sellerId)->pluck('id');

        // Calculer les statistiques
        $stats = [
            'total_products' => Product::where('seller_id', $sellerId)->count(),
            'active_products' => Product::where('seller_id', $sellerId)
                ->where('is_active', true)
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
        $sellerProducts = Product::where('seller_id', $sellerId)->pluck('id');

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
        $sellerId = $request->user()->id;
        $year = $request->input('year', date('Y'));
        $sellerProducts = Product::where('seller_id', $sellerId)->pluck('id');

        $sales = DB::table('order_items')
            ->whereIn('product_id', $sellerProducts)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'delivered')
            ->whereYear('orders.created_at', $year)
            ->select(
                DB::raw('MONTH(orders.created_at) as month'),
                DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json($sales);
    }

    /**
     * Obtenir les produits les plus vendus du vendeur
     */
    public function topProducts(Request $request)
    {
        $sellerId = $request->user()->id;
        $limit = $request->input('limit', 10);

        $products = Product::where('seller_id', $sellerId)
            ->withCount(['orderItems as total_sold' => function ($query) {
                $query->select(DB::raw('SUM(quantity)'));
            }])
            ->orderBy('total_sold', 'desc')
            ->take($limit)
            ->get();

        return response()->json($products);
    }
}
