<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaController extends Controller
{
    public function __construct(private MpesaService $mpesa) {}

    /**
     * POST /api/v1/mpesa/callback — Daraja callback endpoint (no auth)
     */
    public function callback(Request $request)
    {
        Log::info('M-Pesa Callback received', $request->all());

        $body = $request->input('Body.stkCallback');

        if (!$body) {
            return response()->json(['message' => 'Invalid callback payload.'], 400);
        }

        $resultCode = $body['ResultCode'] ?? -1;

        if ($resultCode !== 0) {
            Log::warning('M-Pesa STK Push failed', $body);
            return response()->json(['message' => 'Payment not successful.']);
        }

        // Extract reference (ORDER-{id}) from CallbackMetadata
        $metadata = collect($body['CallbackMetadata']['Item'] ?? [])
            ->keyBy('Name');

        $ref = optional($metadata->get('AccountReference'))->value;

        if (!$ref || !str_starts_with($ref, 'ORDER-')) {
            Log::error('Invalid payment reference in callback', $body);
            return response()->json(['message' => 'Invalid reference.'], 422);
        }

        $orderId = (int) str_replace('ORDER-', '', $ref);
        $order   = Order::find($orderId);

        if (!$order) {
            Log::error("Order #{$orderId} not found in M-Pesa callback.");
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if ($order->status === 'Pending') {
            $order->status      = 'Paid';
            $order->pickup_code = Order::generatePickupCode();
            $order->save();

            Log::info("Order #{$orderId} marked as Paid. Pickup code: {$order->pickup_code}");
        }

        return response()->json(['message' => 'Callback processed.']);
    }
}
