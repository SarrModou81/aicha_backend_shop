import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-orders',
  template: `
    <h1>🛒 Gestion des Commandes</h1>

    <div class="filters">
      <select [(ngModel)]="statusFilter" (change)="loadOrders()">
        <option value="">Tous les statuts</option>
        <option value="pending">En attente</option>
        <option value="confirmed">Confirmée</option>
        <option value="processing">En traitement</option>
        <option value="shipped">Expédiée</option>
        <option value="delivered">Livrée</option>
        <option value="cancelled">Annulée</option>
      </select>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>#ID</th>
          <th>Client</th>
          <th>Montant</th>
          <th>Statut</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let order of orders">
          <td><strong>#{{order.id}}</strong></td>
          <td>{{order.user?.name || 'N/A'}}</td>
          <td>{{order.total | number:'1.0-0'}} FCFA</td>
          <td><span class="badge status-{{order.status}}">{{getStatusLabel(order.status)}}</span></td>
          <td>{{formatDate(order.created_at)}}</td>
          <td>
            <button *ngIf="order.status === 'shipped'" (click)="markAsDelivered(order.id)" class="btn-sm success">Marquer livrée</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div *ngIf="orders.length === 0" class="empty-state">
      <p>Aucune commande trouvée</p>
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; color: #2c3e50; }
    .filters { margin-bottom: 1.5rem; }
    .filters select { padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px; }
    .table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .table th { background: #f8f9fa; font-weight: 600; color: #2c3e50; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; background: #ffc107; color: #000; }
    .badge.status-pending { background: #ffc107; color: #000; }
    .badge.status-confirmed { background: #2196F3; color: #fff; }
    .badge.status-processing { background: #FF9800; color: #fff; }
    .badge.status-shipped { background: #9C27B0; color: #fff; }
    .badge.status-delivered { background: #4caf50; color: #fff; }
    .badge.status-cancelled { background: #f44336; color: #fff; }
    .btn-sm { padding: 6px 12px; margin: 0 4px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
    .btn-sm.success { background: #4caf50; color: #fff; }
    .empty-state { text-align: center; padding: 3rem; color: #7f8c8d; background: #fff; border-radius: 8px; margin-top: 20px; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  statusFilter = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;

    this.adminService.getAllOrders(params).subscribe({
      next: (data) => {
        this.orders = data.data || data;
      },
      error: (e) => console.error('Erreur chargement commandes:', e)
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'processing': 'En traitement',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  markAsDelivered(id: number) {
    if (confirm('Marquer cette commande comme livrée?')) {
      this.adminService.markOrderAsDelivered(id).subscribe({
        next: () => {
          alert('Commande marquée comme livrée');
          this.loadOrders();
        },
        error: (e) => alert('Erreur')
      });
    }
  }
}
