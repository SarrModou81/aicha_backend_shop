import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error = '';
  showVendorFields = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
      phone: [''],
      role: ['client', Validators.required],
      shop_name: [''],
      shop_description: ['']
    });

    // Surveiller les changements de rôle
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.showVendorFields = role === 'vendeur';
      if (this.showVendorFields) {
        this.registerForm.get('shop_name')?.setValidators(Validators.required);
      } else {
        this.registerForm.get('shop_name')?.clearValidators();
      }
      this.registerForm.get('shop_name')?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        if (response.user.role === 'vendeur') {
          alert('Votre compte vendeur a été créé. Il sera activé après validation par un administrateur.');
        }
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }
}
