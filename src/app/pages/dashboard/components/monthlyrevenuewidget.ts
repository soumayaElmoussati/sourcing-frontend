import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
// import { PlannificationBesoinService } from '@/pages/hr/plannificationBesoin/plannificationBesoin.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'monthly-besoins-widget',
  standalone: true,
  imports: [SelectModule, FormsModule, ChartModule,CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <span>Besoins Mensuels par Profil</span>
        <p-select 
          [options]="availableYears" 
          [(ngModel)]="selectedYear" 
          optionLabel="label" 
          optionValue="value" 
          (onChange)="onYearChange()">
        </p-select>
      </div>

      <div class="graph" *ngIf="besoinsChart">
        <p-chart #chart type="line" [data]="besoinsChart" [options]="chartOptions" style="height:400px"></p-chart>
      </div>
      
      <div *ngIf="!besoinsChart">
        Chargement des données...
      </div>
    </div>
  `
})
export class MonthlyBesoinsWidget implements OnInit, OnDestroy {
  // private besoinService = inject(PlannificationBesoinService);
  private subscription = new Subscription();

  availableYears: { label: string, value: number }[] = [];
  selectedYear!: number;

  besoinsChart: any = null;
  chartOptions: any;

  mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

  ngOnInit() {
    this.loadYears();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async loadYears() {
    // const years = await this.besoinService.getAvailableYears();
    // this.availableYears = years.map(y => ({ label: y.toString(), value: y }));
    // if (years.length > 0) {
    //   this.selectedYear = years[0];
    //   this.loadChartData();
    // }
  }

  async onYearChange() {
    await this.loadChartData();
  }

  async loadChartData() {
    if (!this.selectedYear) return;

    // const data = await this.besoinService.getMonthlyBesoinsByProfile(this.selectedYear);

    // Construire les labels (mois) et datasets
    // Chaque profil aura une dataset
    // const datasets = data.map((profileData, idx) => {
    //   const color = this.getColor(idx);
    //   return {
    //     label: profileData.profileName,
    //     data: this.mois.map(m => profileData.besoinsMensuels[m] || 0),
    //     fill: false,
    //     borderColor: color,
    //     backgroundColor: color,
    //     tension: 0.3,
    //     pointRadius: 3,
    //   };
    // });

    this.besoinsChart = {
      labels: this.mois,
      datasets: []
    };

    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#333' } }
      },
      scales: {
        x: { ticks: { color: '#333' } },
        y: { beginAtZero: true, ticks: { color: '#333' } }
      }
    };
  }

  // Génère une couleur simple pour chaque dataset (profil)
  getColor(index: number): string {
    const palette = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];
    return palette[index % palette.length];
  }
}
