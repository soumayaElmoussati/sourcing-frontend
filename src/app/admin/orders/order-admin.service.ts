import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'TO_RETURN'
  | 'RETURNED';

export interface OrderResponseDto {
  id: string;

  sellerId: number;
  productId: string;

  customerName: string;
  customerPhone: string;

  country: string;
  city: string;
  fullAddress: string;
  note?: string;

  quantity: number;
  unitPrice: number;
  totalPrice: number;

  paymentMode: string;
  status: OrderStatus;

  fulfillmentMode: string;
  shippingType: string;
  vatAmount: number;

  createdAt: string;

  source?: string;
  externalOrderId?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminOrderService {

  private baseUrl = `${environment.apiUrl}/api/admin/orders`;

  constructor(private http: HttpClient) { }

  getAllOrders(): Observable<OrderResponseDto[]> {
    // Le backend est paginé (Page<OrderResponseDto>) ; on récupère une page
    // large pour simuler "toutes les commandes", car ce composant gère
    // lui-même le filtrage/tri/pagination côté client.
    return this.http
      .get<{ content: OrderResponseDto[] }>(this.baseUrl, { params: { page: 0, size: 1000 } })
      .pipe(map(response => response.content));
  }

  confirm(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/confirm`, {});
  }

  ship(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/ship`, {});
  }

  deliver(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/deliver`, {});
  }

  returnOrder(id: string, reason: string) {
    return this.http.post(
      `${this.baseUrl}/${id}/return`,
      null,
      { params: { reason } }
    );
  }

  restockReturned(orderId: string) {
    return this.http.patch(`${this.baseUrl}/${orderId}/restock-returned`, {});
  }

}
