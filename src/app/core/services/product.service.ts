import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Product, Category, ProductFilter } from '@shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Lister les produits avec filtres
   */
  getProducts(filters?: ProductFilter): Observable<any> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ProductFilter];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.API_URL}/products`, { params });
  }

  /**
   * Détails d'un produit
   */
  getProduct(id: number): Observable<{ product: Product; average_rating: number; reviews_count: number }> {
    return this.http.get<any>(`${this.API_URL}/products/${id}`);
  }

  /**
   * Produits similaires
   */
  getSimilarProducts(id: number): Observable<{ products: Product[] }> {
    return this.http.get<any>(`${this.API_URL}/products/${id}/similar`);
  }

  /**
   * Produits en promotion
   */
  getOnSaleProducts(page = 1, perPage = 15): Observable<any> {
    return this.http.get(`${this.API_URL}/products/on-sale`, {
      params: { page: page.toString(), per_page: perPage.toString() }
    });
  }

  /**
   * Nouveautés
   */
  getNewArrivals(page = 1, perPage = 15): Observable<any> {
    return this.http.get(`${this.API_URL}/products/new-arrivals`, {
      params: { page: page.toString(), per_page: perPage.toString() }
    });
  }

  /**
   * Produits populaires
   */
  getPopularProducts(page = 1, perPage = 15): Observable<any> {
    return this.http.get(`${this.API_URL}/products/popular`, {
      params: { page: page.toString(), per_page: perPage.toString() }
    });
  }

  /**
   * Obtenir toutes les catégories
   */
  getCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<any>(`${this.API_URL}/categories`);
  }

  /**
   * Détails d'une catégorie
   */
  getCategory(id: number): Observable<{ category: Category }> {
    return this.http.get<any>(`${this.API_URL}/categories/${id}`);
  }

  /**
   * Produits d'une catégorie
   */
  getCategoryProducts(id: number, page = 1, perPage = 15): Observable<any> {
    return this.http.get(`${this.API_URL}/categories/${id}/products`, {
      params: { page: page.toString(), per_page: perPage.toString() }
    });
  }
}
