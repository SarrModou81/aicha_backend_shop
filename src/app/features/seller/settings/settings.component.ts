import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../../core/services/seller.service';

@Component({
  selector: 'app-seller-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SellerSettingsComponent implements OnInit {
  loading = true;
  saving = false;

  // Notification Settings
  notificationSettings = {
    email_notifications: true,
    order_notifications: true,
    stock_alerts: true,
    marketing_emails: false,
    sms_notifications: false
  };

  // Shop Settings
  shopSettings = {
    shop_name: '',
    shop_description: '',
    shop_logo: '',
    contact_email: '',
    contact_phone: '',
    business_hours: '',
    return_policy: '',
    shipping_info: ''
  };

  // Payment Settings
  paymentSettings = {
    bank_name: '',
    account_number: '',
    account_name: '',
    mobile_money_number: '',
    payment_method: 'bank'
  };

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    // Simulating API call - replace with actual API when available
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  updateNotificationSettings(): void {
    this.saving = true;
    // TODO: Implement API call
    setTimeout(() => {
      alert('Paramètres de notification mis à jour avec succès');
      this.saving = false;
    }, 500);
  }

  updateShopSettings(): void {
    if (!this.shopSettings.shop_name) {
      alert('Le nom de la boutique est obligatoire');
      return;
    }

    this.saving = true;
    // TODO: Implement API call
    setTimeout(() => {
      alert('Paramètres de la boutique mis à jour avec succès');
      this.saving = false;
    }, 500);
  }

  updatePaymentSettings(): void {
    if (this.paymentSettings.payment_method === 'bank' && !this.paymentSettings.bank_name) {
      alert('Les informations bancaires sont obligatoires');
      return;
    }

    if (this.paymentSettings.payment_method === 'mobile' && !this.paymentSettings.mobile_money_number) {
      alert('Le numéro de mobile money est obligatoire');
      return;
    }

    this.saving = true;
    // TODO: Implement API call
    setTimeout(() => {
      alert('Paramètres de paiement mis à jour avec succès');
      this.saving = false;
    }, 500);
  }

  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implement file upload logic
      console.log('File selected:', file.name);
    }
  }
}
