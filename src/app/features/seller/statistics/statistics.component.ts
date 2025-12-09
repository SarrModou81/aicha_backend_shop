import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../../core/services/seller.service';

@Component({
  selector: 'app-seller-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class SellerStatisticsComponent implements OnInit {
  stats = {
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0
  };

  salesByMonth: any[] = [];
  topProducts: any[] = [];
  recentOrders: any[] = [];

  selectedYear: number = new Date().getFullYear();
  selectedPeriod: string = 'year';

  loading = true;
  error: string | null = null;

  // Chart data
  salesChartData: any;
  productPerformanceData: any;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    // Load main stats
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
        this.loadSalesData();
        this.loadTopProducts();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      }
    });
  }

  loadSalesData(): void {
    this.sellerService.getSalesByMonth().subscribe({
      next: (sales) => {
        this.salesByMonth = sales;
        this.prepareSalesChart(sales);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ventes:', error);
        this.loading = false;
      }
    });
  }

  loadTopProducts(): void {
    this.sellerService.getTopProducts(10).subscribe({
      next: (products) => {
        this.topProducts = products;
        this.prepareProductPerformanceChart(products);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
      }
    });
  }

  prepareSalesChart(sales: any[]): void {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    this.salesChartData = {
      labels: sales.map(s => monthNames[s.month - 1]),
      revenue: sales.map(s => s.total_revenue || 0),
      orders: sales.map(s => s.total_orders || 0)
    };
  }

  prepareProductPerformanceChart(products: any[]): void {
    this.productPerformanceData = {
      labels: products.map(p => p.name),
      sales: products.map(p => p.total_sold || 0),
      revenue: products.map(p => (p.total_sold || 0) * (p.price || 0))
    };
  }

  getMonthName(month: number): string {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return monthNames[month - 1] || '';
  }

  getMaxValue(data: number[]): number {
    if (!data || data.length === 0) return 1;
    return Math.max(...data);
  }

  getMaxRevenue(): number {
    if (!this.salesChartData || !this.salesChartData.revenue) return 1;
    return this.getMaxValue(this.salesChartData.revenue);
  }

  getMaxOrders(): number {
    if (!this.salesChartData || !this.salesChartData.orders) return 1;
    return this.getMaxValue(this.salesChartData.orders);
  }

  getMaxProductSales(): number {
    if (!this.productPerformanceData || !this.productPerformanceData.sales) return 1;
    return this.getMaxValue(this.productPerformanceData.sales);
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadStatistics();
  }

  changeYear(year: number): void {
    this.selectedYear = year;
    this.loadStatistics();
  }

  getAverageOrderValue(): number {
    if (this.stats.totalOrders === 0) return 0;
    return this.stats.totalRevenue / this.stats.totalOrders;
  }

  getConversionRate(): number {
    if (this.stats.totalProducts === 0) return 0;
    return (this.stats.totalOrders / this.stats.totalProducts) * 100;
  }

  getProductPerformanceRate(): number {
    if (this.stats.totalProducts === 0) return 0;
    return (this.stats.activeProducts / this.stats.totalProducts) * 100;
  }
}
