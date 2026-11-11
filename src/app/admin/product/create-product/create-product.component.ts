import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SourcingRequestService } from '@/pages/sourcingModule/services/sourcing-request.service';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
   imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule
  ],
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {

  createForm!: FormGroup;
  requestId!: string;
  requestFulfillmentMode: string = '';
  requestCountry: string = '';
  requestImages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sourcingRequestService: SourcingRequestService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('requestId')!;

    if (!this.requestId) {
      this.router.navigate(['/sourcing']);
      return;
    }

    this.initForm();
    this.loadRequestInfo(this.requestId);
  }

  // ================= INIT FORM =================
  private initForm(): void {
    this.createForm = this.fb.group({
      requestId: [{ value: '', disabled: true }],
      nameProduct: [{ value: '', disabled: true }],
      description: [{ value: '', disabled: true }],
      linkProduct: [{ value: '', disabled: true }],

      price: [null, [Validators.required, Validators.min(0)]],
      weightKg: [null, [Validators.required, Validators.min(0)]],
      stockQuantity: [null, [Validators.required, Validators.min(1)]],
    });
  }

  // ================= LOAD REQUEST =================
  private loadRequestInfo(requestId: string): void {
    this.sourcingRequestService.getById(requestId).subscribe({
      next: (request) => {
        this.createForm.patchValue({
          requestId: request.id,
          nameProduct: request.nameProduct,
          description: request.description,
          linkProduct: request.linkProduct
        });
        this.requestFulfillmentMode = request.fulfillmentMode || '';
        this.requestCountry = request.country || '';
        this.requestImages = (request as any).images || [];
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec du chargement des informations de la demande de sourcing." });
        this.router.navigate(['/sourcing']);
      }
    });
  }

  // ================= DISPLAY HELPERS =================
  getFulfillmentModeLabel(): string {
    if (this.requestFulfillmentMode === 'CENTRALIZED') return 'Centralisé';
    if (this.requestFulfillmentMode === 'LOCAL_SINGLE_COUNTRY') return 'Local';
    return this.requestFulfillmentMode || '-';
  }

  getCountryFlagCode(): string {
    const flagMap: Record<string, string> = {
      KSA: 'sa',
      UAE: 'ae',
      KW: 'kw',
      QA: 'qa',
      OM: 'om',
      BH: 'bh',
      IQ: 'iq'
    };
    return flagMap[this.requestCountry] || '';
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl}/uploads/${path}`;
  }

  // ================= SUBMIT =================
  submit(): void {
    if (this.createForm.invalid) return;

    const payload = {
      requestId: this.createForm.getRawValue().requestId,
      price: this.createForm.value.price,
      weightKg: this.createForm.value.weightKg,
      stockQuantity: this.createForm.value.stockQuantity
    };

      this.sourcingRequestService.createProduct(payload).subscribe({
      next: product => {
        console.log('PRODUCT CREATED', product);
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Produit créé avec succès !' });
          this.router.navigate(['/admin/list-request']);
      },
      error: err => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de la création du produit." })
    });
  }

  annuler(): void {
    this.router.navigate(['/admin/list-request']);
  }
}
