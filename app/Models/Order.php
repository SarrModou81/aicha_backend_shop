<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'address_id',
        'subtotal',
        'shipping_cost',
        'total',
        'status',
        'tracking_number',
        'notes',
        'cancellation_reason',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected $appends = [
        'status_label',
        'status_color',
        'can_be_cancelled',
        'is_paid',
    ];

    // Boot method to generate order number

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (!$order->order_number) {
                $order->order_number = 'ORD-' . strtoupper(Str::random(10));
            }
        });
    }

    // Relations

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Scopes

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopeShipped($query)
    {
        return $query->where('status', 'shipped');
    }

    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    // Helper methods

    public function canBeCancelled(): bool
    {
        // Le client peut annuler tant que la commande n'est pas livrée ou déjà annulée
        return !in_array($this->status, ['delivered', 'cancelled']);
    }

    public function isPaid(): bool
    {
        return $this->payment && $this->payment->status === 'completed';
    }

    // Accessors pour le frontend

    public function getStatusLabelAttribute(): string
    {
        $labels = [
            'pending' => 'En attente',
            'confirmed' => 'Confirmée',
            'processing' => 'En préparation',
            'shipped' => 'Expédiée',
            'delivered' => 'Livrée',
            'cancelled' => 'Annulée',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    public function getStatusColorAttribute(): string
    {
        $colors = [
            'pending' => 'warning',      // Jaune
            'confirmed' => 'info',       // Bleu
            'processing' => 'purple',    // Violet
            'shipped' => 'secondary',    // Gris
            'delivered' => 'success',    // Vert
            'cancelled' => 'danger',     // Rouge
        ];

        return $colors[$this->status] ?? 'secondary';
    }

    public function getCanBeCancelledAttribute(): bool
    {
        return $this->canBeCancelled();
    }

    public function getIsPaidAttribute(): bool
    {
        return $this->isPaid();
    }
}
