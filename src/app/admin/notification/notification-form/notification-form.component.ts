import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationResponse, NotificationService } from '../notificatio.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-notification-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.scss']
})
export class NotificationFormComponent implements OnInit {

  form!: FormGroup;
  isTargeted = false;
  isEdit = false;
  loading = false;

  selectedImages: File[] = [];
  imagePreviews: string[] = [];

  existingImages: {
    url: string;   // pour affichage
    path: string;  // backend path réel
    toDelete: boolean;
  }[] = [];

  notificationId!: number;

  constructor(
    private fb: FormBuilder,
    private service: NotificationService,
    private route: ActivatedRoute,
    private router: Router , private messageService: MessageService
  ) { }

  ngOnInit() {
    this.initForm();
    this.detectMode();
  }

  /* ---------------- VALIDATION ---------------- */
  targetedEmailsValidator(control: AbstractControl): ValidationErrors | null {
    const type = control.get('type')?.value;
    const emails = control.get('userEmails') as FormArray;

    if (type === 'TARGETED' && emails.length === 0) {
      return { emailsRequired: true };
    }
    return null;
  }

  /* ---------------- FORM ---------------- */
  initForm() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      message: ['', Validators.required],
      type: ['GLOBAL', Validators.required],
      userEmails: this.fb.array([])
    }, { validators: this.targetedEmailsValidator });

    this.form.get('type')?.valueChanges.subscribe(type => {
      this.isTargeted = type === 'TARGETED';
      if (!this.isTargeted) {
        this.userEmails.clear();
      }
    });
  }

  get userEmails(): FormArray {
    return this.form.get('userEmails') as FormArray;
  }

  addEmail(email: string = '') {
    this.userEmails.push(this.fb.control(email, [Validators.required, Validators.email]));
  }

  removeEmail(index: number) {
    this.userEmails.removeAt(index);
  }

  /* ---------------- IMAGES ---------------- */
  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      this.selectedImages.push(file);

      const reader = new FileReader();
      reader.onload = () => this.imagePreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  markImageForDeletion(index: number) {
    this.existingImages[index].toDelete = true; // ne pas supprimer du tableau, juste marquer
  }

  /* ---------------- MODE EDIT ---------------- */
  detectMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.notificationId = +id;
      this.loadNotification(this.notificationId);
    }
  }

  loadNotification(id: number) {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (notif: NotificationResponse) => {

        this.form.patchValue({
          title: notif.title,
          message: notif.message,
          type: notif.type
        });

        if (notif.type === 'TARGETED') {
          this.isTargeted = true;
          notif.targetUserEmails?.forEach(email => this.addEmail(email));
        }

        // 🔥 images existantes
        this.existingImages = notif.imgsNotifications.map((url, index) => ({
          url,
          path: notif.imgsPath[index], // backend path
          toDelete: false
        }));

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  /* ---------------- SUBMIT ---------------- */
  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;

    // images existantes à garder (backend path)
    const imagesToKeep = this.existingImages
      .filter(img => !img.toDelete)
      .map(img => img.path);

    const notificationData = {
      title: this.form.value.title,
      message: this.form.value.message,
      type: this.form.value.type,
      emails: this.form.value.type === 'TARGETED' ? this.form.value.userEmails : [],
      existingImages: imagesToKeep
    };

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(notificationData)], { type: 'application/json' }));

    // nouvelles images
    this.selectedImages.forEach(file => formData.append('images', file));

    const request$ = this.isEdit
      ? this.service.update(this.notificationId, formData)
      : this.service.create(formData);

    request$.subscribe({
      next: () => {
        this.loading = false;
        
        // Message de succès selon le type d'opération
        const message = this.isEdit 
          ? 'Notification a été modifiée avec succès'
          : 'Notification a été créée avec succès';
        
        this.messageService.add({
          severity: 'success',
          summary: this.isEdit ? 'Modification réussie' : 'Création réussie',
          detail: message,
          life: 3000
        });
        
        // Redirection vers la liste des notifications
        this.router.navigate(['/admin/notifications']);
      },
      
      error: err => {
        this.loading = false;
        console.error('Error saving notification', err);
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de l\'enregistrement',
          life: 3000
        });
      }
    });
}

  ///

  goBack(): void {
    // Utilisez votre router pour revenir à la liste des notifications
    // Ajustez le chemin selon votre routing
    this.router.navigate(['/admin/notifications']); // ou le chemin approprié
}
}
