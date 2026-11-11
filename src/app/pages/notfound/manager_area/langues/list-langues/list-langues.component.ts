import { Component, OnInit } from '@angular/core';
import { Langue } from '@/types/langue.model';
import { LangueService } from '../langue.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-langues',
  templateUrl: './list-langues.component.html',
  styleUrls: ['./list-langues.component.scss'],
  imports: [
    CommonModule,
    FormsModule,

    // PrimeNG modules
    TableModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    TooltipModule,
    CheckboxModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class ListLanguesComponent implements OnInit {
  langues: Langue[] = [];
  selectedLangues: Langue[] = [];
  loading: boolean = false;

  // New properties for dialog visibility and filter input
  deleteLangueDialog: boolean = false;
  deleteLanguesDialog: boolean = false;
  langue!: Langue; // current langue selected for deletion
  globalFilterValue: string = '';

  constructor(
    private langueService: LangueService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.langueService.getLangues().subscribe(data => {
      this.langues = data;
      this.loading = false;
    });
  }

  openNew() {
    // You can later add a modal or navigation logic here
    this.router.navigate(['/pages/manage/langues/new']);
  }

  editLangue(langue: Langue) {
    // TODO: implement edit functionality, e.g. open dialog with langue data
    this.router.navigate(['/pages/manage/langues', langue.idL, 'edit']);
  }

  deleteLangue(langue: Langue) {
    this.langue = langue;
    this.deleteLangueDialog = true;  // open confirm dialog
  }

  confirmDelete() {
    if (!this.langue) return;

    this.langueService.deleteLangue(this.langue.idL);
    this.langues = this.langues.filter(l => l.idL !== this.langue.idL);
    this.messageService.add({
      severity: 'success',
      summary: 'Supprimé',
      detail: `"${this.langue.titre}" a été supprimée`,
      life: 3000
    });
    this.deleteLangueDialog = false;
    this.langue = {} as Langue;
  }

  deleteSelectedLangues() {
    this.deleteLanguesDialog = true;
  }

  confirmDeleteSelected() {
    if (!this.selectedLangues || this.selectedLangues.length === 0) return;

    this.selectedLangues.forEach(langue => {
      this.langueService.deleteLangue(langue.idL);
    });
    this.langues = this.langues.filter(l => !this.selectedLangues.includes(l));
    this.selectedLangues = [];
    this.messageService.add({
      severity: 'success',
      summary: 'Supprimées',
      detail: 'Les langues sélectionnées ont été supprimées',
      life: 3000
    });
    this.deleteLanguesDialog = false;
  }

  onGlobalFilter(table: any, event: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
