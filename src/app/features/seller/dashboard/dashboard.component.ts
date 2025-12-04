import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../../core/services/seller.service';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class SellerDashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  };

  recentOrders: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.sellerService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = {
          totalProducts: data.total_products || 0,
          totalOrders: data.total_orders || 0,
          pendingOrders: data.pending_orders || 0,
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
    this.sellerService.getRecentOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders.slice(0, 5);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes récentes:', error);
      }
    });
  }
}
