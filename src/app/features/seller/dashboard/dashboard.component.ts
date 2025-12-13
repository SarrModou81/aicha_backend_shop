import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SellerService } from '../../../core/services/seller.service';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class SellerDashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0
  };

  recentOrders: any[] = [];
  topProducts: any[] = [];
  salesByMonth: any[] = [];
  currentYear = new Date().getFullYear();
  loading = true;
  error: string | null = null;

  chartData: any;
  chartOptions: any;

  constructor(
    private sellerService: SellerService,
    private router: Router
  ) {}

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
          activeProducts: data.active_products || 0,
          totalOrders: data.total_orders || 0,
          pendingOrders: data.pending_orders || 0,
          confirmedOrders: data.confirmed_orders || 0,
          totalRevenue: data.total_revenue || 0
        };
        this.loading = false;
        this.loadRecentOrders();
        this.loadTopProducts();
        this.loadSalesChart();
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
      next: (response: any) => {
        this.recentOrders = response.data ? response.data.slice(0, 5) : (Array.isArray(response) ? response.slice(0, 5) : []);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes récentes:', error);
      }
    });
  }

  loadTopProducts(): void {
    this.sellerService.getTopProducts(5).subscribe({
      next: (products) => {
        this.topProducts = products;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits populaires:', error);
      }
    });
  }

  loadSalesChart(): void {
    this.sellerService.getSalesByDay(30).subscribe({
      next: (response) => {
        console.log('Seller daily sales data received:', response);
        this.salesByMonth = response.data || [];
        this.prepareSalesChart(this.salesByMonth);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ventes:', error);
        this.salesByMonth = [];
        this.prepareSalesChart([]);
      }
    });
  }

  generateEmptyMonths(): any[] {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push({
        month: i,
        total_orders: 0,
        total_revenue: 0
      });
    }
    return months;
  }

  prepareSalesChart(sales: any[]): void {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const labels = sales.map(s => monthNames[s.month - 1]);
    const revenue = sales.map(s => s.total_revenue || 0);

    this.chartData = {
      labels,
      revenue
    };
  }

  addProduct(): void {
    this.router.navigate(['/seller/products/add']);
  }

  viewOrders(): void {
    this.router.navigate(['/seller/orders']);
  }

  viewStatistics(): void {
    // Stay on dashboard
  }

  viewSettings(): void {
    this.router.navigate(['/seller/settings']);
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/seller/orders', orderId]);
  }

  getOrderStatus(status: string): string {
    const statusMap: any = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'processing': 'En préparation',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  }

  getOrderStatusClass(status: string): string {
    return status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'Hier';
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }

  getMonthName(month: number): string {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return monthNames[month - 1] || '';
  }

  getMaxRevenue(): number {
    if (this.salesByMonth.length === 0) return 1;
    return Math.max(...this.salesByMonth.map(s => s.total_revenue || 0));
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }
}
