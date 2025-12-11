import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientRoutingModule } from './client-routing.module';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { OrdersComponent } from './orders/orders.component';
import { PromotionsComponent } from './products/promotions/promotions.component';
import { NewArrivalsComponent } from './products/new-arrivals/new-arrivals.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

@NgModule({
  declarations: [
    HomeComponent,
    ProductListComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    OrdersComponent,
    OrderDetailComponent,
    PromotionsComponent,
    NewArrivalsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ClientRoutingModule
  ]
})
export class ClientModule { }
