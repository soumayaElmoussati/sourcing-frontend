import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SourcingRequestService } from '@/pages/sourcingModule/services/sourcing-request.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from 'src/environments/environment';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | 'PAID';
export type FulfillmentMode = 'CENTRALIZED' | 'LOCAL_SINGLE_COUNTRY';

export interface SourcingRequest {
  id: string;
  nameProduct: string;
  description?: string;
  linkProduct?: string;
  variants?: string;
  estimatedQuantity?: number;
  fulfillmentMode: FulfillmentMode;
  country?: string;
  status: RequestStatus;
  unitPrice?: number;
  totalPrice?: number;
  localCurrencyPrice?: number;
  localCurrencyCode?: string;
  createdAt?: string;
  images?: string[];
}

@Component({
  selector: 'app-admin-sourcing',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './sourcing-request.component.html',
  styleUrls: ['./sourcing-request.component.scss']
})
export class AdminSourcingComponent implements OnInit {

  sourcingRequests: SourcingRequest[] = [];
  filteredRequests: SourcingRequest[] = [];
  
  // Pagination
  currentPage: number = 0; // API commence à 0
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  firstPage: boolean = true;
  lastPage: boolean = false;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  
  stats = { pending: 0, approved: 0, completed: 0, totalAmount: 0 };

  filters = {
    name: '',
    status: '',
    fulfillmentMode: '',
    country: ''
  };

  showPriceModal = false;
  unitPriceInput: number | null = null;
  localCurrencyPriceInput: number | null = null;
  localCurrencyCodeInput: string = '';
  currentRequestId: string | null = null;
  typePrice: string = 'total';

  // Map pays → devise + symbole
  readonly CURRENCY_MAP: Record<string, { code: string; symbol: string; name: string }> = {
    UAE: { code: 'AED', symbol: 'د.إ', name: 'Dirham émirati' },
    KSA: { code: 'SAR', symbol: 'ر.س', name: 'Riyal saoudien' },
    KW:  { code: 'KWD', symbol: 'د.ك', name: 'Dinar koweïtien' },
    QA:  { code: 'QAR', symbol: 'ر.ق', name: 'Riyal qatari' },
    OM:  { code: 'OMR', symbol: 'ر.ع', name: 'Rial omanais' },
    BH:  { code: 'BHD', symbol: 'د.ب', name: 'Dinar bahreïni' },
    IQ:  { code: 'IQD', symbol: 'ع.د', name: 'Dinar irakien' },
  };

  get currentRequest(): SourcingRequest | undefined {
    return this.sourcingRequests.find(r => r.id === this.currentRequestId);
  }

  get computedTotalUSD(): number {
    const qty = this.currentRequest?.estimatedQuantity ?? 1;
    return (this.unitPriceInput ?? 0) * qty;
  }

  get countryMeta() {
    const country = this.currentRequest?.country ?? '';
    return this.CURRENCY_MAP[country] ?? null;
  }

  Math = Math;
  searchFocused = false;

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: "En attente", APPROVED: "Approuvée",
      PAID: "Payée", COMPLETED: "Complétée", CANCELLED: "Annulée"
    };
    return map[status] || status;
  } // Pour utiliser Math dans le template

  ngOnInit() {
    this.loadRequests();
  }

  constructor(
    private sourcingService: SourcingRequestService, 
    private router: Router,
    private messageService: MessageService
  ) { }

  computeStats() {
    this.sourcingService.getStats().subscribe({
      next: data => {
        this.stats = data;
      },
      error: err => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec du chargement des statistiques." });
      }
    });
  }

  loadRequests() {
    this.sourcingService.getAllRequests(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        this.sourcingRequests = response.content;
        this.filteredRequests = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.firstPage = response.first;
        this.lastPage = response.last;
        this.computeStats();
      },
      error: err => {
        console.error('Erreur chargement demandes sourcing', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des demandes de sourcing.' });
      }
    });
  }

  // Méthodes de pagination
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadRequests();
    }
  }

  nextPage() {
    if (!this.lastPage) {
      this.currentPage++;
      this.loadRequests();
    }
  }

  previousPage() {
    if (!this.firstPage) {
      this.currentPage--;
      this.loadRequests();
    }
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadRequests();
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

  applyFilters() {
    this.filteredRequests = this.sourcingRequests.filter(req => {
      return (
        (!this.filters.name ||
          req.nameProduct.toLowerCase().includes(this.filters.name.toLowerCase())) &&
        (!this.filters.status || req.status === this.filters.status) &&
        (!this.filters.fulfillmentMode ||
          req.fulfillmentMode === this.filters.fulfillmentMode) &&
        (!this.filters.country ||
          req.country?.toLowerCase().includes(this.filters.country.toLowerCase()))
      );
    });
  }

  resetFilters() {
    this.filters = {
      name: '',
      status: '',
      fulfillmentMode: '',
      country: ''
    };
    this.filteredRequests = [...this.sourcingRequests];
  }

  // Actions
  canSetPrice(req: SourcingRequest): boolean {
    return req.status === 'PENDING' && !req.totalPrice;
  }

  canCreateProduct(req: SourcingRequest): boolean {
    return req.status === 'APPROVED';
  }

  canApprove(req: SourcingRequest): boolean {
    return req.status === 'PAID';
  }

  openPriceModal(requestId: string, type: string) {
    this.currentRequestId = requestId;
    this.unitPriceInput = null;
    this.localCurrencyPriceInput = null;
    const req = this.sourcingRequests.find(r => r.id === requestId);
    this.localCurrencyCodeInput = req?.country ? (this.CURRENCY_MAP[req.country]?.code ?? '') : '';
    this.typePrice = type;
    this.showPriceModal = true;
  }

  closePriceModal() {
    this.showPriceModal = false;
    this.currentRequestId = null;
  }

  confirmPrice() {
    if (!this.currentRequestId || !this.unitPriceInput || this.unitPriceInput <= 0) return;
    const req = this.sourcingRequests.find(r => r.id === this.currentRequestId);
    if (!req || req.status !== 'PENDING') return;

    this.setPrice(this.currentRequestId, {
      unitPrice: this.unitPriceInput,
      localCurrencyPrice: this.localCurrencyPriceInput ?? null,
      localCurrencyCode: this.localCurrencyCodeInput || null
    });
    this.closePriceModal();
  }

  setPrice(requestId: string, payload: { unitPrice: number; localCurrencyPrice?: number | null; localCurrencyCode?: string | null }) {
    this.sourcingService.setPrice(requestId, payload).subscribe({
      next: () => {
        this.loadRequests();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Prix mis à jour avec succès !' });
      },
      error: err => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de la mise à jour du prix." });
      }
    });
  }

  createProduct(requestId: string) {
    this.router.navigate(['/admin/products/create', requestId]);
  }

  approveRequest(requestId: string) {
    this.sourcingService.approveRequest(requestId).subscribe({
      next: () => {
        this.loadRequests();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Demande de sourcing approuvée avec succès !' });
      },
      error: err => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'approbation de la demande de sourcing." })
    });
  }

  view(requestId: string) {
    this.loadingDetails = true;
    this.sourcingService.getById(requestId).subscribe({
      next: (data) => {
        this.selectedRequest = data as unknown as SourcingRequest;
        this.showDetailsModal = true;
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingDetails = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les détails de cette demande.' });
      }
    });
  }

  showDetailsModal = false;
  loadingDetails = false;
  selectedRequest: SourcingRequest | null = null;

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedRequest = null;
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl}/uploads/${path}`;
  }
}