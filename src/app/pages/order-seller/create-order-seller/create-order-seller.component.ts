import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { OrderService } from '../order-service';
import { CreateOrderDto } from '../order-models';
import { ProductDTO, ProductService } from '@/pages/product-seller/product.service';
import { MessageService } from 'primeng/api';
import { formatCountryCurrency } from '@/shared/currency.utils';

@Component({
  selector: 'app-create-order-seller',
  imports: [FormsModule, CommonModule],
  templateUrl: './create-order-seller.component.html',
  styleUrl: './create-order-seller.component.scss'
})

export class CreateOrderComponent {

  productId!: string;
  productName!: string;
  isSubmitting: boolean = false;

  orderForm: CreateOrderDto = {
    productId: '',
    customerName: '',
    customerPhone: '',
    country: '', // injecté automatiquement
    city: '',
    fullAddress: '',
    note: '',
    quantity: 1,
    unitPrice: 0,          // ignoré côté backend
    paymentMode: 'CASH_ON_DELIVERY'
  };


  countries = ["KSA", "UAE", "KW", "QA", "OM", "BH", "IQ"]

  paymentModes: { value: 'CASH_ON_DELIVERY' | 'PREPAID'; label: string; description: string; icon: string }[] = [
    {
      value: 'CASH_ON_DELIVERY',
      label: 'Paiement à la livraison',
      description: 'Le client paie en espèces à la réception de sa commande.',
      icon: 'pi-money-bill'
    },
    {
      value: 'PREPAID',
      label: 'Paiement en ligne par carte',
      description: 'Le client règle sa commande immédiatement par carte bancaire.',
      icon: 'pi-credit-card'
    }
  ];

  products: ProductDTO[] = [];

  unitPrice: number = 0;
totalPrice: number = 0;
isManualPrice: boolean = false;
maxStock: number = 0;

  constructor(private route: ActivatedRoute, public router: Router, private orderService: OrderService, private productService: ProductService, private messageService: MessageService) { }

  ngOnInit(): void {

    // Toujours charger les produits
    this.loadSellerProducts();

    this.route.queryParams.subscribe(params => {
      this.productId = params['productId'];
      this.productName = params['productName'];

      if (this.productId) {
        this.orderForm.productId = this.productId;
        this.orderForm.country = params['country'];
      }
    });
  }


loadSellerProducts() {
  this.productService.getMyProductsAll().subscribe({
    next: data => {
      // ne garder que les produits avec le statut 'ACTIVE'
      this.products = data.filter((p: { status: string; }) => p.status === 'ACTIVE');
    },
    error: err =>{
      console.error('Erreur chargement produits du vendeur', err);
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des produits.' });
    }
  });
}

  onQuantityChange() {
  if (this.orderForm.quantity > this.maxStock) {
    this.orderForm.quantity = this.maxStock;

    this.messageService.add({
      severity: 'warn',
      summary: 'Stock insuffisant',
      detail: `Quantité max disponible: ${this.maxStock}`
    });
  }

  this.calculateTotal();
}

  onProductChange() {
    const selected = this.products.find(p => p.id === this.orderForm.productId);

    if (selected) {
      this.productName = selected.nameProduct;
      this.orderForm.country = selected.country;

    this.unitPrice = selected.price;
       this.maxStock = selected.qteStock;
    this.calculateTotal();
    }
  }

  calculateTotal() {
  if (!this.isManualPrice) {
    this.totalPrice = this.orderForm.quantity * this.unitPrice;
  }
}

  selectPaymentMode(mode: 'CASH_ON_DELIVERY' | 'PREPAID') {
    this.orderForm.paymentMode = mode;
  }

  // Le prix est saisi/stocké en USD ; on affiche en plus l'équivalent
  // dans la devise locale du pays de livraison (ex: AED pour les Émirats).
  getUnitPriceLocal(): string {
    return formatCountryCurrency(this.unitPrice, this.orderForm.country);
  }

  getTotalPriceLocal(): string {
    return formatCountryCurrency(this.totalPrice, this.orderForm.country);
  }



submit() {


if (this.orderForm.quantity > this.maxStock) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Quantité dépasse le stock disponible'
    });
    return;
  }

    this.isSubmitting = true;

  const payload = {
    ...this.orderForm,
    unitPrice: this.unitPrice,
    totalPrice: this.totalPrice
  };

  this.orderService.createOrder(payload).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Commande créée avec succès !'
      });
      this.router.navigate(['/seller/orders']);
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de la création de la commande.'
      });
    }
  });
}

  //
  goBack() {
    this.router.navigate(['/seller/products']);
  }

}

