import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type AppType =
  | 'GOOGLE_SHEETS'
  | 'LIGHTFUNNELS'
  | 'WORDPRESS'
  | 'SHOPIFY'
  | 'YOUCAN'
  | 'EASY_ORDERS';

export type IntegrationMode  = 'OAUTH' | 'WEBHOOK_INBOUND';
export type ConnectionStatus = 'DISCONNECTED' | 'PENDING' | 'ACTIVE';

export interface AppConnection {
  appType:               AppType;
  integrationMode:       IntegrationMode;
  status:                ConnectionStatus;
  externalAccountLabel?: string | null;
  webhookUrl?:           string | null;
  webhooksReceived?:     number | null;
  lastWebhookAt?:        string | null;
  lastSyncedAt?:         string | null;
}

export interface OAuthInitResponse {
  authorizationUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AppsService {

  private readonly apiUrl = environment.apiUrl;

  static readonly OAUTH_APPS: AppType[]   = ['LIGHTFUNNELS', 'YOUCAN', 'SHOPIFY'];
  static readonly WEBHOOK_APPS: AppType[] = ['GOOGLE_SHEETS', 'WORDPRESS', 'EASY_ORDERS'];

  constructor(private http: HttpClient) {}

  getConnections(): Observable<AppConnection[]> {
    return this.http.get<AppConnection[]>(`${this.apiUrl}/api/apps`);
  }

  // shopDomain : obligatoire pour SHOPIFY (ex: "mon-shop.myshopify.com")
  initiateOAuth(appType: AppType, shopDomain?: string): Observable<OAuthInitResponse> {
    const params = shopDomain ? `?shopDomain=${encodeURIComponent(shopDomain)}` : '';
    return this.http.post<OAuthInitResponse>(
      `${this.apiUrl}/api/apps/oauth/init/${appType}${params}`, {}
    );
  }

  openOAuthPopup(authorizationUrl: string): Promise<'success' | 'cancelled'> {
    return new Promise(resolve => {
      const width  = 600;
      const height = 700;
      const left   = window.screenX + (window.outerWidth  - width)  / 2;
      const top    = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authorizationUrl, 'oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!popup) { resolve('cancelled'); return; }

      const openedPopup: Window = popup;

      const messageHandler = (event: MessageEvent): void => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'OAUTH_SUCCESS') { cleanup(); resolve('success');   }
        if (event.data?.type === 'OAUTH_ERROR')   { cleanup(); resolve('cancelled'); }
      };
      window.addEventListener('message', messageHandler);

      const poll = setInterval(() => {
        if (openedPopup.closed) { cleanup(); resolve('success'); }
      }, 500);

      function cleanup(): void {
        clearInterval(poll);
        window.removeEventListener('message', messageHandler);
        if (!openedPopup.closed) openedPopup.close();
      }
    });
  }

  activateWebhook(appType: AppType): Observable<AppConnection> {
    return this.http.post<AppConnection>(
      `${this.apiUrl}/api/apps/webhook/activate/${appType}`, {}
    );
  }

  regenerateWebhookToken(appType: AppType): Observable<AppConnection> {
    return this.http.post<AppConnection>(
      `${this.apiUrl}/api/apps/webhook/regenerate/${appType}`, {}
    );
  }

  disconnect(appType: AppType): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/apps/${appType}`);
  }

  isOAuthApp(appType: AppType): boolean {
    return AppsService.OAUTH_APPS.includes(appType);
  }
}