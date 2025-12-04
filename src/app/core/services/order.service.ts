import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderRequest } from '../../shared/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les commandes de l'utilisateur
   */
  getOrders(): Observable<any> {
    return this.http.get(`${this.API_URL}/client/orders`);
  }

  /**
   * Récupérer une commande spécifique
   */
  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/client/orders/${id}`);
  }

  /**
   * Créer une nouvelle commande
   */
  createOrder(data: CreateOrderRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/client/orders`, data);
  }

  /**
   * Annuler une commande
   */
  cancelOrder(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.API_URL}/client/orders/${id}/cancel`, { reason });
  }
}
