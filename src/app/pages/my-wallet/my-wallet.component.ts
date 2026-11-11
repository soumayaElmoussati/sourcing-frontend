import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FileSizePipe } from 'public/app/shared/pipes/file-size.pipe';

import { MessageService } from 'primeng/api'; // Pour les notifications
import { ToastModule } from 'primeng/toast'; // Pour les notifications
import { WalletInfo, WalletService, WithdrawalResponse, WalletTransaction } from '@/services/wallet.service';

@Component({
  selector: 'app-my-wallet',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FileSizePipe,
    ToastModule // Ajouter ToastModule
  ],
  providers: [MessageService], // Ajouter MessageService
  templateUrl: './my-wallet.component.html',
  styleUrl: './my-wallet.component.scss'
})
export class MyWalletComponent implements OnInit{

  showDepositModal = false;
  showPaymentMethods = false;
  depositAmount: number | null = null;
  selectedPaymentMethod: string = '';
  selectedMethod: any = null;
  selectedFile: File | null = null;
  copied = false;
  copiedField: string = '';
  isLoading = false; 
  walletInfo: WalletInfo | null = null;
  isLoadingWallet = true;
  walletError: string | null = null;
  hideBalance = false;

  paymentMethods = [
    { 
      value: 'binance', 
      name: 'Binance',
      payId: '94871715'
    },
    { 
      value: 'redotpay', 
      name: 'Redotpay',
      cardNumber: '4532 7890 1234 5678',
      expiryDate: '12/25'
    },
    { 
      value: 'kast', 
      name: 'Kast',
      walletId: 'KST-9876-5432',
      phoneNumber: '+212 6XX-XXXXXX'
    },
    { 
      value: 'moroccan_bank', 
      name: 'Moroccan Bank',
      bankName: 'Banque Populaire',
      accountNumber: 'MA1234567890123456789012',
      iban: 'MA64 1234 5678 9012 3456 7890',
      swift: 'BPMAMAMC'
    }
  ];

  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) {}


  ngOnInit(): void {
    this.loadWalletInfo();
    this.loadTransactions();
    this.loadWithdrawals();
  }


  loadWalletInfo(): void {
    this.isLoadingWallet = true;
    this.walletError = null;

    this.walletService.getWalletInfo().subscribe({
      next: (data) => {
        this.walletInfo = data;
        this.isLoadingWallet = false;
      },
      error: (error) => {
        console.error('Erreur chargement wallet:', error);
        this.walletError = error.error?.error || 'Impossible de charger les informations du wallet';
        this.isLoadingWallet = false;
      }
    });
  }

  togglePaymentMethods() {
    this.showPaymentMethods = !this.showPaymentMethods;
  }

  selectPaymentMethod(method: any) {
    this.selectedMethod = method;
    this.selectedPaymentMethod = method.value;
    this.showPaymentMethods = false;
    this.selectedFile = null;
    this.copied = false;
    this.copiedField = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Fichier trop volumineux',
          detail: 'La taille maximale est de 5MB'
        });
        return;
      }
      
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (!extension || !allowedExtensions.includes(extension)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Format non supporté',
          detail: 'Formats acceptés: JPG, PNG, PDF, DOC'
        });
        return;
      }
      
      this.selectedFile = file;
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      this.copiedField = field;
      setTimeout(() => {
        this.copied = false;
        this.copiedField = '';
      }, 2000);
    });
  }

  closeModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('custom-modal-overlay')) {
      this.showDepositModal = false;
      this.showPaymentMethods = false;
    }
  }

  submitDeposit() {
    if (!this.depositAmount || this.depositAmount <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Montant requis',
        detail: 'Veuillez indiquer le montant de votre dépôt.'
      });
      return;
    }

    if (!this.selectedMethod || !this.selectedFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulaire incomplet',
        detail: 'Veuillez sélectionner une méthode de paiement et un justificatif'
      });
      return;
    }

    this.isLoading = true;

    // Appel au service
    this.walletService.createDeposit(this.depositAmount, this.selectedMethod.value, this.selectedFile).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Afficher le message de succès
        this.messageService.add({
          severity: 'success',
          summary: 'Dépôt créé avec succès',
          detail: `Votre demande de dépôt de ${this.depositAmount} $ (#${response.depositId}) a été enregistrée`
        });

        // Réinitialiser le formulaire
        this.depositAmount = null;
        this.selectedMethod = null;
        this.selectedPaymentMethod = '';
        this.selectedFile = null;
        this.showDepositModal = false;
      },
      error: (error) => {
        this.isLoading = false;
        
        // Afficher le message d'erreur
        const errorMessage = error.error?.error || 'Une erreur est survenue lors de la création du dépôt';
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage
        });
        
        console.error('Erreur dépôt:', error);
      }
    });
  }

  // Méthode pour formater la date (si besoin)
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get formattedBalance(): string {
    if (!this.walletInfo) return '0.00';
    
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.walletInfo.balance);
  }

  toggleBalanceVisibility(): void {
    this.hideBalance = !this.hideBalance;
  }

  // ================= TRANSACTIONS =================
  transactions: WalletTransaction[] = [];
  isLoadingTransactions = false;
  transactionTypeFilter: string = 'all';

  loadTransactions(): void {
    this.isLoadingTransactions = true;
    this.walletService.getMyTransactions(0, 50).subscribe({
      next: (response) => {
        this.transactions = response.content;
        this.isLoadingTransactions = false;
      },
      error: () => {
        this.isLoadingTransactions = false;
      }
    });
  }

  get filteredTransactions(): WalletTransaction[] {
    if (this.transactionTypeFilter === 'all') return this.transactions;
    return this.transactions.filter(t => t.type === this.transactionTypeFilter);
  }

  getTransactionTypeLabel(t: WalletTransaction): string {
    if (t.type === 'FEE') {
      const feeMap: Record<string, string> = {
        LEAD_FEE: 'Lead fee',
        DELIVERED_FEE: 'Delivered fee',
        RETURNED_FEE: 'Returned fee'
      };
      return t.feeType ? feeMap[t.feeType] || 'Frais' : 'Frais';
    }
    const map: Record<string, string> = {
      BALANCE: 'Dépôt',
      WITHDRAW: 'Retrait',
      PAYMENT_ORDER: 'Revenu commande'
    };
    return map[t.type] || t.type;
  }

  getTransactionIcon(t: WalletTransaction): string {
    const map: Record<string, string> = {
      BALANCE: 'pi-plus-circle',
      WITHDRAW: 'pi-arrow-up-right',
      PAYMENT_ORDER: 'pi-shopping-cart',
      FEE: 'pi-percentage'
    };
    return map[t.type] || 'pi-circle';
  }

  // ================= WITHDRAWAL =================
  showWithdrawModal = false;
  withdrawals: WithdrawalResponse[] = [];
  totalWithdrawn = 0;
  isLoadingWithdrawals = false;

  withdrawAmount: number | null = null;
  withdrawMethod: 'BINANCE' | 'BANK_TRANSFER' = 'BINANCE';
  withdrawBinanceId: string = '';
  withdrawBankName: string = '';
  withdrawIban: string = '';
  isWithdrawing = false;

  loadWithdrawals(): void {
    this.isLoadingWithdrawals = true;
    this.walletService.getMyWithdrawals(0, 50).subscribe({
      next: (response) => {
        this.withdrawals = response.content;
        this.totalWithdrawn = response.content
          .filter(w => w.status === 'COMPLETED')
          .reduce((sum, w) => sum + w.amount, 0);
        this.isLoadingWithdrawals = false;
      },
      error: () => {
        this.isLoadingWithdrawals = false;
      }
    });
  }

  get latestPendingWithdrawal(): WithdrawalResponse | undefined {
    return this.withdrawals.find(w => w.status === 'PENDING');
  }

  get completedWithdrawalsCount(): number {
     return this.withdrawals.filter(w => w.status === 'COMPLETED').length;
   }

  openWithdrawModal(): void {
    this.withdrawAmount = null;
    this.withdrawMethod = 'BINANCE';
    this.withdrawBinanceId = '';
    this.withdrawBankName = '';
    this.withdrawIban = '';
    this.showWithdrawModal = true;
  }

  closeWithdrawModal(): void {
    this.showWithdrawModal = false;
  }

  submitWithdrawal(): void {
    if (!this.withdrawAmount || this.withdrawAmount < 10) {
      this.messageService.add({ severity: 'warn', summary: 'Montant invalide', detail: 'Le montant minimum de retrait est de 10 $.' });
      return;
    }

    const accountDetails = this.withdrawMethod === 'BINANCE'
      ? this.withdrawBinanceId
      : `${this.withdrawBankName} - IBAN/RIB: ${this.withdrawIban}`;

    if (this.withdrawMethod === 'BINANCE' && !this.withdrawBinanceId.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Champ requis', detail: "Veuillez indiquer votre identifiant Binance." });
      return;
    }
    if (this.withdrawMethod === 'BANK_TRANSFER' && (!this.withdrawBankName.trim() || !this.withdrawIban.trim())) {
      this.messageService.add({ severity: 'warn', summary: 'Champ requis', detail: 'Veuillez indiquer la banque et l\'IBAN/RIB.' });
      return;
    }

    this.isWithdrawing = true;
    this.walletService.requestWithdrawal({
      amount: this.withdrawAmount,
      paymentMethod: this.withdrawMethod,
      accountDetails
    }).subscribe({
      next: () => {
        this.isWithdrawing = false;
        this.closeWithdrawModal();
        this.loadWithdrawals();
        this.messageService.add({
          severity: 'success',
          summary: 'Demande envoyée',
          detail: 'Votre demande de retrait a été enregistrée et sera traitée par notre équipe.'
        });
      },
      error: (err) => {
        this.isWithdrawing = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.error?.error || 'Échec de la demande de retrait.'
        });
      }
    });
  }

}