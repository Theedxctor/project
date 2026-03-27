<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RestaurantController extends Controller
{
    /**
     * GET /api/v1/restaurants — public list of all restaurants
     */
    public function index()
    {
        $restaurants = Restaurant::withCount(['foods', 'orders'])->get();

        return response()->json($restaurants);
    }

    /**
     * GET /api/v1/restaurants/{slug}/menu — time-sensitive menu for a restaurant
     */
    public function menu(Request $request, string $slug)
    {
        $restaurant = Restaurant::where('slug', $slug)->firstOrFail();

        $hour = now()->hour; // EAT as server time

        $foods = $restaurant->foods()
            ->where('is_available', true)
            ->where(function ($q) use ($hour) {
                $q->where('category', 'All-day')
                  ->orWhere(function ($q2) use ($hour) {
                      $q2->where('category', $hour < 11 ? 'Morning' : 'Evening');
                  });
            })
            ->get();

        return response()->json([
            'restaurant'    => $restaurant,
            'menu_category' => $hour < 11 ? 'Morning' : 'Evening',
            'foods'         => $foods,
        ]);
    }

    /**
     * POST /api/v1/restaurants — admin creates a new restaurant
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'   => 'required|string|max:255',
            'image'  => 'nullable|string',
            'status' => 'in:Open,Closed',
        ]);

        $data['slug'] = Str::slug($data['name']);

        $restaurant = Restaurant::create($data);

        return response()->json($restaurant, 201);
    }

    /**
     * PATCH /api/v1/restaurants/{id} — admin updates a restaurant
     */
    public function update(Request $request, Restaurant $restaurant)
    {
        $data = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'image'  => 'nullable|string',
            'status' => 'sometimes|in:Open,Closed',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $restaurant->update($data);

        return response()->json($restaurant);
    }

    /**
     * DELETE /api/v1/restaurants/{id}
     */
    public function destroy(Restaurant $restaurant)
    {
        $restaurant->delete();

        return response()->json(['message' => 'Restaurant deleted.']);
    }
}
