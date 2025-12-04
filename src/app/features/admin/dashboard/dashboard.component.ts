import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  };

  recentOrders: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

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
          totalOrders: data.total_orders || 0,
          totalUsers: data.total_users || 0,
          totalRevenue: data.total_revenue || 0
        };
        this.loading = false;
        this.loadRecentOrders();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      }
    });
  }

  loadRecentOrders(): void {
    this.adminService.getRecentOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders.slice(0, 3);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes récentes:', error);
      }
    });
  }
}
