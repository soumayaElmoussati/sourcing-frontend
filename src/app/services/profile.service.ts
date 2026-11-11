// src/app/core/services/user-profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  profilePhotoPath?: string;
  sellerInfo?: SellerInfo;
}

export interface SellerInfo {
  storeName: string;
  country: string;
  budget: string;
  phone: string;
  commerceExperience: boolean;
  adsExperience: boolean;
  status: string;
  idCardRectoPath: string;
  idCardVersoPath: string;
}

// src/app/models/update-profile.dto.ts
export interface UpdateProfileDto {
  id: number;
  firstName: string;
  lastName: string;
}

export interface UpdateSellerProfileDto {
  firstName: string;
  lastName: string;
  phone: string;
  country?: string;
  storeName?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}


@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private readonly API_URL = `${environment.apiUrl}/api/user`;
  private readonly SELLER_ACCOUNT_URL = `${environment.apiUrl}/api/seller/account`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.API_URL}/profile`);
  }

   updateProfile(payload: UpdateProfileDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.API_URL}/update-profile`,payload);
  }

  // ================= SELLER SELF-SERVICE =================

  updateSellerProfile(payload: UpdateSellerProfileDto): Observable<any> {
    return this.http.put(`${this.SELLER_ACCOUNT_URL}/profile`, payload);
  }

  changePassword(payload: ChangePasswordDto): Observable<any> {
    return this.http.put(`${this.SELLER_ACCOUNT_URL}/password`, payload);
  }

  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file, file.name);
    return this.http.post(`${this.SELLER_ACCOUNT_URL}/photo`, formData);
  }

}
