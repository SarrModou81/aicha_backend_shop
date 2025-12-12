import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-statistics',
  template: `
    <h1>📊 Statistiques Avancées</h1>

    <div *ngIf="loading" class="loading">Chargement...</div>

    <div *ngIf="!loading" class="stats-container">
      <!-- Ventes par mois -->
      <div class="chart-section">
        <h2>Ventes par Mois ({{currentYear}})</h2>
        <div class="chart-container" *ngIf="salesByMonth.length > 0">
          <div class="chart-bars">
            <div *ngFor="let sale of salesByMonth" class="chart-bar-wrapper">
              <div class="chart-bar"
                   [style.height.%]="getBarHeight(sale.total_revenue)"
                   [class.empty-bar]="!sale.total_revenue">
                <span class="bar-value" *ngIf="sale.total_revenue > 0">
                  {{sale.total_revenue | number:'1.0-0'}}
                </span>
              </div>
              <span class="bar-label">{{getMonthName(sale.month)}}</span>
            </div>
          </div>
        </div>
        <div *ngIf="salesByMonth.length === 0" style="text-align:center; padding: 2rem; color: #7f8c8d;">
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
    .kpis-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .kpi-card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .kpi-label { font-size: 0.9rem; color: #7f8c8d; margin-bottom: 0.5rem; }
    .kpi-value { font-size: 1.8rem; font-weight: 700; color: #2c3e50; }
    .chart-section { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .chart-container { margin-top: 1.5rem; }
    .chart-bars { display: flex; justify-content: space-between; align-items: flex-end; height: 300px; gap: 0.5rem; }
    .chart-bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; }
    .chart-bar { width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px 4px 0 0; position: relative; min-height: 20px; }
    .chart-bar.empty-bar { background: #e0e0e0; min-height: 5px; opacity: 0.5; }
    .bar-value { position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
    .bar-label { margin-top: 0.5rem; font-size: 0.75rem; color: #7f8c8d; }
    .top-products { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .table th { background: #f8f9fa; font-weight: 600; color: #2c3e50; }
  `]
})
export class AdminStatisticsComponent implements OnInit {
  loading = true;
  stats: any = {};
  salesByMonth: any[] = [];
  topProducts: any[] = [];
  currentYear = new Date().getFullYear();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.loading = true;

    this.adminService.getSalesByMonth(this.currentYear).subscribe({
      next: (data) => {
        console.log('Sales data received:', data);
        if (Array.isArray(data) && data.length > 0) {
          this.salesByMonth = data;
        } else {
          // Générer les 12 mois avec des valeurs à 0 par défaut
          this.salesByMonth = this.generateEmptyMonths();
        }
        console.log('salesByMonth:', this.salesByMonth);
        this.loading = false;
      },
      error: (e) => {
        console.error('Erreur ventes:', e);
        // En cas d'erreur, générer quand même les 12 mois vides
        this.salesByMonth = this.generateEmptyMonths();
        this.loading = false;
      }
    });

    this.adminService.getTopProducts(10).subscribe({
      next: (data) => {
        console.log('Top products received:', data);
        this.topProducts = Array.isArray(data) ? data : [];
      },
      error: (e) => {
        console.error('Erreur top products:', e);
        this.topProducts = [];
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

  getBarHeight(value: number): number {
    if (this.salesByMonth.length === 0 || !value) return 0;
    const max = Math.max(...this.salesByMonth.map(s => s.total_revenue || 0));
    return max > 0 ? (value / max) * 100 : 0;
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[month - 1] || '';
  }
}
