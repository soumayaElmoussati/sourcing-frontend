import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'GLOBAL' | 'TARGETED';
  createdAt: string;
}

export interface NotificationRequest {
  title: string;
  message: string;
  type: 'GLOBAL' | 'TARGETED';
  emails?: string[];
  existingImages: string[];
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'GLOBAL' | 'TARGETED';
  targetUserEmails: string[];
  imgsNotifications: string[];
  imgsPath: string[];
}

// Interface pour la réponse paginée
export interface PaginatedResponse {
  content: Notification[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private api = `${environment.apiUrl}/api/notifications`; 

  constructor(private http: HttpClient) { }

  // Méthode avec pagination
  getAll(page: number = 0, size: number = 10) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PaginatedResponse>(this.api + "/admin", { params });
  }

  getById(id: number) {
    return this.http.get<NotificationResponse>(`${this.api}/${id}`);
  }

  getImage(notificationId: number, index: number) {
    return this.http.get(
      `${this.api}/${notificationId}/image/${index}`,
      { responseType: 'blob' }
    );
  }

  create(formData: FormData) {
    return this.http.post<void>(this.api, formData);
  }

  update(id: number, formData: FormData) {
    return this.http.put<void>(`${this.api}/${id}`, formData);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}