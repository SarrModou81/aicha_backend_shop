import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { Cart, CartItem } from '../../../shared/models/cart.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  error: string | null = null;
  updatingItem: number | null = null;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;

    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cart = response.cart;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du panier:', error);
        this.error = 'Impossible de charger le panier. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > item.product.stock) {
      return;
    }

    this.updatingItem = item.id;

    this.cartService.updateCartItem(item.id, newQuantity, item.size, item.color).subscribe({
      next: () => {
        this.loadCart();
        this.updatingItem = null;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la quantité:', error);
        alert('Impossible de mettre à jour la quantité.');
        this.updatingItem = null;
      }
    });
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }

  removeItem(item: CartItem): void {
    if (!confirm('Voulez-vous vraiment supprimer cet article du panier ?')) {
      return;
    }

    this.updatingItem = item.id;

    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.loadCart();
        this.updatingItem = null;
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de l\'article:', error);
        alert('Impossible de supprimer l\'article du panier.');
        this.updatingItem = null;
      }
    });
  }

  clearCart(): void {
    if (!confirm('Voulez-vous vraiment vider le panier ?')) {
      return;
    }

    this.loading = true;

    this.cartService.clearCart().subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Erreur lors du vidage du panier:', error);
        alert('Impossible de vider le panier.');
        this.loading = false;
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  get isEmpty(): boolean {
    return !this.cart || !this.cart.items || this.cart.items.length === 0;
  }

  get totalItems(): number {
    return this.cart?.total_items || 0;
  }

  get totalPrice(): number {
    return this.cart?.total_price || 0;
  }
}
