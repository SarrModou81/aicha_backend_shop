import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SellerService } from '../../../../core/services/seller.service';

interface AvailableAction {
  name: string;
  label: string;
  method: string;
  endpoint: string;
  color: string;
  requires_tracking?: boolean;
}

interface SellerSummary {
  items_count: number;
  subtotal: string;
}

@Component({
  selector: 'app-seller-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class SellerOrderDetailComponent implements OnInit {
  order: any = null;
  sellerSummary: SellerSummary | null = null;
  availableActions: AvailableAction[] = [];
  loading = true;
  error: string | null = null;
  updating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sellerService: SellerService
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

    this.sellerService.getOrder(orderId).subscribe({
      next: (response) => {
        // Utiliser la nouvelle structure d'API
        this.order = response.order;
        this.sellerSummary = response.seller_summary;
        this.availableActions = response.available_actions || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la commande:', error);
        
        if (error.status === 403) {
          this.error = 'Vous n\'avez pas accès à cette commande.';
          setTimeout(() => this.router.navigate(['/seller/orders']), 2000);
        } else if (error.status === 404) {
          this.error = 'Commande introuvable.';
        } else {
          this.error = 'Impossible de charger les détails de la commande.';
        }
        
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/seller/orders']);
  }

  executeAction(action: AvailableAction): void {
    if (action.requires_tracking) {
      this.markAsShipped();
    } else if (action.name === 'confirm') {
      this.confirmOrder();
    } else if (action.name === 'processing') {
      this.markAsProcessing();
    }
  }

  confirmOrder(): void {
    if (!confirm('Confirmer cette commande ?')) {
      return;
    }

    this.updating = true;
    this.sellerService.confirmOrder(this.order.id).subscribe({
      next: () => {
        alert('Commande confirmée avec succès');
        this.loadOrder(this.order.id); // Recharger pour mettre à jour les actions disponibles
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de la confirmation: ' + (error.error?.message || 'Erreur inconnue'));
        this.updating = false;
      }
    });
  }

  markAsProcessing(): void {
    if (!confirm('Marquer cette commande en préparation ?')) {
      return;
    }

    this.updating = true;
    this.sellerService.markAsProcessing(this.order.id).subscribe({
      next: () => {
        alert('Commande marquée en préparation');
        this.loadOrder(this.order.id);
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour: ' + (error.error?.message || 'Erreur inconnue'));
        this.updating = false;
      }
    });
  }

  markAsShipped(): void {
    const trackingNumber = prompt('Entrez le numéro de suivi (optionnel):');

    this.updating = true;
    const payload = trackingNumber ? { tracking_number: trackingNumber } : {};
    
    this.sellerService.markAsShipped(this.order.id).subscribe({
      next: () => {
        alert('Commande marquée comme expédiée');
        this.loadOrder(this.order.id);
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour: ' + (error.error?.message || 'Erreur inconnue'));
        this.updating = false;
      }
    });
  }

  // Utiliser les valeurs du backend si disponibles
  getStatusBadgeClass(status: string): string {
    // Mapper les couleurs du backend aux classes CSS
    const colorMap: { [key: string]: string } = {
      'warning': 'badge-warning',
      'info': 'badge-info',
      'purple': 'badge-purple',
      'secondary': 'badge-secondary',
      'success': 'badge-success',
      'danger': 'badge-danger',
      'primary': 'badge-primary'
    };
    
    // Utiliser status_color du backend si disponible
    if (this.order?.status_color) {
      return colorMap[this.order.status_color] || 'badge-secondary';
    }
    
    // Fallback sur la logique locale
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'processing': 'badge-purple',
      'shipped': 'badge-secondary',
      'delivered': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    // Utiliser status_label du backend si disponible
    if (this.order?.status_label) {
      return this.order.status_label;
    }
    
    // Fallback sur la logique locale
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

  // Utiliser les actions disponibles du backend
  hasActions(): boolean {
    return this.availableActions && this.availableActions.length > 0;
  }
}
