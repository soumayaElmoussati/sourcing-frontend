import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


export type ProductStatus = 'REJECTED' | 'OUT_OF_STOCK' | 'PAUSED' | 'ACTIVE' | 'APPROVED' | 'PENDING_APPROVAL' | 'DRAFT';
export type country = 'KSA' | 'UAE' | 'KW' | 'QA' | 'OM' | 'BH' | 'IQ';
export type FulfillmentMode = 'CENTRALIZED' | 'LOCAL_SINGLE_COUNTRY';

export interface InventoryDTO {
  warehouse: string;
  available: number;
  reserved: number;
  returned: number;
}

export interface SellerInfo {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  storeName?: string;
  country: string;
  budget?: string;
  commerceExperience?: boolean;
  adsExperience?: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDTO {
  id: string;
  nameProduct: string;
  descriptionProduct: string;
  price: number;
  qteStock: number;
  poidsKg: number;
  fulfillmentMode: FulfillmentMode;
  country: country;
  status: ProductStatus;
  rejectionReason?: string;
  canEditPrice: boolean;
  inventories?: InventoryDTO[];
  seller?: SellerInfo;
}


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly API_URL = `${environment.apiUrl}/api/seller/products`;

  constructor(private http: HttpClient) { }

  // ================= SELLER =================

  /** 🔹 Récupérer MES produits (seller connecté) */
  getMyProducts(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.API_URL}/mesProducts`, { params });
  }

  /** 🔹 Récupérer tous les produits (admin / global) */
  getAllProducts(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(this.API_URL, { params });
  }

  /** 🔹 Récupérer un produit par ID */
  getById(id: string): Observable<ProductDTO> {
    return this.http.get<ProductDTO>(`${this.API_URL}/${id}`);
  }

  // ================= ACTIONS SELLER =================

  /** ⏸️ Mettre en pause un produit */
  pause(productId: string): Observable<void> {
    // return this.http.patch<void>(
    //   `${this.API_URL}/${productId}/pause`,
    //   {}
    // );
    return null as any;
  }

  /** ▶️ Activer un produit */
  activate(productId: string): Observable<void> {
    // return this.http.patch<void>(
    //   `${this.API_URL}/${productId}/activate`,
    //   {}
    // );
    return null as any;
  }

  changeStatus(id: string, status: ProductStatus) {
    return this.http.patch(
      `${this.API_URL}/changeStatus/${id}`,
      JSON.stringify(status),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  rejectProduct(id: string, reason: string) {
    return this.http.post(`${this.API_URL}/rejectProducts/${id}`, reason, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


  // ================= STATS =================

  /** 📊 Stats globales */
  getStats(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.API_URL}/stats`);
  }

  /** 📊 Stats du seller connecté */
  getMyStats(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.API_URL}/stats/me`);
  }

  getMyProductsAll(): Observable<any> {
    return this.http.get(`${this.API_URL}/mesProducts/all`);
  }

}
