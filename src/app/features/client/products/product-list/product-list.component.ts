import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product, Category } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  perPage = 12;
  total = 0;

  // Filtres
  filters = {
    search: '',
    category_id: null as number | null,
    brand: '',
    min_price: null as number | null,
    max_price: null as number | null,
    size: '',
    color: '',
    on_sale: false
  };

  // Tri
  sortBy = 'created_at';
  sortOrder = 'desc';

  sortOptions = [
    { value: 'created_at', label: 'Plus récents', order: 'desc' },
    { value: 'price_asc', label: 'Prix croissant', order: 'asc' },
    { value: 'price_desc', label: 'Prix décroissant', order: 'desc' },
    { value: 'name', label: 'Nom A-Z', order: 'asc' },
    { value: 'rating', label: 'Meilleures notes', order: 'desc' }
  ];

  // Tailles et couleurs disponibles
  availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  availableColors = ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Gris'];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Charger les catégories
    this.loadCategories();

    // Récupérer les paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      if (params['category_id']) {
        this.filters.category_id = +params['category_id'];
      }
      if (params['search']) {
        this.filters.search = params['search'];
      }
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    const params: any = {
      page: this.currentPage,
      per_page: this.perPage,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
    };

    // Ajouter les filtres actifs
    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.category_id) params.category_id = this.filters.category_id;
    if (this.filters.brand) params.brand = this.filters.brand;
    if (this.filters.min_price) params.min_price = this.filters.min_price;
    if (this.filters.max_price) params.max_price = this.filters.max_price;
    if (this.filters.size) params.size = this.filters.size;
    if (this.filters.color) params.color = this.filters.color;
    if (this.filters.on_sale) params.on_sale = this.filters.on_sale;

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.data;
        this.currentPage = response.current_page;
        this.totalPages = response.last_page;
        this.total = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.error = 'Impossible de charger les produits. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      category_id: null,
      brand: '',
      min_price: null,
      max_price: null,
      size: '',
      color: '',
      on_sale: false
    };
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(event: any): void {
    const selectedOption = this.sortOptions.find(opt => opt.value === event.target.value);
    if (selectedOption) {
      this.sortBy = selectedOption.value;
      this.sortOrder = selectedOption.order;
      this.loadProducts();
    }
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
