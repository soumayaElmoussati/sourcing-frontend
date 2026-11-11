import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerDTO, SellerService } from '@/services/seller.service';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface Seller {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  cin: string;
  status: string;
  avatar?: string;
  registrationDate: Date;
  lastActivity: Date;
}

@Component({
  selector: 'app-list-seller',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,  ToastModule],
  templateUrl: './list-seller.component.html',
  styleUrls: ['./list-seller.component.scss'],
  providers: [MessageService]
})
export class ListSellerComponent implements OnInit {
  // Données des vendeurs
  sellers: Seller[] = [];
  filteredSellers: Seller[] = [];
  paginatedSellers: Seller[] = []; 
  
  // Filtres et recherche
  searchQuery: string = '';
  statusFilter: string = '';
  countryFilter: string = '';
  sortBy: string = 'name';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // Sélection multiple
  selectedSellers: number[] = [];
  allSelected: boolean = false;
  
  // Mode d'affichage
  viewMode: 'table' | 'grid' = 'table';
  moreActionsVisible: number | null = null;
  
  // Statistiques
  totalSellers: number = 0;
  activeSellers: number = 0;
  pendingSellers: number = 0;
  countriesCount: number = 0;
  
  // Liste des pays
  countries: string[] = ['USA', 'Canada', 'UK', 'France', 'Germany', 'Spain', 'Italy', 'Japan', 'Australia'];
  
  // Tri
  sortField: string = 'fullName';
  sortOrder: number = 1; 

  isLoading: boolean = false;
  searchFocused: boolean = false;
  isDeleting: boolean = false;
  isUpdating: boolean = false;


  showDeleteModal: boolean = false;
  sellerToDelete: Seller | null = null;
  deleteError: string = '';

  constructor(private sellerService:SellerService,
    private messageService: MessageService
  ){}

  ngOnInit() {
    this.loadSellers();
    this.calculateStats();
    this.updatePaginatedSellers(); 
  }

  
  loadSellers() {
    this.isLoading = true;
    
    const sub = this.sellerService.getAllSellers().subscribe({
      next: (apiSellers: SellerDTO[]) => {
        this.sellers = this.transformApiSellers(apiSellers);
        this.filteredSellers = [...this.sellers];
        this.updatePaginatedSellers();
        this.calculateStats();
        this.extractCountries();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur de chargement:', error);
        this.sellers = [];
        this.filteredSellers = [];
        this.paginatedSellers = [];
        this.isLoading = false;
      }
    });
    
  //  this.subscriptions.add(sub);
  }


  private transformApiSellers(apiSellers: SellerDTO[]): Seller[] {
    return apiSellers.map(apiSeller => ({
      id: apiSeller.id || 0,
      fullName: this.getFullName(apiSeller),
      email: apiSeller.email || '',
      phone: apiSeller.phone || '',
      country: apiSeller.country || 'Inconnu',
      cin: this.generateCin(apiSeller),
      status: this.determineStatus(apiSeller),
      registrationDate: new Date(apiSeller.createdAt || new Date()),
      lastActivity: new Date(apiSeller.updatedAt || new Date()),
      storeName: apiSeller.storeName,
      budget: apiSeller.budget,
      commerceExperience: apiSeller.commerceExperience,
      adsExperience: apiSeller.adsExperience,
      firstName: apiSeller.firstName,
      lastName: apiSeller.lastName
    }));
  }

  private getFullName(apiSeller: SellerDTO): string {
    if (apiSeller.firstName && apiSeller.lastName) {
      return `${apiSeller.firstName} ${apiSeller.lastName}`;
    }
    return apiSeller.email?.split('@')[0] || 'Vendeur';
  }

  private generateCin(apiSeller: SellerDTO): string {
    const countryCode = apiSeller.country?.substring(0, 2).toUpperCase() || 'XX';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${countryCode}${randomNum}`;
  }


  private determineStatus(apiSeller: SellerDTO): string {
    // Utiliser directement le statut de l'API
    if (apiSeller.status) {
      return apiSeller.status;
    }
    
    // Fallback si le statut n'existe pas
    return 'pending';
  }

  private extractCountries() {
    const uniqueCountries = new Set(this.sellers.map(s => s.country).filter(Boolean));
    this.countries = Array.from(uniqueCountries);
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'approved':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'suspended':
        return 'Suspendu';
      default:
        return status;
    }
  }


  // Mettre à jour les données paginées
  updatePaginatedSellers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSellers = this.filteredSellers.slice(startIndex, endIndex);
  }

  // Calculer les statistiques
  calculateStats() {
    this.totalSellers = this.sellers.length;
    this.activeSellers = this.sellers.filter(s => s.status === 'active').length;
    this.pendingSellers = this.sellers.filter(s => s.status === 'pending').length;
    
    const uniqueCountries = new Set(this.sellers.map(s => s.country));
    this.countriesCount = uniqueCountries.size;
  }

  // Recherche
  onSearch() {
    this.applyFilters();
  }

  // Appliquer les filtres
  applyFilters() {
    let filtered = [...this.sellers];

    // Filtre par recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(seller =>
        seller.fullName.toLowerCase().includes(query) ||
        seller.email.toLowerCase().includes(query) ||
        seller.cin.toLowerCase().includes(query) ||
        seller.phone.toLowerCase().includes(query)
      );
    }

    // Filtre par statut
    if (this.statusFilter) {
      filtered = filtered.filter(seller => seller.status === this.statusFilter);
    }

    // Filtre par pays
    if (this.countryFilter) {
      filtered = filtered.filter(seller => seller.country === this.countryFilter);
    }

    this.filteredSellers = filtered;
    this.currentPage = 1; // Retour à la première page après filtrage
    this.updatePaginatedSellers(); // Mettre à jour les données paginées
    this.applySorting();
  }

  // Appliquer le tri
  applySorting() {
    this.filteredSellers.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'name':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          return aValue.localeCompare(bValue) * this.sortOrder;
        
        case 'name_desc':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          return bValue.localeCompare(aValue) * this.sortOrder;
        
        case 'date':
          aValue = new Date(a.registrationDate).getTime();
          bValue = new Date(b.registrationDate).getTime();
          return (aValue - bValue) * this.sortOrder;
        
        case 'status':
          aValue = a.status;
          bValue = b.status;
          return aValue.localeCompare(bValue) * this.sortOrder;
        
        default:
          return 0;
      }
    });
    
    this.updatePaginatedSellers(); // Mettre à jour les données paginées après le tri
  }

  // Trier le tableau par colonne
  sortTable(field: string) {
    if (this.sortField === field) {
      this.sortOrder *= -1; // Inverser l'ordre
    } else {
      this.sortField = field;
      this.sortOrder = 1; // Ordre ascendant par défaut
    }

    this.filteredSellers.sort((a, b) => {
      const aValue = (a as any)[field];
      const bValue = (b as any)[field];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * this.sortOrder;
      }
      
      return (aValue - bValue) * this.sortOrder;
    });
    
    this.updatePaginatedSellers(); // Mettre à jour les données paginées
  }

  // Effacer tous les filtres
  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.countryFilter = '';
    this.sortBy = 'name';
    this.filteredSellers = [...this.sellers];
    this.updatePaginatedSellers(); // Mettre à jour les données paginées
    this.applySorting();
  }

  // Rafraîchir les données
  refreshData() {
    this.loadSellers();
    this.calculateStats();
    this.selectedSellers = [];
    this.allSelected = false;
  }

  // Changer le mode d'affichage
  toggleViewMode() {
    this.viewMode = this.viewMode === 'table' ? 'grid' : 'table';
  }

  // Afficher/masquer les actions supplémentaires
  toggleMoreActions(sellerId: number) {
    this.moreActionsVisible = this.moreActionsVisible === sellerId ? null : sellerId;
  }

  // Sélectionner/désélectionner tous les vendeurs
  toggleSelectAll(event: Event) {
    const target = event.target as HTMLInputElement;
    this.allSelected = target.checked;
    
    if (this.allSelected) {
      this.selectedSellers = this.paginatedSellers.map(seller => seller.id);
    } else {
      this.selectedSellers = [];
    }
  }

  // Sélectionner/désélectionner un vendeur
  toggleSelectSeller(sellerId: number) {
    const index = this.selectedSellers.indexOf(sellerId);
    
    if (index > -1) {
      this.selectedSellers.splice(index, 1);
    } else {
      this.selectedSellers.push(sellerId);
    }
    
    this.allSelected = this.selectedSellers.length === this.paginatedSellers.length;
  }

  // Voir les détails d'un vendeur
  viewSeller(sellerId: number) {
    console.log('View seller:', sellerId);
    // Navigation vers la page de détails
    // this.router.navigate(['/seller', sellerId]);
  }



  // Supprimer un vendeur
  deleteSeller(sellerId: number): void {
    const seller = this.sellers.find(s => s.id === sellerId);
    if (seller) {
      this.openDeleteModal(seller);
    }
  }
  // Envoyer un email de vérification
  sendVerificationEmail(sellerId: number) {
    console.log('Send verification email to:', sellerId);
    alert('Verification email sent!');
    this.moreActionsVisible = null;
  }

  // Changer le statut d'un vendeur
  toggleStatus(sellerId: number) {
    const seller = this.sellers.find(s => s.id === sellerId);
    if (seller) {
      seller.status = seller.status === 'active' ? 'suspended' : 'active';
      this.applyFilters();
      this.calculateStats();
      this.updatePaginatedSellers();
      this.moreActionsVisible = null;
    }
  }

  // Voir les documents
  viewDocuments(sellerId: number) {
    console.log('View documents for:', sellerId);
    this.moreActionsVisible = null;
  }

  // Exporter les données
  exportData() {
    console.log('Exporting data...');
    alert('Data exported successfully!');
  }

  // Exporter les éléments sélectionnés
  exportSelected() {
    if (this.selectedSellers.length === 0) {
      alert('Please select sellers to export.');
      return;
    }
    console.log('Exporting selected sellers:', this.selectedSellers);
    alert(`${this.selectedSellers.length} sellers exported successfully!`);
  }

  // Action groupée
  bulkAction(action: string) {
    if (this.selectedSellers.length === 0) {
      alert('Please select sellers first.');
      return;
    }

    switch (action) {
      case 'activate':
        this.selectedSellers.forEach(id => {
          const seller = this.sellers.find(s => s.id === id);
          if (seller) seller.status = 'active';
        });
        break;
      
      case 'suspend':
        this.selectedSellers.forEach(id => {
          const seller = this.sellers.find(s => s.id === id);
          if (seller) seller.status = 'suspended';
        });
        break;
    }

    this.applyFilters();
    this.calculateStats();
    this.updatePaginatedSellers();
    alert(`Action "${action}" applied to ${this.selectedSellers.length} sellers.`);
  }

  // Suppression groupée
  bulkDelete() {
    if (this.selectedSellers.length === 0) {
      alert('Please select sellers to delete.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${this.selectedSellers.length} sellers?`)) {
      this.sellers = this.sellers.filter(s => !this.selectedSellers.includes(s.id));
      this.selectedSellers = [];
      this.allSelected = false;
      this.applyFilters();
      this.calculateStats();
      this.updatePaginatedSellers();
      alert('Sellers deleted successfully.');
    }
  }

  // Effacer la sélection
  clearSelection() {
    this.selectedSellers = [];
    this.allSelected = false;
  }

  // Ouvrir le modal d'ajout
  openAddSellerModal() {
    console.log('Open add seller modal');
    // Implémentez votre modal d'ajout ici
  }

  // Obtenir l'emoji du drapeau
  getFlagEmoji(country: string): string {
    const flags: { [key: string]: string } = {
      'USA': '🇺🇸',
      'Canada': '🇨🇦',
      'UK': '🇬🇧',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Japan': '🇯🇵',
      'Australia': '🇦🇺'
    };
    return flags[country] || '🌍';
  }

  // Formater le téléphone (méthode au lieu de pipe)
  formatPhone(phone: string): string {
    if (!phone) return '';
    
    // Supprimer tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '');
    
    // Formater selon la longueur
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
    }
    
    return phone;
  }

  // Changer de page
  changePage(page: number) {
    this.currentPage = page;
    this.updatePaginatedSellers();
  }

  // Changer le nombre d'éléments par page
  changeItemsPerPage() {
    this.currentPage = 1;
    this.updatePaginatedSellers();
  }

  // Obtenir le nombre total de pages
  getTotalPages(): number {
    return Math.ceil(this.filteredSellers.length / this.itemsPerPage);
  }

  // Obtenir l'index de début
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  // Obtenir l'index de fin
  getEndIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredSellers.length ? this.filteredSellers.length : end;
  }

  // Obtenir les numéros de page à afficher
  getPages(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (this.currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }

  // Vérifier si on doit afficher des points de suspension
  get showEllipsis(): boolean {
    return this.getTotalPages() > 5 && this.currentPage < this.getTotalPages() - 2;
  }

  /////

  openDeleteModal(seller: Seller): void {
    this.sellerToDelete = seller;
    this.deleteError = '';
    this.showDeleteModal = true;
  }

  // Fermer le modal
  closeDeleteModal(): void {
    if (!this.isDeleting) {
      this.showDeleteModal = false;
      this.sellerToDelete = null;
      this.deleteError = '';
    }
  }

  confirmDelete(): void {
    if (!this.sellerToDelete) return;

    this.isDeleting = true;
    this.deleteError = '';

    this.sellerService.deleteSeller(this.sellerToDelete.id).subscribe({
      next: () => {
        // Succès - supprimer le vendeur de la liste
        const index = this.sellers.findIndex(s => s.id === this.sellerToDelete!.id);
        if (index > -1) {
          this.sellers.splice(index, 1);
        }
        
        // Mettre à jour les listes
        this.applyFilters();
        this.calculateStats();
        this.updatePaginatedSellers();
        
        // Fermer le modal
        this.isDeleting = false;
        this.closeDeleteModal();

        this.messageService.add({
          severity: 'success',
          summary: 'Vendeur déplacé vers la corbeille',
          detail: 'Vous pouvez le restaurer depuis la page "Vendeurs supprimés"',
          life: 3000
        });
        
        // Afficher une notification de succès (optionnel)
      //  this.showSuccessNotification('Vendeur supprimé avec succès');
      },
      error: (error: HttpErrorResponse) => {
        this.isDeleting = false;
        console.error('Erreur suppression:', error);
        
        if (error.status === 404) {
          this.deleteError = 'Vendeur non trouvé';
        } else if (error.status === 403) {
          this.deleteError = 'Vous n\'avez pas les droits pour supprimer ce vendeur';
        } else {
          this.deleteError = 'Erreur lors de la suppression. Veuillez réessayer.';
        }
      }
    });
  }

  //

  truncateEmail(email: string, maxLength: number = 25): string {
    if (!email) return '';
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength) + '...';
  }


}