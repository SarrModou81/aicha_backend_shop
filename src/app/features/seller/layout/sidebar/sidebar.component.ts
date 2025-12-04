import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SellerSidebarComponent {
  isSidebarCollapsed = false;

  menuItems = [
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/seller',
      active: true
    },
    {
      label: 'Mes Produits',
      icon: '📦',
      route: '/seller/products',
      active: false
    },
    {
      label: 'Ajouter un produit',
      icon: '➕',
      route: '/seller/products/add',
      active: false
    },
    {
      label: 'Mes Commandes',
      icon: '🛒',
      route: '/seller/orders',
      active: false
    },
    {
      label: 'Statistiques',
      icon: '📈',
      route: '/seller/statistics',
      active: false
    },
    {
      label: 'Mon Profil',
      icon: '👤',
      route: '/seller/profile',
      active: false
    },
    {
      label: 'Paramètres',
      icon: '⚙️',
      route: '/seller/settings',
      active: false
    }
  ];

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateTo(route: string): void {
    this.menuItems.forEach(item => item.active = item.route === route);
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
