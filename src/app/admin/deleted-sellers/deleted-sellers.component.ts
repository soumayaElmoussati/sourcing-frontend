import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SellerDTO, SellerService } from '@/services/seller.service';

interface DeletedSeller {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  storeName: string;
  status: string;
  deletedAt: Date | null;
}

@Component({
  selector: 'app-deleted-sellers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ToastModule],
  templateUrl: './deleted-sellers.component.html',
  styleUrls: ['./deleted-sellers.component.scss'],
  providers: [MessageService]
})
export class DeletedSellersComponent implements OnInit {

  sellers: DeletedSeller[] = [];
  filteredSellers: DeletedSeller[] = [];

  searchQuery: string = '';
  searchFocused = false;
  isLoading: boolean = false;

  // Restauration
  isRestoring: boolean = false;

  // Suppression définitive
  showPermanentDeleteModal: boolean = false;
  sellerToPermanentlyDelete: DeletedSeller | null = null;
  isPermanentlyDeleting: boolean = false;
  permanentDeleteError: string = '';

  constructor(
    private sellerService: SellerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDeletedSellers();
  }

  loadDeletedSellers(): void {
    this.isLoading = true;
    this.sellerService.getAllDeletedSellers().subscribe({
      next: (apiSellers: SellerDTO[]) => {
        this.sellers = this.transformApiSellers(apiSellers);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur de chargement des vendeurs supprimés:', error);
        this.sellers = [];
        this.filteredSellers = [];
        this.isLoading = false;
      }
    });
  }

  private transformApiSellers(apiSellers: SellerDTO[]): DeletedSeller[] {
    return apiSellers.map(apiSeller => ({
      id: apiSeller.id || 0,
      fullName: this.getFullName(apiSeller),
      email: apiSeller.email || '',
      phone: apiSeller.phone || '',
      country: apiSeller.country || 'Inconnu',
      storeName: apiSeller.storeName || '',
      status: apiSeller.status || 'pending',
      deletedAt: apiSeller.deletedAt ? new Date(apiSeller.deletedAt) : null
    }));
  }

  private getFullName(apiSeller: SellerDTO): string {
    if (apiSeller.firstName && apiSeller.lastName) {
      return `${apiSeller.firstName} ${apiSeller.lastName}`;
    }
    return apiSeller.email?.split('@')[0] || 'Vendeur';
  }

  onSearch(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.sellers];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(seller =>
        seller.fullName.toLowerCase().includes(query) ||
        seller.email.toLowerCase().includes(query) ||
        seller.storeName.toLowerCase().includes(query)
      );
    }

    this.filteredSellers = filtered;
  }

  refreshData(): void {
    this.loadDeletedSellers();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'approved':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'suspended':
        return 'Suspendu';
      default:
        return status;
    }
  }

  // Restaurer un vendeur : il redevient visible dans la liste principale des vendeurs
  restoreSeller(seller: DeletedSeller): void {
    this.isRestoring = true;

    this.sellerService.restoreSeller(seller.id).subscribe({
      next: () => {
        this.isRestoring = false;
        this.sellers = this.sellers.filter(s => s.id !== seller.id);
        this.applyFilter();

        this.messageService.add({
          severity: 'success',
          summary: 'Vendeur restauré',
          detail: `${seller.fullName} a été restauré avec succès`,
          life: 3000
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isRestoring = false;
        console.error('Erreur lors de la restauration:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de restaurer ce vendeur. Veuillez réessayer.',
          life: 3000
        });
      }
    });
  }

  openPermanentDeleteModal(seller: DeletedSeller): void {
    this.sellerToPermanentlyDelete = seller;
    this.permanentDeleteError = '';
    this.showPermanentDeleteModal = true;
  }

  closePermanentDeleteModal(): void {
    if (!this.isPermanentlyDeleting) {
      this.showPermanentDeleteModal = false;
      this.sellerToPermanentlyDelete = null;
      this.permanentDeleteError = '';
    }
  }

  confirmPermanentDelete(): void {
    if (!this.sellerToPermanentlyDelete) return;

    this.isPermanentlyDeleting = true;
    this.permanentDeleteError = '';

    this.sellerService.permanentlyDeleteSeller(this.sellerToPermanentlyDelete.id).subscribe({
      next: () => {
        this.sellers = this.sellers.filter(s => s.id !== this.sellerToPermanentlyDelete!.id);
        this.applyFilter();

        this.isPermanentlyDeleting = false;
        const name = this.sellerToPermanentlyDelete!.fullName;
        this.closePermanentDeleteModal();

        this.messageService.add({
          severity: 'success',
          summary: 'Suppression définitive',
          detail: `${name} a été définitivement supprimé`,
          life: 3000
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isPermanentlyDeleting = false;
        console.error('Erreur lors de la suppression définitive:', error);

        if (error.status === 404) {
          this.permanentDeleteError = 'Vendeur non trouvé';
        } else {
          this.permanentDeleteError = 'Erreur lors de la suppression. Veuillez réessayer.';
        }
      }
    });
  }

  truncateEmail(email: string, maxLength: number = 25): string {
    if (!email) return '';
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength) + '...';
  }
}