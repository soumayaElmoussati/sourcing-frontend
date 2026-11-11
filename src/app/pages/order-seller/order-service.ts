import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOrderDto, OrderResponseDto, UpdateOrderDto } from './order-models';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly API_URL = `${environment.apiUrl}/api/seller/orders`; 

  constructor(private http: HttpClient) {}

  // ======================
  // CREATE ORDER
  // ======================
  createOrder(dto: CreateOrderDto): Observable<OrderResponseDto> {
    return this.http.post<OrderResponseDto>(this.API_URL, dto);
  }

  // ======================
  // GET SELLER ORDERS
  // ======================
  getMyOrders(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get(this.API_URL, { params });
  }

  // ======================
  // GET ORDER DETAILS
  // ======================
  getOrderById(orderId: string): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(`${this.API_URL}/${orderId}`);
  }

  // ======================
  // UPDATE ORDER (tant que PENDING)
  // ======================
  updateOrder(orderId: string, dto: UpdateOrderDto): Observable<OrderResponseDto> {
    return this.http.patch<OrderResponseDto>(`${this.API_URL}/${orderId}`, dto);
  }

  // ======================
  // CANCEL ORDER (tant que PENDING)
  // ======================
  cancelOrder(orderId: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${orderId}/cancel`, {});
  }
}
