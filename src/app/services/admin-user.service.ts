import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdminUserCreate {
  email: string;
  firstName: string;
  lastName: string;
  roleLabel?: string;
  permissionIds: number[];
  enabled: boolean;
}

export interface UpdateAdminUserRequest {
  firstName?: string;
  lastName?: string;
  roleLabel?: string;
  permissionIds?: number[];
  enabled?: boolean;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
}

/**
 * Le backend retourne directement Map<String, List<PermissionDto>>
 * ex: { "SELLERS": [...], "ORDERS": [...] }
 */
export type PermissionsCatalog = { [category: string]: Permission[] };

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roleLabel: string;
  enabled: boolean;
  createdAt: string;
  permissions: Permission[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {

  private readonly apiUrl = `${environment.apiUrl}/api/admin/users`;

  constructor(private http: HttpClient) {}

  /** Liste paginée — avec recherche optionnelle via ?q= sur le même endpoint */
  getAllAdminUsers(page = 0, size = 10): Observable<PageResponse<AdminUser>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<AdminUser>>(this.apiUrl, { params });
  }

  /** Recherche — même endpoint GET /api/admin/users?q=...&page=...&size=... */
  searchAdminUsers(q: string, page = 0, size = 10): Observable<PageResponse<AdminUser>> {
    const params = new HttpParams()
      .set('q', q)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<AdminUser>>(this.apiUrl, { params });
  }

  getAdminUserById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/${id}`);
  }

  createAdminUser(payload: AdminUserCreate & { roleLabel?: string }): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.apiUrl, payload);
  }

  updateAdminUser(id: number, payload: UpdateAdminUserRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/${id}`, payload);
  }

  toggleUserStatus(id: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  deleteAdminUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Retourne Map<String, List<PermissionDto>> directement :
   * { "SELLERS": [{id, name, description, category}, ...], "ORDERS": [...] }
   */
  getPermissionsCatalog(): Observable<PermissionsCatalog> {
    return this.http.get<PermissionsCatalog>(`${this.apiUrl}/permissions-catalog`);
  }
}