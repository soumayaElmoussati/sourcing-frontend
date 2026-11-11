import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminOrderService, OrderResponseDto } from '../order-admin.service';
import { MessageService } from 'primeng/api';
import { ToastModule, Toast } from 'primeng/toast';
import { formatCountryCurrency } from '@/shared/currency.utils';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, FormsModule, Toast],
    templateUrl: './admin-orders-component.html',
    styleUrl: './admin-orders-component.scss'
})
export class AdminOrdersComponent implements OnInit {
    orders: OrderResponseDto[] = [];
    filteredOrders: OrderResponseDto[] = [];
    paginatedOrders: OrderResponseDto[] = [];

    showReturnModal = false;
    selectedOrderId: string | null = null;
    returnReason = '';
    selectedOrder: any = null;

    currentPage: number = 1;
    itemsPerPage: number = 10;

    totalOrders: number = 0;
    pendingOrders: number = 0;
    deliveredOrders: number = 0;
    cancelledOrders: number = 0;

    searchQuery: string = '';
    statusFilter: string = '';
    paymentFilter: string = '';
    dateFilter: string = '';
    sortField: string = 'createdAt';
    sortOrder: number = -1;

    // View mode
    viewMode: 'table' | 'grid' = 'table';
  searchFocused = false;

    constructor(
        private orderService: AdminOrderService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadOrders();
    }

    openDetails(order: any) {
        this.selectedOrder = order;
    }

    closeDetails() {
        this.selectedOrder = null;
    }

    loadOrders() {
        this.orderService.getAllOrders().subscribe({
            next: (data) => {
                this.orders = data;
                this.updateStats();
                this.applyFilters();
                console.log(data);
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des commandes.' })
        });
    }

    /* ========= ACTIONS ========= */

    confirm(id: string) {
        this.orderService.confirm(id).subscribe({
            next: () => {
                this.loadOrders();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande confirmée avec succès !' });
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la confirmation de la commande.' });
            }
        });
    }

    ship(id: string) {
        this.orderService.ship(id).subscribe({
            next: () => {
                this.loadOrders();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande expédiée avec succès !' });
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'expédition de la commande." });
            }
        });
    }

    deliver(id: string) {
        this.orderService.deliver(id).subscribe({
            next: () => {
                this.loadOrders();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande livrée avec succès !' });
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la livraison de la commande.' });
            }
        });
    }

    openReturn(orderId: string) {
        this.selectedOrderId = orderId;
        this.showReturnModal = true;
    }

    submitReturn() {
        if (!this.selectedOrderId) return;

        this.orderService.returnOrder(this.selectedOrderId, this.returnReason).subscribe({
            next: () => {
                this.closeModal();
                this.loadOrders();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande retournée avec succès !' });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du retour de la commande.' });
            }
        });
    }

    closeModal() {
        this.showReturnModal = false;
        this.selectedOrderId = null;
        this.returnReason = '';
    }

    /* ========= UI HELPERS ========= */

    canConfirm(o: OrderResponseDto) {
        return o.status === 'PENDING';
    }

    canShip(o: OrderResponseDto) {
        return o.status === 'CONFIRMED';
    }

    canDeliver(o: OrderResponseDto) {
        return o.status === 'SHIPPED';
    }

    canReturn(o: OrderResponseDto) {
        return o.status === 'DELIVERED';
    }

    // Vérifie si l'ordre a du stock retourné à remettre en available
    canRestock(order: OrderResponseDto): boolean {
        return order.status == 'RETURNED'; // tu peux adapter selon ton modèle
    }

    // Appel du service pour remettre le stock retourné en disponible
    restockReturned(orderId: string): void {
        this.orderService.restockReturned(orderId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Stock retourné remis en disponible !' });
                this.loadOrders(); // recharger la liste des commandes pour mettre à jour les stocks
            },
            error: (err) => {
                console.error(err);
                console.log(err.error?.message);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Impossible de remettre le stock en disponible.' });
            }
        });
    }

    //

    // Affiche le montant (stocké en USD) converti dans la devise locale
    // du pays de livraison de la commande (ex: AED pour les Émirats).
    formatPrice(order: OrderResponseDto): string {
        return formatCountryCurrency(order.totalPrice, order.country);
    }

    formatUnitPrice(order: OrderResponseDto): string {
        return formatCountryCurrency(order.unitPrice, order.country);
    }

    getFulfillmentModeLabel(mode: string): string {
        return mode === 'CENTRALIZED' ? 'Centralisé' : 'Local';
    }

    getSourceLabel(source?: string): string {
        const map: Record<string, string> = {
            INTERNAL: 'Interne',
            GOOGLE_SHEETS: 'Google Sheets',
            LIGHTFUNNELS: 'Lightfunnels',
            DROPIFY: 'Dropify',
            WORDPRESS: 'WordPress',
            SHOPIFY: 'Shopify',
            XPAGE: 'XPage',
            EASY_ORDERS: 'Easy Orders'
        };
        return map[source || 'INTERNAL'] || source || 'Interne';
    }

    applyFilters() {
        this.filteredOrders = this.orders.filter(order => {
            const matchesSearch = !this.searchQuery ||
                order.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                order.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                order.customerPhone.includes(this.searchQuery);

            const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
            const matchesPayment = !this.paymentFilter || order.paymentMode === this.paymentFilter;

            return matchesSearch && matchesStatus && matchesPayment;
        });

        this.applySorting();
        this.updatePagination();
    }


    applySorting() {
        this.filteredOrders.sort((a, b) => {
            let aValue: string | number | Date | null = null;
            let bValue: string | number | Date | null = null;

            const field = this.sortField as keyof OrderResponseDto;

            if (this.sortField === 'createdAt') {
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
            } else {
                aValue = a[field] as string | number;
                bValue = b[field] as string | number;
            }

            // Gestion des valeurs null/undefined
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (aValue < bValue) return -1 * this.sortOrder;
            if (aValue > bValue) return 1 * this.sortOrder;
            return 0;
        });
    }

    sortTable(field: string) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 1 ? -1 : 1;
        } else {
            this.sortField = field;
            this.sortOrder = 1;
        }
        this.applySorting();
        this.updatePagination();
    }

    onSearch() {
        this.currentPage = 1;
        this.applyFilters();
    }

    clearFilters() {
        this.searchQuery = '';
        this.statusFilter = '';
        this.paymentFilter = '';
        this.dateFilter = '';
        this.currentPage = 1;
        this.applyFilters();
    }

    updatePagination() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
    }

    changePage(page: number) {
        this.currentPage = page;
        this.updatePagination();
    }

    changeItemsPerPage() {
        this.currentPage = 1;
        this.updatePagination();
    }

    getTotalPages(): number {
        return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    }

    getPages(): number[] {
        const totalPages = this.getTotalPages();
        const maxVisiblePages = 5;
        let pages: number[] = [];

        if (totalPages <= maxVisiblePages) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            if (this.currentPage <= 3) {
                pages = [1, 2, 3, 4, 5];
            } else if (this.currentPage >= totalPages - 2) {
                pages = Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
            } else {
                pages = [
                    this.currentPage - 2,
                    this.currentPage - 1,
                    this.currentPage,
                    this.currentPage + 1,
                    this.currentPage + 2
                ];
            }
        }
        return pages;
    }

    getStartIndex(): number {
        return (this.currentPage - 1) * this.itemsPerPage + 1;
    }

    getEndIndex(): number {
        return Math.min(this.currentPage * this.itemsPerPage, this.filteredOrders.length);
    }

    refreshData() {
        this.loadOrders();
    }

    getStatusLabel(status: string): string {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'En attente',
            'CONFIRMED': 'Confirmée',
            'PREPARED': 'Préparée',
            'SHIPPED': 'Expédiée',
            'DELIVERED': 'Livrée',
            'CANCELLED': 'Annulée',
            'TO_RETURN': 'À retourner',
            'RETURNED': 'Retournée'
        };
        return statusMap[status] || status;
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

    getPaymentLabel(paymentMode: string): string {
        const paymentMap: { [key: string]: string } = {
            'CASH_ON_DELIVERY': 'Paiement à la livraison',
            'ONLINE': 'Paiement en ligne',
            'BANK_TRANSFER': 'Virement bancaire',
            'CREDIT_CARD': 'Carte de crédit'
        };
        return paymentMap[paymentMode] || paymentMode;
    }

    updateStats() {
        this.totalOrders = this.orders.length;
        this.pendingOrders = this.orders.filter(o => o.status === 'PENDING').length;
        this.deliveredOrders = this.orders.filter(o => o.status === 'DELIVERED').length;
        this.cancelledOrders = this.orders.filter(o => o.status === 'CANCELLED').length;
    }
}