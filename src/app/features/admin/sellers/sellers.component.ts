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
          <td>
            <span *ngIf="s.is_verified" class="status-approved">✓ Approuvé</span>
            <span *ngIf="!s.is_verified" class="badge-pending">En attente d'approbation</span>
          </td>
          <td>
            <button *ngIf="!s.is_verified" (click)="approveSeller(s.id)" class="btn-sm success">✓ Approuver</button>
            <button *ngIf="s.is_verified" (click)="disapproveSeller(s.id)" class="btn-sm danger">✗ Désapprouver</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    .table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
    .table th,.table td{padding:12px;text-align:left;border-bottom:1px solid #ddd}
    .table th{background:#f8f9fa;font-weight:600;color:#2c3e50}
    .status-approved{color:#4caf50;font-weight:600;font-size:14px}
    .badge-pending{padding:4px 12px;border-radius:12px;font-size:12px;background:#ffc107;color:#000}
    .btn-sm{padding:6px 12px;margin:0 4px;border:none;border-radius:4px;cursor:pointer;font-size:13px;transition:all 0.2s}
    .btn-sm.success{background:#4caf50;color:#fff}
    .btn-sm.success:hover{background:#45a049}
    .btn-sm.danger{background:#f44336;color:#fff}
    .btn-sm.danger:hover{background:#da190b}
  `]
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
    if (confirm('Approuver ce vendeur?')) {
      this.adminService.approveSeller(id).subscribe({
        next: () => { alert('Vendeur approuvé'); this.loadSellers(); },
        error: (e) => alert('Erreur')
      });
    }
  }

  disapproveSeller(id: number) {
    if (confirm('Désapprouver ce vendeur?')) {
      this.adminService.disapproveSeller(id).subscribe({
        next: () => { alert('Vendeur désapprouvé'); this.loadSellers(); },
        error: (e) => alert('Erreur')
      });
    }
  }
}
