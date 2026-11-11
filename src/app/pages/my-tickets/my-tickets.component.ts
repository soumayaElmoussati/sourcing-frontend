import { SupportService, Ticket, TicketPageResponse, TicketStats } from '@/services/support.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-tickets',
  imports: [CommonModule, FormsModule, RouterModule, ToastModule],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.scss'
})
export class MyTicketsComponent implements OnInit{

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
  showCreateModal: boolean = false;
  showDetailsModal: boolean = false;
  showReplyModal: boolean = false;
  showImageModal: boolean = false;
  
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  
  // Filtres
  searchQuery: string = '';
  statusFilter: string = '';
  priorityFilter: string = '';
  
  // Options pour les filtres
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
    { value: 'TECHNICAL', label: 'Problème technique', icon: 'pi pi-wrench' },
    { value: 'BILLING', label: 'Facturation', icon: 'pi pi-euro' },
    { value: 'ACCOUNT', label: 'Compte', icon: 'pi pi-user' },
    { value: 'OTHER', label: 'Autre', icon: 'pi pi-question' }
  ];
  
  // Formulaire de création
  newTicket = {
    subject: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM'
  };
  newTicketAttachment: File | null = null;
  
  // Formulaire de réponse
  replyMessage: string = '';
  replyAttachment: File | null = null;
  
  // Image
  selectedImagePath: string = '';

  constructor(
    private supportService: SupportService,
    private messageService: MessageService
  ) {}


  ngOnInit(): void {
     this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    
    const page = this.currentPage - 1;
    
    this.supportService.getMyTickets(page, this.itemsPerPage).subscribe({
      next: (response: TicketPageResponse) => {
        this.tickets = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.applyClientSideFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tickets:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger vos tickets'
        });
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.supportService.getMyStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stats:', error);
      }
    });
  }


  applyClientSideFilters(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      let matches = true;
      
      // Filtre recherche
      if (this.searchQuery) {
        const searchLower = this.searchQuery.toLowerCase();
        matches = matches && (
          ticket.ticketNumber.toLowerCase().includes(searchLower) ||
          ticket.subject.toLowerCase().includes(searchLower) ||
          ticket.category.toLowerCase().includes(searchLower)
        );
      }
      
      // Filtre statut
      if (this.statusFilter) {
        matches = matches && ticket.status === this.statusFilter;
      }
      
      // Filtre priorité
      if (this.priorityFilter) {
        matches = matches && ticket.priority === this.priorityFilter;
      }
      
      return matches;
    });
    
    this.currentPage = 1;
    this.updatePaginatedTickets();
  }

  /**
   * Appliquer les filtres
   */
  applyFilters(): void {
    this.applyClientSideFilters();
  }

  /**
   * Réinitialiser les filtres
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.applyClientSideFilters();
  }

  /**
   * Rafraîchir les données
   */
  refreshData(): void {
    this.loadTickets();
    this.loadStats();
    this.messageService.add({
      severity: 'info',
      summary: 'Rafraîchissement',
      detail: 'Données mises à jour'
    });
  }

  /**
   * Créer un nouveau ticket
   */
  createTicket(): void {
    if (!this.newTicket.subject.trim() || !this.newTicket.description.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    this.loading = true;
    
    const request: any = {
      subject: this.newTicket.subject,
      description: this.newTicket.description,
      category: this.newTicket.category,
      priority: this.newTicket.priority,
      attachment: this.newTicketAttachment || undefined
    };

    this.supportService.createTicket(request).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: response.message || 'Ticket créé avec succès'
        });
        this.showCreateModal = false;
        this.resetCreateForm();
        this.loadTickets();
        this.loadStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la création du ticket:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer le ticket'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Voir les détails d'un ticket
   */
  viewTicketDetails(ticket: Ticket): void {
    this.loading = true;
    this.supportService.getMyTicketDetails(ticket.id).subscribe({
      next: (ticketDetails) => {
        this.selectedTicket = ticketDetails;
        this.ticketMessages = ticketDetails.recentMessages || [];
        
        // Marquer les messages comme lus (visuellement)
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

  /**
   * Ouvrir le modal de réponse
   */
  openReplyModal(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.replyMessage = '';
    this.replyAttachment = null;
    this.showReplyModal = true;
  }

  /**
   * Envoyer une réponse
   */
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
    this.supportService.addMessageToMyTicket(
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

  /**
   * Gérer le fichier joint pour la création
   */
  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.newTicketAttachment = event.target.files[0];
    }
  }

  /**
   * Gérer le fichier joint pour la réponse
   */
  onReplyFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.replyAttachment = event.target.files[0];
    }
  }

  /**
   * Voir l'image
   */
  viewImage(imagePath: string): void {
    this.selectedImagePath = this.getFullImagePath(imagePath);
    this.showImageModal = true;
  }

  /**
   * Fermer les modals
   */
  closeModals(): void {
    this.showCreateModal = false;
    this.showDetailsModal = false;
    this.showReplyModal = false;
    this.showImageModal = false;
    this.selectedTicket = null;
    this.ticketMessages = [];
  }

  /**
   * Réinitialiser le formulaire de création
   */
  resetCreateForm(): void {
    this.newTicket = {
      subject: '',
      description: '',
      category: 'TECHNICAL',
      priority: 'MEDIUM'
    };
    this.newTicketAttachment = null;
  }

  /**
   * Changer de page
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTickets();
    }
  }

  /**
   * Changer le nombre d'éléments par page
   */
  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.updatePaginatedTickets();
  }

  /**
   * Mettre à jour les tickets paginés
   */
  updatePaginatedTickets(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTickets = this.filteredTickets.slice(startIndex, endIndex);
  }

  /**
   * Obtenir le libellé du statut
   */
  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  /**
   * Obtenir la classe CSS du statut
   */
  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'OPEN': 'status-open',
      'IN_PROGRESS': 'status-progress',
      'RESOLVED': 'status-resolved',
      'CLOSED': 'status-closed'
    };
    return classMap[status] || '';
  }

  /**
   * Obtenir l'icône du statut
   */
  getStatusIcon(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.icon : 'pi-question';
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatusColor(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.color : '#6b7280';
  }

  /**
   * Obtenir le libellé de la priorité
   */
  getPriorityLabel(priority: string): string {
    const option = this.priorityOptions.find(opt => opt.value === priority);
    return option ? option.label : priority;
  }

  /**
   * Obtenir la classe CSS de la priorité
   */
  getPriorityClass(priority: string): string {
    const classMap: { [key: string]: string } = {
      'LOW': 'priority-low',
      'MEDIUM': 'priority-medium',
      'HIGH': 'priority-high',
      'URGENT': 'priority-urgent'
    };
    return classMap[priority] || '';
  }

  /**
   * Obtenir l'icône de la priorité
   */
  getPriorityIcon(priority: string): string {
    const option = this.priorityOptions.find(opt => opt.value === priority);
    return option ? option.icon : 'pi-minus';
  }

  /**
   * Obtenir le libellé de la catégorie
   */
  getCategoryLabel(category: string): string {
    const option = this.categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  }

  /**
   * Obtenir l'icône de la catégorie
   */
  getCategoryIcon(category: string): string {
    const option = this.categoryOptions.find(opt => opt.value === category);
    return option ? option.icon : 'pi-tag';
  }

  /**
   * Formater la date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formater une date relative
   */
  formatRelativeDate(dateString: string): string {
    if (!dateString) return '';
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

  /**
   * Tronquer le texte
   */
  truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Obtenir le chemin complet de l'image
   */
  getFullImagePath(path: string): string {
    if (!path) return '';
    // Adapter selon votre configuration serveur
    return `${environment.apiUrl}/${path.replace(/\\/g, '/')}`;
  }

  /**
   * Obtenir les indices de début et fin pour la pagination
   */
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.filteredTickets.length);
  }

  /**
   * Générer les numéros de page
   */
  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const totalPages = Math.ceil(this.filteredTickets.length / this.itemsPerPage);
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (this.currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
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

  getTotalPages(): number {
    return Math.ceil(this.filteredTickets.length / this.itemsPerPage);
  }

  get showEllipsis(): boolean {
    return this.getTotalPages() > 5 && this.currentPage < this.getTotalPages() - 2;
  }

  /**
   * Compter les messages non lus
   */
  getUnreadCount(): number {
    return this.ticketMessages.filter(m => !m.read && m.senderRole === 'ADMIN').length;
  }

  hasUnreadAdminMessages(ticket: Ticket): boolean {
    return ticket.recentMessages?.some(m => !m.read && m.senderRole === 'ADMIN') || false;
  }


  

}
