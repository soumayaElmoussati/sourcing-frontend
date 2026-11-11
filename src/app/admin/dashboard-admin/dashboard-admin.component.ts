import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { AdminDashboardService, DashboardData, MonthlyStatDto } from './dashboard-admin.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, ChartModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss']
})
export class DashboardAdminComponent implements OnInit {

  data: DashboardData | null = null;
  isLoading = true;

  // ── Chart data ──────────────────────────────────────────────
  ordersPieData:   any;
  productsPieData: any;
  sellersPieData:  any;
  sourcingPieData: any;
  countryPieData:  any;
  monthlyBarData:  any;

  readonly PIE_COLORS  = ['#10b981','#3b82f6','#f97316','#ef4444','#8b5cf6','#f59e0b','#14b8a6','#ec4899'];
  readonly MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

  pieOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#64748b', font: { size: 11, family: 'Inter' }, padding: 12, usePointStyle: true, pointStyleWidth: 8 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} (${Math.round(ctx.parsed / ctx.dataset.data.reduce((a: number, b: number) => a + b, 0) * 100)}%)` } }
    }
  };

  barOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v: any) => '$' + v.toLocaleString() } }
    }
  };

  constructor(private svc: AdminDashboardService) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.svc.loadAll().subscribe({
      next: d => {
        this.data = d;
        this.buildCharts(d);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  buildCharts(d: DashboardData) {
    // Orders pie
    this.ordersPieData = this.toPie(d.ordersByStatus.map(s => ({ label: this.orderLabel(s.status), value: s.count })));

    // Products pie
    this.productsPieData = this.toPie(d.productsByStatus.map(s => ({ label: this.productLabel(s.status), value: s.count })));

    // Sellers pie
    this.sellersPieData = this.toPie(d.sellersByStatus.map(s => ({ label: this.sellerLabel(s.status), value: s.count })));

    // Sourcing pie
    this.sourcingPieData = this.toPie(d.sourcingByStatus.map(s => ({ label: this.sourcingLabel(s.status), value: s.count })));

    // Country pie (orders)
    this.countryPieData = this.toPie(d.ordersByCountry.slice(0, 6).map(c => ({ label: c.country, value: c.count })));

    // Monthly bar
    const months = this.buildMonthly(d.ordersMonthly);
    this.monthlyBarData = {
      labels: months.map(m => m.label),
      datasets: [{
        label: 'CA (USD)',
        data: months.map(m => m.revenue),
        backgroundColor: months.map((_, i) => i === months.length - 1 ? '#10b981' : 'rgba(16,185,129,.25)'),
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  }

  private toPie(items: { label: string; value: number }[]) {
    return {
      labels: items.map(i => i.label),
      datasets: [{ data: items.map(i => i.value), backgroundColor: this.PIE_COLORS, borderWidth: 2, borderColor: '#fff' }]
    };
  }

  private buildMonthly(stats: MonthlyStatDto[]): { label: string; revenue: number }[] {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const m = d.getMonth() + 1; const y = d.getFullYear();
      const found = stats.find(s => s.month === m && s.year === y);
      return { label: this.MONTH_NAMES[d.getMonth()], revenue: found?.revenue ?? 0 };
    });
  }

  // ── Labels ────────────────────────────────────────────────
  orderLabel(s: string)   { const m: any = { PENDING:'En attente', CONFIRMED:'Confirmé', PREPARED:'Préparé', SHIPPED:'Expédié', DELIVERED:'Livré', CANCELLED:'Annulé', TO_RETURN:'À retourner', RETURNED:'Retourné' }; return m[s] ?? s; }
  productLabel(s: string) { const m: any = { DRAFT:'Brouillon', PENDING_APPROVAL:'En attente', APPROVED:'Approuvé', ACTIVE:'Actif', PAUSED:'Pausé', OUT_OF_STOCK:'Rupture', REJECTED:'Rejeté' }; return m[s] ?? s; }
  sellerLabel(s: string)  { const m: any = { pending:'En attente', approved:'Approuvé', rejected:'Rejeté', suspended:'Suspendu' }; return m[s] ?? s; }
  sourcingLabel(s: string){ const m: any = { PENDING:'En attente', PRE_PAID:'Pré-payé', PAID:'Payé', APPROVED:'Approuvé', COMPLETED:'Complété', CANCELLED:'Annulé', REJECTED:'Rejeté' }; return m[s] ?? s; }

  // ── Getters formatés ──────────────────────────────────────
  get deliveryRate(): number {
    if (!this.data?.kpis.totalOrders) return 0;
    return Math.round((this.data.kpis.deliveredOrders / this.data.kpis.totalOrders) * 100);
  }
  get returnRate(): number {
    if (!this.data?.kpis.totalOrders) return 0;
    return Math.round((this.data.kpis.returnedOrders / this.data.kpis.totalOrders) * 100);
  }
  get topProduct(): string {
    return this.data?.topProducts[0]?.name ?? '—';
  }
}