import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Fee, FeeType, WalletService } from '@/services/wallet.service';

interface FeeTypeInfo {
  value: FeeType;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-fee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './fee-list.component.html',
  styleUrls: ['./fee-list.component.scss']
})
export class FeeListComponent implements OnInit {

  fees: Fee[] = [];
  isLoading = false;

  readonly feeTypes: FeeTypeInfo[] = [
    { value: 'LEAD_FEE', label: 'Lead fee', description: "Prélevé automatiquement dès qu'un vendeur passe une commande.", icon: 'pi-user-plus' },
    { value: 'DELIVERED_FEE', label: 'Delivered fee', description: "Prélevé quand une commande passe au statut Livrée.", icon: 'pi-check-circle' },
    { value: 'RETURNED_FEE', label: 'Returned fee', description: "Prélevé quand une commande passe au statut Retournée.", icon: 'pi-undo' }
  ];

  // ================= ADD/EDIT MODAL =================
  showFormModal = false;
  isEditMode = false;
  formFeeId: number | null = null;
  formType: FeeType | '' = '';
  formAmount: number | null = null;
  isSaving = false;

  // ================= DELETE MODAL =================
  showDeleteModal = false;
  feeToDelete: Fee | null = null;
  isDeleting = false;

  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadFees();
  }

  loadFees(): void {
    this.isLoading = true;
    this.walletService.getAllFees().subscribe({
      next: (fees) => {
        this.fees = fees;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les frais.' });
      }
    });
  }

  getFeeTypeInfo(type: FeeType): FeeTypeInfo {
    return this.feeTypes.find(t => t.value === type)!;
  }

  getFeeForType(type: FeeType): Fee | undefined {
    return this.fees.find(f => f.type === type);
  }

  // Un seul fee actif par type : on ne peut "ajouter" que les types pas encore configurés.
  get unconfiguredTypes(): FeeTypeInfo[] {
    return this.feeTypes.filter(t => !this.getFeeForType(t.value));
  }

  // ================= ADD =================
  openAddModal(type?: FeeType): void {
    this.isEditMode = false;
    this.formFeeId = null;
    this.formType = type || (this.unconfiguredTypes[0]?.value ?? '');
    this.formAmount = null;
    this.showFormModal = true;
  }

  // ================= EDIT =================
  openEditModal(fee: Fee): void {
    this.isEditMode = true;
    this.formFeeId = fee.id;
    this.formType = fee.type;
    this.formAmount = fee.amount;
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.formFeeId = null;
    this.formType = '';
    this.formAmount = null;
  }

  submitForm(): void {
    if (!this.formType || this.formAmount == null || this.formAmount <= 0) return;

    this.isSaving = true;

    if (this.isEditMode && this.formFeeId != null) {
      this.walletService.updateFee(this.formFeeId, this.formAmount).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeFormModal();
          this.loadFees();
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Frais mis à jour avec succès.' });
        },
        error: (err) => {
          this.isSaving = false;
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.error || 'Échec de la mise à jour.' });
        }
      });
    } else {
      this.walletService.createFee(this.formType as FeeType, this.formAmount).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeFormModal();
          this.loadFees();
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Frais ajouté avec succès.' });
        },
        error: (err) => {
          this.isSaving = false;
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.error || "Échec de l'ajout." });
        }
      });
    }
  }

  // ================= DELETE =================
  openDeleteModal(fee: Fee): void {
    this.feeToDelete = fee;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.feeToDelete = null;
  }

  confirmDelete(): void {
    if (!this.feeToDelete) return;

    this.isDeleting = true;
    this.walletService.deleteFee(this.feeToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadFees();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Frais supprimé.' });
      },
      error: () => {
        this.isDeleting = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression.' });
      }
    });
  }
}
