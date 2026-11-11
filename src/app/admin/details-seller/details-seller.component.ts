import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SellerService } from '@/services/seller.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


// Modèles
export interface SellerDocument {
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
}

export interface SellerDetails {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  storeName: string;
  country: string;
  budget: string;
  commerceExperience: boolean;
  adsExperience: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: string;
  updatedAt: string;
  documents: SellerDocument[];
}

export interface UpdateStatusRequest {
  status: 'approved' | 'rejected';
  reason?: string;
}

@Component({
  selector: 'app-details-seller',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink , ToastModule],
  templateUrl: './details-seller.component.html',
  styleUrls: ['./details-seller.component.scss'],
  providers: [MessageService]
})
export class DetailsSellerComponent implements OnInit {
  sellerId: number = 0;
  seller: SellerDetails | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Modal de confirmation
  showStatusModal: boolean = false;
  selectedStatus: 'approved' | 'rejected' | null = null;
  rejectionReason: string = '';
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sellerService: SellerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sellerId = +params['id'];
      this.loadSellerDetails();
    });
  }

  loadSellerDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.sellerService.getSellerById(this.sellerId).subscribe({
      next: (data: any) => { // Utiliser 'any' temporairement pour éviter l'erreur
        this.seller = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement vendeur:', error);
        this.errorMessage = 'Impossible de charger les détails du vendeur';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    } else if (cleaned.length === 12) {
      return cleaned.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{3})/, '+$1 $2 $3 $4 $5');
    }
    return phone;
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      case 'suspended':
        return 'Suspendu';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
      case 'suspended':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  openStatusModal(status: 'approved' | 'rejected'): void {
    this.selectedStatus = status;
    this.rejectionReason = '';
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedStatus = null;
    this.rejectionReason = '';
  }

  updateStatus_old(): void {
    if (!this.selectedStatus) return;

    if (this.selectedStatus === 'rejected' && !this.rejectionReason.trim()) {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }

    this.isSubmitting = true;

    const request: UpdateStatusRequest = {
      status: this.selectedStatus
    };

    if (this.selectedStatus === 'rejected') {
      request.reason = this.rejectionReason;
    }

    this.sellerService.updateSellerStatus(this.sellerId, request).subscribe({
      next: (updatedSeller: any) => {
        this.seller = updatedSeller;
        this.isSubmitting = false;
        this.closeStatusModal();
        
        const message = this.selectedStatus === 'approved' 
          ? 'Vendeur approuvé avec succès' 
          : 'Vendeur rejeté';

      },
      error: (error) => {
        console.error('Erreur mise à jour statut:', error);
        this.isSubmitting = false;
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  //

  updateStatus(): void {
    if (!this.selectedStatus) return;
  
    if (this.selectedStatus === 'rejected' && !this.rejectionReason.trim()) {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }
  
    this.isSubmitting = true;
  
    const request: UpdateStatusRequest = {
      status: this.selectedStatus
    };
  
    if (this.selectedStatus === 'rejected') {
      request.reason = this.rejectionReason;
    }
  
    this.sellerService.updateSellerStatus(this.sellerId, request).subscribe({
      next: (updatedSeller: any) => {
        this.seller = updatedSeller;
        this.isSubmitting = false;
        this.closeStatusModal();
        
        // Notification selon le statut (seulement approved ou rejected)
        if (this.selectedStatus === 'approved') {
          this.messageService.add({
            severity: 'success',
            summary: 'Vendeur approuvé',
            detail: 'Le vendeur a été approuvé avec succès',
            life: 3000
          });
        } else if (this.selectedStatus === 'rejected') {
          this.messageService.add({
            severity: 'error',  // error pour rejeté (au lieu de warn)
            summary: 'Vendeur rejeté',
            detail: this.rejectionReason ? `Rejeté : ${this.rejectionReason}` : 'Le vendeur a été rejeté',
            life: 3000
          });
        }
      },
      error: (error) => {
        console.error('Erreur mise à jour statut:', error);
        this.isSubmitting = false;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la mise à jour du statut',
          life: 5000
        });
      }
    });
  }

  getVerifiedDocumentsCount(): number {
    return this.seller?.documents?.filter(doc => doc.verified).length || 0;
  }

  getTotalDocumentsCount(): number {
    return this.seller?.documents?.length || 0;
  }

  editSeller(): void {
    this.router.navigate(['/admin/edit-seller', this.sellerId]);
  }

  deleteSeller(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ?')) {
      this.sellerService.deleteSeller(this.sellerId).subscribe({
        next: () => {
          alert('Vendeur supprimé avec succès');
          this.router.navigate(['/admin/list-sellers']);
        },
        error: (error: any) => {
          console.error('Erreur suppression:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/list-sellers']);
  }
}