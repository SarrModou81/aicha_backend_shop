import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SellerService } from '../../../../core/services/seller.service';

@Component({
  selector: 'app-seller-orders',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class SellerOrdersListComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  error: string | null = null;
  statusFilter = 'all';
  updatingOrderId: number | null = null;

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
    private sellerService: SellerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.sellerService.getOrders().subscribe({
      next: (response) => {
        this.orders = response.data || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Impossible de charger les commandes';
        this.loading = false;
      }
    });
  }

  viewOrder(id: number): void {
    this.router.navigate(['/seller/orders', id]);
  }

  confirmOrder(order: any): void {
    if (!confirm('Confirmer cette commande ?')) {
      return;
    }

    this.updatingOrderId = order.id;
    this.sellerService.confirmOrder(order.id).subscribe({
      next: () => {
        order.status = 'confirmed';
        alert('Commande confirmée avec succès');
        this.updatingOrderId = null;
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de la confirmation de la commande');
        this.updatingOrderId = null;
      }
    });
  }

  markAsProcessing(order: any): void {
    if (!confirm('Marquer cette commande en préparation ?')) {
      return;
    }

    this.updatingOrderId = order.id;
    this.sellerService.markAsProcessing(order.id).subscribe({
      next: () => {
        order.status = 'processing';
        alert('Commande marquée en préparation');
        this.updatingOrderId = null;
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour');
        this.updatingOrderId = null;
      }
    });
  }

  markAsShipped(order: any): void {
    const trackingNumber = prompt('Entrez le numéro de suivi (optionnel):');

    this.updatingOrderId = order.id;
    this.sellerService.markAsShipped(order.id).subscribe({
      next: () => {
        order.status = 'shipped';
        if (trackingNumber) {
          order.tracking_number = trackingNumber;
        }
        alert('Commande marquée comme expédiée');
        this.updatingOrderId = null;
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour');
        this.updatingOrderId = null;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
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

  getStatusLabel(status: string): string {
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

  canConfirm(order: any): boolean {
    return order.status === 'pending';
  }

  canMarkAsProcessing(order: any): boolean {
    return order.status === 'confirmed';
  }

  canMarkAsShipped(order: any): boolean {
    return order.status === 'processing';
  }

  get filteredOrders(): any[] {
    if (this.statusFilter === 'all') return this.orders;
    return this.orders.filter(o => o.status === this.statusFilter);
  }
}
