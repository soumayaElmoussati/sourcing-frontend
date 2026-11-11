import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {
  AppsService, AppType, AppConnection, IntegrationMode,
} from '@/services/apps.service';

export interface AppInfo {
  type: AppType;
  name: string;
  description: string;
  tags: string[];
  icon: string;
  color: string;
  integrationMode: IntegrationMode;
  setupInstructions?: string;
}

const APP_CATALOG: AppInfo[] = [
  {
    type: 'GOOGLE_SHEETS',
    name: 'Google Sheets',
    description: 'Synchronisez automatiquement les commandes saisies dans une feuille Google Sheets.',
    tags: ['Data Integration', 'Reporting', 'Automation'],
    icon: 'pi-table',
    color: '#10b981',
    integrationMode: 'WEBHOOK_INBOUND',
    setupInstructions: "Dans votre Google Sheet, ouvrez Extensions > Apps Script et ajoutez un script qui envoie un POST à l'URL ci-dessous à chaque nouvelle commande.",
  },
  {
    type: 'LIGHTFUNNELS',
    name: 'Lightfunnels',
    description: 'Connectez votre compte Lightfunnels pour importer automatiquement vos commandes.',
    tags: ['Data Integration', 'Reporting', 'Marketing'],
    icon: 'pi-bolt',
    color: '#f43f5e',
    integrationMode: 'OAUTH',
  },
  {
    type: 'YOUCAN',
    name: 'YouCan',
    description: 'Connectez votre boutique YouCan pour synchroniser automatiquement vos commandes.',
    tags: ['Data Integration', 'Ecommerce', 'Automation'],
    icon: 'pi-shopping-cart',
    color: '#aa2e66',
    integrationMode: 'OAUTH',
  },
  {
    type: 'SHOPIFY',
    name: 'Shopify',
    description: 'Connectez votre boutique Shopify pour synchroniser vos commandes automatiquement.',
    tags: ['Data Integration', 'Ecommerce', 'Reporting'],
    icon: 'pi-shopping-bag',
    color: '#95bf47',
    integrationMode: 'OAUTH',
  },
  {
    type: 'WORDPRESS',
    name: 'WordPress',
    description: 'Synchronisez vos commandes WooCommerce via un plugin webhook.',
    tags: ['Data Integration'],
    icon: 'pi-globe',
    color: '#1e293b',
    integrationMode: 'WEBHOOK_INBOUND',
    setupInstructions: "Installez 'WP Webhooks' ou utilisez les webhooks WooCommerce natifs, déclenché sur 'Commande créée'.",
  },
  {
    type: 'EASY_ORDERS',
    name: 'Easy Orders',
    description: 'Connectez Easy Orders pour gérer vos commandes et votre store builder.',
    tags: ['Order Management', 'Store Builder'],
    icon: 'pi-box',
    color: '#f59e0b',
    integrationMode: 'WEBHOOK_INBOUND',
    setupInstructions: "Dans Easy Orders, ajoutez cette URL comme destination des nouvelles commandes.",
  },
];

@Component({
  selector: 'app-apps',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
})
export class AppsComponent implements OnInit, OnDestroy {

  readonly catalog: AppInfo[] = APP_CATALOG;
  connections: Map<AppType, AppConnection> = new Map();
  isLoading = false;

  showModal    = false;
  selectedApp: AppInfo | null = null;
  selectedConn: AppConnection | null = null;
  isActing     = false;
  copiedUrl    = false;

  // Champ spécifique Shopify — shop domain saisi par le seller dans le modal
  shopifyDomain = '';

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private appsService: AppsService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadConnections();
    this.handleOAuthCallbackParams();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadConnections(): void {
    this.isLoading = true;
    this.appsService.getConnections().subscribe({
      next: (list) => {
        this.connections.clear();
        list.forEach(c => this.connections.set(c.appType, c));
        this.isLoading = false;
        if (this.selectedApp) {
          this.selectedConn = this.connections.get(this.selectedApp.type) ?? null;
        }
      },
      error: () => {
        this.isLoading = false;
        this.toast('error', 'Erreur', 'Impossible de charger les apps.');
      },
    });
  }

  private handleOAuthCallbackParams(): void {
    const params  = new URLSearchParams(window.location.search);
    const success = params.get('oauth_success') as AppType | null;
    const error   = params.get('oauth_error')   as AppType | null;

    if (success) {
      const name = APP_CATALOG.find(a => a.type === success)?.name ?? success;
      this.toast('success', '✅ Connecté !', `${name} est maintenant lié à votre compte.`);
      window.history.replaceState({}, '', window.location.pathname);
      this.loadConnections();
    }
    if (error) {
      const name = APP_CATALOG.find(a => a.type === error)?.name ?? error;
      this.toast('warn', 'Connexion annulée', `La connexion à ${name} a été annulée.`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  getConnection(type: AppType): AppConnection | undefined { return this.connections.get(type); }
  getStatus(type: AppType): string { return this.getConnection(type)?.status ?? 'DISCONNECTED'; }
  isActive(type: AppType): boolean       { return this.getStatus(type) === 'ACTIVE'; }
  isPending(type: AppType): boolean      { return this.getStatus(type) === 'PENDING'; }
  isDisconnected(type: AppType): boolean { return this.getStatus(type) === 'DISCONNECTED'; }
  isOAuthApp(app: AppInfo): boolean      { return app.integrationMode === 'OAUTH'; }

  getButtonLabel(app: AppInfo): string {
    const s = this.getStatus(app.type);
    if (s === 'ACTIVE')  return 'Connecté';
    if (s === 'PENDING') return 'En attente...';
    return app.integrationMode === 'OAUTH' ? 'Connecter' : 'Configurer';
  }

  getButtonClass(app: AppInfo): string {
    return `status-${this.getStatus(app.type).toLowerCase()}`;
  }

  openModal(app: AppInfo): void {
    this.selectedApp  = app;
    this.selectedConn = this.connections.get(app.type) ?? null;
    this.copiedUrl    = false;
    this.shopifyDomain = '';
    this.showModal    = true;
  }

  closeModal(): void {
    this.showModal     = false;
    this.selectedApp   = null;
    this.selectedConn  = null;
    this.copiedUrl     = false;
    this.shopifyDomain = '';
    this.stopPolling();
  }

  onMainAction(): void {
    if (!this.selectedApp) return;
    if (this.isOAuthApp(this.selectedApp)) {
      this.connectOAuth(this.selectedApp);
    } else {
      this.activateWebhook(this.selectedApp);
    }
  }

  private connectOAuth(app: AppInfo): void {
    // Shopify : valider que le seller a saisi son shop domain
    if (app.type === 'SHOPIFY') {
      const domain = this.shopifyDomain.trim();
      if (!domain || !domain.endsWith('.myshopify.com')) {
        this.toast('warn', 'Shop domain requis',
          'Veuillez saisir votre domaine Shopify (ex: mon-shop.myshopify.com)');
        return;
      }
    }

    this.isActing = true;
    const shopDomain = app.type === 'SHOPIFY' ? this.shopifyDomain.trim() : undefined;

    this.appsService.initiateOAuth(app.type, shopDomain).subscribe({
      next: async (resp) => {
        const result = await this.appsService.openOAuthPopup(resp.authorizationUrl);
        this.isActing = false;
        if (result === 'success') {
          this.loadConnections();
          this.toast('success', '✅ Connecté !', `${app.name} est maintenant lié à votre compte.`);
          this.closeModal();
        }
      },
      error: (err) => {
        this.isActing = false;
        const msg = err?.error?.message || "Impossible d'initier la connexion.";
        this.toast('error', 'Erreur', msg);
      },
    });
  }

  private activateWebhook(app: AppInfo): void {
    if (this.selectedConn) return;
    this.isActing = true;
    this.appsService.activateWebhook(app.type).subscribe({
      next: (conn) => {
        this.isActing = false;
        this.selectedConn = conn;
        this.connections.set(app.type, conn);
        this.startPolling();
      },
      error: () => {
        this.isActing = false;
        this.toast('error', 'Erreur', 'Impossible de configurer le webhook.');
      },
    });
  }

  copyWebhookUrl(): void {
    if (!this.selectedConn?.webhookUrl) return;
    navigator.clipboard.writeText(this.selectedConn.webhookUrl).then(() => {
      this.copiedUrl = true;
      setTimeout(() => (this.copiedUrl = false), 2000);
      this.startPolling();
    });
  }

  regenerateWebhookToken(): void {
    if (!this.selectedApp) return;
    this.appsService.regenerateWebhookToken(this.selectedApp.type).subscribe({
      next: (conn) => {
        this.selectedConn = conn;
        this.connections.set(this.selectedApp!.type, conn);
        this.stopPolling();
        this.toast('warn', 'Lien régénéré', "L'ancien lien ne fonctionne plus.");
      },
    });
  }

  disconnect(): void {
    if (!this.selectedApp) return;
    this.appsService.disconnect(this.selectedApp.type).subscribe({
      next: () => {
        this.connections.delete(this.selectedApp!.type);
        this.toast('info', 'Déconnecté', `${this.selectedApp?.name} a été déconnecté.`);
        this.closeModal();
      },
    });
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollInterval = setInterval(() => {
      this.appsService.getConnections().subscribe(list => {
        list.forEach(c => this.connections.set(c.appType, c));
        if (!this.selectedApp) return;
        const fresh = this.connections.get(this.selectedApp.type);
        if (fresh) this.selectedConn = fresh;
        if (fresh?.status === 'ACTIVE') {
          this.toast('success', '✅ Connexion active !', `${this.selectedApp.name} est opérationnel.`);
          this.stopPolling();
        }
      });
    }, 5000);
  }

  private stopPolling(): void {
    if (this.pollInterval) { clearInterval(this.pollInterval); this.pollInterval = null; }
  }

  private toast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 4000 });
  }
}