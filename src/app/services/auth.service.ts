import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpiresAt: number;  // timestamp ms — 24h après login
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  status?: string;
  accountVerified?: boolean;
}

const KEYS = {
  TOKEN:      (s: string) => `auth_token_${s}`,
  REFRESH:    (s: string) => `refresh_token_${s}`,
  EXPIRES_AT: (s: string) => `token_expires_at_${s}`,  // ← nouveau
  ID:         (s: string) => `user_id_${s}`,
  EMAIL:      (s: string) => `user_email_${s}`,
  FIRST:      (s: string) => `user_firstName_${s}`,
  LAST:       (s: string) => `user_lastName_${s}`,
  ROLES:      (s: string) => `user_roles_${s}`,
};

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  // Timer qui déclenchera le logout automatique à l'expiration du token
  private autoLogoutTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private http:   HttpClient,
    private router: Router,
    private ngZone: NgZone,
  ) {
    // Au démarrage de l'app : vérifier si un token existant est encore valide
    // et programmer le logout automatique si nécessaire
    this.scheduleAutoLogoutIfNeeded();
  }

  // ── Login Admin ─────────────────────────────────────────────────────────────

  login_admin(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login_admin`, loginRequest)
      .pipe(
        tap(response => {
          this.storeSession('admin', response);
          this.scheduleAutoLogout(response.tokenExpiresAt, 'admin');
        })
      );
  }

  // ── Login Seller ────────────────────────────────────────────────────────────

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          this.storeSession('seller', response);
          this.scheduleAutoLogout(response.tokenExpiresAt, 'seller');
        })
      );
  }

  // ── Logout ──────────────────────────────────────────────────────────────────

  logout(redirectTo?: string): void {
    // Annuler le timer si en cours
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
      this.autoLogoutTimer = null;
    }

    // Supprimer toutes les clés localStorage pour admin et seller
    ['seller', 'admin'].forEach(suffix => {
      Object.values(KEYS).forEach(keyFn => {
        localStorage.removeItem(keyFn(suffix));
      });
    });

    // Rediriger vers la page de login appropriée
    const target = redirectTo ?? this.getLoginUrl();
    this.router.navigate([target]);
  }

  // ── Getters ─────────────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(KEYS.TOKEN('admin'))
        || localStorage.getItem(KEYS.TOKEN('seller'));
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.REFRESH('admin'))
        || localStorage.getItem(KEYS.REFRESH('seller'));
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    // Vérification locale de l'expiration — sans appel réseau
    return !this.isTokenExpiredLocally();
  }

  isAdmin(): boolean {
    return !!localStorage.getItem(KEYS.TOKEN('admin'));
  }

  isSeller(): boolean {
    return !!localStorage.getItem(KEYS.TOKEN('seller'));
  }

  getUserInfo(): any {
    const suffix = this.isAdmin() ? 'admin' : 'seller';

    const id        = localStorage.getItem(KEYS.ID(suffix));
    const email     = localStorage.getItem(KEYS.EMAIL(suffix));
    const firstName = localStorage.getItem(KEYS.FIRST(suffix));
    const lastName  = localStorage.getItem(KEYS.LAST(suffix));
    const roles     = localStorage.getItem(KEYS.ROLES(suffix));

    if (!id || !email) return null;

    return {
      id:        parseInt(id),
      email,
      firstName,
      lastName,
      roles: roles ? JSON.parse(roles) : [],
    };
  }

  /** Retourne le timestamp d'expiration du token actif */
  getTokenExpiresAt(): number | null {
    const suffix = this.isAdmin() ? 'admin' : 'seller';
    const val = localStorage.getItem(KEYS.EXPIRES_AT(suffix));
    return val ? parseInt(val, 10) : null;
  }

  /** Retourne les ms restants avant expiration (négatif si expiré) */
  getTimeRemainingMs(): number {
    const expiresAt = this.getTokenExpiresAt();
    if (!expiresAt) return -1;
    return expiresAt - Date.now();
  }

  /** Validation du token côté backend */
  validateToken(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/validate-token`);
  }

  // ── Auto-logout ──────────────────────────────────────────────────────────────

  /**
   * Programme la déconnexion automatique exactement quand le token expire.
   * tokenExpiresAt : timestamp epoch ms (fourni par le backend dans LoginResponse)
   */
  private scheduleAutoLogout(tokenExpiresAt: number, suffix: string): void {
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
    }

    const msUntilExpiry = tokenExpiresAt - Date.now();

    if (msUntilExpiry <= 0) {
      // Déjà expiré — déconnecter immédiatement
      this.logout();
      return;
    }

    // Utiliser ngZone pour que le changement de route soit détecté par Angular
    this.ngZone.runOutsideAngular(() => {
      this.autoLogoutTimer = setTimeout(() => {
        this.ngZone.run(() => {
          console.log('[Auth] Token expiré — déconnexion automatique');
          const loginUrl = suffix === 'admin' ? '/login-admin' : '/auth/login-seller';
          this.logout(loginUrl);
        });
      }, msUntilExpiry);
    });

    console.log(`[Auth] Déconnexion automatique dans ${Math.round(msUntilExpiry / 1000 / 60)} minutes`);
  }

  /**
   * Au démarrage de l'app : reprogrammer le logout automatique
   * si un token valide est déjà stocké (après refresh de page).
   */
  private scheduleAutoLogoutIfNeeded(): void {
    const expiresAt = this.getTokenExpiresAt();
    if (!expiresAt) return;

    const msUntilExpiry = expiresAt - Date.now();

    if (msUntilExpiry <= 0) {
      // Token déjà expiré — nettoyer silencieusement
      this.clearStorageOnly();
      return;
    }

    const suffix = this.isAdmin() ? 'admin' : 'seller';
    this.scheduleAutoLogout(expiresAt, suffix);
  }

  /** Vérifie localement si le token est expiré (sans appel réseau) */
  private isTokenExpiredLocally(): boolean {
    const expiresAt = this.getTokenExpiresAt();
    if (!expiresAt) return true;
    return Date.now() >= expiresAt;
  }

  /** Nettoie le localStorage sans rediriger */
  private clearStorageOnly(): void {
    ['seller', 'admin'].forEach(suffix => {
      Object.values(KEYS).forEach(keyFn => {
        localStorage.removeItem(keyFn(suffix));
      });
    });
  }

  private getLoginUrl(): string {
    return this.isAdmin() ? '/login-admin' : '/auth/login-seller';
  }

  /** Stocke toutes les données de session en localStorage */
  private storeSession(suffix: string, response: LoginResponse): void {
    localStorage.setItem(KEYS.TOKEN(suffix),      response.token);
    localStorage.setItem(KEYS.REFRESH(suffix),    response.refreshToken);
    localStorage.setItem(KEYS.EXPIRES_AT(suffix), String(response.tokenExpiresAt));  // ← 24h epoch
    localStorage.setItem(KEYS.ID(suffix),         String(response.id));
    localStorage.setItem(KEYS.EMAIL(suffix),      response.email);
    localStorage.setItem(KEYS.FIRST(suffix),      response.firstName);
    localStorage.setItem(KEYS.LAST(suffix),       response.lastName);
    localStorage.setItem(KEYS.ROLES(suffix),      JSON.stringify(response.roles));
  }
}