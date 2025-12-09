import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerRoutingModule } from './seller-routing.module';
import { SellerDashboardComponent } from './dashboard/dashboard.component';
import { SellerSidebarComponent } from './layout/sidebar/sidebar.component';
import { SellerNavbarComponent } from './layout/navbar/navbar.component';
import { SellerProductListComponent } from './products/product-list/product-list.component';
import { SellerProductFormComponent } from './products/product-form/product-form.component';
import { SellerOrdersListComponent } from './orders/orders-list/orders-list.component';
import { SellerStockComponent } from './stock/stock.component';
import { SellerProfileComponent } from './profile/profile.component';
import { SellerSettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    SellerDashboardComponent,
    SellerSidebarComponent,
    SellerNavbarComponent,
    SellerProductListComponent,
    SellerProductFormComponent,
    SellerOrdersListComponent,
    SellerStockComponent,
    SellerProfileComponent,
    SellerSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SellerRoutingModule
  ]
})
export class SellerModule { }
