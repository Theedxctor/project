<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Food;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class FoodController extends Controller
{
    /**
     * GET /api/v1/foods — all foods (admin)
     */
    public function index(Request $request)
    {
        $foods = Food::with('restaurant')
            ->when($request->restaurant_id, fn($q) => $q->where('restaurant_id', $request->restaurant_id))
            ->get();

        return response()->json($foods);
    }

    /**
     * POST /api/v1/foods — add a food item
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'name'          => 'required|string|max:255',
            'price'         => 'required|numeric|min:0',
            'category'      => 'required|in:Morning,Evening,All-day',
            'image_path'    => 'nullable|string',
            'is_available'  => 'boolean',
        ]);

        $food = Food::create($data);

        return response()->json($food->load('restaurant'), 201);
    }

    /**
     * PATCH /api/v1/foods/{id}
     */
    public function update(Request $request, Food $food)
    {
        $data = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'price'        => 'sometimes|numeric|min:0',
            'category'     => 'sometimes|in:Morning,Evening,All-day',
            'image_path'   => 'nullable|string',
            'is_available' => 'sometimes|boolean',
        ]);

        $food->update($data);

        return response()->json($food->load('restaurant'));
    }

    /**
     * DELETE /api/v1/foods/{id}
     */
    public function destroy(Food $food)
    {
        $food->delete();

        return response()->json(['message' => 'Food item deleted.']);
    }
}
