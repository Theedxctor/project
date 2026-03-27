<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use App\Models\Order;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct(private MpesaService $mpesa) {}

    /**
     * GET /api/v1/orders/mine — student's own orders
     */
    public function mine(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with(['restaurant', 'items.food'])
            ->latest()
            ->get();

        return response()->json($orders);
    }

    /**
     * GET /api/v1/orders — all orders (admin) or own restaurant (vendor)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::with(['user', 'restaurant', 'items.food'])->latest();

        if ($user->isVendorStaff()) {
            // TODO: associate vendor staff with a restaurant via a pivot table if needed
            // For now, filter by restaurant_id query param
            $query->where('restaurant_id', $request->restaurant_id);
        }

        return response()->json($query->get());
    }

    /**
     * POST /api/v1/orders — create a pending order
     */
    public function store(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'items'         => 'required|array|min:1',
            'items.*.food_id'  => 'required|exists:foods,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            $total = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $food = Food::findOrFail($item['food_id']);

                // Ensure food belongs to the correct restaurant
                if ($food->restaurant_id !== (int) $request->restaurant_id) {
                    abort(422, "Food item '{$food->name}' does not belong to the selected restaurant.");
                }

                if (!$food->is_available) {
                    abort(422, "Food item '{$food->name}' is currently unavailable.");
                }

                $subtotal = $food->price * $item['quantity'];
                $total   += $subtotal;

                $itemsData[] = [
                    'food_id'    => $food->id,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $food->price,
                ];
            }

            $order = Order::create([
                'user_id'       => $request->user()->id,
                'restaurant_id' => $request->restaurant_id,
                'total'         => $total,
                'status'        => 'Pending',
            ]);

            $order->items()->createMany($itemsData);

            return response()->json($order->load(['restaurant', 'items.food']), 201);
        });
    }

    /**
     * POST /api/v1/orders/{id}/pay — initiate M-Pesa STK Push
     */
    public function pay(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        if ($order->status !== 'Pending') {
            abort(422, 'Order is not in a payable state.');
        }

        $request->validate([
            'phone' => ['required', 'regex:/^(254|0)[17]\d{8}$/'],
        ]);

        // Normalize phone to 254XXXXXXXXX
        $phone = preg_replace('/^0/', '254', $request->phone);

        $result = $this->mpesa->stkPush(
            phone:  $phone,
            amount: (int) ceil($order->total),
            ref:    "ORDER-{$order->id}",
            desc:   "StrathFood Order #{$order->id}"
        );

        if (!isset($result['ResponseCode']) || $result['ResponseCode'] !== '0') {
            return response()->json([
                'message' => 'STK Push failed. Please try again.',
                'details' => $result,
            ], 502);
        }

        return response()->json([
            'message'             => 'STK Push sent. Complete payment on your phone.',
            'checkout_request_id' => $result['CheckoutRequestID'] ?? null,
        ]);
    }

    /**
     * PATCH /api/v1/orders/{id}/status — update order status (admin/vendor)
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:Pending,Paid,Ready,Picked Up',
        ]);

        // Generate pickup code when marking as Paid
        if ($request->status === 'Paid' && !$order->pickup_code) {
            $order->pickup_code = Order::generatePickupCode();
        }

        $order->status = $request->status;
        $order->save();

        return response()->json($order->load(['user', 'restaurant', 'items.food']));
    }

    /**
     * GET /api/v1/orders/{id}
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        if ($user->isStudent() && $order->user_id !== $user->id) {
            abort(403);
        }

        return response()->json($order->load(['user', 'restaurant', 'items.food']));
    }
}
