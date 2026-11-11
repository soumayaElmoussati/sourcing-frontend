import { SellerDetails, UpdateStatusRequest } from '@/admin/details-seller/details-seller.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SellerDTO {
  id?: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  storeName?: string;
  country?: string;
  budget?: string;
  commerceExperience?: boolean;
  status?: string;
  adsExperience?: boolean;

  firstNameInput?: string;
  lastNameInput?: string;
  phoneInput?: string;
  emailInput?: string;
  passwordInput?: string;
  storeNameInput?: string;
  countryInput?: string;
  budgetInput?: string;
  commerceExperienceInput?: boolean;
  adsExperienceInput?: boolean;
  
  idCardRecto?: File;
  idCardVerso?: File;

  createdAt?: string;
  updatedAt?: string;

  // Soft delete
  deleted?: boolean;
  deletedAt?: string;
}


export interface Seller extends SellerDTO {
  fullName: string;
  status: 'active' | 'pending' | 'suspended';
  avatar?: string;
  cin?: string;
  registrationDate: Date;
  lastActivity: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {

  private apiUrl = `${environment.apiUrl}/api/sellers`;

  constructor(private http: HttpClient) {}

  createSeller(formData: FormData): Observable<SellerDTO> {
    return this.http.post<SellerDTO>(this.apiUrl, formData);
  }

  getAllSellers(): Observable<SellerDTO[]> {
    return this.http.get<SellerDTO[]>(this.apiUrl);
  }

  getSellerById(id: number): Observable<SellerDTO> {
    return this.http.get<SellerDTO>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un vendeur
  updateSeller(id: number, sellerData: any): Observable<SellerDTO> {
    return this.http.put<SellerDTO>(`${this.apiUrl}/${id}`, sellerData);
  }

  // Supprimer un vendeur (soft delete : le vendeur est marqué comme supprimé,
  // il n'est pas retiré de la base de données)
  deleteSeller(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Récupérer la liste des vendeurs supprimés (corbeille)
  getAllDeletedSellers(): Observable<SellerDTO[]> {
    return this.http.get<SellerDTO[]>(`${this.apiUrl}/deleted`);
  }

  // Restaurer un vendeur précédemment supprimé
  restoreSeller(id: number): Observable<SellerDTO> {
    return this.http.patch<SellerDTO>(`${this.apiUrl}/${id}/restore`, {});
  }

  // Supprimer définitivement un vendeur (irréversible, uniquement depuis la corbeille)
  permanentlyDeleteSeller(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/permanent`);
  }

  updateStatus(id: number, status: string): Observable<SellerDTO> {
    return this.http.patch<SellerDTO>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Rechercher des vendeurs
  searchSellers(query: string): Observable<SellerDTO[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<SellerDTO[]>(`${this.apiUrl}/search`, { params });
  }

  // Filtrer les vendeurs
  filterSellers(filters: any): Observable<SellerDTO[]> {
    let params = new HttpParams();
    
    if (filters.status) params = params.set('status', filters.status);
    if (filters.country) params = params.set('country', filters.country);
    if (filters.storeName) params = params.set('storeName', filters.storeName);
    
    return this.http.get<SellerDTO[]>(`${this.apiUrl}/filter`, { params });
  }

  // Transformer DTO en Seller complet
  transformToSeller(dto: SellerDTO): Seller {
    return {
      ...dto,
      fullName: `${dto.firstName || ''} ${dto.lastName || ''}`.trim(),
      status: this.determineStatus(dto),
      avatar: this.generateAvatar(dto.firstName || '', dto.lastName || ''),
      cin: this.generateRandomCin(),
      registrationDate: new Date(dto.createdAt || new Date()),
      lastActivity: new Date(dto.updatedAt || new Date())
    };
  }

  // Déterminer le statut
  private determineStatus(dto: SellerDTO): 'active' | 'pending' | 'suspended' {
    if (!dto.createdAt) return 'pending';
    
    const createdDate = new Date(dto.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays > 30) return 'active';
    if (diffDays > 7) return 'pending';
    return 'suspended';
  }

  // Générer avatar
  private generateAvatar(firstName: string, lastName: string): string {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const colors = ['0D8ABC', '1ABC9C', '2ECC71', '3498DB', '9B59B6', 'E74C3C', 'F39C12', 'D35400'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&bold=true`;
  }

  // Générer CIN aléatoire
  private generateRandomCin(): string {
    return 'C' + Math.floor(10000000 + Math.random() * 90000000);
  }

  updateSellerStatus(id: number, request: UpdateStatusRequest): Observable<SellerDetails> {
    return this.http.patch<SellerDetails>(`${this.apiUrl}/${id}/status`, request);
  }


}
