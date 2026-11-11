import {Component} from '@angular/core';
import {StatsWidget} from '@/pages/dashboard/components/statswidget';


import { ProfilsParSecteurWidget } from './components/countrydistributionswidget';
import {MonthlyBesoinsWidget} from '@/pages/dashboard/components/monthlyrevenuewidget';

import { BesoinStatsWidget } from './components/besoinStatsWidget';
@Component({
    selector: 'app-ecommerce-dashboard',
    standalone: true,
    imports: [StatsWidget, ProfilsParSecteurWidget, MonthlyBesoinsWidget,BesoinStatsWidget],
    // providers: [CustomerService],
    template: `<div class="grid grid-cols-12 gap-6">
  <!-- Widget principal en plein écran -->
  <div class="col-span-12">
    <stats-widget />
  </div>

  <!-- Deux widgets côte à côte -->
  <div class="col-span-12 xl:col-span-4">
    <profils-par-secteur-widget />
  </div>
  <div class="col-span-12 xl:col-span-8">
    <monthly-besoins-widget />
  </div>

  <!-- Dernier widget en plein écran -->
  <div class="col-span-12">
    <besoin-stats-widget />
  </div>
</div>
`
})
export class EcommerceDashboard {}
