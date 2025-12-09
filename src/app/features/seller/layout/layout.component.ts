import { Component } from '@angular/core';

@Component({
  selector: 'app-seller-layout',
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>
      <div class="seller-main">
        <app-seller-navbar></app-seller-navbar>
        <div class="seller-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seller-layout {
      display: flex;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .seller-main {
      flex: 1;
      margin-left: 260px;
      transition: margin-left 0.3s ease;
    }

    .seller-content {
      margin-top: 70px;
      padding: 2rem;
      max-width: 1600px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (max-width: 768px) {
      .seller-main {
        margin-left: 70px;
      }

      .seller-content {
        padding: 1rem;
      }
    }

    @media (max-width: 480px) {
      .seller-main {
        margin-left: 0;
      }

      .seller-content {
        margin-top: 60px;
        padding: 0.75rem;
      }
    }
  `]
})
export class SellerLayoutComponent {}
