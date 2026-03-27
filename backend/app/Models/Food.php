<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    use HasFactory;

    protected $table = 'foods';

    protected $fillable = [
        'restaurant_id',
        'name',
        'price',
        'category',
        'image_path',
        'is_available',
    ];

    protected $casts = [
        'price'        => 'decimal:2',
        'is_available' => 'boolean',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope: filter foods visible right now based on time of day.
     * Morning  → before 11:00 AM
     * Evening  → 11:00 AM and after
     * All-day  → always visible
     */
    public function scopeTimeSensitive($query)
    {
        $hour = now()->hour;

        return $query->where(function ($q) use ($hour) {
            $q->where('category', 'All-day')
              ->orWhere(function ($q2) use ($hour) {
                  if ($hour < 11) {
                      $q2->where('category', 'Morning');
                  } else {
                      $q2->where('category', 'Evening');
                  }
              });
        });
    }
}
