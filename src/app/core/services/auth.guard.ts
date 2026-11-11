import { Injectable } from '@angular/core';
import {
  CanActivate, ActivatedRouteSnapshot,
  RouterStateSnapshot, Router, UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '@/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {

    const isAdminRoute = state.url.startsWith('/admin');
    const loginUrl     = isAdminRoute ? '/login-admin' : '/auth/login-seller';

    // ── 1. Vérifier token local ──────────────────────────────────────────────
    if (!this.authService.isLoggedIn()) {
      this.authService.logout(); // pas de param — signature correcte
      return of(this.router.createUrlTree([loginUrl], {
        queryParams: { returnUrl: state.url }
      }));
    }

    // ── 2. Valider le token côté backend ────────────────────────────────────
    return this.authService.validateToken().pipe(

      map(isValid => {

        if (!isValid) {
          this.authService.logout();
          return this.router.createUrlTree([loginUrl]);
        }

        // ── 3. Vérifier les rôles ──────────────────────────────────────────
        const requiredRoles: string[] = route.data?.['roles'] ?? [];

        if (requiredRoles.length === 0) return true;

        const userInfo  = this.authService.getUserInfo();
        const userRoles: string[] = userInfo?.roles ?? [];

        /**
         * Pour la partie ADMIN :
         *  - Le super-admin a ROLE_ADMIN
         *  - Les admin users créés via AdminUser ont aussi ROLE_ADMIN (retourné
         *    par AdminUser.getAuthorities()) + leurs permissions spécifiques
         *
         * La route /admin utilise data: { roles: ['ADMIN'] } mais les rôles
         * stockés ont le préfixe ROLE_ → on vérifie les deux formes.
         */
        const hasRole = requiredRoles.some(required =>
          userRoles.includes(required) ||
          userRoles.includes('ROLE_' + required)  // 'ADMIN' → 'ROLE_ADMIN'
        );

        if (!hasRole) {
          // Rôle insuffisant → rediriger vers la bonne page de login
          return this.router.createUrlTree([loginUrl]);
        }

        // ── 4. Pour les admin users : vérifier que le compte est actif ─────
        // (le token est valide mais on bloque si disabled — géré côté backend
        //  via Spring Security UserDetails.isEnabled())
        // Si le backend a rejeté le token, isValid serait false déjà.

        return true;
      }),

      catchError(() => {
        this.authService.logout();
        return of(this.router.createUrlTree([loginUrl]));
      })
    );
  }
}