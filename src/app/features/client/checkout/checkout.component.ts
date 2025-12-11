import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AddressService } from '../../../core/services/address.service';
import { Cart } from '../../../shared/models/cart.model';
import { Address, CreateOrderRequest } from '../../../shared/models/order.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  addresses: Address[] = [];
  selectedAddressId: number | null = null;
  selectedPaymentMethod: 'cash' | 'card' | 'wave' | 'orange_money' | 'free_money' | null = null;
  notes: string = '';

  loading = true;
  submitting = false;
  error: string | null = null;
  showAddressForm = false;

  newAddress: Partial<Address> = {
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    region: '',
    postal_code: '',
    country: 'Sénégal'
  };

  paymentMethods = [
    { value: 'cash' as const, label: 'Paiement à la livraison', icon: '💵' },
    { value: 'card' as const, label: 'Carte bancaire', icon: '💳' },
    { value: 'wave' as const, label: 'Wave', icon: '📱' },
    { value: 'orange_money' as const, label: 'Orange Money', icon: '📱' },
    { value: 'free_money' as const, label: 'Free Money', icon: '📱' }
  ];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Charger le panier
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cart = response.cart || response;

        // Vérifier que le panier n'est pas vide
        if (this.isEmpty) {
          this.error = 'Votre panier est vide.';
          this.loading = false;
          return;
        }

        // Charger les adresses
        this.addressService.getAddresses().subscribe({
          next: (response) => {
            this.addresses = response.addresses || [];

            // Sélectionner l'adresse par défaut
            const defaultAddress = this.addresses.find(addr => addr.is_default);
            if (defaultAddress) {
              this.selectedAddressId = defaultAddress.id;
            } else if (this.addresses.length > 0) {
              this.selectedAddressId = this.addresses[0].id;
            }

            this.loading = false;
          },
          error: (error) => {
            console.error('Erreur lors du chargement des adresses:', error);
            this.error = 'Impossible de charger les adresses.';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement du panier:', error);
        this.error = 'Impossible de charger le panier.';
        this.loading = false;
      }
    });
  }

  toggleAddressForm(): void {
    this.showAddressForm = !this.showAddressForm;
  }

  saveNewAddress(): void {
    if (!this.isNewAddressValid()) {
      return;
    }

    this.submitting = true;

    this.addressService.createAddress(this.newAddress).subscribe({
      next: (response) => {
        this.addresses.push(response.address);
        this.selectedAddressId = response.address.id;
        this.showAddressForm = false;
        this.resetNewAddress();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la création de l\'adresse:', error);
        alert('Impossible de créer l\'adresse. Veuillez réessayer.');
        this.submitting = false;
      }
    });
  }

  isNewAddressValid(): boolean {
    return !!(
      this.newAddress.full_name &&
      this.newAddress.phone &&
      this.newAddress.address_line1 &&
      this.newAddress.city &&
      this.newAddress.country
    );
  }

  resetNewAddress(): void {
    this.newAddress = {
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      region: '',
      postal_code: '',
      country: 'Sénégal'
    };
  }

  selectPaymentMethod(method: 'cash' | 'card' | 'wave' | 'orange_money' | 'free_money'): void {
    this.selectedPaymentMethod = method;
  }

  placeOrder(): void {
    if (!this.canPlaceOrder) {
      return;
    }

    if (!confirm('Confirmer la commande ?')) {
      return;
    }

    this.submitting = true;
    this.error = null;

    const orderData: CreateOrderRequest = {
      address_id: this.selectedAddressId!,
      payment_method: this.selectedPaymentMethod!,
      notes: this.notes || undefined
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        this.submitting = false;
        alert('Commande créée avec succès !');
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        console.error('Erreur lors de la création de la commande:', error);
        this.error = error.error?.message || 'Impossible de créer la commande. Veuillez réessayer.';
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  get isEmpty(): boolean {
    return !this.cart || !this.cart.items || this.cart.items.length === 0;
  }

  get totalItems(): number {
    return this.cart?.total_items || 0;
  }

  get subtotal(): number {
    return this.cart?.total_price || 0;
  }

  get shippingCost(): number {
    return 0; // TODO: Calculer selon la zone
  }

  get total(): number {
    return this.subtotal + this.shippingCost;
  }

  get canPlaceOrder(): boolean {
    return !!(
      this.selectedAddressId &&
      this.selectedPaymentMethod &&
      !this.isEmpty &&
      !this.submitting
    );
  }

  get selectedAddress(): Address | undefined {
    return this.addresses.find(addr => addr.id === this.selectedAddressId);
  }
}
