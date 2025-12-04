import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { User } from '@shared/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  cartItemsCount = 0;
  isMenuOpen = false;
  isUserMenuOpen = false;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner à l'utilisateur actuel
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      // Charger le panier si c'est un client
      if (user && user.role === 'client') {
        this.cartService.getCart().subscribe();
      }
    });

    // S'abonner au nombre d'articles dans le panier
    this.cartService.cart$.subscribe(cart => {
      this.cartItemsCount = cart?.total_items || 0;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.isUserMenuOpen = false; // Fermer le menu utilisateur si ouvert
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeMenus(): void {
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // L'erreur est déjà gérée dans le service, pas besoin d'action supplémentaire
      }
    });
    this.closeMenus();
  }

  navigateToDashboard(): void {
    if (this.currentUser) {
      switch (this.currentUser.role) {
        case 'admin':
          this.router.navigate(['/admin']);
          break;
        case 'vendeur':
          this.router.navigate(['/seller']);
          break;
        case 'client':
        default:
          this.router.navigate(['/']);
          break;
      }
    }
  }
}
