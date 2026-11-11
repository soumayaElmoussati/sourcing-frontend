import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateSourcingRequest, SourcingRequest } from '../models/sourcing-data';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class SourcingRequestService {

    private readonly API_URL = `${environment.apiUrl}/api/seller/sourcing`;

    constructor(private http: HttpClient) { }

    // ================= SELLER =================

    /** Créer une demande de sourcing (avec photos optionnelles) */
    create(request: CreateSourcingRequest, images?: File[]): Observable<SourcingRequest> {
        const formData = new FormData();
        formData.append('nameProduct', request.nameProduct);
        formData.append('description', request.description);
        if (request.linkProduct) formData.append('linkProduct', request.linkProduct);
        formData.append('variants', request.variants);
        if (request.estimatedQuantity != null) {
            formData.append('estimatedQuantity', String(request.estimatedQuantity));
        }
        formData.append('fulfillmentMode', request.fulfillmentMode);
        if (request.country) formData.append('country', request.country);

        if (images && images.length > 0) {
            images.forEach((file) => formData.append('images', file, file.name));
        }

        return this.http.post<SourcingRequest>(this.API_URL, formData);
    }

    /** Payer une demande (passage à APPROVED) */
    pay(requestId: string): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/${requestId}/pay`, {});
    }

    /** Annuler une demande */
    cancel(id: string): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/${id}/cancel`, {});
    }

    // ================= ADMIN =================

    /** Fixer les prix (ADMIN) */
    setPrice(id: string, payload: {
        unitPrice: number;
        localCurrencyPrice?: number | null;
        localCurrencyCode?: string | null;
    }): Observable<any> {
        return this.http.patch<any>(`${this.API_URL}/${id}/price`, payload);
    }

    /** Créer le produit à partir du sourcing (ADMIN) */
    createProduct(productPayload :any): Observable<any> {
        return this.http.post(`${this.API_URL}/createProduct`,productPayload);
    }

    approveRequest(id: string): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/${id}/approve`, {});
    }
// sourcing-request.service.ts
getMyRequests(page: number = 0, size: number = 10): Observable<{
    content: SourcingRequest[],
    totalElements: number,
    totalPages: number,
    number: number,
    first: boolean,
    last: boolean
}> {
    const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());

    return this.http.get<{
        content: SourcingRequest[],
        totalElements: number,
        totalPages: number,
        number: number,
        first: boolean,
        last: boolean
    }>(`${this.API_URL}/mesSourcing`, { params });
}


    getStats(): Observable<any> {
        return this.http.get(`${this.API_URL}/stats`);
    }

    getAllRequests(page: number = 0, size: number = 10): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get(`${this.API_URL}/allSourcing`, { params });
    }

    getById(id: string): Observable<SourcingRequest> {
        return this.http.get<SourcingRequest>(`${this.API_URL}/${id}`);
    }


}