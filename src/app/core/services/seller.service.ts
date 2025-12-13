import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private API_URL = environment.apiUrl + '/seller';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/stats`);
  }

  getRecentOrders(): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/recent-orders`);
  }

  getSalesByMonth(year?: number): Observable<any> {
    const url = `${this.API_URL}/dashboard/sales-by-month`;
    if (year) {
      return this.http.get(url, { params: { year: year.toString() } });
    }
    return this.http.get(url);
  }

  getSalesByDay(days: number = 30): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/sales-by-day`, {
      params: { days: days.toString() }
    });
  }

  getTopProducts(limit: number = 10): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/top-products`, {
      params: { limit: limit.toString() }
    });
  }

  // Products
  getProducts(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.API_URL}/products`, {
      params: { page: page.toString(), per_page: perPage.toString() }
    });
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/products/${id}`);
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/products`, data);
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/products/${id}`);
  }

  toggleProductVisibility(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/products/${id}/toggle-visibility`, {});
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.API_URL}/products/upload-image`, formData);
  }

  // Orders
  getOrders(page: number = 1): Observable<any> {
    return this.http.get(`${this.API_URL}/orders`, {
      params: { page: page.toString() }
    });
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/orders/${id}`);
  }

  confirmOrder(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/orders/${id}/confirm`, {});
  }

  markAsProcessing(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/orders/${id}/processing`, {});
  }

  markAsShipped(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/orders/${id}/shipped`, {});
  }

  // Stock
  getStock(): Observable<any> {
    return this.http.get(`${this.API_URL}/stock`);
  }

  getLowStock(): Observable<any> {
    return this.http.get(`${this.API_URL}/stock/low-stock`);
  }

  updateStock(productId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.API_URL}/stock/products/${productId}`, { stock: quantity });
  }
}
