import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { LayoutModule } from '../../layout/layout.module';
// TODO: Importer les composants admin

@NgModule({
  declarations: [
    // TODO: Déclarer les composants
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    LayoutModule
  ]
})
export class AdminModule { }
