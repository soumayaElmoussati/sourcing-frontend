import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminUserCreate, AdminUserService, Permission, PermissionsCatalog } from '@/services/admin-user.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit {

  // ❌ password supprimé (généré côté backend)
  user: AdminUserCreate = {
    email: '', firstName: '', lastName: '',
    permissionIds: [], enabled: true
  };

  roleLabel = '';

  // ✅ PermissionsCatalog = { [cat: string]: Permission[] } directement
  permissionsCatalog: PermissionsCatalog = {};
  categories: string[] = [];
  selectedPermIds = new Set<number>();

  loading = false;
  saving  = false;

  readonly CAT_COLOR: Record<string, string> = {
    SELLERS: 'blue', ORDERS: 'green', PRODUCTS: 'indigo',
    SOURCING: 'orange', WALLET: 'teal', SETTINGS: 'purple'
  };

  readonly CAT_ICON: Record<string, string> = {
    SELLERS: 'pi-users', ORDERS: 'pi-shopping-cart', PRODUCTS: 'pi-box',
    SOURCING: 'pi-file-edit', WALLET: 'pi-wallet', SETTINGS: 'pi-cog'
  };

  constructor(
    private userService: AdminUserService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.userService.getPermissionsCatalog().subscribe({
      next: catalog => {
        // ✅ catalog EST déjà { [cat]: Permission[] } — Object.keys direct
        this.permissionsCatalog = catalog;
        this.categories = Object.keys(catalog);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ✅ accès direct par clé
  getPermissions(cat: string): Permission[] {
    return this.permissionsCatalog[cat] ?? [];
  }

  isSelected(id: number): boolean { return this.selectedPermIds.has(id); }

  togglePerm(id: number) {
    if (this.selectedPermIds.has(id)) this.selectedPermIds.delete(id);
    else this.selectedPermIds.add(id);
  }

  isCatFullySelected(cat: string): boolean {
    return this.getPermissions(cat).every(p => this.selectedPermIds.has(p.id));
  }

  toggleCat(cat: string) {
    const perms = this.getPermissions(cat);
    if (this.isCatFullySelected(cat)) perms.forEach(p => this.selectedPermIds.delete(p.id));
    else perms.forEach(p => this.selectedPermIds.add(p.id));
  }

  get selectedCount(): number { return this.selectedPermIds.size; }

  catColor(cat: string): string { return this.CAT_COLOR[cat] ?? 'slate'; }
  catIcon(cat: string):  string { return this.CAT_ICON[cat]  ?? 'pi-circle'; }

  save() {
    if (!this.user.email || !this.user.firstName || !this.user.lastName) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Remplissez tous les champs obligatoires.' });
      return;
    }
    this.saving = true;
    const payload = {
      ...this.user,
      roleLabel: this.roleLabel,
      permissionIds: [...this.selectedPermIds]
    };
    this.userService.createAdminUser(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Créé', detail: 'Compte créé. Email envoyé avec les accès.' });
        setTimeout(() => this.router.navigate(['/admin/users']), 1500);
      },
      error: err => {
        this.saving = false;
        const msg = err.error?.message ?? 'Erreur lors de la création.';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
      }
    });
  }
}