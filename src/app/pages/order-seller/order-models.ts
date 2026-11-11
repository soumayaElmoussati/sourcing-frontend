export interface CreateOrderDto {
  productId: string;

  customerName: string;
  customerPhone: string;

  country: string;
  city: string;
  fullAddress: string;
  note?: string;

  quantity: number;
  unitPrice: number;

  paymentMode: 'CASH_ON_DELIVERY' | 'PREPAID';
}

export interface UpdateOrderDto {
  customerName: string;
  customerPhone: string;
  city: string;
  fullAddress: string;
  note?: string;
}

export interface OrderResponseDto {
  id: string;

  sellerId: string;
  productId: string;

  customerName: string;
  customerPhone: string;

  country: string;
  city: string;
  fullAddress: string;
  note: string;

  quantity: number;
  unitPrice: number;
  totalPrice: number;

  paymentMode: string;
  status: string;

  fulfillmentMode: string;
  shippingType: string;
  vatAmount: number;

  createdAt: string;

  // Intégrations externes
  source?: OrderSource;
  externalOrderId?: string;
}

export type OrderSource =
  | 'INTERNAL'
  | 'GOOGLE_SHEETS'
  | 'LIGHTFUNNELS'
  | 'DROPIFY'
  | 'WORDPRESS'
  | 'SHOPIFY'
  | 'XPAGE'
  | 'EASY_ORDERS';
