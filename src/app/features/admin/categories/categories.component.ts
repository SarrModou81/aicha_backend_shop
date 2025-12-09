import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-categories',
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      <div class="admin-main">
        <app-admin-navbar></app-admin-navbar>
        <div class="admin-content">
          <h1>🏷️ Gestion des Catégories</h1>
          <button (click)="showForm = !showForm" class="btn-primary">+ Ajouter</button>
          <div *ngIf="showForm" class="form">
            <input [(ngModel)]="category.name" placeholder="Nom"/>
            <input [(ngModel)]="category.description" placeholder="Description"/>
            <button (click)="saveCategory()" class="btn-success">Enregistrer</button>
            <button (click)="showForm = false" class="btn-cancel">Annuler</button>
          </div>
          <table class="table">
            <thead><tr><th>Nom</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td>{{c.name}}</td>
                <td>{{c.description}}</td>
                <td>
                  <button (click)="editCategory(c)" class="btn-sm">✏️</button>
                  <button (click)="deleteCategory(c.id)" class="btn-sm danger">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`.table{width:100%;border-collapse:collapse}.table th,.table td{padding:12px;text-align:left;border-bottom:1px solid #ddd}.btn-primary,.btn-success,.btn-cancel,.btn-sm{padding:8px 16px;margin:5px;border:none;border-radius:4px;cursor:pointer}.btn-primary{background:#2196F3;color:#fff}.btn-success{background:#4caf50;color:#fff}.btn-cancel{background:#757575;color:#fff}.btn-sm.danger{background:#f44336;color:#fff}.form{margin:20px 0;padding:20px;background:#f5f5f5;border-radius:8px}.form input{display:block;width:100%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:4px}`]
})
export class AdminCategoriesComponent implements OnInit {
  categories: any[] = [];
  category: any = {};
  showForm = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadCategories(); }

  loadCategories() {
    this.adminService.getAllCategories().subscribe({
      next: (data) => { this.categories = Array.isArray(data) ? data : (data.data || []); },
      error: (e) => console.error(e)
    });
  }

  saveCategory() {
    const req = this.category.id ? this.adminService.updateCategory(this.category.id, this.category) : this.adminService.createCategory(this.category);
    req.subscribe({
      next: () => { this.loadCategories(); this.category = {}; this.showForm = false; },
      error: (e) => alert('Erreur')
    });
  }

  editCategory(c: any) {
    this.category = {...c};
    this.showForm = true;
  }

  deleteCategory(id: number) {
    if (confirm('Supprimer?')) {
      this.adminService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
        error: (e) => alert('Erreur')
      });
    }
  }
}
