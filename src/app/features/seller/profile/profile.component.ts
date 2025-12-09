import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../../core/services/seller.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-seller-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class SellerProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  editMode = false;
  saving = false;

  profileForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: ''
  };

  passwordForm = {
    current_password: '',
    password: '',
    password_confirmation: ''
  };

  constructor(
    private sellerService: SellerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (response: any) => {
        this.user = response.user || response;
        this.profileForm = {
          name: this.user.name || '',
          email: this.user.email || '',
          phone: this.user.phone || '',
          address: this.user.address || '',
          city: this.user.city || '',
          country: this.user.country || '',
          bio: this.user.bio || ''
        };
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.loading = false;
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Reset form if cancelled
      this.profileForm = {
        name: this.user.name || '',
        email: this.user.email || '',
        phone: this.user.phone || '',
        address: this.user.address || '',
        city: this.user.city || '',
        country: this.user.country || '',
        bio: this.user.bio || ''
      };
    }
  }

  updateProfile(): void {
    this.saving = true;
    this.authService.updateProfile(this.profileForm).subscribe({
      next: (response) => {
        alert('Profil mis à jour avec succès');
        this.user = response.user || response;
        this.editMode = false;
        this.saving = false;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        alert('Erreur lors de la mise à jour du profil');
        this.saving = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.password !== this.passwordForm.password_confirmation) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.passwordForm.password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    this.saving = true;
    this.authService.changePassword(this.passwordForm).subscribe({
      next: (response: any) => {
        alert('Mot de passe modifié avec succès');
        this.passwordForm = {
          current_password: '',
          password: '',
          password_confirmation: ''
        };
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du changement de mot de passe:', error);
        alert('Erreur lors du changement de mot de passe');
        this.saving = false;
      }
    });
  }

  getInitials(): string {
    if (!this.user || !this.user.name) return '?';
    const names = this.user.name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return this.user.name[0];
  }
}
