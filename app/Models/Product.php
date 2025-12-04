<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'discount_price',
        'brand',
        'sizes',
        'colors',
        'images',
        'stock',
        'stock_alert_threshold',
        'is_visible',
        'is_approved',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'sizes' => 'array',
        'colors' => 'array',
        'images' => 'array',
        'stock' => 'integer',
        'is_visible' => 'boolean',
        'is_approved' => 'boolean',
    ];

    // Relations

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function stockAlerts()
    {
        return $this->hasMany(StockAlert::class);
    }

    // Scopes

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_visible', true)->where('is_approved', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock', '<=', 'stock_alert_threshold');
    }

    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    // Accessors

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getReviewsCountAttribute()
    {
        return $this->reviews()->count();
    }

    public function getFinalPriceAttribute()
    {
        return $this->discount_price ?? $this->price;
    }

    public function getIsOnSaleAttribute()
    {
        return $this->discount_price !== null && $this->discount_price < $this->price;
    }

    public function getDiscountPercentageAttribute()
    {
        if (!$this->is_on_sale) {
            return 0;
        }

        return round((($this->price - $this->discount_price) / $this->price) * 100);
    }
}
