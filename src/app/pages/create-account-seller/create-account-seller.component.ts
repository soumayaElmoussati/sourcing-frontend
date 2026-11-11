import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { SellerService, SellerDTO } from '../../services/seller.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-create-account-seller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './create-account-seller.component.html',
  styleUrls: ['./create-account-seller.component.scss']
})
export class CreateAccountSellerComponent implements OnInit, AfterViewInit {
  @ViewChild('fileFrontInput') fileFrontInput!: ElementRef;
  @ViewChild('fileBackInput') fileBackInput!: ElementRef;
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('contractScroll') contractScrollEl!: ElementRef;

  // ── Signature & Contrat ────────────────────────────────
  contractRead = false;
  signatureStarted = false;
  isDrawing = false;
  lastX = 0;
  lastY = 0;
  signatureBase64 = '';
  today = new Date();
  
  sellerForm!: FormGroup;
  currentStep: number = 1;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showDocumentErrors = false;
  
  // Fichiers uploadés
  idCardRectoFile: File | null = null;
  idCardVersoFile: File | null = null;
  
  // Liste complète des pays (ISO, en français/anglais de base)
  countries = [
    'Afghanistan',
    'Afrique du Sud',
    'Albania',
    'Algérie',
    'Allemagne',
    'Andorre',
    'Angola',
    'Antigua-et-Barbuda',
    'Arabie saoudite',
    'Argentine',
    'Arménie',
    'Australie',
    'Autriche',
    'Azerbaïdjan',
    'Bahamas',
    'Bahreïn',
    'Bangladesh',
    'Barbade',
    'Belgique',
    'Belize',
    'Bénin',
    'Bhoutan',
    'Biélorussie',
    'Birmanie',
    'Bolivie',
    'Bosnie-Herzégovine',
    'Botswana',
    'Brésil',
    'Brunei',
    'Bulgarie',
    'Burkina Faso',
    'Burundi',
    'Cambodge',
    'Cameroun',
    'Canada',
    'Cap-Vert',
    'République centrafricaine',
    'Chili',
    'Chine',
    'Chypre',
    'Colombie',
    'Comores',
    'Congo (Brazzaville)',
    'Congo (Kinshasa)',
    'Corée du Nord',
    'Corée du Sud',
    'Costa Rica',
    'Côte d’Ivoire',
    'Croatie',
    'Cuba',
    'Danemark',
    'Djibouti',
    'Dominique',
    'Égypte',
    'Émirats arabes unis',
    'Équateur',
    'Érythrée',
    'Espagne',
    'Estonie',
    'Eswatini',
    'États-Unis',
    'Éthiopie',
    'Fidji',
    'Finlande',
    'France',
    'Gabon',
    'Gambie',
    'Géorgie',
    'Ghana',
    'Grèce',
    'Grenade',
    'Guatemala',
    'Guinée',
    'Guinée-Bissau',
    'Guinée équatoriale',
    'Guyana',
    'Haïti',
    'Honduras',
    'Hongrie',
    'Inde',
    'Indonésie',
    'Irak',
    'Iran',
    'Irlande',
    'Islande',
    'Israël',
    'Italie',
    'Jamaïque',
    'Japon',
    'Jordanie',
    'Kazakhstan',
    'Kenya',
    'Kirghizistan',
    'Kiribati',
    'Kosovo',
    'Koweït',
    'Laos',
    'Lesotho',
    'Lettonie',
    'Liban',
    'Libéria',
    'Libye',
    'Liechtenstein',
    'Lituanie',
    'Luxembourg',
    'Macédoine du Nord',
    'Madagascar',
    'Malaisie',
    'Malawi',
    'Maldives',
    'Mali',
    'Malte',
    'Maroc',
    'Îles Marshall',
    'Maurice',
    'Mauritanie',
    'Mexique',
    'Micronésie',
    'Moldavie',
    'Monaco',
    'Mongolie',
    'Monténégro',
    'Mozambique',
    'Namibie',
    'Nauru',
    'Népal',
    'Nicaragua',
    'Niger',
    'Nigéria',
    'Norvège',
    'Nouvelle-Zélande',
    'Oman',
    'Ouganda',
    'Ouzbékistan',
    'Pakistan',
    'Palaos',
    'Panama',
    'Papouasie-Nouvelle-Guinée',
    'Paraguay',
    'Pays-Bas',
    'Pérou',
    'Philippines',
    'Pologne',
    'Portugal',
    'Qatar',
    'Roumanie',
    'Royaume-Uni',
    'Russie',
    'Rwanda',
    'Saint-Kitts-et-Nevis',
    'Saint-Marin',
    'Saint-Vincent-et-les-Grenadines',
    'Sainte-Lucie',
    'Salomon (Îles)',
    'Salvador',
    'Samoa',
    'São Tomé-et-Principe',
    'Sénégal',
    'Serbie',
    'Seychelles',
    'Sierra Leone',
    'Singapour',
    'Slovaquie',
    'Slovénie',
    'Somalie',
    'Soudan',
    'Soudan du Sud',
    'Sri Lanka',
    'Suède',
    'Suisse',
    'Suriname',
    'Syrie',
    'Tadjikistan',
    'Tanzanie',
    'Tchad',
    'Thaïlande',
    'Timor oriental',
    'Togo',
    'Tonga',
    'Trinité-et-Tobago',
    'Tunisie',
    'Turkménistan',
    'Turquie',
    'Tuvalu',
    'Ukraine',
    'Uruguay',
    'Vanuatu',
    'Vatican',
    'Venezuela',
    'Viêt Nam',
    'Yémen',
    'Zambie',
    'Zimbabwe',
    'Autre'
  ];

  // Types de documents
  documentTypes = [
    { value: 'cni', label: 'Carte Nationale d\'Identité' },
    { value: 'passport', label: 'Passeport' },
    { value: 'permis', label: 'Permis de conduire' },
    { value: 'carte_sejour', label: 'Carte de séjour' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sellerService: SellerService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {}

  initForm(): void {
    this.sellerForm = this.fb.group({
      // Étape 1: Informations personnelles
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[+]?[0-9]{10,15}$/)
      ]],
      storeName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      country: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      
      // Étape 2: Expérience professionnelle
      budget: [''],
      commerceExperience: [false],
      adsExperience: [false],
      
      // Étape 3: Vérification d'identité
      documentType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validator pour la force du mot de passe
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValidLength = value.length >= 6;

    const errors: ValidationErrors = {};

    if (!hasUpperCase) errors['noUpperCase'] = true;
    if (!hasLowerCase) errors['noLowerCase'] = true;
    if (!hasNumeric) errors['noNumber'] = true;
    if (!hasSpecialChar) errors['noSpecialChar'] = true;
    if (!isValidLength) errors['invalidLength'] = true;

    return Object.keys(errors).length ? errors : null;
  }

  // Validator pour vérifier que les mots de passe correspondent
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Navigation entre les étapes
  nextStep(): void {
    if (this.isCurrentStepValid() && this.currentStep < 4) {
      this.currentStep++;
      this.errorMessage = '';
    }
  }
  
  isCurrentStepValid(): boolean {
    switch(this.currentStep) {
      case 1:
        // Étape 1: Informations personnelles
        const step1Controls = [
          'firstName', 'lastName', 'phone', 
          'storeName', 'country', 
          'email', 'password', 'confirmPassword'
        ];
        
        const allValid = step1Controls.every(controlName => {
          const control = this.sellerForm.get(controlName);
          return control && control.valid;
        });
        
        const passwordsMatch = !this.sellerForm.hasError('passwordMismatch');
        
        return allValid && passwordsMatch;
      
      case 2:
        // Étape 2: Expérience professionnelle - toujours valide (champs optionnels)
        return true;
      
      case 3:
        // Étape 3: Vérification d'identité
        const step3Controls = ['documentType', 'documentNumber', 'termsAccepted'];
        return step3Controls.every(control => this.sellerForm.get(control)?.valid) &&
               this.idCardRectoFile !== null &&
               this.idCardVersoFile !== null;

      case 4:
        // Étape 4: Contrat & Signature
        return this.contractRead && this.signatureStarted && this.signatureBase64 !== '';

      default:
        return false;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  // Gestion des fichiers
  onFileFrontSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validation de la taille du fichier (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Le fichier ne doit pas dépasser 5MB';
        return;
      }
      
      // Validation du type de fichier
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        this.errorMessage = 'Format de fichier non supporté. Utilisez JPG, PNG ou PDF';
        return;
      }
      
      this.idCardRectoFile = file;
      this.errorMessage = '';
    }
  }

  onFileBackSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Le fichier ne doit pas dépasser 5MB';
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        this.errorMessage = 'Format de fichier non supporté. Utilisez JPG, PNG ou PDF';
        return;
      }
      
      this.idCardVersoFile = file;
      this.errorMessage = '';
    }
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Helper pour évaluer la force du mot de passe
  getPasswordStrength(): string {
    const password = this.sellerForm.get('password')?.value;
    if (!password) return 'empty';

    const strengthChecks = {
      length: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const passedChecks = Object.values(strengthChecks).filter(Boolean).length;

    if (passedChecks <= 2) return 'weak';
    if (passedChecks <= 3) return 'fair';
    if (passedChecks <= 4) return 'good';
    return 'strong';
  }

  getPasswordStrengthClass(): string {
    return this.getPasswordStrength();
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    const texts = {
      'empty': '',
      'weak': 'Faible',
      'fair': 'Moyen',
      'good': 'Bon',
      'strong': 'Fort'
    };
    return texts[strength as keyof typeof texts] || '';
  }

  // Getters pour les règles du mot de passe
  hasMinLength(): boolean {
    const password = this.sellerForm.get('password')?.value;
    return password && password.length >= 6;
  }

  hasUppercase(): boolean {
    const password = this.sellerForm.get('password')?.value;
    return password && /[A-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.sellerForm.get('password')?.value;
    return password && /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.sellerForm.get('password')?.value;
    return password && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  // Soumission du formulaire
// Dans create-account-seller.component.ts - onSubmit()
onSubmit(): void {
  this.showDocumentErrors = true;
  
  if (!this.isCurrentStepValid()) {
    if (!this.idCardRectoFile) {
      this.errorMessage = 'Le recto du document est requis';
    } else if (!this.idCardVersoFile) {
      this.errorMessage = 'Le verso du document est requis';
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
    }
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  // Créer FormData pour envoyer les fichiers
  const formData = new FormData();

  // Récupérer les valeurs du formulaire
  const formValue = this.sellerForm.value;
  
  // Étape 1 - Informations personnelles (AVEC LES NOMS BACKEND)
  formData.append('firstNameInput', formValue.firstName);
  formData.append('lastNameInput', formValue.lastName);
  formData.append('emailInput', formValue.email);
  formData.append('passwordInput', formValue.password);
  formData.append('phoneInput', formValue.phone);
  formData.append('storeNameInput', formValue.storeName);
  formData.append('countryInput', formValue.country);
  
  // Étape 2 - Expérience professionnelle
  if (formValue.budget) {
    formData.append('budgetInput', formValue.budget);
  }
  
  formData.append('commerceExperienceInput', formValue.commerceExperience ? 'true' : 'false');
  formData.append('adsExperienceInput', formValue.adsExperience ? 'true' : 'false');
  
  // Étape 3 - Documents (À AJOUTER DANS SellerDTO si nécessaire)
  formData.append('documentType', formValue.documentType);
  formData.append('documentNumber', formValue.documentNumber);
  formData.append('termsAccepted', formValue.termsAccepted ? 'true' : 'false');

  // Ajouter les fichiers
  if (this.idCardRectoFile) {
    formData.append('idCardRecto', this.idCardRectoFile);
  }
  if (this.idCardVersoFile) {
    formData.append('idCardVerso', this.idCardVersoFile);
  }

  // Debug - Afficher les données envoyées
  console.log('Données envoyées:');
  formData.forEach((value, key) => {
    console.log(key, value);
  });

  // Signature électronique
  if (this.signatureBase64) {
    formData.append('signatureBase64Input', this.signatureBase64);
  }

  // Appeler le service
  this.sellerService.createSeller(formData).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.successMessage = 'Compte créé avec succès! Redirection en cours...';
      
      this.router.navigate(['/auth/verification-pending']);
    },
    error: (error: HttpErrorResponse) => {
      this.isLoading = false;
      console.error('Erreur complète:', error);
      
      if (error.status === 400) {
        // Afficher les erreurs de validation détaillées
        if (error.error && error.error.errors) {
          const validationErrors = Object.entries(error.error.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n');
          this.errorMessage = 'Erreurs de validation:\n' + validationErrors;
        } else {
          this.errorMessage = 'Erreur de validation: ' + (error.error?.message || 'Données invalides');
        }
      } else if (error.status === 409) {
        this.errorMessage = 'Cette adresse email est déjà utilisée';
      } else {
        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
      }
    }
  });
}

  // ══ CANVAS SIGNATURE METHODS ══════════════════════════

  onContractScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 30;
    if (atBottom) this.contractRead = true;
  }

  private getCanvasPos(event: MouseEvent | Touch): { x: number; y: number } {
    const canvas = this.signatureCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = (event as any).clientX ?? (event as Touch).clientX;
    const clientY = (event as any).clientY ?? (event as Touch).clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  startDrawing(event: MouseEvent): void {
    if (!this.contractRead) return;
    this.isDrawing = true;
    this.signatureStarted = true;
    const pos = this.getCanvasPos(event);
    this.lastX = pos.x;
    this.lastY = pos.y;
    event.preventDefault();
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing) return;
    const canvas = this.signatureCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const pos = this.getCanvasPos(event);
    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    this.lastX = pos.x;
    this.lastY = pos.y;
    this.signatureBase64 = canvas.toDataURL('image/png');
    event.preventDefault();
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  startDrawingTouch(event: TouchEvent): void {
    if (!this.contractRead) return;
    const touch = event.touches[0];
    this.isDrawing = true;
    this.signatureStarted = true;
    const pos = this.getCanvasPos(touch);
    this.lastX = pos.x;
    this.lastY = pos.y;
    event.preventDefault();
  }

  drawTouch(event: TouchEvent): void {
    if (!this.isDrawing) return;
    const touch = event.touches[0];
    const canvas = this.signatureCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const pos = this.getCanvasPos(touch);
    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    this.lastX = pos.x;
    this.lastY = pos.y;
    this.signatureBase64 = canvas.toDataURL('image/png');
    event.preventDefault();
  }

  clearSignature(): void {
    const canvas = this.signatureCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.signatureStarted = false;
    this.signatureBase64 = '';
  }

  getProgressPercent(): number {
    return Math.round((this.currentStep / 4) * 100);
  }

  // Helper pour afficher les erreurs de validation
  getErrorMessage(controlName: string): string {
    const control = this.sellerForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    
    if (control.hasError('email')) {
      return 'Format d\'email invalide';
    }
    
    if (control.hasError('minlength')) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} caractères`;
    }
    
    if (control.hasError('maxlength')) {
      const requiredLength = control.errors['maxlength'].requiredLength;
      return `Maximum ${requiredLength} caractères`;
    }
    
    if (control.hasError('pattern')) {
      return 'Format invalide';
    }
    
    return 'Valeur invalide';
  }
}