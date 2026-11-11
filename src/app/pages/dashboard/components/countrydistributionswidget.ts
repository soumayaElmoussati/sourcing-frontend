import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { LayoutService } from '@/layout/service/layout.service';
// import { ProfileBesoinService } from '@/pages/hr/ficheprofilebesoin/profile-besoin.service';// adapte le chemin
import { debounceTime, Subscription } from 'rxjs';

@Component({
    selector: 'profils-par-secteur-widget',
    standalone: true,
    imports: [ChartModule,CommonModule],
    template: `<div class="card">
        <div class="font-medium leading-loose">Nombre de profils par secteur</div>
        <div class="flex justify-center mb-8">
            <p-chart type="doughnut" height="225" [data]="countryChart" [options]="countryChartOptions" class="w-9/12" id="country-chart"></p-chart>
        </div>
        <ul class="m-0 p-0 border-0 outline-0 list-none" *ngIf="secteurs.length">
            <li *ngFor="let secteur of secteurs; let i = index"
                class="flex justify-between items-center py-2 border-b border-surface-200 dark:border-surface-700">
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded mr-2"
                        [ngStyle]="{ 'background-color': colors[i % colors.length], 'box-shadow': '0 0 10px rgba(0,0,0,0.2)' }"></div>
                    <span>{{ secteur.secteur }}</span>
                </div>
                <span>{{ secteur.count }} ({{ getPercentage(secteur.count) }}%)</span>
            </li>
        </ul>
    </div>`
})
export class ProfilsParSecteurWidget implements OnInit, OnDestroy {
    private layoutService = inject(LayoutService);
    // private profileService = inject(ProfileBesoinService);

    countryChart: any;
    countryChartOptions: any;
    secteurs: { secteur: string, count: number }[] = [];
    total = 0;

    colors = ['#0F8BFD', '#EC4DBC', '#EEE500', '#FC6161', '#545C6B'];

    subscription!: Subscription;

    constructor() {
    this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
        if (this.secteurs.length) {
            this.initChart();
        }
    });
}


   async ngOnInit() {
    // await this.profileService.ensureInitialized(); // s'assurer que les données sont générées
    // this.secteurs = this.profileService.getNombreProfilsParSector(); // maintenant correct
    this.total = this.secteurs.reduce((acc, val) => acc + val.count, 0);
    this.initChart();
}


    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.countryChart = {
            labels: this.secteurs.map(s => s.secteur),
            datasets: [
                {
                    data: this.secteurs.map(s => s.count),
                    backgroundColor: this.colors,
                    hoverBackgroundColor: this.colors,
                    borderColor: 'transparent',
                    fill: true
                }
            ]
        };

        this.countryChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        };
    }

    getPercentage(count: number): string {
        return this.total ? ((count / this.total) * 100).toFixed(1) : '0';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
