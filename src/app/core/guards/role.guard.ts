import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRole = route.data['role'];

    if (this.authService.hasRole(requiredRole)) {
      return true;
    }

    // Rediriger vers la page d'accueil si l'utilisateur n'a pas le bon rôle
    this.router.navigate(['/']);
    return false;
  }
}
