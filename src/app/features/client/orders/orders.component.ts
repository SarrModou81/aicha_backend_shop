import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  selectedStatus: string = 'all';
  statusOptions = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmées' },
    { value: 'processing', label: 'En préparation' },
    { value: 'shipped', label: 'Expédiées' },
    { value: 'delivered', label: 'Livrées' },
    { value: 'cancelled', label: 'Annulées' }
  ];

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.data || response.orders || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.error = 'Impossible de charger vos commandes. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
  }

  get filteredOrders(): Order[] {
    if (this.selectedStatus === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.selectedStatus);
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  cancelOrder(orderId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    const reason = prompt('Raison de l\'annulation (optionnel):') || 'Annulation par le client';

    this.orderService.cancelOrder(orderId, reason).subscribe({
      next: () => {
        alert('Commande annulée avec succès');
        this.loadOrders();
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation:', error);
        alert('Impossible d\'annuler la commande. ' + (error.error?.message || 'Elle est peut-être déjà expédiée.'));
      }
    });
  }

  getStatusBadgeClass(status: string, order?: any): string {
    // Utiliser status_color du backend si disponible
    if (order?.status_color) {
      const colorMap: { [key: string]: string } = {
        'warning': 'badge-warning',
        'info': 'badge-info',
        'purple': 'badge-purple',
        'primary': 'badge-primary',
        'secondary': 'badge-secondary',
        'success': 'badge-success',
        'danger': 'badge-danger'
      };
      return colorMap[order.status_color] || 'badge-default';
    }

    // Fallback
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'processing': 'badge-primary',
      'shipped': 'badge-secondary',
      'delivered': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return statusClasses[status] || 'badge-default';
  }

  getStatusLabel(status: string, order?: any): string {
    // Utiliser status_label du backend si disponible
    if (order?.status_label) {
      return order.status_label;
    }

    // Fallback
    const statusLabels: { [key: string]: string } = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'processing': 'En préparation',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusLabels[status] || status;
  }

  canCancelOrder(order: Order): boolean {
    // Utiliser can_be_cancelled du backend si disponible
    if (order.hasOwnProperty('can_be_cancelled')) {
      return (order as any).can_be_cancelled;
    }

    // Fallback - peut annuler tant que pas livrée ou déjà annulée
    return !['delivered', 'cancelled'].includes(order.status);
  }
}
