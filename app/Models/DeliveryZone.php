<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'shipping_cost',
        'estimated_days',
        'is_active',
    ];

    protected $casts = [
        'shipping_cost' => 'decimal:2',
        'estimated_days' => 'integer',
        'is_active' => 'boolean',
    ];

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
