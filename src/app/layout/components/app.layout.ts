import { Component, OnDestroy, Renderer2, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LayoutService } from '@/layout/service/layout.service';
import { AppConfigurator } from './app.configurator';
import { AppBreadcrumb } from './app.breadcrumb';
import { AppSidebar } from './app.sidebar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppProfileMenu } from "@/layout/components/app.profilemenu";
import { MenuItem } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { Ripple } from 'primeng/ripple';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { ElementRef, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NotificationSellerService } from '@/pages/notification/notification-seller.service';

import { environment } from 'src/environments/environment';
import { LangSwitcherComponent } from '@/shared/components/lang-switcher/lang-switcher/lang-switcher.component';

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
    selector: 'app-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        AppConfigurator,
        AppBreadcrumb,
        ToastModule,
        AppProfileMenu,
        AppSidebar,
        StyleClassModule,
        FormsModule,
        Ripple,
        InputText,
        ButtonModule,
        IconField,
        InputIcon,
        LangSwitcherComponent
    ],
    template: `
        <div class="layout-container" [ngClass]="containerClass">
            <div class="layout-content-wrapper">
              
                <!-- Topbar intégrée directement -->
                <!-- Navbar Simple -->
                <nav class="simple-navbar">
                    <div class="navbar-content">
                        <!-- Bouton menu pour toggle sidebar -->
                        <button class="menu-toggle" (click)="onMenuButtonClick()">
                            <i class="pi pi-bars"></i>
                        </button>
                        
                        <!-- Actions droite -->
                        <div class="navbar-actions">
                            <!-- Barre de recherche -->
                            <div class="search-container" [ngClass]="{'search-active': searchBarActive()}">
                                <button class="btn-search" (click)="activateSearch()">
                                    <i class="pi pi-search"></i>
                                </button>
                                <div class="search-input-wrapper">
                                    <input 
                                        type="text" 
                                        #searchinput
                                        placeholder="Rechercher..." 
                                        (blur)="deactivateSearch()" 
                                        (keydown.escape)="deactivateSearch()">
                                </div>
                            </div>
                            
                            <!-- Notifications -->
                            <div class="notification-icon" (click)="toggleNotifications()">
                                <i class="pi pi-bell"></i>
                                <span class="notification-badge"> {{  unreadCount }} </span>
                            </div>
                            
                            <!-- Lang switcher -->
                            <app-lang-switcher></app-lang-switcher>

                            <!-- Messages -->
                            <div class="message-icon" (click)="toggleMessages()">
                                <i class="pi pi-comment"></i>
                                <span class="message-badge">2</span>
                            </div>
                            
                            <!-- Profil utilisateur -->
                            <div class="user-profile" (click)="toggleProfileMenu()">
                                <!-- Avatar avec initiales si pas d'image -->
                                <div class="user-avatar" *ngIf="!userProfile; else withImage">
                                    <span class="avatar-initials">{{ getUserInitials() }}</span>
                                </div>
                                <ng-template #withImage>
                                    <!-- <img [src]="getUserAvatar()" alt="User" class="user-avatar-img" (error)="onImageError($event)"> -->
                                    <img src="" alt="User" class="user-avatar-img" (error)="onImageError($event)">

                                </ng-template>
                                
                                <div class="user-info">
                                    <span class="user-name">{{ getUserDisplayName() }}</span>
                                    <span class="user-role">{{ getUserRole() }}</span>
                                </div>
                                
                                <i class="pi pi-chevron-down"></i>
                            </div>
                            
                            <!-- Menu profil (dropdown) -->
                            <div class="profile-dropdown" [class.show]="profileMenuOpen">
                                <div class="dropdown-header">
                                    <div class="profile-summary">
                                        <div class="profile-avatar" *ngIf="!userProfile; else withImageDropdown">
                                            <span class="avatar-initials-large">{{ getUserInitials() }}</span>
                                        </div>
                                        <ng-template #withImageDropdown>
                                            <!-- <img [src]="getUserAvatar()" alt="User" class="profile-avatar-img" (error)="onImageError($event)"> -->
                                            <img src="" alt="User" class="profile-avatar-img" (error)="onImageError($event)">

                                        </ng-template>
                                        <div class="profile-details">
                                            <div class="profile-name">{{ getUserDisplayName() }}</div>
                                            <div class="profile-email">{{ getUserEmail() }}</div>
                                            <div class="profile-role">{{ getUserRole() }}</div>
                                        </div>
                                    </div>
                                    
                                    <!-- Informations Seller si applicable -->
                                    <div class="seller-info" *ngIf="userProfile?.sellerInfo">
                                        <div class="info-item">
                                            <i class="pi pi-store"></i>
                                            <span>{{ userProfile?.sellerInfo?.storeName }}</span>
                                        </div>
                                        <div class="info-item">
                                            <i class="pi pi-flag"></i>
                                            <span>{{ userProfile?.sellerInfo?.country }}</span>
                                        </div>
                                        <div class="info-item">
                                            <i class="pi pi-phone"></i>
                                            <span>{{ userProfile?.sellerInfo?.phone }}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="dropdown-divider"></div>
                                
                                <a href="/seller/profile" class="dropdown-item">
                                    <i class="pi pi-user"></i>
                                    <span>Mon profil</span>
                                </a>
                                <a href="/settings" class="dropdown-item">
                                    <i class="pi pi-cog"></i>
                                    <span>Paramètres</span>
                                </a>
                                
                                <div class="dropdown-divider"></div>
                                
                                <a href="#" class="dropdown-item" (click)="logout(); $event.preventDefault()">
                                    <i class="pi pi-sign-out"></i>
                                    <span>Déconnexion</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
              
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
            
            <!-- Toast pour les notifications -->
            <p-toast position="top-right"></p-toast>
            
            <app-profile-menu />
            <app-configurator />
        </div>
    `,
    providers: [MessageService],
    styles: [`
        /* Navbar Simple */
        .simple-navbar {
            background: var(--surface-card);
            height: 70px;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .navbar-content {
            display: flex;
            align-items: center;
            height: 100%;
            justify-content: space-between;
        }

        .menu-toggle {
            background: none;
            border: none;
            color: var(--text-color-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 6px;
            transition: all 0.3s ease;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .menu-toggle:hover {
            background: var(--surface-hover);
            color: var(--text-color);
        }

        .navbar-logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            text-decoration: none;
        }

        .navbar-logo img {
            height: 36px;
        }

        .navbar-logo span {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .navbar-actions {
            display: flex;
            align-items: center;
            position: relative;
        }

        /* Barre de recherche */
        .search-container {
            display: flex;
            align-items: center;
            position: relative;
        }

        .btn-search {
            background: none;
            border: none;
            color: var(--text-color-secondary);
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 6px;
            transition: all 0.3s ease;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-search:hover {
            background: var(--surface-hover);
            color: var(--text-color);
        }

        .search-input-wrapper {
            width: 0;
            overflow: hidden;
            transition: width 0.3s ease;
            opacity: 0;
        }

        .search-active .search-input-wrapper {
            width: 250px;
            margin-left: 0.5rem;
            opacity: 1;
        }

        .search-input-wrapper input {
            width: 100%;
            padding: 0.5rem 1rem;
            border: 1px solid var(--surface-border);
            border-radius: 6px;
            background: var(--surface-ground);
            color: var(--text-color);
            font-size: 0.875rem;
        }

        .search-input-wrapper input:focus {
            outline: none;
            border-color: var(--primary-color);
        }

        /* Notifications et Messages */
        .notification-icon,
        .message-icon {
            position: relative;
            cursor: pointer;
            color: var(--text-color-secondary);
            font-size: 1.25rem;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.3s ease;
        }

        .notification-icon:hover,
        .message-icon:hover {
            background: var(--surface-hover);
            color: var(--text-color);
        }

        .notification-badge,
        .message-badge {
            position: absolute;
            top: 0;
            right: 0;
            background: var(--red-500);
            color: #050505;
            font-size: 0.75rem;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Profil utilisateur */
        .user-profile {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 6px;
            transition: all 0.3s ease;
            position: relative;
        }

        .user-profile:hover {
            background: var(--surface-hover);
        }

        .user-avatar, .user-avatar-img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid var(--surface-border);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-color);
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .user-avatar-img {
            object-fit: cover;
            background: transparent;
        }

        .avatar-initials {
            font-size: 0.875rem;
        }

        .user-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .user-name {
            font-weight: 600;
            color: var(--text-color);
            font-size: 0.875rem;
        }

        .user-role {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
            text-transform: capitalize;
        }

        /* Dropdown Profil */
        .profile-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: var(--surface-card);
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            min-width: 280px;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        }

        .profile-dropdown.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
            margin-top: 0.5rem;
        }

        .dropdown-header {
            padding: 1rem;
        }

        .profile-summary {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .profile-avatar, .profile-avatar-img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 2px solid var(--surface-border);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-color);
            color: white;
            font-weight: 600;
            font-size: 1rem;
        }

        .profile-avatar-img {
            object-fit: cover;
            background: transparent;
        }

        .avatar-initials-large {
            font-size: 1rem;
        }

        .profile-details {
            flex: 1;
        }

        .profile-name {
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 0.25rem;
        }

        .profile-email {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
            margin-bottom: 0.25rem;
        }

        .profile-role {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
            background: var(--surface-hover);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            display: inline-block;
            text-transform: capitalize;
        }

        .seller-info {
            background: var(--surface-hover);
            border-radius: 6px;
            padding: 0.75rem;
            margin-top: 0.75rem;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }

        .info-item:last-child {
            margin-bottom: 0;
        }

        .info-item i {
            color: var(--primary-color);
            width: 16px;
        }

        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            color: var(--text-color);
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .dropdown-item:hover {
            background: var(--surface-hover);
            color: var(--primary-color);
        }

        .dropdown-item i {
            width: 20px;
            text-align: center;
        }

        .dropdown-divider {
            height: 1px;
            background: var(--surface-border);
            margin: 0.5rem 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .simple-navbar {
                padding: 0 1rem;
                height: 60px;
            }
            
            .navbar-logo span {
                display: none;
            }
            
            .user-info {
                display: none;
            }
            
            .search-active .search-input-wrapper {
                width: 180px;
            }
            
            .notification-icon,
            .message-icon {
                width: 36px;
                height: 36px;
            }
            
            .profile-dropdown {
                min-width: 250px;
                right: -1rem;
            }
        }

        /* Dark Mode */
        .layout-dark .simple-navbar {
            background: var(--surface-900);
            border-bottom-color: var(--surface-800);
        }

        .layout-dark .profile-dropdown {
            background: var(--surface-900);
            border-color: var(--surface-800);
        }

        .layout-dark .seller-info {
            background: var(--surface-800);
        }

        .layout-dark .search-input-wrapper input {
            background: var(--surface-800);
            border-color: var(--surface-700);
            color: var(--text-color);
        }
    `]
})
export class AppLayout implements OnDestroy, OnInit {
    overlayMenuOpenSubscription: Subscription;
    menuOutsideClickListener: any;
    menuScrollListener: any;

    profileMenuOpen = false;
    notificationsOpen = false;
    messagesOpen = false;

    userProfile: UserProfile | null = null;
    loading = true;
    error: string | null = null;

    unreadCount = 0;

    @ViewChild(AppSidebar) appSidebar!: AppSidebar;
    @ViewChild('searchinput') searchInput!: ElementRef<HTMLElement>;

    menu: MenuItem[] = [];

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
                    if (this.isOutsideClicked(event)) {
                        this.hideMenu();
                    }
                });
            }
            if ((this.layoutService.isHorizontal() || this.layoutService.isSlim() || this.layoutService.isSlimPlus()) && !this.menuScrollListener) {
                this.menuScrollListener = this.renderer.listen(this.appSidebar?.appMenu?.menuContainer?.nativeElement, 'scroll', (event) => {
                    if (this.layoutService.isDesktop()) {
                        this.hideMenu();
                    }
                });
            }
            if (this.layoutService.layoutState().staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.hideMenu();
        });

        // Fermer le menu profil en cliquant ailleurs
        this.renderer.listen('document', 'click', (event) => {
            if (this.profileMenuOpen && !event.target.closest('.user-profile') && !event.target.closest('.profile-dropdown')) {
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

        // Charger notifications au démarrage
        this.notificationService.getAllForSeller();
    }

    private getToken(): string | null {
        return localStorage.getItem('auth_token');
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
    // Méthodes pour l'API utilisateur
    loadUserProfile() {
        this.loading = true;
        this.error = null;

        const token = this.getToken();
        console.log("new token", token)
        

        if (!token) {
            this.error = 'Token non trouvé';
            this.loading = false;
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Vous devez être connecté pour accéder à cette fonctionnalité',
                life: 3000
            });
            this.router.navigate(['/auth/login']);
            return;
        }
        console.log("start header")
        

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        console.log("headers", headers)
        

        this.http.get<UserProfile>(`${environment.apiUrl}/api/user/profile`, { headers })
            .subscribe({
                next: (profile) => {
                    this.userProfile = profile;
                    console.log("profile", profile);
                    this.loading = false;
                    console.log('Profil utilisateur chargé:', profile);
                },
                error: (error) => {
                    this.error = 'Erreur lors du chargement du profil';
                    this.loading = false;
                    console.error('Erreur API:', error);

                    // Gérer les différents types d'erreurs
                    if (error.status === 401) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Session expirée',
                            detail: 'Votre session a expiré, veuillez vous reconnecter',
                            life: 3000
                        });
                        this.router.navigate(['/auth/login']);
                    } else if (error.status === 403) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Accès refusé',
                            detail: 'Vous n\'avez pas les permissions nécessaires',
                            life: 3000
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de charger le profil utilisateur',
                            life: 3000
                        });
                    }
                }
            });
    }

    // Méthodes d'affichage
    getUserDisplayName(): string {
        if (!this.userProfile) {
            return 'Chargement...';
        }
        return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    }

    getUserEmail(): string {
        return this.userProfile?.email || '';
    }

    getUserRole(): string {
        if (!this.userProfile) {
            return 'Utilisateur';
        }
        // Enlever "ROLE_" du début si présent
        const role = this.userProfile.role;
        return role.replace('ROLE_', '').toLowerCase();
    }

    getUserInitials(): string {
        if (!this.userProfile) {
            return 'U';
        }
        const firstInitial = this.userProfile.firstName?.charAt(0) || '';
        const lastInitial = this.userProfile.lastName?.charAt(0) || '';
        return (firstInitial + lastInitial).toUpperCase() || 'U';
    }

    getUserAvatar(): string {
        // Si l'utilisateur a une photo de profil, l'utiliser
        // Sinon, utiliser l'image par défaut
        // if (this.userProfile?.sellerInfo?.idCardRectoPath) {
        //     // Construire l'URL complète de l'image
        //     return `/api/uploads/${this.userProfile.sellerInfo.idCardRectoPath}`;
        // }
        return '/images/avatar/circle-big/avatar-f-2.png';
    }

    onImageError(event: any) {
        // Si l'image échoue au chargement, utiliser l'image par défaut
        event.target.src = '/images/image.png';
    }

    // Méthodes de la navbar
    searchBarActive = computed(() => this.layoutService.layoutState().searchBarActive);

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    activateSearch() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            searchBarActive: true
        }));
        setTimeout(() => {
            this.searchInput.nativeElement?.focus();
        }, 250);
    }

    deactivateSearch() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            searchBarActive: false
        }));
    }

    toggleProfileMenu() {
        this.profileMenuOpen = !this.profileMenuOpen;
        this.notificationsOpen = false;
        this.messagesOpen = false;

        // Rafraîchir les données à l'ouverture du menu
        if (this.profileMenuOpen) {
            this.loadUserProfile();
        }
    }

    toggleNotifications() {
        this.router.navigate(['/seller/notifications']);
    }

    toggleMessages() {
        this.messagesOpen = !this.messagesOpen;
        this.profileMenuOpen = false;
        this.notificationsOpen = false;
    }


    logout() {
        // 1. Nettoyer toutes les données d'authentification
        this.clearAuthData();

        // 2. Rediriger vers la page de login
        this.router.navigate(['/auth/login-seller']);

        // 3. Afficher un message de succès
        this.messageService.add({
            severity: 'success',
            summary: 'Déconnexion',
            detail: 'Vous avez été déconnecté avec succès',
            life: 3000
        });
    }

    // Méthode pour nettoyer toutes les données d'authentification
    private clearAuthData() {
        // Supprimer le token JWT
        localStorage.removeItem('auth_token_seller');
        sessionStorage.removeItem('auth_token_seller');

        // Supprimer le refresh token si vous en avez un
        localStorage.removeItem('refresh_token_seller');
        sessionStorage.removeItem('refresh_token_seller');

        // Supprimer les données utilisateur
        localStorage.removeItem('user_data');
        sessionStorage.removeItem('user_data');

        // Réinitialiser les données du composant
        this.userProfile = null;
        this.profileMenuOpen = false;
        this.notificationsOpen = false;
        this.messagesOpen = false;
        this.loading = false;
        this.error = null;
    }
    // Méthodes du layout
    isOutsideClicked(event: any) {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const menuToggleEl = document.querySelector('.menu-toggle');

        return !(sidebarEl?.isSameNode(event.target) || sidebarEl?.contains(event.target) || menuToggleEl?.isSameNode(event.target) || menuToggleEl?.contains(event.target));
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({
            ...prev,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));
        this.layoutService.reset();
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }

        if (this.menuScrollListener) {
            this.menuScrollListener();
            this.menuScrollListener = null;
        }

        this.unblockBodyScroll();
    }

    get containerClass() {
        const layoutConfig = this.layoutService.layoutConfig();
        const layoutState = this.layoutService.layoutState();

        return {
            'layout-light': !layoutConfig.darkTheme,
            'layout-dark': layoutConfig.darkTheme,
            'layout-overlay': layoutConfig.menuMode === 'overlay',
            'layout-static': layoutConfig.menuMode === 'static',
            'layout-slim': layoutConfig.menuMode === 'slim',
            'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
            'layout-horizontal': layoutConfig.menuMode === 'horizontal',
            'layout-reveal': layoutConfig.menuMode === 'reveal',
            'layout-drawer': layoutConfig.menuMode === 'drawer',
            'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
            'layout-overlay-active': layoutState.overlayMenuActive,
            'layout-mobile-active': layoutState.staticMenuMobileActive,
            'layout-sidebar-active': layoutState.sidebarActive,
            'layout-sidebar-anchored': layoutState.anchored
        };
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }
    }
}