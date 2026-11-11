import { Component, OnDestroy, Renderer2, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LayoutService } from '@/layout/service/layout.service';
import { AppConfigurator } from './app.configurator';
import { AppBreadcrumb } from './app.breadcrumb';
import { AppSidebarAdmin } from './app.sidebar'; // Gardé pour l'Admin
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppProfileMenu } from '@/layout/components/app.profilemenu';
import { MenuItem } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { Ripple } from 'primeng/ripple';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NotificationSellerService } from '@/pages/notification/notification-seller.service';
import { environment } from 'src/environments/environment';

// Interface pour la réponse de l'API
interface SellerInfo {
    storeName: string;
    country: string;
    budget: string;
    phone: string;
    commerceExperience: boolean;
    adsExperience: boolean;
    idCardRectoPath: string;
    idCardVersoPath: string;
}

interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    sellerInfo?: SellerInfo;
}

@Component({
    selector: 'app-layout-admin',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        AppConfigurator,
        AppBreadcrumb,
        ToastModule,
        AppProfileMenu,
        AppSidebarAdmin, // Sidebar Admin
        StyleClassModule,
        FormsModule,
        Ripple,
        InputText,
        ButtonModule,
        IconField,
        InputIcon
    ],
    template: `
        <div class="layout-container" [ngClass]="containerClass">
            <div class="layout-content-wrapper">

                <!-- ══ TOPBAR MODERNE ══ -->
                <nav class="topbar">
                    <div class="topbar-inner">

                        <!-- Gauche : hamburger -->
                        <button class="topbar-hamburger" (click)="onMenuButtonClick()" aria-label="Menu">
                            <i class="pi pi-bars"></i>
                        </button>

                        <!-- Centre : Search bar always visible -->
                        <div class="topbar-search" [class.focused]="searchFocused">
                            <i class="pi pi-search topbar-search-icon"></i>
                            <input
                                #searchinput
                                type="text"
                                class="topbar-search-input"
                                placeholder="Rechercher commandes, vendeurs, produits…"
                                [(ngModel)]="searchQuery"
                                (focus)="searchFocused = true"
                                (blur)="searchFocused = false"
                                (keydown.escape)="searchQuery = ''; searchFocused = false"
                            />
                            <button *ngIf="searchQuery" class="topbar-search-clear" (click)="searchQuery = ''">
                                <i class="pi pi-times"></i>
                            </button>
                        </div>

                        <!-- Droite : actions -->
                        <div class="topbar-actions">

                            <!-- Notifications -->
                            <button
                                class="topbar-btn"
                                [class.has-badge]="unreadCount > 0"
                                (click)="toggleNotifications()"
                                aria-label="Notifications"
                            >
                                <i class="pi pi-bell"></i>
                                <span class="topbar-badge" *ngIf="unreadCount > 0">
                                    {{ unreadCount > 99 ? '99+' : unreadCount }}
                                </span>
                            </button>



                            <!-- Séparateur -->
                            <div class="topbar-divider"></div>

                            <!-- Profil -->
                            <div class="topbar-profile" (click)="toggleProfileMenu()">
                                <div class="topbar-avatar">
                                    <span class="topbar-avatar-initials">{{ getUserInitials() }}</span>
                                </div>
                                <div class="topbar-user-info">
                                    <span class="topbar-user-name">{{ getUserDisplayName() }}</span>
                                    <span class="topbar-user-role">{{ getUserRole() }}</span>
                                </div>
                                <i class="pi pi-chevron-down topbar-chevron"
                                   [class.rotated]="profileMenuOpen"></i>
                            </div>

                            <!-- Dropdown profil -->
                            <div class="topbar-dropdown" [class.open]="profileMenuOpen">

                                <!-- Header dropdown -->
                                <div class="tdd-header">
                                    <div class="tdd-avatar-lg">
                                        <span>{{ getUserInitials() }}</span>
                                    </div>
                                    <div class="tdd-user-info">
                                        <div class="tdd-name">{{ getUserDisplayName() }}</div>
                                        <div class="tdd-email">{{ getUserEmail() }}</div>
                                        <span class="tdd-role-badge">{{ getUserRole() }}</span>
                                    </div>
                                </div>

                                <!-- Infos Seller (si applicable) -->
                                <div class="tdd-seller-info" *ngIf="userProfile?.sellerInfo">
                                    <div class="tdd-info-row" *ngIf="userProfile?.sellerInfo?.storeName">
                                        <i class="pi pi-shop"></i>
                                        <span>{{ userProfile?.sellerInfo?.storeName }}</span>
                                    </div>
                                    <div class="tdd-info-row" *ngIf="userProfile?.sellerInfo?.country">
                                        <i class="pi pi-flag"></i>
                                        <span>{{ userProfile?.sellerInfo?.country }}</span>
                                    </div>
                                    <div class="tdd-info-row" *ngIf="userProfile?.sellerInfo?.phone">
                                        <i class="pi pi-phone"></i>
                                        <span>{{ userProfile?.sellerInfo?.phone }}</span>
                                    </div>
                                </div>

                                <div class="tdd-divider"></div>

                                <!-- Menu items -->
                                <a routerLink="/admin/profile" class="tdd-item" (click)="profileMenuOpen = false">
                                    <span class="tdd-item-icon"><i class="pi pi-user"></i></span>
                                    <span class="tdd-item-label">Mon profil</span>
                                    <i class="pi pi-chevron-right tdd-item-arrow"></i>
                                </a>
                                <a routerLink="/admin/settings" class="tdd-item" (click)="profileMenuOpen = false">
                                    <span class="tdd-item-icon"><i class="pi pi-cog"></i></span>
                                    <span class="tdd-item-label">Paramètres</span>
                                    <i class="pi pi-chevron-right tdd-item-arrow"></i>
                                </a>

                                <div class="tdd-divider"></div>

                                <!-- Logout -->
                                <button class="tdd-item tdd-logout" (click)="logout()">
                                    <span class="tdd-item-icon logout-icon"><i class="pi pi-sign-out"></i></span>
                                    <span class="tdd-item-label">Déconnexion</span>
                                </button>

                            </div>
                        </div>
                    </div>
                </nav>
                <!-- ══ FIN TOPBAR ══ -->

                <div class="layout-topbar" app-topbar>
                    <div class="topbar-start"></div>
                    <div class="layout-topbar-menu-section">
                        <div app-sidebar></div>
                    </div>
                </div>

                <div class="content-breadcrumb">
                    <div app-breadcrumb></div>
                </div>

                <div class="layout-content">
                    <router-outlet></router-outlet>
                </div>

                <div class="layout-mask"></div>
            </div>

            <p-toast position="top-right"></p-toast>
            <app-profile-menu />
            <app-configurator />
        </div>
    `,
    providers: [MessageService],
    styles: [`
        /* ══════════════════════════════════════════════
           TOPBAR
        ══════════════════════════════════════════════ */
        .topbar {
            position: sticky;
            top: 0;
            z-index: 200;
            height: 64px;
            background: var(--surface-card);
            border-bottom: 1px solid var(--surface-border);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }

        .topbar-inner {
            height: 100%;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 20px;
        }

        /* Hamburger */
        .topbar-hamburger {
            flex-shrink: 0;
            width: 38px;
            height: 38px;
            border: none;
            background: transparent;
            border-radius: 10px;
            color: var(--text-color-secondary);
            font-size: 1.1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, color 0.2s;
        }
        .topbar-hamburger:hover {
            background: var(--surface-hover);
            color: var(--text-color);
        }

        /* ── Search ── */
        .topbar-search {
            flex: 1;
            max-width: 480px;
            display: flex;
            align-items: center;
            gap: 10px;
            background: var(--surface-ground);
            border: 1.5px solid var(--surface-border);
            border-radius: 12px;
            padding: 0 14px;
            height: 40px;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .topbar-search.focused {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 15%, transparent);
            background: var(--surface-card);
        }
        .topbar-search-icon {
            color: var(--text-color-secondary);
            font-size: 0.9rem;
            flex-shrink: 0;
        }
        .topbar-search.focused .topbar-search-icon {
            color: var(--primary-color);
        }
        .topbar-search-input {
            flex: 1;
            border: none;
            background: transparent;
            color: var(--text-color);
            font-size: 0.875rem;
            outline: none;
            min-width: 0;
        }
        .topbar-search-input::placeholder {
            color: var(--text-color-secondary);
            opacity: 0.7;
        }
        .topbar-search-clear {
            width: 22px;
            height: 22px;
            border: none;
            background: var(--surface-border);
            border-radius: 50%;
            color: var(--text-color-secondary);
            font-size: 0.65rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: background 0.2s;
        }
        .topbar-search-clear:hover {
            background: var(--surface-300);
        }

        /* ── Actions ── */
        .topbar-actions {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: auto;
            position: relative;
        }

        /* Boutons icône */
        .topbar-btn {
            position: relative;
            width: 38px;
            height: 38px;
            border: none;
            background: transparent;
            border-radius: 10px;
            color: var(--text-color-secondary);
            font-size: 1.05rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, color 0.2s;
            flex-shrink: 0;
        }
        .topbar-btn:hover {
            background: var(--surface-hover);
            color: var(--text-color);
        }
        .topbar-btn.has-badge {
            color: var(--primary-color);
        }

        /* Badge */
        .topbar-badge {
            position: absolute;
            top: 4px;
            right: 4px;
            min-width: 16px;
            height: 16px;
            padding: 0 3px;
            background: #ef4444;
            color: #fff;
            font-size: 0.6rem;
            font-weight: 700;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            border: 2px solid var(--surface-card);
        }

        /* Séparateur vertical */
        .topbar-divider {
            width: 1px;
            height: 28px;
            background: var(--surface-border);
            margin: 0 8px;
            flex-shrink: 0;
        }

        /* ── Profil ── */
        .topbar-profile {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 10px;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.2s;
            border: 1.5px solid transparent;
            user-select: none;
        }
        .topbar-profile:hover {
            background: var(--surface-hover);
        }

        .topbar-avatar {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, #8b5cf6));
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 2px 8px color-mix(in srgb, var(--primary-color) 40%, transparent);
        }
        .topbar-avatar-initials {
            color: #fff;
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .topbar-user-info {
            display: flex;
            flex-direction: column;
            line-height: 1.3;
        }
        .topbar-user-name {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-color);
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .topbar-user-role {
            font-size: 0.7rem;
            color: var(--text-color-secondary);
            text-transform: capitalize;
        }

        .topbar-chevron {
            font-size: 0.7rem;
            color: var(--text-color-secondary);
            transition: transform 0.25s;
            flex-shrink: 0;
        }
        .topbar-chevron.rotated {
            transform: rotate(180deg);
        }

        /* ── Dropdown ── */
        .topbar-dropdown {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 300px;
            background: var(--surface-card);
            border: 1px solid var(--surface-border);
            border-radius: 16px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.14), 0 4px 12px rgba(0, 0, 0, 0.08);
            z-index: 500;
            overflow: hidden;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-8px) scale(0.97);
            transform-origin: top right;
            transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
        }
        .topbar-dropdown.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }

        /* Dropdown header */
        .tdd-header {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 18px 16px 14px;
            background: linear-gradient(135deg,
                color-mix(in srgb, var(--primary-color) 8%, var(--surface-card)),
                var(--surface-card)
            );
        }

        .tdd-avatar-lg {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 60%, #8b5cf6));
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 40%, transparent);
            font-size: 1.1rem;
            font-weight: 700;
            color: #fff;
            letter-spacing: 0.5px;
        }

        .tdd-user-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }
        .tdd-name {
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--text-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tdd-email {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tdd-role-badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 8px;
            background: color-mix(in srgb, var(--primary-color) 12%, transparent);
            color: var(--primary-color);
            border-radius: 999px;
            font-size: 0.65rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            width: fit-content;
        }

        /* Seller info block */
        .tdd-seller-info {
            padding: 10px 16px;
            background: var(--surface-ground);
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .tdd-info-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
            color: var(--text-color-secondary);
        }
        .tdd-info-row i {
            color: var(--primary-color);
            font-size: 0.75rem;
            width: 14px;
            text-align: center;
        }

        /* Divider */
        .tdd-divider {
            height: 1px;
            background: var(--surface-border);
        }

        /* Menu items */
        .tdd-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 11px 16px;
            color: var(--text-color);
            text-decoration: none;
            transition: background 0.15s;
            cursor: pointer;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
            font-size: 0.875rem;
        }
        .tdd-item:hover {
            background: var(--surface-hover);
        }

        .tdd-item-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--surface-ground);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 0.85rem;
            color: var(--text-color-secondary);
            transition: background 0.15s, color 0.15s;
        }
        .tdd-item:hover .tdd-item-icon {
            background: color-mix(in srgb, var(--primary-color) 12%, transparent);
            color: var(--primary-color);
        }

        .tdd-item-label {
            flex: 1;
            font-weight: 500;
        }

        .tdd-item-arrow {
            font-size: 0.65rem;
            color: var(--text-color-secondary);
            opacity: 0;
            transition: opacity 0.15s;
        }
        .tdd-item:hover .tdd-item-arrow {
            opacity: 1;
        }

        /* Logout spécial */
        .tdd-logout {
            color: #ef4444;
            margin-bottom: 4px;
        }
        .tdd-logout .tdd-item-label {
            color: #ef4444;
        }
        .tdd-logout .logout-icon {
            color: #ef4444;
        }
        .tdd-logout:hover {
            background: color-mix(in srgb, #ef4444 8%, transparent);
        }
        .tdd-logout:hover .tdd-item-icon {
            background: color-mix(in srgb, #ef4444 15%, transparent);
            color: #ef4444;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            .topbar-inner { padding: 0 12px; gap: 8px; }
            .topbar-search { max-width: none; }
            .topbar-user-info { display: none; }
            .topbar-chevron { display: none; }
            .topbar-divider { display: none; }
            .topbar-dropdown { width: 280px; right: -8px; }
        }

        @media (max-width: 480px) {
            .topbar-search { max-width: 160px; }
        }
    `]
})
export class AppLayoutAdmin implements OnDestroy, OnInit {
    overlayMenuOpenSubscription: Subscription;
    menuOutsideClickListener: any;
    menuScrollListener: any;

    profileMenuOpen   = false;
    notificationsOpen = false;
    messagesOpen      = false;
    searchFocused     = false;
    searchQuery       = '';

    userProfile: UserProfile | null = null;
    loading = true;
    error: string | null = null;
    unreadCount = 0;

    @ViewChild(AppSidebarAdmin) appSidebar!: AppSidebarAdmin;
    @ViewChild('searchinput') searchInput!: ElementRef<HTMLInputElement>;

    menu: MenuItem[] = [];

    searchBarActive = computed(() => this.layoutService.layoutState().searchBarActive);

    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router,
        private http: HttpClient,
        private messageService: MessageService,
        private notificationService: NotificationSellerService
    ) {
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                    if (this.isOutsideClicked(event)) this.hideMenu();
                });
            }
            if ((this.layoutService.isHorizontal() || this.layoutService.isSlim() || this.layoutService.isSlimPlus()) && !this.menuScrollListener) {
                this.menuScrollListener = this.renderer.listen(
                    this.appSidebar?.appMenu?.menuContainer?.nativeElement, 'scroll', () => {
                        if (this.layoutService.isDesktop()) this.hideMenu();
                    }
                );
            }
            if (this.layoutService.layoutState().staticMenuMobileActive) this.blockBodyScroll();
        });

        this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe(() => { this.hideMenu(); this.profileMenuOpen = false; });

        // Fermer dropdown au clic dehors
        this.renderer.listen('document', 'click', (event) => {
            if (this.profileMenuOpen
                && !event.target.closest('.topbar-profile')
                && !event.target.closest('.topbar-dropdown')) {
                this.profileMenuOpen = false;
            }
        });
    }

    ngOnInit() {
        this.loadUserProfile();
        this.loadUnreadCount();
    }

    loadUnreadCount() {
        this.notificationService.getUnreadCount().subscribe(count => {
            this.unreadCount = count;
        });
        this.notificationService.getAllForSeller();
    }

    private getToken(): string | null {
        // On garde le token Admin spécifique ici
        return localStorage.getItem('auth_token_admin');
    }

    private getAuthHeaders(): HttpHeaders {
        const token = this.getToken();
        if (token) {
            return new HttpHeaders({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            });
        }
        return new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }

    loadUserProfile() {
        this.loading = true;
        this.error = null;
        const token = this.getToken();

        if (!token) {
            this.error = 'Token non trouvé';
            this.loading = false;
            this.router.navigate(['/auth/login']);
            return;
        }

        const headers = this.getAuthHeaders();

        this.http.get<UserProfile>(`${environment.apiUrl}/api/user/profile`, { headers })
            .subscribe({
                next: (profile) => {
                    this.userProfile = profile;
                    this.loading = false;
                },
                error: (error) => {
                    this.error = 'Erreur chargement profil';
                    this.loading = false;
                    if (error.status === 401) {
                        this.router.navigate(['/auth/login']);
                    }
                }
            });
    }

    getUserDisplayName(): string {
        if (!this.userProfile) return 'Chargement…';
        return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    }

    getUserEmail(): string {
        return this.userProfile?.email || '';
    }

    getUserRole(): string {
        if (!this.userProfile) return '';
        return this.userProfile.role.replace('ROLE_', '').toLowerCase();
    }

    getUserInitials(): string {
        if (!this.userProfile) return 'U';
        return ((this.userProfile.firstName?.charAt(0) || '')
            + (this.userProfile.lastName?.charAt(0)  || '')).toUpperCase() || 'U';
    }

    onImageError(event: any) {
        event.target.src = '/public/images/image.png';
    }

    onMenuButtonClick() { this.layoutService.onMenuToggle(); }

    toggleProfileMenu() {
        this.profileMenuOpen = !this.profileMenuOpen;
        if (this.profileMenuOpen) this.loadUserProfile();
    }

    toggleNotifications() {
        this.router.navigate(['/admin/notifications']); // À adapter si route admin différente
    }

    logout() {
        // Nettoyage spécifique Admin
        ['auth_token', 'auth_token_admin',
            'refresh_token', 'refresh_token_admin',
            'user_profile', 'token_expires_at_admin',
            'user_id_admin', 'user_email_admin', 'user_firstName_admin',
            'user_lastName_admin', 'user_roles_admin',
        ].forEach(k => localStorage.removeItem(k));

        this.userProfile      = null;
        this.profileMenuOpen  = false;
        this.router.navigate(['/login-admin']); // Route login admin

        this.messageService.add({
            severity: 'success',
            summary: 'Déconnexion',
            detail: 'Vous avez été déconnecté avec succès',
            life: 3000
        });
    }

    isOutsideClicked(event: any) {
        const sidebarEl    = document.querySelector('.layout-sidebar');
        const menuToggleEl = document.querySelector('.topbar-hamburger');
        return !(
            sidebarEl?.isSameNode(event.target)    || sidebarEl?.contains(event.target) ||
            menuToggleEl?.isSameNode(event.target) || menuToggleEl?.contains(event.target)
        );
    }

    blockBodyScroll() { document.body.classList.add('blocked-scroll'); }
    unblockBodyScroll() { document.body.classList.remove('blocked-scroll'); }

    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({
            ...prev,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));
        this.layoutService.reset();
        if (this.menuOutsideClickListener) { this.menuOutsideClickListener(); this.menuOutsideClickListener = null; }
        if (this.menuScrollListener) { this.menuScrollListener(); this.menuScrollListener = null; }
        this.unblockBodyScroll();
    }

    get containerClass() {
        const layoutConfig = this.layoutService.layoutConfig();
        const layoutState  = this.layoutService.layoutState();
        return {
            'layout-light':             !layoutConfig.darkTheme,
            'layout-dark':               layoutConfig.darkTheme,
            'layout-overlay':            layoutConfig.menuMode === 'overlay',
            'layout-static':             layoutConfig.menuMode === 'static',
            'layout-slim':               layoutConfig.menuMode === 'slim',
            'layout-slim-plus':          layoutConfig.menuMode === 'slim-plus',
            'layout-horizontal':         layoutConfig.menuMode === 'horizontal',
            'layout-reveal':             layoutConfig.menuMode === 'reveal',
            'layout-drawer':             layoutConfig.menuMode === 'drawer',
            'layout-static-inactive':    layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
            'layout-overlay-active':     layoutState.overlayMenuActive,
            'layout-mobile-active':      layoutState.staticMenuMobileActive,
            'layout-sidebar-active':     layoutState.sidebarActive,
            'layout-sidebar-anchored':   layoutState.anchored
        };
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) this.overlayMenuOpenSubscription.unsubscribe();
        if (this.menuOutsideClickListener)    this.menuOutsideClickListener();
    }
}