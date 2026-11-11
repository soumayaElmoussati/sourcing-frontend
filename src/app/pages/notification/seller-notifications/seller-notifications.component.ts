import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationResponse } from '@/admin/notification/notificatio.service';
import { NotificationSellerService } from '../notification-seller.service';

interface NotificationGroup {
  label: string;
  items: NotificationResponse[];
}

@Component({
  selector: 'app-seller-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './seller-notifications.component.html',
  styleUrls: ['./seller-notifications.component.scss']
})
export class SellerNotificationsComponent implements OnInit {

  notifications: NotificationResponse[] = [];
  loading = false;

  // Toolbar
  filter: 'all' | 'unread' = 'all';
  searchQuery = '';

  // Vue détail (façon boîte de réception)
  selected: NotificationResponse | null = null;
  wasUnreadOnOpen = false;

  constructor(private service: NotificationSellerService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.service.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.loading = false;
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get filteredNotifications(): NotificationResponse[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.notifications.filter(n => {
      const matchesFilter = this.filter === 'all' || !n.read;
      const matchesSearch =
        !query ||
        n.title?.toLowerCase().includes(query) ||
        n.message?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }

  // Regroupe la liste filtrée sous des libellés "Aujourd'hui / Hier / Cette semaine / Plus ancien"
  get groupedNotifications(): NotificationGroup[] {
    const groups: NotificationGroup[] = [
      { label: "Aujourd'hui", items: [] },
      { label: 'Hier', items: [] },
      { label: 'Cette semaine', items: [] },
      { label: 'Plus ancien', items: [] },
    ];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    for (const n of this.filteredNotifications) {
      const date = new Date(n.createdAt);

      if (date >= startOfToday) {
        groups[0].items.push(n);
      } else if (date >= startOfYesterday) {
        groups[1].items.push(n);
      } else if (date >= startOfWeek) {
        groups[2].items.push(n);
      } else {
        groups[3].items.push(n);
      }
    }

    return groups.filter(g => g.items.length > 0);
  }

  setFilter(filter: 'all' | 'unread') {
    this.filter = filter;
  }

  selectNotification(n: NotificationResponse) {
    this.wasUnreadOnOpen = !n.read;
    this.selected = n;

    if (!n.read) {
      this.markAsRead(n);
    }
  }

  markAsRead(notification: NotificationResponse) {
    this.service.markAsRead(notification.id).subscribe(() => {
      notification.read = true;
    });
  }

  markAllAsRead() {
    this.notifications
      .filter(n => !n.read)
      .forEach(n => this.markAsRead(n));
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/image-not-found.png';
  }
}