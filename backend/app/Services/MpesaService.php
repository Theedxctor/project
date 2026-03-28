<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class MpesaService
{
    private string $env;
    private string $consumerKey;
    private string $consumerSecret;
    private string $shortcode;
    private string $passkey;
    private string $callbackUrl;

    public function __construct()
    {
        $this->env            = config('mpesa.env', 'sandbox');
        $this->consumerKey    = config('mpesa.consumer_key');
        $this->consumerSecret = config('mpesa.consumer_secret');
        $this->shortcode      = config('mpesa.shortcode');
        $this->passkey        = config('mpesa.passkey');
        $this->callbackUrl    = config('mpesa.callback_url');
    }

    private function baseUrl(): string
    {
        return $this->env === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    /**
     * Get or cache an OAuth access token.
     */
    public function getAccessToken(): string
    {
        return Cache::remember('mpesa_token', 3500, function () {
            $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                ->get("{$this->baseUrl()}/oauth/v1/generate?grant_type=client_credentials");

            if ($response->failed()) {
                throw new \RuntimeException('Failed to get M-Pesa access token: ' . $response->body());
            }

            return $response->json('access_token');
        });
    }

    /**
     * Initiate an STK Push (Lipa Na M-Pesa Online).
     *
     * @param  string  $phone   Phone in 254XXXXXXXXX format
     * @param  int     $amount  Amount in KES (integer)
     * @param  string  $ref     Account reference (e.g. ORDER-42)
     * @param  string  $desc    Transaction description
     */
    public function stkPush(string $phone, int $amount, string $ref, string $desc, int $orderId = null): array
    {
        $timestamp = now()->format('YmdHis');
        $password  = base64_encode($this->shortcode . $this->passkey . $timestamp);

        $token = $this->getAccessToken();

        $response = Http::withToken($token)
            ->post("{$this->baseUrl()}/mpesa/stkpush/v1/processrequest", [
                'BusinessShortCode' => $this->shortcode,
                'Password'          => $password,
                'Timestamp'         => $timestamp,
                'TransactionType'   => 'CustomerPayBillOnline',
                'Amount'            => $amount,
                'PartyA'            => $phone,
                'PartyB'            => $this->shortcode,
                'PhoneNumber'       => $phone,
                'CallBackURL'       => $orderId ? $this->callbackUrl . '?order_id=' . $orderId : $this->callbackUrl,
                'AccountReference'  => $ref,
                'TransactionDesc'   => $desc,
            ]);

        return $response->json() ?? [];
    }
}
