import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  similarProducts: Product[] = [];
  loading = false;
  error: string | null = null;

  selectedImage = 0;
  selectedSize: string | null = null;
  selectedColor: string | null = null;
  quantity = 1;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
        this.loadSimilarProducts(productId);
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getProduct(id).subscribe({
      next: (response) => {
        this.product = response.product;
        this.loading = false;

        // Sélectionner automatiquement la première taille et couleur si disponibles
        if (this.product.sizes && this.product.sizes.length > 0) {
          this.selectedSize = this.product.sizes[0];
        }
        if (this.product.colors && this.product.colors.length > 0) {
          this.selectedColor = this.product.colors[0];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.error = 'Impossible de charger le produit. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  loadSimilarProducts(id: number): void {
    this.productService.getSimilarProducts(id).subscribe({
      next: (response) => {
        this.similarProducts = response.products;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits similaires:', error);
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImage = index;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    // Vérifier que la taille et la couleur sont sélectionnées si nécessaires
    if (this.product.sizes && this.product.sizes.length > 0 && !this.selectedSize) {
      alert('Veuillez sélectionner une taille');
      return;
    }

    if (this.product.colors && this.product.colors.length > 0 && !this.selectedColor) {
      alert('Veuillez sélectionner une couleur');
      return;
    }

    this.cartService.addToCart(this.product.id, this.quantity, this.selectedSize || undefined, this.selectedColor || undefined).subscribe({
      next: () => {
        alert('Produit ajouté au panier !');
        this.quantity = 1; // Réinitialiser la quantité
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout au panier:', error);
        alert('Impossible d\'ajouter le produit au panier.');
      }
    });
  }

  viewSimilarProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get discountPercentage(): number {
    if (!this.product || !this.product.discount_price) return 0;
    return Math.round(((this.product.price - this.product.discount_price) / this.product.price) * 100);
  }

  get finalPrice(): number {
    if (!this.product) return 0;
    return this.product.discount_price || this.product.price;
  }

  get isInStock(): boolean {
    return this.product ? this.product.stock > 0 : false;
  }
}
