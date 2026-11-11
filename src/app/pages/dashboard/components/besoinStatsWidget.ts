import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
// import { PlannificationBesoinService } from '@/pages/hr/plannificationBesoin/plannificationBesoin.service';
@Component({
    selector: 'besoin-stats-widget',
    standalone: true,
    imports: [CommonModule, ChartModule],
    template: `
    <div class="card">
        <div class="font-medium leading-loose mb-4">Statistiques des besoins</div>

        <div class="grid grid-cols-12 gap-4 mb-4">
            <div class="col-span-12 md:col-span-4">
                <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
                    <div class="text-blue-500 dark:text-blue-300 text-xl font-medium mb-2">Total des besoins</div>
                    <div class="text-4xl font-bold">{{stats.total}}</div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-4">
                <div class="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
                    <div class="text-green-500 dark:text-green-300 text-xl font-medium mb-2">Besoins ouverts</div>
                    <div class="text-4xl font-bold">{{stats.ouverts}}</div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-4">
                <div class="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
                    <div class="text-purple-500 dark:text-purple-300 text-xl font-medium mb-2">Besoins complétés</div>
                    <div class="text-4xl font-bold">{{stats.completes}}</div>
                </div>
            </div>
        </div>

        <div class="mt-6">
            <p-chart type="bar" [data]="chartData" [options]="chartOptions" height="250"></p-chart>
        </div>
    </div>
    `
})
export class BesoinStatsWidget implements OnInit {
    stats = {
        total: 0,
        ouverts: 0,
        completes: 0
    };

    chartData: any;
    chartOptions: any;

    constructor(
        // private besoinService: PlannificationBesoinService
    ) {}  // injection modifiée

    async ngOnInit() {
        await this.loadStats();
        this.initChart();
    }

    async loadStats() {
        try {
            // this.stats = !
            this.initChart();  // Met à jour le graphique après chargement des données
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#000';
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#666';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#ddd';

        this.chartData = {
            labels: ['Besoins'],
            datasets: [
                {
                    label: 'Ouverts',
                    backgroundColor: '#4CAF50',
                    data: [this.stats.ouverts]
                },
                {
                    label: 'Complétés',
                    backgroundColor: '#9C27B0',
                    data: [this.stats.completes]
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }
}
