import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DepositRequest {
  amount: number;
  paymentMethodType: string;
  proofDocument: File;
}

export interface DepositResponse {
  message: string;
  depositId: number;
  paymentMethodType: string;
  status: string;
  createdAt: string;
}

// deposit.model.ts
export interface Deposit {
  id: number;
  wallet: {
    id: number;
    seller: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      storeName: string;
      country: string;
      phone: string;
    };
    balance: number;
  };
  amount: number;
  paymentMethodType: string;
  proofDocumentPath: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositPageResponse {
  content: Deposit[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface DepositStats {
  totalDeposits: number;
  pendingDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  totalAmount: number;
}

export interface WalletInfo {
  walletId: number;
  balance: number;
  sellerId: number;
  createdAt: string | null;
}

// ================= WITHDRAWAL =================
export interface WithdrawalRequest {
  amount: number;
  paymentMethod: string; // BINANCE, BANK_TRANSFER...
  accountDetails: string; // ID Binance, IBAN/RIB...
}

export interface WithdrawalResponse {
  id: number;
  amount: number;
  paymentMethod: string;
  accountDetails: string;
  status: string; // PENDING, COMPLETED, REJECTED
  rejectionReason?: string;
  proofDocumentPath?: string;
  processedAt?: string;
  createdAt: string;
  walletInfo: {
    id: number;
    balance: number;
    sellerId: number;
    sellerName: string;
    sellerEmail: string;
  };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ================= FEES =================
export type FeeType = 'LEAD_FEE' | 'DELIVERED_FEE' | 'RETURNED_FEE';

export interface Fee {
  id: number;
  type: FeeType;
  amount: number;
  updatedAt: string;
}

// ================= TRANSACTIONS =================
export type TransactionType = 'BALANCE' | 'WITHDRAW' | 'PAYMENT_ORDER' | 'FEE';

export interface WalletTransaction {
  id: number;
  sellerId: number;
  sellerName: string;
  sellerEmail: string;
  type: TransactionType;
  feeType?: FeeType;
  amount: number; // signé
  balanceAfter: number;
  description: string;
  relatedOrderId?: string;
  relatedDepositId?: number;
  relatedWithdrawalId?: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private apiUrl = `${environment.apiUrl}/api/wallet`;
  private adminFeesUrl = `${environment.apiUrl}/api/admin/fees`;
  private adminTransactionsUrl = `${environment.apiUrl}/api/admin/wallet-transactions`;

  constructor(private http: HttpClient) { }

   /**
   * Créer une demande de dépôt
   * @param paymentMethodType Type de méthode de paiement
   * @param file Fichier justificatif
   */
   createDeposit(amount: number, paymentMethodType: string, file: File): Observable<DepositResponse> {
    const formData = new FormData();
    formData.append('amount', amount.toString());
    formData.append('paymentMethodType', paymentMethodType);
    formData.append('proofDocument', file, file.name);

    return this.http.post<DepositResponse>(`${this.apiUrl}/deposit`, formData);
  }


  /**
   * Récupérer l'historique des dépôts (si l'API existe)
   */
  getDepositHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/deposits`);
  }

  /**
   * Récupérer les informations du wallet (si l'API existe)
   */
  getWalletInfo(): Observable<WalletInfo> {
    return this.http.get<WalletInfo>(`${this.apiUrl}`);
  }

  ///

  getAllDeposits(page: number = 0, size: number = 10): Observable<DepositPageResponse> {
    return this.http.get<DepositPageResponse>(`${this.apiUrl}/all-deposits?page=${page}&size=${size}`);
  }

  // ================= ADMIN : confirmer / rejeter un dépôt =================

  approveDeposit(depositId: number, amount: number): Observable<any> {
    const params = new HttpParams().set('amount', amount);
    return this.http.patch(`${this.apiUrl}/admin/deposits/${depositId}/approve`, null, { params });
  }

  rejectDeposit(depositId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/deposits/${depositId}/reject`, null);
  }

  // ================= WITHDRAWAL (Seller) =================

  requestWithdrawal(request: WithdrawalRequest): Observable<WithdrawalResponse> {
    return this.http.post<WithdrawalResponse>(`${this.apiUrl}/withdrawals`, request);
  }

  getMyWithdrawals(page: number = 0, size: number = 10): Observable<PageResponse<WithdrawalResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<WithdrawalResponse>>(`${this.apiUrl}/withdrawals/my-withdrawals`, { params });
  }

  // ================= WITHDRAWAL (Admin) =================

  getAllWithdrawals(page: number = 0, size: number = 10): Observable<PageResponse<WithdrawalResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<WithdrawalResponse>>(`${this.apiUrl}/withdrawals/admin/all`, { params });
  }

  processWithdrawal(withdrawalId: number, action: 'APPROVE' | 'REJECT', reason?: string, proofDocument?: File): Observable<any> {
    let params = new HttpParams().set('action', action);
    if (reason) params = params.set('reason', reason);

    const formData = new FormData();
    if (proofDocument) {
      formData.append('proofDocument', proofDocument, proofDocument.name);
    }

    return this.http.post(`${this.apiUrl}/withdrawals/admin/${withdrawalId}/process`, formData, { params });
  }

  // ================= FEES (Admin) =================

  getAllFees(): Observable<Fee[]> {
    return this.http.get<Fee[]>(this.adminFeesUrl);
  }

  createFee(type: FeeType, amount: number): Observable<Fee> {
    return this.http.post<Fee>(this.adminFeesUrl, { type, amount });
  }

  updateFee(id: number, amount: number): Observable<Fee> {
    const params = new HttpParams().set('amount', amount);
    return this.http.put<Fee>(`${this.adminFeesUrl}/${id}`, null, { params });
  }

  deleteFee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminFeesUrl}/${id}`);
  }

  // ================= TRANSACTIONS =================

  getMyTransactions(page: number = 0, size: number = 20): Observable<PageResponse<WalletTransaction>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<WalletTransaction>>(`${this.apiUrl}/transactions`, { params });
  }

  getAllTransactions(page: number = 0, size: number = 20): Observable<PageResponse<WalletTransaction>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<WalletTransaction>>(this.adminTransactionsUrl, { params });
  }

}
