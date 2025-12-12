import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error: string | null = null;
  cancelling = false;

  statusTimeline = [
    { key: 'pending', label: 'Commande passée', icon: '📝' },
    { key: 'confirmed', label: 'Confirmée', icon: '✅' },
    { key: 'processing', label: 'En préparation', icon: '📦' },
    { key: 'shipped', label: 'Expédiée', icon: '🚚' },
    { key: 'delivered', label: 'Livrée', icon: '🎉' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.loadOrder(Number(orderId));
    }
  }

  loadOrder(orderId: number): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrder(orderId).subscribe({
      next: (response: any) => {
        // L'API peut retourner directement l'order ou un objet avec une propriété order
        this.order = response.order || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la commande:', error);
        
        if (error.status === 404) {
          this.error = 'Commande introuvable.';
        } else if (error.status === 403) {
          this.error = 'Vous n\'avez pas accès à cette commande.';
          setTimeout(() => this.router.navigate(['/orders']), 2000);
        } else {
          this.error = 'Impossible de charger les détails de la commande.';
        }
        
        this.loading = false;
      }
    });
  }

  cancelOrder(): void {
    if (!this.order || !this.canCancelOrder()) {
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    const reason = prompt('Raison de l\'annulation (optionnel):') || 'Annulation par le client';

    this.cancelling = true;

    this.orderService.cancelOrder(this.order.id, reason).subscribe({
      next: () => {
        alert('Commande annulée avec succès');
        this.loadOrder(this.order!.id);
        this.cancelling = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation:', error);
        alert('Impossible d\'annuler la commande. ' + (error.error?.message || 'Elle est peut-être déjà expédiée.'));
        this.cancelling = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getStatusBadgeClass(status: string): string {
    // Utiliser status_color du backend si disponible
    if ((this.order as any)?.status_color) {
      const colorMap: { [key: string]: string } = {
        'warning': 'badge-warning',
        'info': 'badge-info',
        'purple': 'badge-purple',
        'primary': 'badge-primary',
        'secondary': 'badge-secondary',
        'success': 'badge-success',
        'danger': 'badge-danger'
      };
      return colorMap[(this.order as any).status_color] || 'badge-default';
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

  getStatusLabel(status: string): string {
    // Utiliser status_label du backend si disponible
    if ((this.order as any)?.status_label) {
      return (this.order as any).status_label;
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

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'cash_on_delivery': 'Paiement à la livraison',
      'cash': 'Paiement à la livraison',
      'card': 'Carte bancaire',
      'wave': 'Wave',
      'orange_money': 'Orange Money',
      'free_money': 'Free Money'
    };
    return labels[method] || method;
  }

  canCancelOrder(): boolean {
    if (!this.order) return false;

    // Utiliser can_be_cancelled du backend si disponible
    if ((this.order as any).hasOwnProperty('can_be_cancelled')) {
      return (this.order as any).can_be_cancelled;
    }

    // Fallback - peut annuler tant que pas livrée ou déjà annulée
    return !['delivered', 'cancelled'].includes(this.order.status);
  }

  isStatusCompleted(statusKey: string): boolean {
    if (!this.order) return false;

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(this.order.status);
    const checkIndex = statusOrder.indexOf(statusKey);

    return checkIndex <= currentIndex;
  }

  isStatusActive(statusKey: string): boolean {
    return this.order?.status === statusKey;
  }
}
