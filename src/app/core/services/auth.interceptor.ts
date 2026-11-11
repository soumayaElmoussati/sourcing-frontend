import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // Ne pas intercepter les routes publiques
  const isPublic = req.url.includes('/api/auth/login')
      || req.url.includes('/api/auth/login_admin')
      || req.url.includes('/api/webhooks/');

  if (isPublic) return next(req);

  // Vérification locale de l'expiration avant même d'envoyer la requête
  if (authService.getToken() && !authService.isLoggedIn()) {
    // Token expiré localement — déconnecter immédiatement
    const loginUrl = authService.isAdmin() ? '/login-admin' : '/auth/login-seller';
    authService.logout(loginUrl);
    return throwError(() => new Error('Token expiré'));
  }

  // Ajouter le token dans le header Authorization
  const token = authService.getToken();
  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // Intercepter les 401 du backend (token rejeté côté serveur)
  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Le backend a rejeté le token → logout + redirect
        const isAdminRoute = router.url.startsWith('/admin');
        const loginUrl = isAdminRoute ? '/login-admin' : '/auth/login-seller';
        authService.logout(loginUrl);
      }
      return throwError(() => error);
    })
  );
};