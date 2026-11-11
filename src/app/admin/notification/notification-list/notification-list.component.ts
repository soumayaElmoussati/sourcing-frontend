import { Component, OnInit } from "@angular/core";
import { Notification, NotificationService } from "../notificatio.service";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  providers: [MessageService]
})
export class NotificationListComponent implements OnInit {

  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];

  // Pagination (adaptée à l'API Spring)
  currentPage: number = 0; // Spring commence à 0
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  firstPage: boolean = true;
  lastPage: boolean = false;
  
  // Filtres
  searchQuery: string = '';
  typeFilter: string = '';
  
  showDeleteModal: boolean = false;
  notificationToDelete: Notification | null = null;
  isDeleting: boolean = false;

  constructor(
    private service: NotificationService,
    private router: Router, private messageService: MessageService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.notifications = response.content;
        this.filteredNotifications = response.content; // Pas de filtrage client
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.firstPage = response.first;
        this.lastPage = response.last;
      },
      error: (err) => {
        console.error('Erreur chargement notifications', err);
      }
    });
  }

  // Navigation
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.load();
    }
  }

  nextPage() {
    if (!this.lastPage) {
      this.currentPage++;
      this.load();
    }
  }

  previousPage() {
    if (!this.firstPage) {
      this.currentPage--;
      this.load();
    }
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.load();
  }

  // Filtres (appliqués côté serveur plus tard si besoin)
  applyFilters() {
    // Pour l'instant, on recharge simplement
    this.currentPage = 0;
    this.load();
  }

  clearFilters() {
    this.searchQuery = '';
    this.typeFilter = '';
    this.currentPage = 0;
    this.load();
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  /////

  getStartIndex(): number {
    return this.currentPage * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  goToCreate() {
    this.router.navigate(['/admin/notifications/create']);
  }

  edit(id: number) {
    this.router.navigate(['/admin/notifications/edit', id]);
  }

  openDeleteModal(notification: Notification) {
    this.notificationToDelete = notification;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.notificationToDelete = null;
  }

  confirmDelete() {
    if (!this.notificationToDelete) return;
    
    this.isDeleting = true;
    this.service.delete(this.notificationToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.load();

        this.messageService.add({
          severity: 'error',
          summary: 'Confirmation de suppression',
          detail: 'Notification a été supprimée avec succès',
          life: 3000
        });
        
      },
      error: (err) => {
        console.error('Erreur suppression', err);
        this.isDeleting = false;
      }
    });
  }

  truncateMessage(message: string, length: number): string {
    if (message.length <= length) return message;
    return message.substring(0, length) + '...';
  }
}