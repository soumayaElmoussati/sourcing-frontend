import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface OrderStatusMap {
  PENDING:    number;
  CONFIRMED:  number;
  PREPARED:   number;
  SHIPPED:    number;
  DELIVERED:  number;
  CANCELLED:  number;
  TO_RETURN:  number;
  RETURNED:   number;
  TOTAL:      number;
}

export interface SellerDashboard {
  totalOrders:   number;
  monthlyOrders: number;
  delivered:     number;
  deliveryRate:  number;  // %
  returnRate:    number;  // %
  walletBalance: number;
  statusMap:     Omit<OrderStatusMap, 'TOTAL'>;
}

@Injectable({ providedIn: 'root' })
export class ReportSellerService {

  private readonly apiUrl = `${environment.apiUrl}/api/sellers/report`;

  constructor(private http: HttpClient) {}

  getTotalOrders(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/orders/total`);
  }

  getTotalOrdersForCurrentMonth(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/orders/total-month`);
  }

  getOrdersStatusMap(): Observable<OrderStatusMap> {
    return this.http.get<OrderStatusMap>(`${this.apiUrl}/orders/status-map`);
  }

  /** Nouveau : tout le dashboard en un seul appel */
  getDashboard(): Observable<SellerDashboard> {
    return this.http.get<SellerDashboard>(`${this.apiUrl}/dashboard`);
  }
}