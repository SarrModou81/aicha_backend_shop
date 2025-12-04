import { Component, OnInit } from '@angular/core';

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

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // TODO: Charger les données depuis le backend
    setTimeout(() => {
      this.stats = {
        totalProducts: 150,
        totalOrders: 89,
        totalUsers: 245,
        totalRevenue: 1245000
      };
      this.loading = false;
    }, 1000);
  }
}
