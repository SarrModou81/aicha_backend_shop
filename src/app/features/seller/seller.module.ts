import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerRoutingModule } from './seller-routing.module';
import { SellerDashboardComponent } from './dashboard/dashboard.component';
import { SellerSidebarComponent } from './layout/sidebar/sidebar.component';
import { SellerNavbarComponent } from './layout/navbar/navbar.component';

@NgModule({
  declarations: [
    SellerDashboardComponent,
    SellerSidebarComponent,
    SellerNavbarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SellerRoutingModule
  ]
})
export class SellerModule { }
