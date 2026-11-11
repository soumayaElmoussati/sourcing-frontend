import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UserDto, UserProfileService } from '@/services/profile.service';
import { PaymentMethodsService, PaymentMethodType, SellerPaymentMethod } from '@/services/payment-methods.service';
import { environment } from 'src/environments/environment';

type ProfileTab = 'profile' | 'security' | 'documents' | 'bank';

@Component({
  selector: 'app-profile-seller',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  templateUrl: './profile-seller.component.html',
  styleUrls: ['./profile-seller.component.scss'],
  providers: [MessageService]
})
export class ProfileSellerComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  activeTab: ProfileTab = 'profile';
  isLoading = false;
  isSaving = false;

  user: UserDto | null = null;

  // ================= FORM STATE =================
  form = {
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    storeName: ''
  };

  photoPreview: string | null = null;
  selectedPhotoFile: File | null = null;
  isUploadingPhoto = false;

  // ================= SECURITY =================
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isChangingPassword = false;

  // ================= BANK ACCOUNTS =================
  paymentMethods: SellerPaymentMethod[] = [];
  isLoadingPaymentMethods = false;

  showPaymentModal = false;
  isEditingPaymentMethod = false;
  editingPaymentMethodId: number | null = null;
  paymentForm = {
    methodType: 'BINANCE' as PaymentMethodType,
    label: 'Binance',
    accountDetails: ''
  };
  isSavingPaymentMethod = false;

  showDeleteModal = false;
  paymentMethodToDelete: SellerPaymentMethod | null = null;

  constructor(
    private userProfileService: UserProfileService,
    private paymentMethodsService: PaymentMethodsService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  setTab(tab: ProfileTab): void {
    this.activeTab = tab;
    if (tab === 'bank' && this.paymentMethods.length === 0) {
      this.loadPaymentMethods();
    }
  }

  loadProfile(): void {
    this.isLoading = true;
    this.userProfileService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.form.firstName = user.firstName;
        this.form.lastName = user.lastName;
        this.form.phone = user.sellerInfo?.phone || '';
        this.form.country = user.sellerInfo?.country || '';
        this.form.storeName = user.sellerInfo?.storeName || '';
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger le profil' });
      }
    });
  }

  get fullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  get initials(): string {
    if (!this.user) return '';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  get statusLabel(): string {
    const status = this.user?.sellerInfo?.status;
    const map: Record<string, string> = { approved: 'Actif', pending: 'En attente', suspended: 'Suspendu' };
    return status ? (map[status] || status) : '-';
  }

  getPhotoUrl(path: string): string {
    return `${environment.apiUrl}/uploads/${path}`;
  }

  getDocumentUrl(path: string): string {
    return `${environment.apiUrl}/${path.replace(/\\/g, '/')}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // ================= PHOTO =================
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.match(/image\/*/) || file.size > 5_000_000) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez sélectionner une image valide (max 5 Mo)' });
      return;
    }

    this.selectedPhotoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => (this.photoPreview = e.target?.result as string);
    reader.readAsDataURL(file);

    this.isUploadingPhoto = true;
    this.userProfileService.uploadProfilePhoto(file).subscribe({
      next: (response) => {
        this.isUploadingPhoto = false;
        if (this.user) this.user.profilePhotoPath = response.profilePhotoPath;
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Photo de profil mise à jour.' });
      },
      error: () => {
        this.isUploadingPhoto = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de l'envoi de la photo." });
      }
    });
  }

  // ================= PROFILE FORM =================
  saveProfile(): void {
    if (!this.form.firstName.trim() || !this.form.lastName.trim() || !this.form.phone.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Prénom, nom et téléphone sont obligatoires.' });
      return;
    }

    this.isSaving = true;
    this.userProfileService.updateSellerProfile(this.form).subscribe({
      next: () => {
        this.isSaving = false;
        this.loadProfile();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Profil mis à jour avec succès.' });
      },
      error: (err) => {
        this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.error || 'Échec de la mise à jour du profil.' });
      }
    });
  }

  cancelProfileEdit(): void {
    this.loadProfile();
  }

  // ================= SECURITY =================
  changePassword(): void {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez remplir tous les champs.' });
      return;
    }
    if (newPassword.length < 6) {
      this.messageService.add({ severity: 'warn', summary: 'Mot de passe trop court', detail: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'Erreur', detail: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    this.isChangingPassword = true;
    this.userProfileService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Mot de passe modifié avec succès.' });
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.error || 'Échec du changement de mot de passe.' });
      }
    });
  }

  cancelPasswordEdit(): void {
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  // ================= BANK ACCOUNTS =================
  loadPaymentMethods(): void {
    this.isLoadingPaymentMethods = true;
    this.paymentMethodsService.getAll().subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
        this.isLoadingPaymentMethods = false;
      },
      error: () => {
        this.isLoadingPaymentMethods = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger vos comptes de paiement.' });
      }
    });
  }

  openAddPaymentModal(): void {
    this.isEditingPaymentMethod = false;
    this.editingPaymentMethodId = null;
    this.paymentForm = { methodType: 'BINANCE', label: 'Binance', accountDetails: '' };
    this.showPaymentModal = true;
  }

  openEditPaymentModal(method: SellerPaymentMethod): void {
    this.isEditingPaymentMethod = true;
    this.editingPaymentMethodId = method.id;
    this.paymentForm = { methodType: method.methodType, label: method.label, accountDetails: method.accountDetails };
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  onPaymentMethodTypeChange(): void {
    this.paymentForm.label = this.paymentForm.methodType === 'BINANCE' ? 'Binance' : '';
  }

  submitPaymentMethod(): void {
    if (!this.paymentForm.label.trim() || !this.paymentForm.accountDetails.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez remplir tous les champs.' });
      return;
    }

    this.isSavingPaymentMethod = true;
    const request$ = this.isEditingPaymentMethod && this.editingPaymentMethodId
      ? this.paymentMethodsService.update(this.editingPaymentMethodId, this.paymentForm)
      : this.paymentMethodsService.create(this.paymentForm);

    request$.subscribe({
      next: () => {
        this.isSavingPaymentMethod = false;
        this.closePaymentModal();
        this.loadPaymentMethods();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: this.isEditingPaymentMethod ? 'Compte mis à jour avec succès.' : 'Compte ajouté avec succès.'
        });
      },
      error: (err) => {
        this.isSavingPaymentMethod = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.error || "Échec de l'enregistrement." });
      }
    });
  }

  openDeleteModal(method: SellerPaymentMethod): void {
    this.paymentMethodToDelete = method;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.paymentMethodToDelete = null;
  }

  confirmDeletePaymentMethod(): void {
    if (!this.paymentMethodToDelete) return;
    this.paymentMethodsService.delete(this.paymentMethodToDelete.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadPaymentMethods();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Compte supprimé.' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression.' });
      }
    });
  }
}
