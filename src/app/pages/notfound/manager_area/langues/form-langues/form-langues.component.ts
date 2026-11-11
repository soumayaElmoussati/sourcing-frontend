import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LangueService } from '../langue.service';
import { Langue } from '@/types/langue.model';

@Component({
  selector: 'app-form-langues',
  templateUrl: './form-langues.component.html',
  styleUrls: ['./form-langues.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class FormLanguesComponent implements OnInit {
  languageForm!: FormGroup;
  language: Langue = { idL: 0, codeLg: '', titre: '', flag: '' };
  isEditMode: boolean = false;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private langueService: LangueService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initForm();

    this.route.url.subscribe(urlSegments => {
      if (urlSegments.length === 1 && urlSegments[0].path === 'new') {
        this.isEditMode = false;
      } else if (urlSegments.length === 2 && urlSegments[1].path === 'edit') {
        this.isEditMode = true;
        const id = Number(urlSegments[0].path);
        this.loadLanguage(id);
      } else {
        this.router.navigate(['/pages/manage/langues']);
      }
    });
  }

  initForm() {
    this.languageForm = this.fb.group({
      titre: ['', Validators.required],
      codeLg: ['', [Validators.required, Validators.maxLength(2)]],
      flag: ['']
    });
  }

  loadLanguage(id: number) {
    const lang = this.langueService.getLangueById(id);
    if (lang) {
      this.language = lang;
      this.languageForm.patchValue({
        titre: lang.titre,
        codeLg: lang.codeLg,
        flag: lang.flag
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: `Langue avec id ${id} non trouvée`,
        life: 3000
      });
      this.router.navigate(['/pages/manage/langues']);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const simulatedPath = `flags/${file.name}`;
      this.languageForm.patchValue({ flag: simulatedPath });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.languageForm.invalid) {
      return;
    }

    const formValue = this.languageForm.value;
    const langData: Langue = {
      idL: this.isEditMode ? this.language.idL : 0,
      titre: formValue.titre,
      codeLg: formValue.codeLg,
      flag: formValue.flag
    };

    try {
      if (this.isEditMode) {
        this.langueService.updateLangue(langData);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Langue mise à jour',
          life: 2000
        });
      } else {
        this.langueService.addLangue(langData);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Langue créée',
          life: 2000
        });
      }

      setTimeout(() => {
        this.router.navigate(['/pages/manage/langues']);
      }, 700);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de la sauvegarde',
        life: 3000
      });
    }
  }

  onCancel() {
    this.router.navigate(['/pages/manage/langues']);
  }
}
