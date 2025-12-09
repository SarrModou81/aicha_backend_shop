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
    this.sellerService.confirmOrder(order.id).subscribe({
      next: () => {
        order.status = 'confirmed';
        alert('Commande confirmée');
      },
      error: (error) => console.error('Erreur:', error)
    });
  }

  markAsShipped(order: any): void {
    this.sellerService.markAsShipped(order.id).subscribe({
      next: () => {
        order.status = 'shipped';
        alert('Commande marquée comme expédiée');
      },
      error: (error) => console.error('Erreur:', error)
    });
  }

  get filteredOrders(): any[] {
    if (this.statusFilter === 'all') return this.orders;
    return this.orders.filter(o => o.status === this.statusFilter);
  }
}
