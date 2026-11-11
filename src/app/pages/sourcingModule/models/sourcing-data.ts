
export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum FulfillmentMode {
  CENTRALIZED = 'CENTRALIZED',
  LOCAL_SINGLE_COUNTRY = 'LOCAL_SINGLE_COUNTRY'
}

export enum Country {
  KSA = 'KSA',
  UAE = 'UAE',
  KW = 'KW',
  QA = 'QA',
  OM = 'OM',
  BH = 'BH',
  IQ = 'IQ'
}

export const COUNTRY_FLAGS: Record<Country, string> = {
  KSA: 'sa', // Arabie Saoudite
  UAE: 'ae',
  KW: 'kw',
  QA: 'qa',
  OM: 'om',
  BH: 'bh',
  IQ: 'iq'
};

export interface CreateSourcingRequest {
  nameProduct: string;
  description: string;
  linkProduct?: string;
  variants: string;
  estimatedQuantity?: number;
  fulfillmentMode: FulfillmentMode;
  country?: Country;
}

export interface SourcingRequest {
  id: string;
  nameProduct: string;
  description: string;
  linkProduct?: string;
  variants: string;
  estimatedQuantity?: number;

  fulfillmentMode: FulfillmentMode;
  country?: Country;

  status: RequestStatus;
  totalPrice?: number;

  isArchive: boolean;
  createdAt?: string;

  // Photos du produit (chemins relatifs, servies via /uploads/**)
  images?: string[];
}