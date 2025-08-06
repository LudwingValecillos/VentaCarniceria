import { Product } from '../types';

// Define el tipo de estado
export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Define los tipos de acciones
export type ProductAction =
  | { type: 'FETCH_PRODUCTS_START' }
  | { type: 'FETCH_PRODUCTS_SUCCESS'; payload: Product[] }
  | { type: 'FETCH_PRODUCTS_FAILURE'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT_OPTIMISTIC'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'TOGGLE_PRODUCT_STATUS_START'; payload: string }
  | { type: 'TOGGLE_PRODUCT_STATUS_SUCCESS'; payload: Product[] }
  | { type: 'TOGGLE_PRODUCT_STATUS_FAILURE'; payload: string }
  | { type: 'UPDATE_PRODUCT_PRICE_START'; payload: { id: string; price: number } }
  | { type: 'UPDATE_PRODUCT_PRICE_SUCCESS'; payload: Product[] }
  | { type: 'UPDATE_PRODUCT_PRICE_FAILURE'; payload: string }
  | { type: 'TOGGLE_PRODUCT_OFFER_START'; payload: string }
  | { type: 'TOGGLE_PRODUCT_OFFER_SUCCESS'; payload: Product[] }
  | { type: 'TOGGLE_PRODUCT_OFFER_FAILURE'; payload: string }
  | { type: 'UPDATE_PRODUCT_NAME_START'; payload: { id: string; name: string } }
  | { type: 'UPDATE_PRODUCT_NAME_SUCCESS'; payload: Product[] }
  | { type: 'UPDATE_PRODUCT_NAME_FAILURE'; payload: string }
  | { type: 'DELETE_PRODUCT_START'; payload: string }
  | { type: 'DELETE_PRODUCT_SUCCESS'; payload: Product[] }
  | { type: 'DELETE_PRODUCT_FAILURE'; payload: string }
  | { type: 'UPDATE_PRODUCT_IMAGE_START'; payload: { id: string; imageFile: File } }
  | { type: 'UPDATE_PRODUCT_IMAGE_SUCCESS'; payload: Product[] }
  | { type: 'UPDATE_PRODUCT_IMAGE_FAILURE'; payload: string }
  | { type: 'UPDATE_PRODUCT_STOCK_START'; payload: { id: string; stock: number } }
  | { type: 'UPDATE_PRODUCT_STOCK_SUCCESS'; payload: Product[] }
  | { type: 'UPDATE_PRODUCT_STOCK_FAILURE'; payload: string };

// Define el tipo del contexto
export interface ProductContextType {
  state: ProductState;
  // Acciones básicas
  fetchProductsAction: () => Promise<void>;
  addProductAction: (product: Omit<Product, 'id' | 'active' | 'offer' | 'image'> & { image: File; offer?: boolean }) => Promise<void>;
  deleteProductAction: (productId: string) => Promise<void>;
  // Acciones de actualización
  toggleProductStatusAction: (productId: string) => Promise<void>;
  updateProductPriceAction: (productId: string, newPrice: number) => Promise<void>;
  updateProductNameAction: (productId: string, newName: string) => Promise<void>;
  updateProductImageAction: (productId: string, newImageFile: File) => Promise<void>;
  updateProductStockAction: (productId: string, newStock: number) => Promise<void>;
  toggleProductOfferAction: (productId: string) => Promise<void>;
  // Utilidades
  safeToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Estado inicial
export const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  initialized: false,
};