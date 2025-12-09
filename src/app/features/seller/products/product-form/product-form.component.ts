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
  uploading = false;
  error: string | null = null;

  product = {
    name: '',
    description: '',
    price: 0,
    discount_price: null,
    stock: 0,
    brand: '',
    category_id: null,
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    stock_alert_threshold: 5
  };

  selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];

  // Temporary inputs for sizes and colors
  newSize = '';
  newColor = '';

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
      next: (response: any) => {
        const productData = response.product || response;
        this.product = {
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price || 0,
          discount_price: productData.discount_price || null,
          stock: productData.stock || 0,
          brand: productData.brand || '',
          category_id: productData.category_id || null,
          images: productData.images || [],
          sizes: productData.sizes || [],
          colors: productData.colors || [],
          stock_alert_threshold: productData.stock_alert_threshold || 5
        };
        this.imagePreviewUrls = [...this.product.images];
        this.loading = false;
      },
      error: (error: any) => {
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

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Vérifier que c'est une image
        if (!file.type.startsWith('image/')) {
          alert('Veuillez sélectionner uniquement des images');
          continue;
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('La taille de l\'image ne doit pas dépasser 5MB');
          continue;
        }

        this.selectedFiles.push(file);

        // Créer une prévisualisation
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
    // Réinitialiser l'input
    event.target.value = '';
  }

  removeImage(index: number): void {
    this.imagePreviewUrls.splice(index, 1);

    // Si c'est une image déjà uploadée, la retirer des images du produit
    if (index < this.product.images.length) {
      this.product.images.splice(index, 1);
    } else {
      // Sinon, retirer du tableau des fichiers sélectionnés
      const fileIndex = index - this.product.images.length;
      this.selectedFiles.splice(fileIndex, 1);
    }
  }

  async uploadImages(): Promise<void> {
    if (this.selectedFiles.length === 0) return;

    this.uploading = true;

    for (const file of this.selectedFiles) {
      try {
        const response: any = await this.sellerService.uploadImage(file).toPromise();
        if (response && response.url) {
          this.product.images.push(response.url);
        }
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        alert('Erreur lors de l\'upload d\'une image');
      }
    }

    this.selectedFiles = [];
    this.uploading = false;
  }

  async onSubmitWithImages(): Promise<void> {
    // Validation
    if (!this.product.name || !this.product.description || !this.product.price) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.product.images.length === 0 && this.selectedFiles.length === 0) {
      alert('Veuillez ajouter au moins une image');
      return;
    }

    // Upload des nouvelles images d'abord
    await this.uploadImages();

    // Ensuite soumettre le formulaire
    this.onSubmit();
  }

  addSize(): void {
    if (this.newSize.trim()) {
      if (!this.product.sizes.includes(this.newSize.trim())) {
        this.product.sizes.push(this.newSize.trim());
      }
      this.newSize = '';
    }
  }

  removeSize(index: number): void {
    this.product.sizes.splice(index, 1);
  }

  addColor(): void {
    if (this.newColor.trim()) {
      if (!this.product.colors.includes(this.newColor.trim())) {
        this.product.colors.push(this.newColor.trim());
      }
      this.newColor = '';
    }
  }

  removeColor(index: number): void {
    this.product.colors.splice(index, 1);
  }
}
