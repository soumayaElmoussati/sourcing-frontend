import { ProductDTO, ProductService, ProductStatus } from '@/pages/product-seller/product.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-list-product-admin',
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './list-product-admin.component.html',
  styleUrl: './list-product-admin.component.scss',
  providers: [MessageService]
})
export class ListProductAdminComponent {
  products: ProductDTO[] = [];
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  firstPage: boolean = true;
  lastPage: boolean = false;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  
  // Stats
  totalProducts = 0;
  activeProducts = 0;
  pausedProducts = 0;
  rejectedProducts = 0;

  showRejectedModalAffiche = false;
  rejectedReason = '';
  
  showRejectModalInpute = false;
  rejectProductId: string | null = null;
  rejectReasonInput = '';
  
  Math = Math; // Pour utiliser dans le template

  constructor(
    private productService: ProductService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadStats();
  }

  loadProducts(): void {
    this.productService.getAllProducts(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        this.products = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.firstPage = response.first;
        this.lastPage = response.last;
        
        this.calculateStats();
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: 'Échec du chargement des produits.' 
        });
      }
    });
  }

  loadStats(): void {
    this.productService.getStats().subscribe({
      next: (data) => {
        this.totalProducts = data['total'] || 0;
        this.activeProducts = data['active'] || 0;
        this.pausedProducts = data['paused'] || 0;
        this.rejectedProducts = data['rejected'] || 0;
      },
      error: (err) => console.error('Erreur chargement stats', err)
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  nextPage() {
    if (!this.lastPage) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  previousPage() {
    if (!this.firstPage) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadProducts();
  }

  getPageNumbers(): number[] {
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

  getStartIndex(): number {
    return this.currentPage * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  // Actions sur les produits
  activate(id: string) {
    this.updateStatus(id, 'ACTIVE');
  }

  pause(id: string) {
    this.updateStatus(id, 'PAUSED');
  }

  submit(id: string) {
    this.updateStatus(id, 'PENDING_APPROVAL');
  }

  approve(id: string) {
    this.updateStatus(id, 'APPROVED');
  }

  updateStatus(id: string, status: ProductStatus) {
    this.productService.changeStatus(id, status).subscribe({
      next: () => {
        this.loadProducts();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Succès', 
          detail: `Statut du produit mis à jour à ${status} avec succès !` 
        });
      },
      error: err => {
        console.error('Erreur mise à jour statut produit', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: `Échec de la mise à jour du statut du produit.` 
        });
      }
    });
  }

  // Gestion du rejet
  openRejectModal(id: string) {
    this.rejectProductId = id;
    this.rejectReasonInput = '';
    this.showRejectModalInpute = true;
  }

  closeRejectModal() {
    this.showRejectModalInpute = false;
    this.rejectProductId = null;
  }

  rejectProduct() {
    if (!this.rejectProductId) return;

    this.productService.rejectProduct(this.rejectProductId, this.rejectReasonInput).subscribe({
      next: () => {
        this.loadProducts();
        this.closeRejectModal();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Succès', 
          detail: 'Produit rejeté avec succès !' 
        });
      },
      error: err => {
        console.error('Erreur rejet produit', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: "Échec du rejet du produit." 
        });
      }
    });
  }

  canReject(p: ProductDTO) {
    return p.status === 'PENDING_APPROVAL';
  }

  viewReason(p: ProductDTO): void {
    this.rejectedReason = p.rejectionReason || 'Aucune raison fournie';
    this.showRejectedModalAffiche = true;
  }

  closeModal(): void {
    this.showRejectedModalAffiche = false;
    this.rejectedReason = '';
  }

  calculateStats(): void {
    this.activeProducts = this.products.filter(p => p.status === 'ACTIVE').length;
    this.pausedProducts = this.products.filter(p => p.status === 'PAUSED').length;
    this.rejectedProducts = this.products.filter(p => p.status === 'REJECTED').length;
  }

  // Vérifications de droits
  canEdit(p: ProductDTO) {
    return p.status === 'DRAFT';
  }

  canSubmit(p: ProductDTO) {
    return p.status === 'DRAFT';
  }

  canActivate(p: ProductDTO) {
    return p.status === 'APPROVED' || p.status === 'PAUSED';
  }

  canPause(p: ProductDTO) {
    return p.status === 'ACTIVE';
  }

  canViewReason(p: ProductDTO) {
    return p.status === 'REJECTED';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: "Actif",
      PAUSED: "En pause",
      REJECTED: "Rejeté",
      DRAFT: "Brouillon",
      APPROVED: "Approuvé",
      PENDING_APPROVAL: "En attente"
    };
    return map[status] || status;
  }

  canApprove(p: ProductDTO) {
    return p.status === 'PENDING_APPROVAL';
  }
}