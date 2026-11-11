import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-admin',
  templateUrl: './auth-admin.component.html',
  styleUrls: ['./auth-admin.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AuthAdminComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUserInfo();
      // Le backend retourne 'ROLE_ADMIN' — on vérifie les deux formes
      if (user?.roles?.some((r: string) => r === 'ADMIN' || r === 'ROLE_ADMIN')) {
        this.router.navigate(['/admin/dashboard']);
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login_admin(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Le backend retourne 'ROLE_ADMIN' avec préfixe — on vérifie les deux formes
        const isAdmin = response.roles?.some(
          (r: string) => r === 'ADMIN' || r === 'ROLE_ADMIN'
        );

        if (isAdmin) {
          if (this.loginForm.value.rememberMe) {
            localStorage.setItem('remember_me', 'true');
          } else {
            localStorage.removeItem('remember_me');
          }
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = 'Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.';
          this.authService.logout();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur de connexion:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error.status === 403) {
          this.errorMessage = 'Accès refusé. Veuillez contacter l\'administrateur.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}