import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerDashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: SellerDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule { }
