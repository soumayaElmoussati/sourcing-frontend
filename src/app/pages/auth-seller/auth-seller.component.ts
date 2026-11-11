import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService, LoginRequest, LoginResponse } from '@/services/auth.service';

@Component({
  selector: 'app-auth-seller',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    RippleModule,
    ToastModule
  ],
  templateUrl: './auth-seller.component.html',
  styleUrls: ['./auth-seller.component.scss'],
  providers: [MessageService]
})
export class AuthSellerComponent implements OnInit {
  showPassword = false;
  isLoading = false;
  loginForm!: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/seller/dashboard']);
    }
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Réinitialiser les messages
    this.errorMessage = '';
    this.successMessage = '';

    // Marquer tous les champs comme touchés
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });

    // Vérifier la validité du formulaire
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs';
      return;
    }

    this.isLoading = true;

    const loginRequest: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        console.log('Login response:', response);
        // CAS 1: Compte en attente de vérification
        if (response.roles.includes('ROLE_SELLER') &&
            response.status === 'pending') {

          // Afficher le message d'erreur (pas de sauvegarde de token)
          this.errorMessage = 'Votre compte vendeur est en cours de vérification par notre équipe. Vous recevrez un email dès que votre compte sera approuvé.';

          // Afficher un toast d'avertissement
          this.messageService.add({
            severity: 'warn',
            summary: 'Compte en attente',
            detail: 'Votre compte est en cours de vérification',
            life: 5000
          });

          return; // IMPORTANT: Sortir sans sauvegarder ni rediriger
        }

        // CAS 2: Compte rejeté
        if (response.roles.includes('ROLE_SELLER') &&
            response.status === 'rejected') {

          // Afficher le message d'erreur (pas de sauvegarde de token)
          this.errorMessage = 'Votre compte vendeur n\'a pas été approuvé. Veuillez contacter le support pour plus d\'informations.';

          this.messageService.add({
            severity: 'error',
            summary: 'Compte rejeté',
            detail: 'Votre compte n\'a pas été approuvé',
            life: 5000
          });

          return;
        }

        // CAS 3: Compte approuvé ou non-seller - SEUL CAS OÙ ON SAUVEGARDE LE TOKEN
        // Stocker le token
        localStorage.setItem('auth_token', response.token);

        // Stocker les informations utilisateur
        localStorage.setItem('user_data', JSON.stringify({
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          roles: response.roles
        }));

        // Afficher un message de succès
        this.messageService.add({
          severity: 'success',
          summary: 'Connexion réussie',
          detail: `Bienvenue ${response.firstName} !`,
          life: 3000
        });

        // Rediriger vers le dashboard
        // setTimeout(() => {
          this.router.navigate(['/seller/dashboard']);
        // }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;

        // Récupérer le message d'erreur du backend
        const errorResponse = error.error;

        // Gestion des différents codes d'erreur
        if (error.status === 401) {
          this.errorMessage = errorResponse.message || 'Email ou mot de passe incorrect';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }

        // Afficher l'erreur dans un toast également
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de connexion',
          detail: this.errorMessage,
          life: 5000
        });

        console.error('Login error:', error);
      }
    });
  }

  // Getters pour faciliter l'accès aux contrôles
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }

  // Méthode pour afficher les erreurs
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Ce champ est requis';
    }

    if (control.hasError('email')) {
      return 'Format d\'email invalide';
    }

    if (control.hasError('minlength')) {
      return 'Minimum 6 caractères';
    }

    return 'Valeur invalide';
  }

  // Méthode pour vérifier si le formulaire est valide
  isFormValid(): boolean {
    return this.loginForm.valid && !this.isLoading;
  }
}
