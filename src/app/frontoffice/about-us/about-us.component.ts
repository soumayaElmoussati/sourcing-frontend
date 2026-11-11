import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent {
  solutions = [
    {
      icon: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
      title: 'Gestion des Commandes',
      description: 'Confirmation, traitement et suivi des commandes en temps réel',
      color: '#10b981'
    },
    {
      icon: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z',
      title: 'Fulfillment',
      description: 'Stockage, préparation et expédition depuis nos hubs stratégiques',
      color: '#0ea5e9'
    },
    {
      icon: 'M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z',
      title: 'Sourcing & Fabrication',
      description: 'Accès à un réseau de fournisseurs et usines fiables',
      color: '#8b5cf6'
    },
    {
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
      title: 'Livraison Last-Mile',
      description: 'Réseau de partenaires logistiques pour une livraison optimale',
      color: '#f59e0b'
    }
  ];

  locations = [
    { country: 'Maroc', top: '30%', left: '40%' },
    { country: 'Émirats', top: '40%', left: '55%' },
    { country: 'Arabie Saoudite', top: '45%', left: '60%' },
    { country: 'Irak', top: '50%', left: '65%' },
    { country: 'Égypte', top: '45%', left: '48%' },
    { country: 'Qatar', top: '42%', left: '58%' }
  ];
}