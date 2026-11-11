import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { WalletService, WalletTransaction, TransactionType } from '@/services/wallet.service';

@Component({
  selector: 'app-admin-wallet-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './admin-wallet-transactions.component.html',
  styleUrls: ['./admin-wallet-transactions.component.scss']
})
export class AdminWalletTransactionsComponent implements OnInit {

  transactions: WalletTransaction[] = [];
  isLoading = false;

  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  typeFilter: TransactionType | '' = '';

  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.walletService.getAllTransactions(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.transactions = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les transactions.' });
      }
    });
  }

  get filteredTransactions(): WalletTransaction[] {
    if (!this.typeFilter) return this.transactions;
    return this.transactions.filter(t => t.type === this.typeFilter);
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadTransactions();
  }

  getTypeLabel(type: TransactionType): string {
    const map: Record<TransactionType, string> = {
      BALANCE: 'Dépôt',
      WITHDRAW: 'Retrait',
      PAYMENT_ORDER: 'Revenu commande',
      FEE: 'Frais'
    };
    return map[type];
  }

  getFeeTypeLabel(feeType?: string): string {
    if (!feeType) return '';
    const map: Record<string, string> = {
      LEAD_FEE: 'Lead fee',
      DELIVERED_FEE: 'Delivered fee',
      RETURNED_FEE: 'Returned fee'
    };
    return map[feeType] || feeType;
  }

  countByType(type: string): number {
    return this.transactions.filter(t => t.type === type).length;
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      BALANCE: "pi-arrow-circle-down",
      WITHDRAW: "pi-arrow-circle-up",
      PAYMENT_ORDER: "pi-shopping-cart",
      FEE: "pi-percentage"
    };
    return map[type] || "pi-circle";
  }

  getPageNumbers(): number[] {
    const max = 5;
    const pages: number[] = [];
    let start = Math.max(0, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages - 1, start + max - 1);
    if (end - start + 1 < max) start = Math.max(0, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}