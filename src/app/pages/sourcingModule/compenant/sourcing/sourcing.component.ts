import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourcingRequestService } from '../../services/sourcing-request.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
    fulfillmentMode: 'CENTRALIZED' | 'LOCAL_SINGLE_COUNTRY';
    country?: string;
    status: RequestStatus;
    totalPrice?: number;
    createdAt?: string;
    images?: string[];
}

@Component({
    selector: 'app-sourcing',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule],
    templateUrl: './sourcing.component.html',
    styleUrls: ['./sourcing.component.scss']
})
export class SourcingComponent implements OnInit {
    sourcingRequests: SourcingRequest[] = [];
    filteredRequests: SourcingRequest[] = [];

    filters = {
        name: '',
        status: '',
        fulfillmentMode: '',
        country: ''
    };

    stats = {
        pending: 0,
        approved: 0,
        completed: 0,
        totalAmount: 0
    };

    showPayConfirm = false;
    selectedPayId?: string;
    selectedPayAmount?: number;

    currentPage: number = 0;
    pageSize: number = 10;
    totalElements: number = 0;
    totalPages: number = 0;
    firstPage: boolean = true;
    lastPage: boolean = false;
    pageSizeOptions: number[] = [5, 10, 20, 50];

    Math = Math;

    ngOnInit() {
        this.mesSourcing();
    }

    constructor(
        private sourcingService: SourcingRequestService,
        private router: Router,
        private messageService: MessageService
    ) {}

    applyFilters() {
        this.filteredRequests = this.sourcingRequests.filter((req) => {
            return (
                (!this.filters.name || req.nameProduct.toLowerCase().includes(this.filters.name.toLowerCase())) &&
                (!this.filters.status || req.status === this.filters.status) &&
                (!this.filters.fulfillmentMode || req.fulfillmentMode === this.filters.fulfillmentMode) &&
                (!this.filters.country || req.country?.toLowerCase().includes(this.filters.country.toLowerCase()))
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

    // ================= BUSINESS RULES =================

    canPay(req: SourcingRequest): boolean {
        return req.status === 'PENDING' && !!req.totalPrice;
    }

    openPayConfirm(req: SourcingRequest) {
        this.selectedPayId = req.id;
        this.selectedPayAmount = req.totalPrice || 0;
        this.showPayConfirm = true;
    }
    closePayConfirm() {
        this.showPayConfirm = false;
        this.selectedPayId = undefined;
        this.selectedPayAmount = undefined;
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

getImageUrl(path: string): string {
    return `${environment.apiUrl}/uploads/${path}`;
}

    confirmPay() {
        if (!this.selectedPayId) return;

        this.sourcingService.pay(this.selectedPayId).subscribe({
            next: () => {
                const req = this.sourcingRequests.find((r) => r.id === this.selectedPayId);
                if (req) req.status = 'PAID';

                this.computeStats();
                this.closePayConfirm();

                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Paiement effectué avec succès !'
                });
            },
            error: (err) => {
                console.error(err);
                this.closePayConfirm();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Solde insuffisant ou erreur paiement.'
                });
            }
        });
    }

    canCancel(req: SourcingRequest): boolean {
        return req.status !== 'COMPLETED' && req.status !== 'CANCELLED' && req.status !== 'PAID' && req.status !== 'APPROVED';
    }

    // ================= ACTIONS =================

    createRequest() {
        console.log('CREATE REQUEST');
        this.router.navigate(['/seller/createSourcing']);
    }

    pay(id: string) {
        this.sourcingService.pay(id).subscribe({
            next: () => {
                this.mesSourcing();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Paiement effectué avec succès !' });
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du paiement de la demande de sourcing.' });
            }
        });
    }

    cancel(id: string) {
        this.sourcingService.cancel(id).subscribe({
            next: () => {
                this.mesSourcing();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Demande de sourcing annulée avec succès !' });
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'annulation de la demande de sourcing." });
            }
        });
    }

    view(id: string) {
        this.loadingDetails = true;
        this.sourcingService.getById(id).subscribe({
            next: (data) => {
                this.selectedRequest = data as unknown as SourcingRequest;
                this.showDetailsModal = true;
                this.loadingDetails = false;
            },
            error: (err) => {
                console.error(err);
                this.loadingDetails = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les détails de cette demande.'
                });
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

    openCreateModal() {
        console.log('OPEN CREATE MODAL');
        // this.router.navigate(['/sourcing/create']);
    }

    // ================= STATS =================

    computeStats() {
        this.sourcingService.getStats().subscribe({
            next: (data) => {
                this.stats = data;
            },
            error: (err) => {
                console.error('Erreur calcul stats sourcing', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du calcul des statistiques de sourcing.' });
            }
        });
    }

    mesSourcing() {
        this.sourcingService.getMyRequests(this.currentPage, this.pageSize).subscribe({
            next: (response) => {
                this.sourcingRequests = response.content;
                this.filteredRequests = response.content;

                // Mettre à jour les informations de pagination
                this.totalElements = response.totalElements;
                this.totalPages = response.totalPages;
                this.currentPage = response.number;
                this.firstPage = response.first;
                this.lastPage = response.last;

                this.computeStats();
            },
            error: (err) => {
                console.error('Erreur chargement demandes sourcing', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des demandes de sourcing.' });
            }
        });
    }

    showCancelConfirm = false;
    selectedRequestId?: string;

    // ====== OPEN CONFIRM ======
    openCancelConfirm(id: string) {
        this.selectedRequestId = id;
        this.showCancelConfirm = true;
    }

    // ====== CLOSE ======
    closeCancelConfirm() {
        this.showCancelConfirm = false;
        this.selectedRequestId = undefined;
    }

    confirmCancel() {
        if (!this.selectedRequestId) return;

        this.sourcingService.cancel(this.selectedRequestId).subscribe({
            next: () => {
                const req = this.sourcingRequests.find((r) => r.id === this.selectedRequestId);
                if (req) req.status = 'CANCELLED';
                this.computeStats();
                this.closeCancelConfirm();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Demande de sourcing annulée avec succès !' });
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'annulation de la demande de sourcing." });
            }
        });
    }

    ///

    goToPage(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.mesSourcing();
        }
    }

    nextPage() {
        if (!this.lastPage) {
            this.currentPage++;
            this.mesSourcing();
        }
    }

    previousPage() {
        if (!this.firstPage) {
            this.currentPage--;
            this.mesSourcing();
        }
    }

    onPageSizeChange() {
        this.currentPage = 0;
        this.mesSourcing();
    }

    getPageNumbers(): number[] {
        const pageNumbers: number[] = [];
        const maxVisiblePages = 5;

        if (this.totalPages <= maxVisiblePages) {
            for (let i = 0; i < this.totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

            if (startPage === 0) {
                endPage = maxVisiblePages - 1;
            }

            if (endPage === this.totalPages - 1) {
                startPage = this.totalPages - maxVisiblePages;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }

        return pageNumbers;
    }

}
