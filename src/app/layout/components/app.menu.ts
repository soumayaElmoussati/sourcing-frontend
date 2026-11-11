import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: '[app-menu]',
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
export class AppMenu {
  el: ElementRef = inject(ElementRef);
  @ViewChild('menuContainer') menuContainer!: ElementRef;

  model: any[] = [
    {
      label: 'Accueil',
      icon: 'pi pi-home',
      items: [
        { label: 'Accueil', icon: 'pi pi-fw pi-home', routerLink: ['/seller/dashboard'] }
      ]
    },
    {
      label: 'Wallet',
      icon: 'pi pi-wallet',
      items: [
        { label: 'Wallet', icon: 'pi pi-fw pi-wallet', routerLink: ['/seller/mywallet'] }
      ]
    },
    {
      label: 'Apps',
      icon: 'pi pi-th-large',
      items: [
        { label: 'Apps', icon: 'pi pi-fw pi-th-large', routerLink: ['/seller/apps'] }
      ]
    },
    {
      label: 'Tickets',
      icon: 'pi pi-headphones',
      items: [
        { label: 'Tickets', icon: 'pi pi-fw pi-headphones', routerLink: ['/seller/mytickets'] }
      ]
    },
    {
      label: 'Sourcing',
      icon: 'pi pi-truck',
      items: [
        { label: 'Mes sourcings',  icon: 'pi pi-fw pi-list',  routerLink: ['/seller/sourcing'] },
        { label: 'Créer sourcing', icon: 'pi pi-fw pi-plus',  routerLink: ['/seller/createSourcing'] }
      ]
    },
    {
      label: 'Produits',
      icon: 'pi pi-box',
      items: [
        { label: 'Mes produits',   icon: 'pi pi-fw pi-box',   routerLink: ['/seller/products'] }
      ]
    },
    {
      label: 'Commandes',
      icon: 'pi pi-shopping-cart',
      items: [
        { label: 'Mes commandes',  icon: 'pi pi-fw pi-list',  routerLink: ['/seller/orders'] },
        { label: 'Créer commande', icon: 'pi pi-fw pi-plus',  routerLink: ['/seller/create-order'] }
      ]
    },
    {
      label: 'Notifications',
      icon: 'pi pi-bell',
      items: [
        { label: 'Notifications',  icon: 'pi pi-fw pi-bell',  routerLink: ['/seller/notifications'] }
      ]
    },
    {
      label: 'Mon profil',
      icon: 'pi pi-user',
      items: [
        { label: 'Mon profil',     icon: 'pi pi-fw pi-user',  routerLink: ['/seller/profile'] }
      ]
    }
  ];
}