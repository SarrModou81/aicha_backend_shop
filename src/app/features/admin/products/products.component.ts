import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-products',
  template: `
    <h1>📦 Gestion des Produits</h1>
    <div class="filters">
      <select [(ngModel)]="filter" (change)="loadProducts()">
        <option value="all">Tous</option>
        <option value="pending">En attente</option>
        <option value="approved">Approuvés</option>
      </select>
    </div>
    <table class="table">
      <thead><tr><th>Image</th><th>Nom</th><th>Vendeur</th><th>Prix</th><th>Statut</th><th>Actions</th></tr></thead>
      <tbody>
        <tr *ngFor="let p of products">
          <td><img [src]="p.images?.[0]" class="thumb"/></td>
          <td>{{p.name}}</td>
          <td>{{p.seller?.name}}</td>
          <td>{{p.price | number}} FCFA</td>
          <td><span class="badge" [class.success]="p.is_approved">{{p.is_approved ? 'Approuvé' : 'En attente'}}</span></td>
          <td>
            <button *ngIf="!p.is_approved" (click)="approveProduct(p.id)" class="btn-sm success">✓ Approuver</button>
            <button *ngIf="!p.is_approved" (click)="rejectProduct(p.id)" class="btn-sm danger">✗ Rejeter</button>
            <button (click)="deleteProduct(p.id)" class="btn-sm danger">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`.thumb{width:50px;height:50px;object-fit:cover;border-radius:4px}.table{width:100%;border-collapse:collapse}.table th,.table td{padding:12px;text-align:left;border-bottom:1px solid #ddd}.badge{padding:4px 12px;border-radius:12px;font-size:12px;background:#ffc107;color:#000}.badge.success{background:#4caf50;color:#fff}.btn-sm{padding:6px 12px;margin:0 4px;border:none;border-radius:4px;cursor:pointer}.btn-sm.success{background:#4caf50;color:#fff}.btn-sm.danger{background:#f44336;color:#fff}.filters{margin-bottom:20px}`]
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  filter = 'all';

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    const method = this.filter === 'pending' ? this.adminService.getPendingProducts() : this.adminService.getAllProducts({ status: this.filter });
    method.subscribe({
      next: (data) => { this.products = Array.isArray(data) ? data : (data.data || []); },
      error: (e) => console.error(e)
    });
  }

  approveProduct(id: number) {
    this.adminService.approveProduct(id).subscribe({
      next: () => { alert('Produit approuvé'); this.loadProducts(); },
      error: (e) => alert('Erreur: ' + e.message)
    });
  }

  rejectProduct(id: number) {
    if (confirm('Rejeter ce produit?')) {
      this.adminService.rejectProduct(id).subscribe({
        next: () => { alert('Produit rejeté'); this.loadProducts(); },
        error: (e) => alert('Erreur: ' + e.message)
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('Supprimer ce produit?')) {
      this.adminService.deleteProduct(id).subscribe({
        next: () => { alert('Produit supprimé'); this.loadProducts(); },
        error: (e) => alert('Erreur: ' + e.message)
      });
    }
  }
}
