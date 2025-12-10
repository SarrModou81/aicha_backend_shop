import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-settings',
  template: `
    <h1>⚙️ Paramètres Système</h1>

    <div class="settings-container">
      <div class="settings-section">
        <h2>Informations Générales</h2>
        <div class="form-group">
          <label>Nom de l'application</label>
          <input type="text" [(ngModel)]="settings.app_name" placeholder="AICHA SHOP"/>
        </div>
        <div class="form-group">
          <label>Email de contact</label>
          <input type="email" [(ngModel)]="settings.contact_email" placeholder="contact@aichashop.sn"/>
        </div>
        <div class="form-group">
          <label>Téléphone de contact</label>
          <input type="text" [(ngModel)]="settings.contact_phone" placeholder="+221 XX XXX XX XX"/>
        </div>
      </div>

      <div class="settings-section">
        <h2>Configuration des Commandes</h2>
        <div class="form-group">
          <label>Commission plateforme (%)</label>
          <input type="number" [(ngModel)]="settings.commission_rate" placeholder="10"/>
        </div>
        <div class="form-group">
          <label>Frais de livraison par défaut (FCFA)</label>
          <input type="number" [(ngModel)]="settings.default_shipping_cost" placeholder="2000"/>
        </div>
        <div class="form-group">
          <label>Seuil alerte stock</label>
          <input type="number" [(ngModel)]="settings.stock_alert_threshold" placeholder="5"/>
        </div>
      </div>

      <div class="settings-section">
        <h2>Zones de Livraison</h2>
        <div class="zones-list">
          <div *ngFor="let zone of deliveryZones" class="zone-item">
            <div class="zone-info">
              <strong>{{zone.name}}</strong>
              <span>{{zone.cost | number:'1.0-0'}} FCFA</span>
            </div>
            <button (click)="deleteZone(zone.id)" class="btn-delete">🗑️</button>
          </div>
        </div>
        <button (click)="showZoneForm = !showZoneForm" class="btn-primary">+ Ajouter une zone</button>

        <div *ngIf="showZoneForm" class="zone-form">
          <input type="text" [(ngModel)]="newZone.name" placeholder="Nom de la zone"/>
          <input type="number" [(ngModel)]="newZone.cost" placeholder="Coût de livraison"/>
          <button (click)="addZone()" class="btn-success">Ajouter</button>
          <button (click)="showZoneForm = false" class="btn-cancel">Annuler</button>
        </div>
      </div>

      <div class="actions">
        <button (click)="saveSettings()" class="btn-save">💾 Enregistrer les Paramètres</button>
      </div>
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 1.5rem; color: #2c3e50; }
    .settings-container { max-width: 800px; }
    .settings-section { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
    .settings-section h2 { margin-top: 0; color: #2c3e50; font-size: 1.2rem; margin-bottom: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #2c3e50; }
    .form-group input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
    .zones-list { margin-bottom: 1rem; }
    .zone-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8f9fa; border-radius: 4px; margin-bottom: 0.5rem; }
    .zone-info { display: flex; gap: 1rem; align-items: center; }
    .btn-delete { background: #f44336; color: #fff; border: none; padding: 0.5rem 0.75rem; border-radius: 4px; cursor: pointer; }
    .btn-primary { background: #3498db; color: #fff; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem; }
    .zone-form { margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 4px; }
    .zone-form input { width: calc(50% - 0.5rem); padding: 0.5rem; margin: 0.5rem 0.5rem 0.5rem 0; border: 1px solid #ddd; border-radius: 4px; }
    .btn-success { background: #4caf50; color: #fff; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; }
    .btn-cancel { background: #757575; color: #fff; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
    .actions { margin-top: 2rem; }
    .btn-save { background: #4caf50; color: #fff; padding: 1rem 2rem; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 600; }
  `]
})
export class AdminSettingsComponent implements OnInit {
  settings: any = {
    app_name: 'AICHA SHOP',
    contact_email: 'contact@aichashop.sn',
    contact_phone: '',
    commission_rate: 10,
    default_shipping_cost: 2000,
    stock_alert_threshold: 5
  };
  deliveryZones: any[] = [];
  showZoneForm = false;
  newZone: any = { name: '', cost: 0 };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadSettings();
    this.loadDeliveryZones();
  }

  loadSettings() {
    this.adminService.getSettings().subscribe({
      next: (data) => {
        this.settings = data || this.settings;
      },
      error: (e) => console.error('Erreur chargement paramètres:', e)
    });
  }

  loadDeliveryZones() {
    this.adminService.getDeliveryZones().subscribe({
      next: (data) => {
        this.deliveryZones = data || [];
      },
      error: (e) => console.error('Erreur zones:', e)
    });
  }

  saveSettings() {
    this.adminService.updateSettings(this.settings).subscribe({
      next: () => {
        alert('Paramètres enregistrés avec succès');
      },
      error: (e) => alert('Erreur lors de l\'enregistrement')
    });
  }

  addZone() {
    this.adminService.createDeliveryZone(this.newZone).subscribe({
      next: () => {
        this.loadDeliveryZones();
        this.newZone = { name: '', cost: 0 };
        this.showZoneForm = false;
        alert('Zone ajoutée');
      },
      error: (e) => alert('Erreur')
    });
  }

  deleteZone(id: number) {
    if (confirm('Supprimer cette zone?')) {
      this.adminService.deleteDeliveryZone(id).subscribe({
        next: () => {
          this.loadDeliveryZones();
          alert('Zone supprimée');
        },
        error: (e) => alert('Erreur')
      });
    }
  }
}
