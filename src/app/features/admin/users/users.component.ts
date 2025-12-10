import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  template: `
    <h1>👥 Gestion des Utilisateurs</h1>

    <div class="filters">
      <select [(ngModel)]="roleFilter" (change)="loadUsers()">
        <option value="">Tous les rôles</option>
        <option value="client">Clients</option>
        <option value="vendeur">Vendeurs</option>
        <option value="admin">Administrateurs</option>
      </select>
      <select [(ngModel)]="statusFilter" (change)="loadUsers()">
        <option value="">Tous les statuts</option>
        <option value="active">Actifs</option>
        <option value="inactive">Inactifs</option>
      </select>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Statut</th>
          <th>Vérifié</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of users">
          <td>{{user.name}}</td>
          <td>{{user.email}}</td>
          <td><span class="badge role-{{user.role}}">{{getRoleLabel(user.role)}}</span></td>
          <td><span class="badge" [class.success]="user.is_active">{{user.is_active ? 'Actif' : 'Inactif'}}</span></td>
          <td><span class="badge" [class.success]="user.is_verified">{{user.is_verified ? '✓' : '✗'}}</span></td>
          <td>
            <button *ngIf="!user.is_active && user.role !== 'admin'" (click)="activateUser(user.id)" class="btn-sm success">Activer</button>
            <button *ngIf="user.is_active && user.role !== 'admin'" (click)="deactivateUser(user.id)" class="btn-sm warning">Désactiver</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div *ngIf="users.length === 0" class="empty-state">
      <p>Aucun utilisateur trouvé</p>
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; color: #2c3e50; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .filters select { padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px; }
    .table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .table th { background: #f8f9fa; font-weight: 600; color: #2c3e50; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; background: #ffc107; color: #000; }
    .badge.success { background: #4caf50; color: #fff; }
    .badge.role-admin { background: #e74c3c; color: #fff; }
    .badge.role-vendeur { background: #3498db; color: #fff; }
    .badge.role-client { background: #95a5a6; color: #fff; }
    .btn-sm { padding: 6px 12px; margin: 0 4px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
    .btn-sm.success { background: #4caf50; color: #fff; }
    .btn-sm.warning { background: #ff9800; color: #fff; }
    .empty-state { text-align: center; padding: 3rem; color: #7f8c8d; background: #fff; border-radius: 8px; margin-top: 20px; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  roleFilter = '';
  statusFilter = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const params: any = {};
    if (this.roleFilter) params.role = this.roleFilter;
    if (this.statusFilter) params.status = this.statusFilter;

    this.adminService.getAllUsers(params).subscribe({
      next: (data) => {
        this.users = data.data || data;
      },
      error: (e) => console.error('Erreur chargement utilisateurs:', e)
    });
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      'admin': 'Admin',
      'vendeur': 'Vendeur',
      'client': 'Client'
    };
    return labels[role] || role;
  }

  activateUser(id: number) {
    this.adminService.activateUser(id).subscribe({
      next: () => {
        alert('Utilisateur activé');
        this.loadUsers();
      },
      error: (e) => alert('Erreur')
    });
  }

  deactivateUser(id: number) {
    if (confirm('Désactiver cet utilisateur?')) {
      this.adminService.deactivateUser(id).subscribe({
        next: () => {
          alert('Utilisateur désactivé');
          this.loadUsers();
        },
        error: (e) => alert('Erreur')
      });
    }
  }
}
