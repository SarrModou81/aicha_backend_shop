import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SellerService } from '../../../../core/services/seller.service';

@Component({
  selector: 'app-seller-products',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class SellerProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  statusFilter = 'all';
  currentPage = 1;
  totalPages = 1;
  perPage = 10;
  total = 0;

  constructor(
    private sellerService: SellerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.sellerService.getProducts(this.currentPage, this.perPage).subscribe({
      next: (response) => {
        this.products = response.data || response;
        this.filteredProducts = this.products;
        this.currentPage = response.current_page || 1;
        this.totalPages = response.last_page || 1;
        this.total = response.total || this.products.length;
        this.loading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Impossible de charger les produits';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && product.is_active) ||
        (this.statusFilter === 'inactive' && !product.is_active);
      return matchesSearch && matchesStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  addProduct(): void {
    this.router.navigate(['/seller/products/add']);
  }

  editProduct(id: number): void {
    this.router.navigate(['/seller/products/edit', id]);
  }

  viewProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  toggleVisibility(product: any): void {
    this.sellerService.toggleProductVisibility(product.id).subscribe({
      next: () => {
        product.is_active = !product.is_active;
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Impossible de modifier la visibilité');
      }
    });
  }

  deleteProduct(product: any): void {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    
    this.sellerService.deleteProduct(product.id).subscribe({
      next: () => this.loadProducts(),
      error: (error) => {
        console.error('Erreur:', error);
        alert('Impossible de supprimer le produit');
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
