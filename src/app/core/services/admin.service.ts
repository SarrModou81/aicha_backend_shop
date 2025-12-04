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

  /**
   * Obtenir les statistiques du dashboard
   */
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/stats`);
  }

  /**
   * Obtenir les commandes récentes
   */
  getRecentOrders(): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/recent-orders`);
  }

  /**
   * Obtenir les statistiques de ventes par mois
   */
  getSalesByMonth(year?: number): Observable<any> {
    const url = `${this.API_URL}/dashboard/sales-by-month`;
    if (year) {
      return this.http.get(url, { params: { year: year.toString() } });
    }
    return this.http.get(url);
  }

  /**
   * Obtenir les produits les plus vendus
   */
  getTopProducts(limit: number = 10): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/top-products`, {
      params: { limit: limit.toString() }
    });
  }
}
