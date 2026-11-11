import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProductDTO, ProductService, ProductStatus } from '../product.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-list-product-seller',
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './list-product-seller.component.html',
  styleUrl: './list-product-seller.component.scss',
  providers: [MessageService]
})
export class ListProductSellerComponent {
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

  Math = Math; // Pour utiliser dans le template

  constructor(
    private productService: ProductService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadStats();
  }


getFlagCode(country: string): string {
  const flagMap: any = {
    'MA': 'MA',   // Maroc
    'KSA': 'SA',  // Arabie Saoudite
    'UAE': 'AE',  // Émirats Arabes Unis
    'KW': 'KW',   // Koweït
    'QA': 'QA',   // Qatar
    'OM': 'OM',   // Oman
    'BH': 'BH',   // Bahreïn
    'IQ': 'IQ'    // Irak
  };
  return flagMap[country] || country;
}

  // Libellé lisible pour un statut de produit (au lieu de la valeur brute en MAJUSCULES)
  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Actif',
      PAUSED: 'En pause',
      REJECTED: 'Rejeté',
      DRAFT: 'Brouillon',
      APPROVED: 'Approuvé',
      PENDING_APPROVAL: 'En attente'
    };
    return map[status] || status;
  }

  loadProducts(): void {
    this.productService.getMyProducts(this.currentPage, this.pageSize).subscribe({
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
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des produits.' });
      }
    });
  }

  loadStats(): void {
    this.productService.getMyStats().subscribe({
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

  // Méthodes existantes
  getTotalAvailableStock(p: ProductDTO): number {
    if (!p.inventories || p.inventories.length === 0) {
      return p.qteStock ?? 0;
    }
    return p.inventories.reduce((sum, inv) => sum + inv.available, 0);
  }

  getReservedStock(p: ProductDTO): number {
    if (!p.inventories) return 0;
    return p.inventories.reduce((sum, inv) => sum + inv.reserved, 0);
  }

  getReturnedStock(p: ProductDTO): number {
    if (!p.inventories) return 0;
    return p.inventories.reduce((sum, inv) => sum + inv.returned, 0);
  }

  activate(id: string) {
    this.updateStatus(id, 'ACTIVE');
  }

  pause(id: string) {
    this.updateStatus(id, 'PAUSED');
  }

  canCreateOrder(p: ProductDTO): boolean {
    return p.status === 'ACTIVE' && this.getTotalAvailableStock(p) > 0;
  }

  updateStatus(id: string, status: ProductStatus) {
    this.productService.changeStatus(id, status).subscribe({
      next: () => {
        this.loadProducts();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Produit mis à jour en statut ${status} avec succès !`
        });
      },
      error: (err) => {
        console.error('Erreur mise à jour statut produit', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Échec de la mise à jour du statut du produit.`
        });
      }
    });
  }

  showRejectModalInpute = false;
  rejectProductId: string | null = null;
  rejectReasonInput = '';

  canReject(p: ProductDTO) {
    return p.status === 'PENDING_APPROVAL';
  }

  viewReason(p: ProductDTO): void {
    this.rejectedReason = p.rejectionReason || 'Aucune raison fournie';
    this.showRejectedModalAffiche = true;
  }

  closeModal(): void {
    this.showRejectModalInpute = false;
    this.showRejectedModalAffiche = false;
    this.rejectedReason = '';
  }

  calculateStats(): void {
    // Stats calculées à partir des produits chargés
    this.activeProducts = this.products.filter(p => p.status === 'ACTIVE').length;
    this.pausedProducts = this.products.filter(p => p.status === 'PAUSED').length;
    this.rejectedProducts = this.products.filter(p => p.status === 'REJECTED').length;
  }

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

  canApprove(p: ProductDTO) {
    return p.status === 'PENDING_APPROVAL';
  }

  goToCreateOrder(p: ProductDTO) {
    this.router.navigate(
      ['/seller/create-order'],
      {
        queryParams: {
          productId: p.id,
          productName: p.nameProduct,
          country: p.country
        }
      }
    );
  }

  goToCreateOrderSansSelection() {
    this.router.navigate(['/seller/create-order']);
  }
}