import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerLayoutComponent } from './layout/layout.component';
import { SellerDashboardComponent } from './dashboard/dashboard.component';
import { SellerProductListComponent } from './products/product-list/product-list.component';
import { SellerProductFormComponent } from './products/product-form/product-form.component';
import { SellerOrdersListComponent } from './orders/orders-list/orders-list.component';
import { SellerStockComponent } from './stock/stock.component';
import { SellerProfileComponent } from './profile/profile.component';
import { SellerSettingsComponent } from './settings/settings.component';
import { SellerStatisticsComponent } from './statistics/statistics.component';

const routes: Routes = [
  {
    path: '',
    component: SellerLayoutComponent,
    children: [
      { path: '', component: SellerDashboardComponent },
      { path: 'products', component: SellerProductListComponent },
      { path: 'products/add', component: SellerProductFormComponent },
      { path: 'products/edit/:id', component: SellerProductFormComponent },
      { path: 'orders', component: SellerOrdersListComponent },
      { path: 'statistics', component: SellerStatisticsComponent },
      { path: 'stock', component: SellerStockComponent },
      { path: 'profile', component: SellerProfileComponent },
      { path: 'settings', component: SellerSettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule { }
