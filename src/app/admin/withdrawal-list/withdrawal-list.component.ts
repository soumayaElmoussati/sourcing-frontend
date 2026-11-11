import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { WalletService, WithdrawalResponse } from '@/services/wallet.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-withdrawal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './withdrawal-list.component.html',
  styleUrls: ['./withdrawal-list.component.scss']
})
export class WithdrawalListComponent implements OnInit {

  withdrawals: WithdrawalResponse[] = [];
  isLoading = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  statusFilter = '';

  // ================= PROCESS MODAL =================
  showProcessModal = false;
  withdrawalToProcess: WithdrawalResponse | null = null;
  processAction: 'APPROVE' | 'REJECT' = 'APPROVE';
  rejectReason = '';
  proofFile: File | null = null;
  isProcessing = false;

  showImageModal = false;
  selectedImagePath = '';

  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadWithdrawals();
  }

  loadWithdrawals(): void {
    this.isLoading = true;
    this.walletService.getAllWithdrawals(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.withdrawals = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les demandes de retrait.' });
      }
    });
  }

  get filteredWithdrawals(): WithdrawalResponse[] {
    if (!this.statusFilter) return this.withdrawals;
    return this.withdrawals.filter(w => w.status === this.statusFilter);
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadWithdrawals();
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente',
      COMPLETED: 'Complété',
      REJECTED: 'Rejeté'
    };
    return map[status] || status;
  }

  getPaymentMethodLabel(method: string): string {
    const map: Record<string, string> = {
      BINANCE: 'Binance',
      BANK_TRANSFER: 'Virement bancaire (IBAN/RIB)'
    };
    return map[method] || method;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  // ================= PROCESS =================
  openProcessModal(withdrawal: WithdrawalResponse, action: 'APPROVE' | 'REJECT'): void {
    this.withdrawalToProcess = withdrawal;
    this.processAction = action;
    this.rejectReason = '';
    this.proofFile = null;
    this.showProcessModal = true;
  }

  closeProcessModal(): void {
    this.showProcessModal = false;
    this.withdrawalToProcess = null;
    this.proofFile = null;
  }

  onProofSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.proofFile = input.files[0];
    }
  }

  confirmProcess(): void {
    if (!this.withdrawalToProcess) return;
    if (this.processAction === 'REJECT' && !this.rejectReason.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Raison requise', detail: 'Veuillez indiquer la raison du rejet.' });
      return;
    }

    this.isProcessing = true;
    this.walletService.processWithdrawal(
      this.withdrawalToProcess.id,
      this.processAction,
      this.processAction === 'REJECT' ? this.rejectReason : undefined,
      this.processAction === 'APPROVE' ? this.proofFile || undefined : undefined
    ).subscribe({
      next: () => {
        this.isProcessing = false;
        this.closeProcessModal();
        this.loadWithdrawals();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: this.processAction === 'APPROVE'
            ? 'Retrait approuvé, wallet débité et email envoyé au vendeur.'
            : 'Retrait rejeté, le vendeur a été notifié par email.'
        });
      },
      error: (err) => {
        this.isProcessing = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.error || 'Échec du traitement.' });
      }
    });
  }

  viewProof(path: string): void {
    this.selectedImagePath = path;
    this.showImageModal = true;
  }

  getFullImagePath(path: string): string {
    return `${environment.apiUrl}/${path.replace(/\\/g, '/')}`;
  }

  countByStatus(status: string): number {
    return this.withdrawals.filter(w => w.status === status).length;
  }

  totalCompleted(): number {
    return this.withdrawals
      .filter(w => w.status === "COMPLETED")
      .reduce((sum, w) => sum + (w.amount || 0), 0);
  }

  getPageNumbers(): number[] {
    const max = 5; const pages: number[] = [];
    let start = Math.max(0, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages - 1, start + max - 1);
    if (end - start + 1 < max) start = Math.max(0, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.selectedImagePath = '';
  }
}