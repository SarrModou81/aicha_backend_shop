<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
    ];

    protected $appends = [
        'total_items',
        'subtotal',
    ];

    // Relations

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    // Accessors

    public function getTotalItemsAttribute()
    {
        return $this->items->sum('quantity');
    }

    public function getSubtotalAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });
    }

    // Helper methods

    public function addItem($productId, $quantity = 1, $size = null, $color = null, $price = null)
    {
        $product = Product::findOrFail($productId);

        if ($price === null) {
            $price = $product->final_price;
        }

        // Check if item already exists with same attributes
        $existingItem = $this->items()
            ->where('product_id', $productId)
            ->where('size', $size)
            ->where('color', $color)
            ->first();

        if ($existingItem) {
            $existingItem->update([
                'quantity' => $existingItem->quantity + $quantity,
            ]);
            return $existingItem;
        }

        return $this->items()->create([
            'product_id' => $productId,
            'quantity' => $quantity,
            'size' => $size,
            'color' => $color,
            'price' => $price,
        ]);
    }

    public function clear()
    {
        return $this->items()->delete();
    }
}
