<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FoodController;
use App\Http\Controllers\Api\MpesaController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\RestaurantController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ─── Public Routes ────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // Restaurants & menus (public browsing)
    Route::get('/restaurants',                   [RestaurantController::class, 'index']);
    Route::get('/restaurants/{slug}/menu',        [RestaurantController::class, 'menu']);

    // M-Pesa callback (no auth — called by Safaricom)
    Route::post('/mpesa/callback', [MpesaController::class, 'callback']);
});

// ─── Authenticated Routes ─────────────────────────────────────────────────────
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── Student: Orders ──────────────────────────────────────────────────────
    Route::get('/orders/mine',          [OrderController::class, 'mine']);
    Route::post('/orders',              [OrderController::class, 'store']);
    Route::post('/orders/{order}/pay',  [OrderController::class, 'pay']);
    Route::get('/orders/{order}',       [OrderController::class, 'show']);
    Route::delete('/orders/{order}',    [OrderController::class, 'destroy']);

    // ── Admin / Vendor_Staff: Orders ─────────────────────────────────────────
    Route::middleware('role:Admin,Vendor_Staff')->group(function () {
        Route::get('/orders',                          [OrderController::class, 'index']);
        Route::patch('/orders/{order}/status',         [OrderController::class, 'updateStatus']);
    });

    // ── Admin / Vendor_Staff: Foods ──────────────────────────────────────────
    Route::middleware('role:Admin,Vendor_Staff')->group(function () {
        Route::get('/foods',          [FoodController::class, 'index']);
        Route::post('/foods',         [FoodController::class, 'store']);
        Route::patch('/foods/{food}', [FoodController::class, 'update']);
    });

    Route::middleware('role:Admin')->group(function () {
        Route::delete('/foods/{food}', [FoodController::class, 'destroy']);

        // Restaurants management
        Route::post('/restaurants',              [RestaurantController::class, 'store']);
        Route::patch('/restaurants/{restaurant}',[RestaurantController::class, 'update']);
        Route::delete('/restaurants/{restaurant}',[RestaurantController::class, 'destroy']);

        // User management
        Route::get('/users',         fn() => \App\Models\User::all());
        Route::delete('/users/{user}', function (\App\Models\User $user) {
            $user->delete();
            return response()->json(['message' => 'User deleted.']);
        });
    });
});
