<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\Client\ProductController as ClientProductController;
use App\Http\Controllers\API\Client\CartController;
use App\Http\Controllers\API\Client\OrderController as ClientOrderController;
use App\Http\Controllers\API\Client\AddressController;
use App\Http\Controllers\API\Seller\ProductController as SellerProductController;
use App\Http\Controllers\API\Seller\OrderController as SellerOrderController;
use App\Http\Controllers\API\Seller\StockController;
use App\Http\Controllers\API\Seller\DashboardController as SellerDashboardController;
use App\Http\Controllers\API\Admin\UserController as AdminUserController;
use App\Http\Controllers\API\Admin\ProductController as AdminProductController;
use App\Http\Controllers\API\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\API\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\API\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\API\Admin\SettingsController;

/*
|--------------------------------------------------------------------------
| API Routes - AICHA SHOP
|--------------------------------------------------------------------------
*/

// Routes publiques
Route::prefix('v1')->group(function () {

    // Authentification
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
            Route::put('password', [AuthController::class, 'changePassword']);
        });
    });

    // Catégories (public)
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::get('/{id}', [CategoryController::class, 'show']);
        Route::get('/{id}/products', [CategoryController::class, 'products']);
    });

    // Produits (public - navigation)
    Route::prefix('products')->group(function () {
        Route::get('/', [ClientProductController::class, 'index']);
        Route::get('/on-sale', [ClientProductController::class, 'onSale']);
        Route::get('/new-arrivals', [ClientProductController::class, 'newArrivals']);
        Route::get('/popular', [ClientProductController::class, 'popular']);
        Route::get('/{id}', [ClientProductController::class, 'show']);
        Route::get('/{id}/similar', [ClientProductController::class, 'similar']);
    });

    // Routes protégées - CLIENT
    Route::middleware(['auth:sanctum', 'client'])->prefix('client')->group(function () {

        // Panier
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'index']);
            Route::post('/add', [CartController::class, 'add']);
            Route::put('/items/{itemId}', [CartController::class, 'update']);
            Route::delete('/items/{itemId}', [CartController::class, 'remove']);
            Route::delete('/clear', [CartController::class, 'clear']);
        });

        // Commandes
        Route::prefix('orders')->group(function () {
            Route::get('/', [ClientOrderController::class, 'index']);
            Route::post('/', [ClientOrderController::class, 'store']);
            Route::get('/{id}', [ClientOrderController::class, 'show']);
            Route::post('/{id}/cancel', [ClientOrderController::class, 'cancel']);
        });

        // Adresses
        Route::prefix('addresses')->group(function () {
            Route::get('/', [AddressController::class, 'index']);
            Route::post('/', [AddressController::class, 'store']);
            Route::get('/{id}', [AddressController::class, 'show']);
            Route::put('/{id}', [AddressController::class, 'update']);
            Route::delete('/{id}', [AddressController::class, 'destroy']);
            Route::post('/{id}/set-default', [AddressController::class, 'setDefault']);
        });
    });

    // Routes protégées - VENDEUR
    Route::middleware(['auth:sanctum', 'vendeur'])->prefix('seller')->group(function () {

        // Dashboard
        Route::get('/dashboard/stats', [SellerDashboardController::class, 'stats']);
        Route::get('/dashboard/recent-orders', [SellerDashboardController::class, 'recentOrders']);
        Route::get('/dashboard/sales-by-month', [SellerDashboardController::class, 'salesByMonth']);
        Route::get('/dashboard/top-products', [SellerDashboardController::class, 'topProducts']);

        // Gestion des produits
        Route::prefix('products')->group(function () {
            Route::get('/', [SellerProductController::class, 'index']);
            Route::post('/', [SellerProductController::class, 'store']);
            Route::get('/{id}', [SellerProductController::class, 'show']);
            Route::put('/{id}', [SellerProductController::class, 'update']);
            Route::delete('/{id}', [SellerProductController::class, 'destroy']);
            Route::post('/{id}/toggle-visibility', [SellerProductController::class, 'toggleVisibility']);
        });

        // Gestion des commandes
        Route::prefix('orders')->group(function () {
            Route::get('/', [SellerOrderController::class, 'index']);
            Route::get('/new', [SellerOrderController::class, 'newOrders']);
            Route::get('/{orderId}', [SellerOrderController::class, 'show']);
            Route::post('/{orderId}/confirm', [SellerOrderController::class, 'confirm']);
            Route::post('/{orderId}/processing', [SellerOrderController::class, 'markAsProcessing']);
            Route::post('/{orderId}/shipped', [SellerOrderController::class, 'markAsShipped']);
        });

        // Gestion des stocks
        Route::prefix('stock')->group(function () {
            Route::get('/', [StockController::class, 'index']);
            Route::get('/low-stock', [StockController::class, 'lowStock']);
            Route::get('/alerts', [StockController::class, 'alerts']);
            Route::put('/products/{productId}', [StockController::class, 'update']);
            Route::post('/alerts/{alertId}/resolve', [StockController::class, 'resolveAlert']);
            Route::post('/import-csv', [StockController::class, 'importCsv']);
        });
    });

    // Routes protégées - ADMINISTRATEUR
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/dashboard/recent-orders', [AdminDashboardController::class, 'recentOrders']);
        Route::get('/dashboard/sales-by-month', [AdminDashboardController::class, 'salesByMonth']);
        Route::get('/dashboard/top-products', [AdminDashboardController::class, 'topProducts']);

        // Gestion des utilisateurs
        Route::prefix('users')->group(function () {
            Route::get('/', [AdminUserController::class, 'index']);
            Route::post('/sellers', [AdminUserController::class, 'createSeller']);
            Route::get('/pending-vendors', [AdminUserController::class, 'pendingVendors']);
            Route::get('/{id}', [AdminUserController::class, 'show']);
            Route::put('/{id}', [AdminUserController::class, 'update']);
            Route::post('/{id}/deactivate', [AdminUserController::class, 'deactivate']);
            Route::post('/{id}/activate', [AdminUserController::class, 'activate']);
            Route::post('/{id}/verify-seller', [AdminUserController::class, 'verifySeller']);
            Route::post('/{id}/reset-password', [AdminUserController::class, 'resetPassword']);
        });

        // Modération des produits
        Route::prefix('products')->group(function () {
            Route::get('/', [AdminProductController::class, 'index']);
            Route::get('/pending', [AdminProductController::class, 'pending']);
            Route::get('/{id}', [AdminProductController::class, 'show']);
            Route::post('/{id}/approve', [AdminProductController::class, 'approve']);
            Route::post('/{id}/reject', [AdminProductController::class, 'reject']);
            Route::delete('/{id}', [AdminProductController::class, 'destroy']);
        });

        // Supervision des commandes
        Route::prefix('orders')->group(function () {
            Route::get('/', [AdminOrderController::class, 'index']);
            Route::get('/stats', [AdminOrderController::class, 'stats']);
            Route::get('/{id}', [AdminOrderController::class, 'show']);
            Route::post('/{id}/mark-delivered', [AdminOrderController::class, 'markAsDelivered']);
        });

        // Gestion des catégories
        Route::prefix('categories')->group(function () {
            Route::get('/', [AdminCategoryController::class, 'index']);
            Route::post('/', [AdminCategoryController::class, 'store']);
            Route::get('/{id}', [AdminCategoryController::class, 'show']);
            Route::put('/{id}', [AdminCategoryController::class, 'update']);
            Route::delete('/{id}', [AdminCategoryController::class, 'destroy']);
        });

        // Paramètres système
        Route::prefix('settings')->group(function () {
            Route::get('/', [SettingsController::class, 'index']);
            Route::post('/', [SettingsController::class, 'update']);

            // Zones de livraison
            Route::get('/delivery-zones', [SettingsController::class, 'deliveryZones']);
            Route::post('/delivery-zones', [SettingsController::class, 'createDeliveryZone']);
            Route::put('/delivery-zones/{id}', [SettingsController::class, 'updateDeliveryZone']);
            Route::delete('/delivery-zones/{id}', [SettingsController::class, 'deleteDeliveryZone']);
        });
    });
});

// Route de test
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'AICHA SHOP API is running',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});
