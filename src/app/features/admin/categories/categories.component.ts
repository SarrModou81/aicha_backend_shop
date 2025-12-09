import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-categories',
  template: `
    <h1>🏷️ Gestion des Catégories</h1>
    <button (click)="showForm = !showForm" class="btn-primary">+ Ajouter</button>
    <div *ngIf="showForm" class="form">
      <input [(ngModel)]="category.name" placeholder="Nom"/>
      <input [(ngModel)]="category.description" placeholder="Description"/>
      <button (click)="saveCategory()" class="btn-success">Enregistrer</button>
      <button (click)="showForm = false" class="btn-cancel">Annuler</button>
    </div>
    <div *ngIf="categories.length === 0" class="empty-state">
      <p>Aucune catégorie pour le moment.</p>
    </div>
    <table *ngIf="categories.length > 0" class="table">
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
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; color: #2c3e50; }
    .table{width:100%;border-collapse:collapse;margin-top:20px;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,0.1);border-radius:8px;overflow:hidden}
    .table th,.table td{padding:12px;text-align:left;border-bottom:1px solid #ddd}
    .table th{background:#f8f9fa;font-weight:600;color:#2c3e50}
    .btn-primary,.btn-success,.btn-cancel,.btn-sm{padding:8px 16px;margin:5px;border:none;border-radius:4px;cursor:pointer;transition:all 0.3s}
    .btn-primary{background:#3498db;color:#fff}
    .btn-primary:hover{background:#2980b9}
    .btn-success{background:#4caf50;color:#fff}
    .btn-success:hover{background:#45a049}
    .btn-cancel{background:#757575;color:#fff}
    .btn-cancel:hover{background:#616161}
    .btn-sm{background:#3498db;color:#fff;padding:6px 12px}
    .btn-sm:hover{background:#2980b9}
    .btn-sm.danger{background:#f44336;color:#fff}
    .btn-sm.danger:hover{background:#da190b}
    .form{margin:20px 0;padding:20px;background:#fff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
    .form input{display:block;width:100%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:4px}
    .empty-state{text-align:center;padding:3rem;color:#7f8c8d;background:#fff;border-radius:8px;margin-top:20px}
  `]
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
