import { Product } from '../types';
import {
  fetchProductsFromFirebase,
  addProductToFirebase,
  updateProductInFirebase,
  updateProductImageInFirebase,
  deleteProductFromFirebase,
  toggleProductStatusInFirebase,
  toggleProductOfferInFirebase,
  updateProductPriceInFirebase,
  updateProductNameInFirebase,
  updateProductStockInFirebase,
  uploadImageToImgBB,
  createSale,
  getSalesHistory,
  getSaleWithItems,
  updateSaleStatus
} from '../services/firebaseAdminService';

// Simple in-memory cache with TTL to avoid duplicate fetches
let productsCache: { data: Product[]; expiresAt: number } | null = null;
let productsInFlight: Promise<Product[]> | null = null;
const PRODUCTS_TTL_MS = 60_000; // 1 min TTL

export const fetchProducts = async (): Promise<Product[]> => {
  const now = Date.now();
  if (productsCache && productsCache.expiresAt > now) {
    return productsCache.data;
  }
  if (productsInFlight) {
    return productsInFlight;
  }

  productsInFlight = (async () => {
    try {
      const data = await fetchProductsFromFirebase();
      productsCache = { data, expiresAt: Date.now() + PRODUCTS_TTL_MS };
      return data;
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      return [] as Product[];
    } finally {
      productsInFlight = null;
    }
  })();

  return productsInFlight;
};

// ----------------------------
// Firebase Admin Operations
// ----------------------------

export const updateProductPrice = async (productId: string, newPrice: number) => {
  try {
    await updateProductPriceInFirebase(productId, newPrice);
    // Return updated products list
    return await fetchProductsFromFirebase();
  } catch (error) {
    console.error('Error updating product price:', error);
    throw error;
  }
};

export const toggleProductStatus = async (productId: string) => {
  try {
    await toggleProductStatusInFirebase(productId);
    // Return updated products list
    return await fetchProductsFromFirebase();
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
};

export const toggleProductOffer = async (productId: string) => {
  try {
    await toggleProductOfferInFirebase(productId);
    // Return updated products list
    return await fetchProductsFromFirebase();
  } catch (error) {
    console.error('Error toggling product offer status:', error);
    throw error;
  }
};

export const updateProductName = async (productId: string, newName: string) => {
  try {
    await updateProductNameInFirebase(productId, newName);
    // Return updated products list
    return await fetchProductsFromFirebase();
  } catch (error) {
    console.error('Error updating product name:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product[]> => {
  try {
    await updateProductInFirebase(productId, updates);
    // Return updated products list
    return await fetchProductsFromFirebase();
  } catch (error) {
    console.error('Error updating product:', error);
    return [];
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    await deleteProductFromFirebase(productId);
    // Return updated products list
    return await fetchProductsFromFirebase();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// ----------------------------
// Image upload functions (using ImgBB)
// ----------------------------
export const uploadImageToImageKit = async (file: File): Promise<string> => {
  try {
    // Use ImgBB for image upload - call the working function from firebaseAdminService
    return await uploadImageToImgBB(file);
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error);
    return '';
  }
};

export const addNewProduct = async (
  product: Omit<Product, 'id' | 'active' | 'offer' | 'image'> & { image: File; offer?: boolean }
): Promise<Product | null> => {
  try {
    // Use Firebase service to add product
    const newProduct = await addProductToFirebase({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      offer: product.offer || false
    });

    return newProduct;
  } catch (error) {
    console.error('Error adding new product:', error);
    return null;
  }
};

export const updateProductImage = async (productId: string, newImageFile: File): Promise<Product[]> => {
  try {
    // Use Firebase service to update product image
    await updateProductImageInFirebase(productId, newImageFile);
    // Return updated products list
    return await fetchProductsFromFirebase();
  } catch (error) {
    console.error('Error updating product image:', error);
    return [];
  }
};

export const updateProductStock = async (productId: string, newStock: number) => {
  try {
    await updateProductStockInFirebase(productId, newStock);
    // Return updated products list
    return await fetchProductsFromFirebase();
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

// Sales API functions
export const createSaleAPI = async (saleData: {
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    category: string;
  }>;
  notes?: string;
  status?: 'completed' | 'pending' | 'cancelled';
}) => {
  try {
    const sale = await createSale(saleData);
    return sale;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

export const fetchSalesHistory = async (
  limit: number = 50,
  startDate?: Date,
  endDate?: Date,
  status?: string
) => {
  try {
    return await getSalesHistory(limit, startDate, endDate, status);
  } catch (error) {
    console.error('Error fetching sales history:', error);
    return [];
  }
};

export const fetchSaleDetails = async (saleId: string) => {
  try {
    return await getSaleWithItems(saleId);
  } catch (error) {
    console.error('Error fetching sale details:', error);
    throw error;
  }
};

export const updateSaleStatusAPI = async (
  saleId: string, 
  newStatus: 'completed' | 'pending' | 'cancelled',
  currentStatus: 'completed' | 'pending' | 'cancelled'
) => {
  try {
    const result = await updateSaleStatus(saleId, newStatus, currentStatus);
    
    // Return information about whether stock needs updating
    return {
      needsStockUpdate: result.needsStockUpdate,
      saleItems: result.saleItems,
      shouldDeductStock: (currentStatus === 'pending' || currentStatus === 'cancelled') && newStatus === 'completed',
      shouldRestoreStock: currentStatus === 'completed' && (newStatus === 'pending' || newStatus === 'cancelled')
    };
  } catch (error) {
    console.error('Error updating sale status:', error);
    throw error;
  }
};

export default fetchProducts;