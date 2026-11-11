import { NotificationResponse } from "@/admin/notification/notificatio.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { environment } from "src/environments/environment";




@Injectable({ providedIn: 'root' })
export class NotificationSellerService {

  private api = `${environment.apiUrl}/api/notifications`;

  private notificationsSubject = new BehaviorSubject<NotificationResponse[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

 getAllForSeller() {
    return this.http.get<NotificationResponse[]>(this.api + "/me").subscribe(notifs => this.notificationsSubject.next(notifs));
  }

markAsRead(id: number) {
  return this.http.patch<NotificationResponse>(`${this.api}/${id}/read`, {}).pipe(
      tap(() => {
        // Mise à jour locale du BehaviorSubject pour auto refresh
        const current = this.notificationsSubject.value.map(n => {
          if (n.id === id) return { ...n, read: true };
          return n;
        });
        this.notificationsSubject.next(current);
      })
    );;
}

 getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map(notifs => notifs.filter(n => !n.read).length)
    );
  }

}
