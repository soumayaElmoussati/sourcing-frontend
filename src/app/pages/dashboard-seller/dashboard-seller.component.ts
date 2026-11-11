import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { ReportSellerService, SellerDashboard } from '@/services/report-seller.service';

@Component({
  selector:    'app-dashboard-seller',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './dashboard-seller.component.html',
  styleUrl:    './dashboard-seller.component.scss'
})
export class DashboardSellerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('pieCanvas')  pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas')  barCanvas!: ElementRef<HTMLCanvasElement>;

  isLoading    = true;
  error: string | null = null;
  dashboard: SellerDashboard | null = null;

  private pieChart:  any = null;
  private barChart:  any = null;
  private chartsReady = false;

  // Statuts affichés dans le tableau pipeline
  readonly statusRows = [
    { key: 'PENDING',   label: 'En attente',   icon: 'pi-clock',         color: '#f59e0b' },
    { key: 'CONFIRMED', label: 'Confirmée',    icon: 'pi-check',         color: '#3b82f6' },
    { key: 'PREPARED',  label: 'Préparée',     icon: 'pi-box',           color: '#8b5cf6' },
    { key: 'SHIPPED',   label: 'Expédiée',     icon: 'pi-truck',         color: '#06b6d4' },
    { key: 'DELIVERED', label: 'Livrée',       icon: 'pi-check-circle',  color: '#10b981' },
    { key: 'CANCELLED', label: 'Annulée',      icon: 'pi-times-circle',  color: '#ef4444' },
    { key: 'TO_RETURN', label: 'À retourner',  icon: 'pi-undo',          color: '#f97316' },
    { key: 'RETURNED',  label: 'Retournée',    icon: 'pi-reply',         color: '#6b7280' },
  ];

  // Données mock pour le bar chart mensuel (6 mois)
  readonly months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  readonly monthlyData = [12, 19, 8, 25, 14, 31]; // mock — à remplacer par API

  constructor(private reportService: ReportSellerService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    if (this.dashboard) this.renderCharts();
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
    this.barChart?.destroy();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.error = null;

    this.reportService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.isLoading = false;
        if (this.chartsReady) this.renderCharts();
        else setTimeout(() => this.renderCharts(), 100);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Impossible de charger le dashboard.';
        this.isLoading = false;
      }
    });
  }

  // ── Charts ─────────────────────────────────────────────────────────────────

  private renderCharts(): void {
    this.renderPieChart();
    this.renderBarChart();
  }

  private renderPieChart(): void {
    if (!this.pieCanvas || !this.dashboard) return;

    const ctx = this.pieCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const sm = this.dashboard.statusMap as any;
    const labels = this.statusRows.map(s => s.label);
    const data   = this.statusRows.map(s => sm[s.key] || 0);
    const colors = this.statusRows.map(s => s.color);

    // Si chart.js est disponible globalement (CDN) ou via import
    const Chart = (window as any)['Chart'];
    if (!Chart) { this.renderPieFallback(ctx, data, colors, labels); return; }

    this.pieChart?.destroy();
    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item: any) => ` ${item.label} : ${item.raw} commandes`
            }
          }
        },
        animation: { animateScale: true, duration: 700 }
      }
    });
  }

  private renderBarChart(): void {
    if (!this.barCanvas) return;

    const ctx = this.barCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const Chart = (window as any)['Chart'];
    if (!Chart) { this.renderBarFallback(ctx); return; }

    this.barChart?.destroy();
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.months,
        datasets: [{
          label: 'Commandes',
          data:  this.monthlyData,
          backgroundColor: 'rgba(16,185,129,0.15)',
          borderColor: '#10b981',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12 } } },
          y: {
            grid: { color: 'rgba(0,0,0,.05)' },
            ticks: { stepSize: 5, font: { size: 11 } },
            beginAtZero: true
          }
        },
        animation: { duration: 600 }
      }
    });
  }

  // ── Fallback canvas (sans Chart.js) ────────────────────────────────────────

  private renderPieFallback(
    ctx: CanvasRenderingContext2D,
    data: number[], colors: string[], labels: string[]
  ): void {
    const total = data.reduce((a, b) => a + b, 0) || 1;
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;
    const r  = Math.min(cx, cy) - 10;
    const ri = r * 0.62;
    let angle = -Math.PI / 2;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    data.forEach((val, i) => {
      if (val === 0) return;
      const slice = (val / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.fillStyle = colors[i];
      ctx.fill();

      angle += slice;
    });

    // Inner circle (donut hole)
    ctx.beginPath();
    ctx.arc(cx, cy, ri, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Centre text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold 20px Inter, sans-serif`;
    ctx.fillText(String(total), cx, cy - 8);
    ctx.font = `12px Inter, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('commandes', cx, cy + 12);
  }

  private renderBarFallback(ctx: CanvasRenderingContext2D): void {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const max = Math.max(...this.monthlyData) || 1;
    const barW = (w - 60) / this.months.length - 8;
    const padLeft = 30;
    const padBottom = 28;

    ctx.clearRect(0, 0, w, h);

    this.monthlyData.forEach((val, i) => {
      const barH = ((h - padBottom - 10) * val) / max;
      const x = padLeft + i * ((w - 60) / this.months.length + 8);
      const y = h - padBottom - barH;

      const grad = ctx.createLinearGradient(0, y, 0, h - padBottom);
      grad.addColorStop(0, 'rgba(16,185,129,0.9)');
      grad.addColorStop(1, 'rgba(16,185,129,0.2)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      (ctx as any).roundRect?.(x, y, barW, barH, 6) ?? ctx.rect(x, y, barW, barH);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.months[i], x + barW / 2, h - 8);
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getStatusCount(key: string): number {
    if (!this.dashboard) return 0;
    return (this.dashboard.statusMap as any)[key] || 0;
  }

  getStatusPercent(key: string): number {
    if (!this.dashboard) return 0;
    const total = Object.values(this.dashboard.statusMap).reduce((a, b) => a + b, 0);
    return total > 0 ? Math.round((this.getStatusCount(key) / total) * 100) : 0;
  }

  getTotalFromMap(): number {
    if (!this.dashboard) return 0;
    return Object.values(this.dashboard.statusMap).reduce((a, b) => a + b, 0);
  }

  formatNumber(v: number): string {
    return new Intl.NumberFormat('fr-FR').format(v);
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 2
    }).format(v);
  }

  get monthlyAverage(): string {
  if (!this.monthlyData.length) return '0';
  const sum = this.monthlyData.reduce((a, b) => a + b, 0);
  return (sum / this.monthlyData.length).toFixed(0);
}

}