import { Component, OnInit } from '@angular/core';
import { ProductService } from '@core/services/product.service';
import { Product, Category } from '@shared/models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredProducts: Product[] = [];
  newProducts: Product[] = [];
  onSaleProducts: Product[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Charger les catégories
    this.productService.getCategories().subscribe(response => {
      this.categories = response.categories;
    });

    // Charger les nouveautés
    this.productService.getNewArrivals(1, 8).subscribe(response => {
      this.newProducts = response.data;
      this.loading = false;
    });

    // Charger les promotions
    this.productService.getOnSaleProducts(1, 8).subscribe(response => {
      this.onSaleProducts = response.data;
    });

    // Charger les produits populaires
    this.productService.getPopularProducts(1, 8).subscribe(response => {
      this.featuredProducts = response.data;
    });
  }
}
