export interface Product {
  id: string;
  name: string;
  price: number | string;  // This is the source of the problem!
  category: string;
  image: string;
  description?: string;
  active: boolean;
  offer?: boolean;  // Added optional offer property
  stock?: number;  // Added stock property
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  location: string;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'mercadopago';
}

// WhatsApp number interface
export interface WhatsAppNumber {
  id: string;
  name: string;
  role: string;
  number: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sales system types
export interface Sale {
  id: string;
  date: Date;
  totalAmount: number;
  totalItems: number;
  totalQuantity: number;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  category: string;
  createdAt: Date;
}

export interface SaleWithItems extends Sale {
  items: SaleItem[];
}