import { Deposit, DepositPageResponse, WalletService } from '@/services/wallet.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-deposit',
  imports: [CommonModule, FormsModule, RouterModule, ToastModule],
  templateUrl: './deposit.component.html',
  styleUrl: './deposit.component.scss'
})
export class DepositComponent implements OnInit{



  deposits: Deposit[] = [];
  filteredDeposits: Deposit[] = [];
  paginatedDeposits: Deposit[] = [];

  totalDeposits: number = 0;
  pendingDeposits: number = 0;
  approvedDeposits: number = 0;
  rejectedDeposits: number = 0;
  totalAmount: number = 0;
  
  loading: boolean = false;
  viewMode: 'table' | 'grid' = 'table';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  
  // Filtres
  searchQuery: string = '';
  statusFilter: string = '';
  paymentMethodFilter: string = '';

  paymentMethods: string[] = [];
  sortField: string = 'createdAt';
  sortOrder: number = -1;
  searchFocused = false;

  selectedDeposit: Deposit | null = null;
  showDetailsModal: boolean = false;
  showImageModal: boolean = false;
  selectedImagePath: string = '';

  // ================= APPROVE / REJECT =================
  showApproveModal: boolean = false;
  showRejectModal: boolean = false;
  depositToProcess: Deposit | null = null;
  approveAmount: number | null = null;
  isProcessing: boolean = false;
  
 
  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) {}


  ngOnInit(): void {
    this.loadDeposits();
  }

  /**
   * Charger les dépôts depuis l'API
   */
  loadDeposits(): void {
    this.loading = true;
    
    // Adapter pour Spring Boot pagination (page commence à 0)
    const springPage = this.currentPage - 1;
    
    this.walletService.getAllDeposits(springPage, this.itemsPerPage).subscribe({
      next: (response: DepositPageResponse) => {
        this.deposits = response.content;
        this.totalDeposits = response.totalElements;
        this.totalPages = response.totalPages;
        this.filteredDeposits = [...this.deposits];
        this.calculateStats();
        this.extractPaymentMethods();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des dépôts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger la liste des dépôts'
        });
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.pendingDeposits = this.deposits.filter(d => d.status === 'PENDING').length;
    this.approvedDeposits = this.deposits.filter(d => d.status === 'APPROVED').length;
    this.rejectedDeposits = this.deposits.filter(d => d.status === 'REJECTED').length;
    
    // Calculer le montant total (seulement pour les approuvés)
    this.totalAmount = this.deposits
      .filter(d => d.status === 'APPROVED')
      .reduce((sum, d) => sum + (d.amount || 0), 0);
  }

  extractPaymentMethods(): void {
    const methods = new Set(this.deposits.map(d => d.paymentMethodType));
    this.paymentMethods = Array.from(methods);
  }

  applyFilters(): void {
    this.filteredDeposits = this.deposits.filter(deposit => {
      let matches = true;
      
      // Filtre recherche
      if (this.searchQuery) {
        const searchLower = this.searchQuery.toLowerCase();
        const sellerName = `${deposit.wallet.seller.firstName} ${deposit.wallet.seller.lastName}`.toLowerCase();
        const sellerEmail = deposit.wallet.seller.email.toLowerCase();
        const paymentMethod = deposit.paymentMethodType.toLowerCase();
        
        matches = matches && (
          sellerName.includes(searchLower) ||
          sellerEmail.includes(searchLower) ||
          paymentMethod.includes(searchLower) ||
          deposit.id.toString().includes(searchLower)
        );
      }
      
      // Filtre statut
      if (this.statusFilter) {
        matches = matches && deposit.status === this.statusFilter;
      }
      
      // Filtre méthode de paiement
      if (this.paymentMethodFilter) {
        matches = matches && deposit.paymentMethodType === this.paymentMethodFilter;
      }
      
      return matches;
    });
    
    this.applySorting();
    this.currentPage = 1;
    this.updatePaginatedDeposits();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.paymentMethodFilter = '';
    this.applyFilters();
  }

  applySorting(): void {
    this.filteredDeposits.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortField) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'sellerName':
          const nameA = `${a.wallet.seller.firstName} ${a.wallet.seller.lastName}`;
          const nameB = `${b.wallet.seller.firstName} ${b.wallet.seller.lastName}`;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'amount':
          comparison = (a.wallet?.balance || 0) - (b.wallet?.balance || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return this.sortOrder * comparison;
    });
    
    this.updatePaginatedDeposits();
  }

  sortTable(field: string): void {
    if (this.sortField === field) {
      this.sortOrder *= -1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
    this.applySorting();
  }

  updatePaginatedDeposits(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedDeposits = this.filteredDeposits.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      
      // Si on utilise la pagination côté serveur
      // this.loadDeposits();
      
      // Si on utilise la pagination côté client
      this.updatePaginatedDeposits();
    }
  }

  changeItemsPerPage(): void {
    this.currentPage = 1;
    
    // Si on utilise la pagination côté serveur
    // this.loadDeposits();
    
    // Si on utilise la pagination côté client
    this.updatePaginatedDeposits();
  }

  refreshData(): void {
    this.loadDeposits();
    this.messageService.add({
      severity: 'info',
      summary: 'Rafraîchissement',
      detail: 'Données mises à jour'
    });
  }

  viewDepositDetails(deposit: Deposit): void {
    this.selectedDeposit = deposit;
    this.showDetailsModal = true;
  }

  viewProofImage(imagePath: string): void {
    this.selectedImagePath = imagePath;
    this.showImageModal = true;
  }

  /**
   * Fermer les modals
   */
  closeModals(): void {
    this.showDetailsModal = false;
    this.showImageModal = false;
    this.selectedDeposit = null;
    this.selectedImagePath = '';
  }

  // ================= APPROVE / REJECT =================

  openApproveModal(deposit: Deposit): void {
    this.depositToProcess = deposit;
    this.approveAmount = deposit.amount;
    this.showApproveModal = true;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.depositToProcess = null;
    this.approveAmount = null;
  }

  confirmApprove(): void {
    if (!this.depositToProcess || !this.approveAmount || this.approveAmount <= 0) return;

    this.isProcessing = true;
    this.walletService.approveDeposit(this.depositToProcess.id, this.approveAmount).subscribe({
      next: () => {
        this.isProcessing = false;
        this.closeApproveModal();
        this.loadDeposits();
        this.messageService.add({
          severity: 'success',
          summary: 'Dépôt approuvé',
          detail: 'Le wallet du vendeur a été mis à jour et un email de confirmation lui a été envoyé.'
        });
      },
      error: (err) => {
        this.isProcessing = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.error?.error || "Échec de l'approbation du dépôt."
        });
      }
    });
  }

  openRejectModal(deposit: Deposit): void {
    this.depositToProcess = deposit;
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.depositToProcess = null;
  }

  confirmReject(): void {
    if (!this.depositToProcess) return;

    this.isProcessing = true;
    this.walletService.rejectDeposit(this.depositToProcess.id).subscribe({
      next: () => {
        this.isProcessing = false;
        this.closeRejectModal();
        this.loadDeposits();
        this.messageService.add({ severity: 'success', summary: 'Dépôt rejeté', detail: 'Le vendeur a été notifié par email.' });
      },
      error: (err) => {
        this.isProcessing = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.error?.error || 'Échec du rejet du dépôt.'
        });
      }
    });
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

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Obtenir le libellé du statut
   */
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'En attente',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Rejeté'
    };
    return statusMap[status] || status;
  }

  /**
   * Obtenir la classe CSS du statut
   */
  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected'
    };
    return classMap[status] || '';
  }

  /**
   * Obtenir l'icône du statut
   */
  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'PENDING': 'pi-clock',
      'APPROVED': 'pi-check-circle',
      'REJECTED': 'pi-times-circle'
    };
    return iconMap[status] || 'pi-question';
  }

  /**
   * Tronquer l'email
   */
  truncateEmail(email: string, maxLength: number = 20): string {
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength) + '...';
  }

  /**
   * Obtenir le chemin complet de l'image
   */
  getFullImagePath(path: string): string {
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
    return end > this.filteredDeposits.length ? this.filteredDeposits.length : end;
  }

  /**
   * Générer les numéros de page pour la pagination
   */
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


}