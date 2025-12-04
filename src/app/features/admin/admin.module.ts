import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminSidebarComponent } from './layout/sidebar/sidebar.component';
import { AdminNavbarComponent } from './layout/navbar/navbar.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminSidebarComponent,
    AdminNavbarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
