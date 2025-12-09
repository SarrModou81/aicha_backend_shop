import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/layout.component';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminProductsComponent } from './products/products.component';
import { AdminSellersComponent } from './sellers/sellers.component';
import { AdminCategoriesComponent } from './categories/categories.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'sellers', component: AdminSellersComponent },
      { path: 'categories', component: AdminCategoriesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
