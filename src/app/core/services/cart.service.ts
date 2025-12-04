import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { Cart, AddToCartRequest } from '@shared/models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = environment.apiUrl;

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtenir le panier
   */
  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.API_URL}/client/cart`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  /**
   * Ajouter au panier
   */
  addToCart(productIdOrData: number | AddToCartRequest, quantity?: number, size?: string, color?: string): Observable<any> {
    let data: AddToCartRequest;

    if (typeof productIdOrData === 'number') {
      data = {
        product_id: productIdOrData,
        quantity: quantity || 1,
        size,
        color
      };
    } else {
      data = productIdOrData;
    }

    return this.http.post(`${this.API_URL}/client/cart/add`, data).pipe(
      tap(() => this.getCart().subscribe())
    );
  }

  /**
   * Mettre à jour la quantité
   */
  updateCartItem(itemId: number, quantity: number, size?: string, color?: string): Observable<any> {
    const data: any = { quantity };
    if (size) data.size = size;
    if (color) data.color = color;

    return this.http.put(`${this.API_URL}/client/cart/items/${itemId}`, data).pipe(
      tap(() => this.getCart().subscribe())
    );
  }

  /**
   * Retirer du panier
   */
  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/client/cart/items/${itemId}`).pipe(
      tap(() => this.getCart().subscribe())
    );
  }

  /**
   * Vider le panier
   */
  clearCart(): Observable<any> {
    return this.http.delete(`${this.API_URL}/client/cart/clear`).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  /**
   * Obtenir le nombre d'articles dans le panier
   */
  getCartItemsCount(): number {
    return this.cartSubject.value?.total_items || 0;
  }
}
