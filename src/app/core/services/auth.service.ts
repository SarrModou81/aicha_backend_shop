import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'aicha_shop_token';
  private readonly USER_KEY = 'aicha_shop_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Connexion
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        this.storeAuthData(response.token, response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Inscription
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data).pipe(
      tap(response => {
        this.storeAuthData(response.token, response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearAuthData();
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
      })
    );
  }

  /**
   * Obtenir l'utilisateur connecté
   */
  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/auth/me`).pipe(
      tap(response => {
        this.storeUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Mettre à jour le profil
   */
  updateProfile(data: Partial<User>): Observable<any> {
    return this.http.put(`${this.API_URL}/auth/profile`, data);
  }

  /**
   * Changer le mot de passe
   */
  changePassword(data: { current_password: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.put(`${this.API_URL}/auth/password`, data);
  }

  /**
   * Stocker les données d'authentification
   */
  private storeAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Stocker l'utilisateur
   */
  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Supprimer les données d'authentification
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Obtenir le token stocké
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtenir l'utilisateur stocké
   */
  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtenir le rôle de l'utilisateur actuel
   */
  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }
}
