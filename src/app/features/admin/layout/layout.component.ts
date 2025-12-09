import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      <div class="admin-main">
        <app-admin-navbar></app-admin-navbar>
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .admin-main {
      flex: 1;
      margin-left: 260px;
      transition: margin-left 0.3s ease;
    }

    .admin-content {
      margin-top: 70px;
      padding: 2rem;
      max-width: 1600px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (max-width: 768px) {
      .admin-main {
        margin-left: 70px;
      }

      .admin-content {
        padding: 1rem;
      }
    }

    @media (max-width: 480px) {
      .admin-main {
        margin-left: 0;
      }

      .admin-content {
        margin-top: 60px;
        padding: 0.75rem;
      }
    }
  `]
})
export class AdminLayoutComponent {}
