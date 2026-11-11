import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type PaymentMethodType = 'BINANCE' | 'BANK_TRANSFER';

export interface SellerPaymentMethod {
  id: number;
  methodType: PaymentMethodType;
  label: string;
  accountDetails: string;
  createdAt: string;
}

export interface SellerPaymentMethodRequest {
  methodType: PaymentMethodType;
  label: string;
  accountDetails: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  private readonly API_URL = `${environment.apiUrl}/api/seller/payment-methods`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SellerPaymentMethod[]> {
    return this.http.get<SellerPaymentMethod[]>(this.API_URL);
  }

  create(payload: SellerPaymentMethodRequest): Observable<SellerPaymentMethod> {
    return this.http.post<SellerPaymentMethod>(this.API_URL, payload);
  }

  update(id: number, payload: SellerPaymentMethodRequest): Observable<SellerPaymentMethod> {
    return this.http.put<SellerPaymentMethod>(`${this.API_URL}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
