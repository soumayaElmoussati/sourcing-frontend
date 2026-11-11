import { AdminUser, AdminUserService, UserStats } from '@/services/admin-user.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-list-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ToastModule],
  providers: [MessageService],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.scss'
})
export class ListUsersComponent implements OnInit {

  users: AdminUser[] = [];
  stats: UserStats = { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 };

  currentPage = 0;
  pageSize    = 10;
  totalElements = 0;
  totalPages    = 0;

  searchQuery   = '';
  searchFocused = false;
  loading       = false;

  showDeleteModal  = false;
  showDetailsModal = false;
  selectedUser: AdminUser | null = null;

  // Category colors
  readonly CAT_COLOR: Record<string, string> = {
    SELLERS: 'blue', ORDERS: 'green', PRODUCTS: 'indigo',
    SOURCING: 'orange', WALLET: 'teal', SETTINGS: 'purple'
  };

  constructor(
    private userService: AdminUserService,
    private messageService: MessageService
  ) {}

  ngOnInit() { this.loadUsers(); this.loadStats(); }

  loadUsers() {
    this.loading = true;
    this.userService.getAllAdminUsers(this.currentPage, this.pageSize).subscribe({
      next: r => {
        this.users = r.content;
        this.totalElements = r.totalElements;
        this.totalPages    = r.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadStats() {
    this.userService.getUserStats().subscribe(s => this.stats = s);
  }

  onSearch() {
    this.currentPage = 0;
    if (this.searchQuery.trim()) {
      this.userService.searchAdminUsers(this.searchQuery, 0, this.pageSize).subscribe(r => {
        this.users = r.content;
        this.totalPages = r.totalPages;
      });
    } else {
      this.loadUsers();
    }
  }

  changePage(p: number) {
    if (p < 0 || p >= this.totalPages) return;
    this.currentPage = p;
    this.loadUsers();
  }

  getPageNumbers(): number[] {
    const max = 5; const pages: number[] = [];
    let start = Math.max(0, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages - 1, start + max - 1);
    if (end - start + 1 < max) start = Math.max(0, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  openDetails(user: AdminUser) {
    this.selectedUser = user;
    this.showDetailsModal = true;
  }

  openDelete(user: AdminUser) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.selectedUser) return;
    this.userService.deleteAdminUser(this.selectedUser.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: 'Utilisateur supprimé.' });
        this.showDeleteModal = false;
        this.loadUsers(); this.loadStats();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer.' })
    });
  }

  toggleStatus(user: AdminUser) {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: updated => {
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx !== -1) this.users[idx] = updated as AdminUser;
        this.loadStats();
        this.messageService.add({
          severity: 'success', summary: 'Mis à jour',
          detail: `Compte ${(updated as AdminUser).enabled ? 'activé' : 'désactivé'}.`
        });
      }
    });
  }

  permissionsByCategory(user: AdminUser): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    user.permissions?.forEach(p => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p.name);
    });
    return map;
  }

  catColor(cat: string): string { return this.CAT_COLOR[cat] ?? 'slate'; }

  objectKeys(obj: Record<string, any>): string[] { return Object.keys(obj); }
}