import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../../core/services/seller.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class SellerStockComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  loading = true;
  searchTerm = '';
  stockFilter = 'all'; // all, low, out
  currentPage = 1;
  totalPages = 1;
  perPage = 10;

  constructor(
    private sellerService: SellerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStock();
  }

  loadStock(): void {
    this.loading = true;
    this.sellerService.getStock().subscribe({
      next: (response) => {
        this.products = response.data || response;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du stock:', error);
        this.loading = false;
      }
    });
  }

  loadLowStock(): void {
    this.loading = true;
    this.sellerService.getLowStock().subscribe({
      next: (response) => {
        this.products = response.data || response;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits en rupture:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Filtre par terme de recherche
    if (this.searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtre par niveau de stock
    if (this.stockFilter === 'low') {
      filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10);
    } else if (this.stockFilter === 'out') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    this.filteredProducts = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStockFilterChange(): void {
    if (this.stockFilter === 'low') {
      this.loadLowStock();
    } else {
      this.loadStock();
    }
  }

  getStockStatus(product: any): string {
    if (product.stock === 0) {
      return 'Rupture';
    } else if (product.stock <= 10) {
      return 'Stock faible';
    }
    return 'En stock';
  }

  getStockClass(product: any): string {
    if (product.stock === 0) {
      return 'out-of-stock';
    } else if (product.stock <= 10) {
      return 'low-stock';
    }
    return 'in-stock';
  }

  updateStock(product: any): void {
    const newQuantity = prompt(`Quantité actuelle: ${product.stock}\nNouvelle quantité:`, product.stock.toString());

    if (newQuantity !== null && !isNaN(Number(newQuantity))) {
      const quantity = parseInt(newQuantity, 10);

      this.sellerService.updateStock(product.id, quantity).subscribe({
        next: (response) => {
          alert('Stock mis à jour avec succès');
          this.loadStock();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du stock:', error);
          alert('Erreur lors de la mise à jour du stock');
        }
      });
    }
  }

  viewProduct(product: any): void {
    this.router.navigate(['/seller/products/edit', product.id]);
  }
}
