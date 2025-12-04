import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerRoutingModule } from './seller-routing.module';
import { LayoutModule } from '../../layout/layout.module';
// TODO: Importer les composants seller

@NgModule({
  declarations: [
    // TODO: Déclarer les composants
  ],
  imports: [
    CommonModule,
    SellerRoutingModule,
    LayoutModule
  ]
})
export class SellerModule { }
