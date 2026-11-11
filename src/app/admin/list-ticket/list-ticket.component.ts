import { SupportService, Ticket, TicketPageResponse, TicketStats } from '@/services/support.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-list-ticket',
  imports: [CommonModule, FormsModule, RouterModule, ToastModule],
  templateUrl: './list-ticket.component.html',
  styleUrl: './list-ticket.component.scss'
})
export class ListTicketComponent implements OnInit{

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  paginatedTickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  ticketMessages: any[] = [];

  stats: TicketStats = {
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    urgentTickets: 0,
    highPriorityTickets: 0,
    unreadMessages: 0
  };

  loading: boolean = false;
  viewMode: 'table' | 'grid' = 'table';
  showDetailsModal: boolean = false;
  showAssignModal: boolean = false;
  showStatusModal: boolean = false;
  showReplyModal: boolean = false;
  showImageModal: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  
  searchQuery: string = '';
  statusFilter: string = '';
  priorityFilter: string = '';
  categoryFilter: string = '';

  statusOptions = [
    { value: 'OPEN', label: 'Ouvert', icon: 'pi pi-folder-open', color: '#3b82f6' },
    { value: 'IN_PROGRESS', label: 'En cours', icon: 'pi pi-spinner', color: '#f59e0b' },
    { value: 'RESOLVED', label: 'Résolu', icon: 'pi pi-check-circle', color: '#10b981' },
    { value: 'CLOSED', label: 'Fermé', icon: 'pi pi-times-circle', color: '#6b7280' }
  ];
  
  priorityOptions = [
    { value: 'LOW', label: 'Basse', icon: 'pi pi-arrow-down', color: '#6b7280' },
    { value: 'MEDIUM', label: 'Moyenne', icon: 'pi pi-minus', color: '#3b82f6' },
    { value: 'HIGH', label: 'Haute', icon: 'pi pi-arrow-up', color: '#f59e0b' },
    { value: 'URGENT', label: 'Urgente', icon: 'pi pi-exclamation-triangle', color: '#ef4444' }
  ];

  categoryOptions = [
    { value: 'TECHNICAL', label: 'Technique', icon: 'pi pi-wrench' },
    { value: 'BILLING', label: 'Facturation', icon: 'pi pi-euro' },
    { value: 'ACCOUNT', label: 'Compte', icon: 'pi pi-user' },
    { value: 'OTHER', label: 'Autre', icon: 'pi pi-question' }
  ];

  replyMessage: string = '';
  replyAttachment: File | null = null;

  assignAdminId: number = 1; // À remplacer par la liste des admins
  assignPriority: string = 'MEDIUM';
  
  // Formulaire de statut
  newStatus: string = '';
  resolution: string = '';
  
  // Image
  selectedImagePath: string = '';

  constructor(
    private supportService: SupportService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
     this.loadTickets();
     this.loadStats();
  }


  loadTickets(): void {
    this.loading = true;
    
    const page = this.currentPage - 1;
    
    let request;
    if (this.statusFilter) {
      request = this.supportService.getTicketsByStatus(this.statusFilter, page, this.itemsPerPage);
    } else if (this.priorityFilter) {
      request = this.supportService.getTicketsByPriority(this.priorityFilter, page, this.itemsPerPage);
    } else if (this.categoryFilter) {
      request = this.supportService.getTicketsByCategory(this.categoryFilter, page, this.itemsPerPage);
    } else {
      request = this.supportService.getAllTickets(page, this.itemsPerPage);
    }
    
    request.subscribe({
      next: (response: TicketPageResponse) => {
        this.tickets = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.filteredTickets = [...this.tickets];
        this.updatePaginatedTickets();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tickets:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger la liste des tickets'
        });
        this.loading = false;
      }
    });
  }

  //

  loadStats(): void {
    this.supportService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stats:', error);
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.categoryFilter = '';
    this.currentPage = 1;
    this.loadTickets();
  }

  refreshData(): void {
    this.loadTickets();
    this.loadStats();
    this.messageService.add({
      severity: 'info',
      summary: 'Rafraîchissement',
      detail: 'Données mises à jour'
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTickets();
    }
  }

  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  updatePaginatedTickets(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTickets = this.filteredTickets.slice(startIndex, endIndex);
  }

  viewTicketDetails(ticket: Ticket): void {
    this.loading = true;
    this.supportService.getTicketDetails(ticket.id).subscribe({
      next: (ticketDetails) => {
        this.selectedTicket = ticketDetails;
        this.ticketMessages = ticketDetails.recentMessages || [];
        this.showDetailsModal = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les détails du ticket'
        });
        this.loading = false;
      }
    });
  }

  openReplyModal(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.replyMessage = '';
    this.replyAttachment = null;
    this.showReplyModal = true;
  }

  openAssignModal(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.assignAdminId = 1;
    this.assignPriority = ticket.priority || 'MEDIUM';
    this.showAssignModal = true;
  }

  openStatusModal(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.newStatus = ticket.status;
    this.resolution = '';
    this.showStatusModal = true;
  }

  sendReply(): void {
    if (!this.replyMessage.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez saisir un message'
      });
      return;
    }

    this.loading = true;
    this.supportService.addMessage(
      this.selectedTicket!.id, 
      this.replyMessage, 
      this.replyAttachment || undefined
    ).subscribe({
      next: (message) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Message envoyé avec succès'
        });
        this.showReplyModal = false;
        this.loading = false;
        // Recharger les détails du ticket
        this.viewTicketDetails(this.selectedTicket!);
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du message:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible d\'envoyer le message'
        });
        this.loading = false;
      }
    });
  }

  assignTicket(): void {
    this.loading = true;
    this.supportService.assignTicket(this.selectedTicket!.id, {
      adminId: this.assignAdminId,
      priority: this.assignPriority
    }).subscribe({
      next: (ticket) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Ticket assigné avec succès'
        });
        this.showAssignModal = false;
        this.loading = false;
        this.loadTickets();
      },
      error: (error) => {
        console.error('Erreur lors de l\'assignation:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible d\'assigner le ticket'
        });
        this.loading = false;
      }
    });
  }

  updateStatus(): void {
    this.loading = true;
    this.supportService.updateTicketStatus(this.selectedTicket!.id, {
      status: this.newStatus,
      resolution: this.resolution
    }).subscribe({
      next: (ticket) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Statut mis à jour avec succès'
        });
        this.showStatusModal = false;
        this.loading = false;
        this.loadTickets();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de mettre à jour le statut'
        });
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.replyAttachment = event.target.files[0];
    }
  }

  viewImage(imagePath: string): void {
    this.selectedImagePath = this.getFullImagePath(imagePath);
    this.showImageModal = true;
  }

  closeModals(): void {
    this.showDetailsModal = false;
    this.showAssignModal = false;
    this.showStatusModal = false;
    this.showReplyModal = false;
    this.showImageModal = false;
    this.selectedTicket = null;
    this.ticketMessages = [];
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'OPEN': 'status-open',
      'IN_PROGRESS': 'status-progress',
      'RESOLVED': 'status-resolved',
      'CLOSED': 'status-closed'
    };
    return classMap[status] || '';
  }

  getStatusIcon(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.icon : 'pi-question';
  }

  getStatusColor(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.color : '#6b7280';
  }

  getPriorityLabel(priority: string): string {
    const option = this.priorityOptions.find(opt => opt.value === priority);
    return option ? option.label : priority;
  }

  getPriorityClass(priority: string): string {
    const classMap: { [key: string]: string } = {
      'LOW': 'priority-low',
      'MEDIUM': 'priority-medium',
      'HIGH': 'priority-high',
      'URGENT': 'priority-urgent'
    };
    return classMap[priority] || '';
  }

  getPriorityIcon(priority: string): string {
    const option = this.priorityOptions.find(opt => opt.value === priority);
    return option ? option.icon : 'pi-minus';
  }

  getPriorityColor(priority: string): string {
    const option = this.priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : '#6b7280';
  }

  getCategoryLabel(category: string): string {
    const option = this.categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  }

  getCategoryIcon(category: string): string {
    const option = this.categoryOptions.find(opt => opt.value === category);
    return option ? option.icon : 'pi-tag';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return this.formatDate(dateString);
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  truncateEmail(email: string, maxLength: number = 20): string {
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength) + '...';
  }

  getFullImagePath(path: string): string {
    if (!path) return '';
    // Adapter selon votre configuration serveur
    return `${environment.apiUrl}/${path.replace(/\\/g, '/')}`;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalElements);
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

  get showEllipsis(): boolean {
    return this.totalPages > 5 && this.currentPage < this.totalPages - 2;
  }


  getUnreadCount(): number {
    return this.ticketMessages.filter(m => !m.read && m.senderRole === 'SELLER').length;
  }

}
