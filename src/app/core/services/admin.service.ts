import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private API_URL = environment.apiUrl + '/admin';

  constructor(private http: HttpClient) {}

  // ========== Dashboard ==========
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

  getTopProducts(limit: number = 10): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/top-products`, {
      params: { limit: limit.toString() }
    });
  }

  // ========== Products Management ==========
  getAllProducts(params?: any): Observable<any> {
    return this.http.get(`${this.API_URL}/products`, { params });
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/products/${id}`);
  }

  approveProduct(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/products/${id}/approve`, {});
  }

  rejectProduct(id: number, reason?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/products/${id}/reject`, { reason });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/products/${id}`);
  }

  getPendingProducts(): Observable<any> {
    return this.http.get(`${this.API_URL}/products/pending`);
  }

  // ========== Categories Management ==========
  getAllCategories(): Observable<any> {
    return this.http.get(`${this.API_URL}/categories`);
  }

  getCategory(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/categories/${id}`);
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/categories`, data);
  }

  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/categories/${id}`);
  }

  // ========== Sellers Management ==========
  getAllSellers(params?: any): Observable<any> {
    return this.http.get(`${this.API_URL}/sellers`, { params });
  }

  getSeller(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/sellers/${id}`);
  }

  approveSeller(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/sellers/${id}/approve`, {});
  }

  suspendSeller(id: number, reason?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/sellers/${id}/suspend`, { reason });
  }

  activateSeller(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/sellers/${id}/activate`, {});
  }

  getPendingSellers(): Observable<any> {
    return this.http.get(`${this.API_URL}/sellers/pending`);
  }

  // ========== Users Management ==========
  getAllUsers(params?: any): Observable<any> {
    return this.http.get(`${this.API_URL}/users`, { params });
  }

  getUser(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/users/${id}`);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/users/${id}`);
  }

  banUser(id: number, reason?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${id}/ban`, { reason });
  }

  unbanUser(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${id}/unban`, {});
  }

  activateUser(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${id}/deactivate`, {});
  }

  // ========== Orders Management ==========
  getAllOrders(params?: any): Observable<any> {
    return this.http.get(`${this.API_URL}/orders`, { params });
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.API_URL}/orders/${id}/status`, { status });
  }

  markOrderAsDelivered(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/orders/${id}/mark-delivered`, {});
  }

  // ========== Statistics ==========
  getAdvancedStats(period?: string): Observable<any> {
    const url = `${this.API_URL}/statistics/advanced`;
    if (period) {
      return this.http.get(url, { params: { period } });
    }
    return this.http.get(url);
  }

  getRevenueByCategory(): Observable<any> {
    return this.http.get(`${this.API_URL}/statistics/revenue-by-category`);
  }

  getUserGrowth(): Observable<any> {
    return this.http.get(`${this.API_URL}/statistics/user-growth`);
  }

  getSellerPerformance(): Observable<any> {
    return this.http.get(`${this.API_URL}/statistics/seller-performance`);
  }

  // ========== Settings ==========
  getSettings(): Observable<any> {
    return this.http.get(`${this.API_URL}/settings`);
  }

  updateSettings(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/settings`, data);
  }

  getDeliveryZones(): Observable<any> {
    return this.http.get(`${this.API_URL}/settings/delivery-zones`);
  }

  createDeliveryZone(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/settings/delivery-zones`, data);
  }

  updateDeliveryZone(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/settings/delivery-zones/${id}`, data);
  }

  deleteDeliveryZone(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/settings/delivery-zones/${id}`);
  }
}
