import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Country, COUNTRY_FLAGS, CreateSourcingRequest, FulfillmentMode } from '../../models/sourcing-data';
import { SourcingRequestService } from '../../services/sourcing-request.service';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'app-create-sourcing',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DropdownModule],
    templateUrl: './create-sourcing.component.html',
    styleUrls: ['./create-sourcing.component.scss']
})
export class CreateSourcingComponent implements OnInit {
    countries: { name: Country; code: string }[] = [];

    createForm!: FormGroup;

    fulfillmentModes = Object.values(FulfillmentMode);
    //   countries = Object.values(Country);

    constructor(
        private fb: FormBuilder,
        public router: Router,
        private sourcingService: SourcingRequestService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.countries = Object.values(Country).map((c) => ({
            name: c,
            code: COUNTRY_FLAGS[c as Country]
        }));

        this.createForm = this.fb.group({
            nameProduct: ['', Validators.required],
            description: ['', Validators.required],
            linkProduct: ['', Validators.required, Validators.pattern('https?://.+')],
            variants: ['', Validators.required],
            estimatedQuantity: [null],
            fulfillmentMode: [null, Validators.required],
            country: [{ value: null, disabled: true }]
        });

        this.createForm.get('fulfillmentMode')?.valueChanges.subscribe((mode) => {
            const countryControl = this.createForm.get('country');

            if (mode === FulfillmentMode.LOCAL_SINGLE_COUNTRY) {
                countryControl?.enable();
                countryControl?.setValue(null);
                countryControl?.setValidators([Validators.required]);
            }

            if (mode === FulfillmentMode.CENTRALIZED) {
                countryControl?.setValue(Country.UAE);
                countryControl?.clearValidators();
                countryControl?.disable();
            }

            countryControl?.updateValueAndValidity();
        });
    }

    selectMode(mode: string) {
        this.createForm.get('fulfillmentMode')?.setValue(mode);
        this.createForm.get('fulfillmentMode')?.markAsTouched();
    }

    // ================= PHOTOS DU PRODUIT (optionnel) =================

    selectedImages: File[] = [];
    imagePreviews: string[] = [];

    readonly maxImages = 6;
    readonly maxImageSizeMb = 5;

    onImagesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const files = Array.from(input.files);

        for (const file of files) {
            if (this.selectedImages.length >= this.maxImages) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Limite atteinte',
                    detail: `Vous pouvez ajouter au maximum ${this.maxImages} photos.`
                });
                break;
            }

            if (!file.type.startsWith('image/')) {
                this.messageService.add({ severity: 'warn', summary: 'Fichier ignoré', detail: `${file.name} n'est pas une image.` });
                continue;
            }

            if (file.size > this.maxImageSizeMb * 1024 * 1024) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Fichier trop volumineux',
                    detail: `${file.name} dépasse ${this.maxImageSizeMb} Mo.`
                });
                continue;
            }

            this.selectedImages.push(file);

            const reader = new FileReader();
            reader.onload = () => this.imagePreviews.push(reader.result as string);
            reader.readAsDataURL(file);
        }

        // Permet de resélectionner le même fichier après suppression
        input.value = '';
    }

    removeImage(index: number) {
        this.selectedImages.splice(index, 1);
        this.imagePreviews.splice(index, 1);
    }

    submit() {
        if (this.createForm.invalid) return;

        const payload = this.createForm.getRawValue();

        if (payload.country) {
            payload.country = payload.country.name;
        }

        this.sourcingService.create(payload, this.selectedImages).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Demande de sourcing créée avec succès !' });
                this.router.navigate(['/seller/sourcing']);
            },
            error: (err) => {
                console.error('CREATE ERROR', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la création de la demande de sourcing.' });
            }
        });
    }
}
