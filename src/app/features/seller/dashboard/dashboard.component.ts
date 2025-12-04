import { Component, OnInit } from '@angular/core';

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

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Charger les données depuis le backend
    setTimeout(() => {
      this.stats = {
        totalProducts: 45,
        totalOrders: 28,
        pendingOrders: 5,
        totalRevenue: 385000
      };
      this.loading = false;
    }, 1000);
  }
}
