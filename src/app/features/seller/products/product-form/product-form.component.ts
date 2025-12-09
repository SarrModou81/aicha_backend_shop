import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SellerService } from '../../../../core/services/seller.service';

@Component({
  selector: 'app-seller-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class SellerProductFormComponent implements OnInit {
  productId: number | null = null;
  isEditMode = false;
  loading = false;
  error: string | null = null;

  product = {
    name: '',
    description: '',
    price: 0,
    discount_price: null,
    stock: 0,
    sku: '',
    brand: '',
    category_id: null,
    is_active: true
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sellerService: SellerService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.productId;
    
    if (this.isEditMode) {
      this.loadProduct();
    }
  }

  loadProduct(): void {
    if (!this.productId) return;
    
    this.loading = true;
    this.sellerService.getProduct(this.productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Impossible de charger le produit';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.error = null;

    const request = this.isEditMode && this.productId
      ? this.sellerService.updateProduct(this.productId, this.product)
      : this.sellerService.createProduct(this.product);

    request.subscribe({
      next: () => {
        alert(this.isEditMode ? 'Produit modifié avec succès' : 'Produit créé avec succès');
        this.router.navigate(['/seller/products']);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Impossible de sauvegarder le produit';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/seller/products']);
  }
}
