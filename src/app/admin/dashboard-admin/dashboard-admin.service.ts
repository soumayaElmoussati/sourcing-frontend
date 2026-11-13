import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface AdminKpiDto {
  totalSellers: number; approvedSellers: number; pendingSellers: number;
  totalOrders: number; pendingOrders: number; deliveredOrders: number;
  returnedOrders: number; cancelledOrders: number;
  totalRevenue: number; avgOrderValue: number;
  totalProducts: number; activeProducts: number; pendingProducts: number; rejectedProducts: number;
  totalSourcingRequests: number; pendingSourcing: number; completedSourcing: number;
}
export interface StatusCountDto { status: string; count: number; }
export interface MonthlyStatDto  { month: number; year: number; orderCount: number; revenue: number; }
export interface CountryCountDto { country: string; count: number; }
export interface TopProductDto   { name: string; orderCount: number; revenue: number; }

export interface DashboardData {
  kpis: AdminKpiDto;
  ordersByStatus: StatusCountDto[];
  ordersMonthly: MonthlyStatDto[];
  ordersByCountry: CountryCountDto[];
  productsByStatus: StatusCountDto[];
  topProducts: TopProductDto[];
  sellersByCountry: CountryCountDto[];
  sellersByStatus: StatusCountDto[];
  sourcingByStatus: StatusCountDto[];
}

// KPIs vides par défaut si l'API échoue
const EMPTY_KPIS: AdminKpiDto = {
  totalSellers: 0, approvedSellers: 0, pendingSellers: 0,
  totalOrders: 0, pendingOrders: 0, deliveredOrders: 0,
  returnedOrders: 0, cancelledOrders: 0, totalRevenue: 0, avgOrderValue: 0,
  totalProducts: 0, activeProducts: 0, pendingProducts: 0, rejectedProducts: 0,
  totalSourcingRequests: 0, pendingSourcing: 0, completedSourcing: 0
};

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private base = `${environment.apiUrl}/api/admin/dashboard`;

  constructor(private http: HttpClient) {}

  loadAll(): Observable<DashboardData> {
    return forkJoin({
      kpis:            this.http.get<AdminKpiDto>(`${this.base}/kpis`).pipe(catchError(e => { console.error('kpis error', e); return of(EMPTY_KPIS); })),
      ordersByStatus:  this.http.get<StatusCountDto[]>(`${this.base}/orders/status`).pipe(catchError(e => { console.error('orders/status error', e); return of([]); })),
      ordersMonthly:   this.http.get<MonthlyStatDto[]>(`${this.base}/orders/monthly`).pipe(catchError(e => { console.error('orders/monthly error', e); return of([]); })),
      ordersByCountry: this.http.get<CountryCountDto[]>(`${this.base}/orders/country`).pipe(catchError(e => { console.error('orders/country error', e); return of([]); })),
      productsByStatus:this.http.get<StatusCountDto[]>(`${this.base}/products/status`).pipe(catchError(e => { console.error('products/status error', e); return of([]); })),
      topProducts:     this.http.get<TopProductDto[]>(`${this.base}/products/top`).pipe(catchError(e => { console.error('products/top error', e); return of([]); })),
      sellersByCountry:this.http.get<CountryCountDto[]>(`${this.base}/sellers/country`).pipe(catchError(e => { console.error('sellers/country error', e); return of([]); })),
      sellersByStatus: this.http.get<StatusCountDto[]>(`${this.base}/sellers/status`).pipe(catchError(e => { console.error('sellers/status error', e); return of([]); })),
      sourcingByStatus:this.http.get<StatusCountDto[]>(`${this.base}/sourcing/status`).pipe(catchError(e => { console.error('sourcing/status error', e); return of([]); })),
    }) as Observable<DashboardData>;
  }
}