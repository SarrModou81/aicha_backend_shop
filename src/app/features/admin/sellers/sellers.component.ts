import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-sellers',
  template: `
    <h1>🏪 Gestion des Vendeurs</h1>
    <table class="table">
      <thead><tr><th>Nom</th><th>Email</th><th>Produits</th><th>Statut</th><th>Actions</th></tr></thead>
      <tbody>
        <tr *ngFor="let s of sellers">
          <td>{{s.name}}</td>
          <td>{{s.email}}</td>
          <td>{{s.products_count || 0}}</td>
          <td><span class="badge" [class.success]="s.is_approved">{{s.is_approved ? 'Actif' : 'En attente'}}</span></td>
          <td>
            <button *ngIf="!s.is_approved" (click)="approveSeller(s.id)" class="btn-sm success">✓ Approuver</button>
            <button *ngIf="s.is_approved" (click)="suspendSeller(s.id)" class="btn-sm warning">⏸ Suspendre</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`.table{width:100%;border-collapse:collapse}.table th,.table td{padding:12px;text-align:left;border-bottom:1px solid #ddd}.badge{padding:4px 12px;border-radius:12px;font-size:12px;background:#ffc107;color:#000}.badge.success{background:#4caf50;color:#fff}.btn-sm{padding:6px 12px;margin:0 4px;border:none;border-radius:4px;cursor:pointer}.btn-sm.success{background:#4caf50;color:#fff}.btn-sm.warning{background:#ff9800;color:#fff}`]
})
export class AdminSellersComponent implements OnInit {
  sellers: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadSellers(); }

  loadSellers() {
    this.adminService.getAllSellers().subscribe({
      next: (data) => { this.sellers = Array.isArray(data) ? data : (data.data || []); },
      error: (e) => console.error(e)
    });
  }

  approveSeller(id: number) {
    this.adminService.approveSeller(id).subscribe({
      next: () => { alert('Vendeur approuvé'); this.loadSellers(); },
      error: (e) => alert('Erreur')
    });
  }

  suspendSeller(id: number) {
    if (confirm('Suspendre ce vendeur?')) {
      this.adminService.suspendSeller(id).subscribe({
        next: () => { alert('Vendeur suspendu'); this.loadSellers(); },
        error: (e) => alert('Erreur')
      });
    }
  }
}
