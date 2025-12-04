import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss']
})
export class PromotionsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;
  perPage = 12;
  total = 0;

  Math = Math;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getOnSaleProducts(this.currentPage, this.perPage).subscribe({
      next: (response) => {
        this.products = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des promotions:', error);
        this.error = 'Impossible de charger les promotions. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        alert('Produit ajouté au panier !');
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout au panier:', error);
        alert('Impossible d\'ajouter le produit au panier.');
      }
    });
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
