import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-statistics',
  template: `
    <h1>📊 Statistiques Avancées</h1>

    <div *ngIf="loading" class="loading">Chargement...</div>

    <div *ngIf="!loading" class="stats-container">
      <!-- Ventes par jour -->
      <div class="chart-section">
        <h2>Évolution des Ventes ({{selectedPeriod}} derniers jours)</h2>
        <div class="period-selector">
          <button (click)="changePeriod(7)" [class.active]="selectedPeriod === 7">7 jours</button>
          <button (click)="changePeriod(30)" [class.active]="selectedPeriod === 30">30 jours</button>
        </div>
        <div class="chart-container" *ngIf="salesByDay.length > 0">
          <svg class="line-chart" [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight">
            <!-- Grid lines -->
            <g class="grid">
              <line *ngFor="let line of gridLines"
                    [attr.x1]="chartPadding"
                    [attr.y1]="line"
                    [attr.x2]="chartWidth - chartPadding"
                    [attr.y2]="line"
                    class="grid-line" />
            </g>

            <!-- Revenue Area -->
            <path [attr.d]="revenueAreaPath" class="area-revenue" />

            <!-- Revenue Line -->
            <path [attr.d]="revenueLinePath" class="line-revenue" />

            <!-- Orders Line -->
            <path [attr.d]="ordersLinePath" class="line-orders" />

            <!-- Data points -->
            <circle *ngFor="let point of revenuePoints"
                    [attr.cx]="point.x"
                    [attr.cy]="point.y"
                    r="4"
                    class="point-revenue"
                    (mouseenter)="showTooltip(point.data, $event)"
                    (mouseleave)="hideTooltip()" />

            <circle *ngFor="let point of ordersPoints"
                    [attr.cx]="point.x"
                    [attr.cy]="point.y"
                    r="3"
                    class="point-orders" />
          </svg>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color revenue"></span>
              <span>Revenu (FCFA)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color orders"></span>
              <span>Nombre de commandes</span>
            </div>
          </div>
        </div>
        <div *ngIf="salesByDay.length === 0" style="text-align:center; padding: 2rem; color: #7f8c8d;">
          Aucune donnée de vente disponible
        </div>
      </div>

      <!-- Top produits -->
      <div class="top-products">
        <h2>Top 10 Produits</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Vendeur</th>
              <th>Ventes</th>
              <th>Revenu Estimé</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of topProducts">
              <td>{{product.name}}</td>
              <td>{{product.seller?.name || product.seller?.shop_name || 'N/A'}}</td>
              <td>{{product.total_sold || 0}} unités</td>
              <td>{{(product.total_sold || 0) * (product.discount_price || product.price || 0) | number:'1.0-0'}} FCFA</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="topProducts.length === 0" style="text-align:center; padding: 2rem; color: #7f8c8d;">
          Aucune donnée de vente disponible
        </div>
      </div>
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; color: #2c3e50; }
    .loading { text-align: center; padding: 3rem; }
    .chart-section { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .period-selector { margin: 1rem 0; display: flex; gap: 0.5rem; }
    .period-selector button { padding: 0.5rem 1rem; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; transition: all 0.3s; }
    .period-selector button:hover { background: #f8f9fa; }
    .period-selector button.active { background: #667eea; color: white; border-color: #667eea; }
    .chart-container { margin-top: 1.5rem; }
    .line-chart { width: 100%; height: 300px; }
    .grid-line { stroke: #e0e0e0; stroke-width: 1; }
    .area-revenue { fill: url(#revenueGradient); opacity: 0.2; }
    .line-revenue { fill: none; stroke: #667eea; stroke-width: 3; }
    .line-orders { fill: none; stroke: #f39c12; stroke-width: 2; stroke-dasharray: 5,5; }
    .point-revenue { fill: #667eea; stroke: white; stroke-width: 2; cursor: pointer; transition: r 0.2s; }
    .point-revenue:hover { r: 6; }
    .point-orders { fill: #f39c12; stroke: white; stroke-width: 1.5; }
    .chart-legend { display: flex; gap: 1.5rem; margin-top: 1rem; justify-content: center; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .legend-color { width: 20px; height: 3px; display: inline-block; }
    .legend-color.revenue { background: #667eea; }
    .legend-color.orders { background: #f39c12; }
    .top-products { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .table th { background: #f8f9fa; font-weight: 600; color: #2c3e50; }
  `]
})
export class AdminStatisticsComponent implements OnInit {
  loading = true;
  salesByDay: any[] = [];
  topProducts: any[] = [];
  selectedPeriod = 30;

  // Chart dimensions
  chartWidth = 800;
  chartHeight = 300;
  chartPadding = 40;

  // Chart data
  revenueLinePath = '';
  ordersLinePath = '';
  revenueAreaPath = '';
  revenuePoints: any[] = [];
  ordersPoints: any[] = [];
  gridLines: number[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStatistics();
  }

  changePeriod(days: number) {
    this.selectedPeriod = days;
    this.loadDailySales();
  }

  loadStatistics() {
    this.loading = true;
    this.loadDailySales();

    this.adminService.getTopProducts(10).subscribe({
      next: (data) => {
        this.topProducts = Array.isArray(data) ? data : [];
      },
      error: (e) => {
        console.error('Erreur top products:', e);
        this.topProducts = [];
      }
    });
  }

  loadDailySales() {
    this.adminService.getSalesByDay(this.selectedPeriod).subscribe({
      next: (response) => {
        console.log('Daily sales data received:', response);
        this.salesByDay = response.data || [];
        this.generateChart();
        this.loading = false;
      },
      error: (e) => {
        console.error('Erreur daily sales:', e);
        this.salesByDay = [];
        this.loading = false;
      }
    });
  }

  generateChart() {
    if (this.salesByDay.length === 0) return;

    const maxRevenue = Math.max(...this.salesByDay.map(d => d.total_revenue), 1);
    const maxOrders = Math.max(...this.salesByDay.map(d => d.total_orders), 1);

    const chartInnerWidth = this.chartWidth - 2 * this.chartPadding;
    const chartInnerHeight = this.chartHeight - 2 * this.chartPadding;

    // Generate grid lines
    this.gridLines = [0, 1, 2, 3, 4].map(i =>
      this.chartPadding + (chartInnerHeight / 4) * i
    );

    // Generate points
    this.revenuePoints = [];
    this.ordersPoints = [];
    const revenuePathPoints: string[] = [];
    const ordersPathPoints: string[] = [];
    const areaPoints: string[] = [];

    this.salesByDay.forEach((sale, index) => {
      const x = this.chartPadding + (index / (this.salesByDay.length - 1 || 1)) * chartInnerWidth;
      const yRevenue = this.chartHeight - this.chartPadding - (sale.total_revenue / maxRevenue) * chartInnerHeight;
      const yOrders = this.chartHeight - this.chartPadding - (sale.total_orders / maxOrders) * chartInnerHeight;

      this.revenuePoints.push({ x, y: yRevenue, data: sale });
      this.ordersPoints.push({ x, y: yOrders, data: sale });

      revenuePathPoints.push(`${index === 0 ? 'M' : 'L'} ${x} ${yRevenue}`);
      ordersPathPoints.push(`${index === 0 ? 'M' : 'L'} ${x} ${yOrders}`);

      if (index === 0) {
        areaPoints.push(`M ${x} ${this.chartHeight - this.chartPadding}`);
      }
      areaPoints.push(`L ${x} ${yRevenue}`);
    });

    // Close area path
    const lastX = this.chartPadding + chartInnerWidth;
    areaPoints.push(`L ${lastX} ${this.chartHeight - this.chartPadding} Z`);

    this.revenueLinePath = revenuePathPoints.join(' ');
    this.ordersLinePath = ordersPathPoints.join(' ');
    this.revenueAreaPath = areaPoints.join(' ');
  }

  showTooltip(data: any, event: MouseEvent) {
    // Implement tooltip if needed
    console.log('Show tooltip:', data);
  }

  hideTooltip() {
    // Implement tooltip hiding if needed
  }
}
