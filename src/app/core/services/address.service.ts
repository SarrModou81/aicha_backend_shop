import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address } from '../../shared/models/order.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les adresses de l'utilisateur
   */
  getAddresses(): Observable<{ addresses: Address[] }> {
    return this.http.get<any>(`${this.API_URL}/client/addresses`);
  }

  /**
   * Créer une nouvelle adresse
   */
  createAddress(data: Partial<Address>): Observable<any> {
    return this.http.post(`${this.API_URL}/client/addresses`, data);
  }

  /**
   * Mettre à jour une adresse
   */
  updateAddress(id: number, data: Partial<Address>): Observable<any> {
    return this.http.put(`${this.API_URL}/client/addresses/${id}`, data);
  }

  /**
   * Supprimer une adresse
   */
  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/client/addresses/${id}`);
  }

  /**
   * Définir une adresse par défaut
   */
  setDefaultAddress(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/client/addresses/${id}/set-default`, {});
  }
}
