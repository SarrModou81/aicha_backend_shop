import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class AdminSidebarComponent {
  isSidebarCollapsed = false;

  menuItems = [
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/admin',
      active: true
    },
    {
      label: 'Produits',
      icon: '📦',
      route: '/admin/products',
      active: false
    },
    {
      label: 'Catégories',
      icon: '🏷️',
      route: '/admin/categories',
      active: false
    },
    {
      label: 'Commandes',
      icon: '🛒',
      route: '/admin/orders',
      active: false
    },
    {
      label: 'Utilisateurs',
      icon: '👥',
      route: '/admin/users',
      active: false
    },
    {
      label: 'Vendeurs',
      icon: '🏪',
      route: '/admin/sellers',
      active: false
    },
    {
      label: 'Statistiques',
      icon: '📈',
      route: '/admin/statistics',
      active: false
    },
    {
      label: 'Paramètres',
      icon: '⚙️',
      route: '/admin/settings',
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
