import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminSidebarComponent } from './layout/sidebar/sidebar.component';
import { AdminNavbarComponent } from './layout/navbar/navbar.component';
import { AdminProductsComponent } from './products/products.component';
import { AdminSellersComponent } from './sellers/sellers.component';
import { AdminCategoriesComponent } from './categories/categories.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminSidebarComponent,
    AdminNavbarComponent,
    AdminProductsComponent,
    AdminSellersComponent,
    AdminCategoriesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
