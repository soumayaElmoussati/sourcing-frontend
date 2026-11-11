import { Component } from '@angular/core';
import { OrderService } from '../order-service';
import { OrderResponseDto, UpdateOrderDto } from '../order-models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { formatCountryCurrency } from '@/shared/currency.utils';

@Component({
  selector: 'app-list-orders',
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './list-order-seller.component.html',
  styleUrl: './list-order-seller.component.scss',
  providers: [MessageService]
})
export class ListOrderComponent {

  orders: OrderResponseDto[] = [];
  filteredOrders: OrderResponseDto[] = [];

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  firstPage: boolean = true;
  lastPage: boolean = false;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // filters
  search = '';
  statusFilter = 'ALL';
  paymentFilter = 'ALL';

  loading = true;
  Math = Math; // Pour utiliser dans le template

  stats = {
    totalOrders: 0,
    pending: 0,
    delivered: 0,
    totalRevenue: 0
  };

  // ================= COLUMNS PICKER =================
  showColumnsMenu = false;

  // Colonnes optionnelles (affichées/masquées par l'utilisateur).
  // N° Commande, Client, Total, Statut et Actions restent toujours visibles.
  toggleableColumns: { key: string; label: string; visible: boolean }[] = [
    { key: 'source', label: 'Source', visible: false },
    { key: 'product', label: 'Produit', visible: true },
    { key: 'country', label: 'Pays', visible: false },
    { key: 'mode', label: 'Mode', visible: false },
    { key: 'payment', label: 'Paiement', visible: false },
    { key: 'date', label: 'Date', visible: true },
  ];

  private readonly COLUMNS_STORAGE_KEY = 'orders-visible-columns';

  constructor(
    private orderService: OrderService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.restoreColumnsPreference();
    this.loadOrders();
  }

  private restoreColumnsPreference(): void {
    try {
      const saved = localStorage.getItem(this.COLUMNS_STORAGE_KEY);
      if (!saved) return;
      const savedKeys: string[] = JSON.parse(saved);
      this.toggleableColumns.forEach(col => {
        col.visible = savedKeys.includes(col.key);
      });
    } catch {
      // localStorage indisponible ou donnée corrompue : on garde les valeurs par défaut
    }
  }

  private saveColumnsPreference(): void {
    try {
      const visibleKeys = this.toggleableColumns.filter(c => c.visible).map(c => c.key);
      localStorage.setItem(this.COLUMNS_STORAGE_KEY, JSON.stringify(visibleKeys));
    } catch {
      // ignorer si le stockage n'est pas disponible
    }
  }

  isColVisible(key: string): boolean {
    const col = this.toggleableColumns.find(c => c.key === key);
    return col ? col.visible : true;
  }

  toggleColumn(col: { key: string; visible: boolean }): void {
    col.visible = !col.visible;
    this.saveColumnsPreference();
  }

  loadOrders() {
    this.orderService.getMyOrders(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        this.orders = response.content;
        this.filteredOrders = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.firstPage = response.first;
        this.lastPage = response.last;
        this.loading = false;
        this.calculateStats();
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: "Échec du chargement des commandes." 
        });
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  nextPage() {
    if (!this.lastPage) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  previousPage() {
    if (!this.firstPage) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadOrders();
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

  private calculateStats() {
    this.stats.totalOrders = this.totalElements;
    this.stats.pending = this.orders.filter(o => o.status === 'PENDING').length;
    this.stats.delivered = this.orders.filter(o => o.status === 'DELIVERED').length;
    this.stats.totalRevenue = this.orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
  }

  goToCreateOrder() {
    this.router.navigate(['/seller/create-order']);
  }

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
    const search = this.search.toLowerCase();

    this.filteredOrders = this.orders.filter(o => {
      const matchSearch =
        (o.customerName?.toLowerCase().includes(search) ?? false) ||
        (o.id?.toLowerCase().includes(search) ?? false);

      const matchStatus = this.statusFilter === 'ALL' || o.status === this.statusFilter;
      const matchPayment = this.paymentFilter === 'ALL' || o.paymentMode === this.paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }

  resetFilters() {
    this.search = '';
    this.statusFilter = 'ALL';
    this.paymentFilter = 'ALL';
    this.filteredOrders = this.orders;
  }

  viewOrderDetails(orderId: string) {
    this.loadingDetails = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.selectedOrder = order;
        this.showDetailsModal = true;
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingDetails = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les détails de cette commande.' });
      }
    });
  }

  // ================= DETAILS MODAL =================
  showDetailsModal = false;
  loadingDetails = false;
  selectedOrder: OrderResponseDto | null = null;

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  // ================= EDIT MODAL =================
  showEditModal = false;
  isSaving = false;
  orderToEditId: string | null = null;
  editForm: UpdateOrderDto = {
    customerName: '',
    customerPhone: '',
    city: '',
    fullAddress: '',
    note: ''
  };

  openEditModal(order: OrderResponseDto) {
    this.orderToEditId = order.id;
    this.editForm = {
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      city: order.city,
      fullAddress: order.fullAddress,
      note: order.note || ''
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.orderToEditId = null;
  }

  confirmEdit() {
    if (!this.orderToEditId) return;

    this.isSaving = true;
    this.orderService.updateOrder(this.orderToEditId, this.editForm).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeEditModal();
        this.loadOrders();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande modifiée avec succès !' });
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la modification de la commande.' });
      }
    });
  }

  // ================= CANCEL MODAL =================
  showCancelModal = false;
  isCancelling = false;
  orderToCancel: OrderResponseDto | null = null;

  openCancelModal(order: OrderResponseDto) {
    this.orderToCancel = order;
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.orderToCancel = null;
  }

  confirmCancel() {
    if (!this.orderToCancel) return;

    this.isCancelling = true;
    this.orderService.cancelOrder(this.orderToCancel.id).subscribe({
      next: () => {
        this.isCancelling = false;
        this.closeCancelModal();
        this.loadOrders();
        this.messageService.add({ severity: 'success', summary: 'Commande annulée', detail: 'La commande a été annulée avec succès.' });
      },
      error: (err) => {
        console.error(err);
        this.isCancelling = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'annulation de la commande." });
      }
    });
  }
}