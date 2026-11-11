import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';

interface MenuItem {
    label?: string;
    icon?: string;
    routerLink?: string[];
    url?: string[];
    target?: '_blank' | '_self' | '_parent' | '_top';
    routerLinkActiveOptions?: { [key: string]: any };
    items?: MenuItem[];
    separator?: boolean;
    visible?: boolean;
    disabled?: boolean;
    command?: (event?: any) => void;
    class?: string;
    style?: string;
    styleClass?: string;
    id?: string;
    urlTarget?: '_blank' | '_self' | '_parent' | '_top';
}

@Component({
    selector: '[app-menu-admin]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
    <ul class="layout-menu" #menuContainer>
      <ng-container *ngFor="let item of model; let i = index">
        <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
        <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
    </ul>
  `,
    host: { class: 'layout-menu-container' }
})
export class AppMenuAdmin {
    el: ElementRef = inject(ElementRef);

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    model: MenuItem[] = [
        {
            label: 'Accueil',
            icon: 'pi pi-home',
            items: [
                { label: 'Accueil', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard'] }
            ]
        },
        {
            label: 'Vendeurs',
            icon: 'pi pi-users',
            items: [
                { label: 'Vendeurs', icon: 'pi pi-fw pi-users', routerLink: ['/admin/list-sellers'] }
            ]
        },
        {
            label: 'Vendeurs supprimés',
            icon: 'pi pi-trash',
            items: [
                { label: 'Vendeurs supprimés', icon: 'pi pi-fw pi-trash', routerLink: ['/admin/deleted-sellers'] }
            ]
        },
        {
            label: 'Produits',
            icon: 'pi pi-box',
            items: [
                { label: 'Produits', icon: 'pi pi-fw pi-box', routerLink: ['/admin/products'] }
            ]
        },
        {
            label: 'Sourcing Requests',
            icon: 'pi pi-truck',
            items: [
                { label: 'Sourcing Requests', icon: 'pi pi-fw pi-truck', routerLink: ['/admin/list-request'] }
            ]
        },
        {
            label: 'Commandes',
            icon: 'pi pi-shopping-cart',
            items: [
                { label: 'Commandes', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/admin/orders'] }
            ]
        },
        {
            label: 'Deposits',
            icon: 'pi pi-wallet',
            items: [
                { label: 'Deposits', icon: 'pi pi-fw pi-wallet', routerLink: ['/admin/deposits'] }
            ]
        },
        {
            label: 'Retraits',
            icon: 'pi pi-money-bill',
            items: [
                { label: 'Retraits', icon: 'pi pi-fw pi-money-bill', routerLink: ['/admin/withdrawals'] }
            ]
        },
        {
            label: 'Frais',
            icon: 'pi pi-percentage',
            items: [
                { label: 'Frais', icon: 'pi pi-fw pi-percentage', routerLink: ['/admin/fees'] }
            ]
        },
        {
            label: 'Transactions',
            icon: 'pi pi-list',
            items: [
                { label: 'Transactions', icon: 'pi pi-fw pi-list', routerLink: ['/admin/wallet-transactions'] }
            ]
        },
        {
            label: 'Tickets',
            icon: 'pi pi-headphones',
            items: [
                { label: 'Tickets', icon: 'pi pi-fw pi-ticket', routerLink: ['/admin/tickets'] }
            ]
        },
        {
            label: 'Notifications',
            icon: 'pi pi-bell',
            items: [
                { label: 'Notifications', icon: 'pi pi-fw pi-bell', routerLink: ['/admin/notifications'] }
            ]
        },
        {
            label: 'Utilisateurs',
            icon: 'pi pi-users',
            items: [
                { label: 'Utilisateurs', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users'] }
            ]
        }
    ];
}