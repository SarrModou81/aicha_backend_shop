import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    pendingProducts: 0,
    totalSellers: 0,
    pendingSellers: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalCategories: 0
  };

  recentOrders: any[] = [];
  topProducts: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = {
          totalProducts: data.total_products || 0,
          pendingProducts: data.pending_products || 0,
          totalSellers: data.total_sellers || 0,
          pendingSellers: data.pending_sellers || 0,
          totalOrders: data.total_orders || 0,
          totalUsers: data.total_users || 0,
          totalRevenue: data.total_revenue || 0,
          totalCategories: data.total_categories || 0
        };
        this.loading = false;
        this.loadRecentOrders();
        this.loadTopProducts();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      }
    });
  }

  loadRecentOrders(): void {
    this.adminService.getRecentOrders().subscribe({
      next: (response: any) => {
        this.recentOrders = (response.data || response || []).slice(0, 5);
      },
      error: () => {}
    });
  }

  loadTopProducts(): void {
    this.adminService.getTopProducts(5).subscribe({
      next: (products) => {
        this.topProducts = products || [];
      },
      error: () => {}
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
