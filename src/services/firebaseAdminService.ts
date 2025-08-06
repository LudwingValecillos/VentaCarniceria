import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  setDoc,
  serverTimestamp,
  FieldValue,
  query,
  where,
  orderBy,
  limit as limitQuery,
  QueryConstraint
} from 'firebase/firestore';
// Solo usamos Firebase para datos, ImgBB para imágenes
import { app } from '../config/firebase';
import { Product, Sale, SaleItem, SaleWithItems } from '../types';

// Initialize Firebase services
const db = getFirestore(app);

/**
 * Helper function to get the current butchery ID based on URL
 */
const getCurrentButcheryId = async (): Promise<string> => {
  try {
    // Get the search URL (same logic as in other files)
    let searchUrl = window.location.origin;
    if (searchUrl.includes('localhost') || searchUrl.includes('127.0.0.1')) {
      searchUrl = 'https://voluble-squirrel-a30bd3.netlify.app';
    }

    // Search for butchery by URL
    const butcheriesRef = collection(db, 'butcheries');
    const butcheriesSnapshot = await getDocs(butcheriesRef);
    
    let butcheryId: string | null = null;
    butcheriesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.url === searchUrl) {
        butcheryId = doc.id;
      }
    });

    // If not found, use 'demo' as fallback
    return butcheryId || 'demo';
  } catch (error) {
    console.error('Error getting current butchery ID:', error);
    return 'demo';
  }
};

// ----------------------------
// Helper: Convertir File a Base64
// ----------------------------
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Upload image to ImgBB (usando el método exacto que funciona)
 */
export const uploadImageToImgBB = async (file: File): Promise<string> => {
  try {
    // Convertir el archivo a cadena base64
    const base64Image = await convertFileToBase64(file);
    // Remover el prefijo "data:image/*;base64," si existe
    const base64Data = base64Image.split(',')[1];
    
    const formData = new FormData();
    formData.append("image", base64Data);
    formData.append("key", "9a2d7bbb99f1b945a192fcbbcf11c4af");

    // Usar dynamic import para evitar problemas de bundling
    const axios = (await import('axios')).default;
    
    const response = await axios.post("https://api.imgbb.com/1/upload", formData);
    
    return response.data.data.url || '';
  } catch (error) {
    console.error('Error uploading image to ImgBB:', JSON.stringify(error, null, 2));
    return '';
  }
};

/**
 * Delete image (ImgBB no permite eliminar con cuenta gratuita)
 */
export const deleteImageFromImgBB = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) {
      return;
    }
    
    // ImgBB no permite eliminar imágenes con cuenta gratuita
    // Solo registramos que se "eliminaría"
    console.log('📝 ImgBB image would be deleted (free account limitation):', imageUrl);
  } catch (error) {
    console.error('❌ Error in image cleanup:', error);
    // Don't throw error, just log it
  }
};

/**
 * Fetch all products for the current butchery
 */
export const fetchProductsFromFirebase = async (): Promise<Product[]> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const productsRef = collection(db, 'butcheries', butcheryId, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name || 'Producto sin nombre',
        price: typeof data.price === 'string' 
          ? parseFloat(data.price.replace(/\./g, '')) 
          : data.price || 0,
        category: data.category || 'general',
        image: data.image || '',
        active: data.active ?? true,
        offer: data.isOffer ?? data.offer ?? false,
        description: data.description || '',
        stock: data.stock ?? 0
      });
    });
    
    console.log(`✅ Fetched ${products.length} products from Firebase`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching products from Firebase:', error);
    throw new Error('Error al cargar productos de la base de datos');
  }
};

/**
 * Add a new product to Firebase
 */
export const addProductToFirebase = async (productData: {
  name: string;
  price: number | string;
  category: string;
  image: File;
  offer?: boolean;
  stock?: number;
}): Promise<Product> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    
    // First upload the image to ImgBB
    const imageUrl = await uploadImageToImgBB(productData.image);
    
    // Prepare product data
    const newProductData = {
      name: productData.name,
      price: typeof productData.price === 'string' 
        ? parseFloat(productData.price.replace(/\./g, '')) 
        : productData.price,
      category: productData.category,
      image: imageUrl,
      active: true,
      offer: productData.offer || false,
      isOffer: productData.offer || false, // Keep both for compatibility
      stock: productData.stock ?? 10, // Default stock of 10
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add to Firestore
    const productsRef = collection(db, 'butcheries', butcheryId, 'products');
    const docRef = await addDoc(productsRef, newProductData);
    
    const newProduct: Product = {
      id: docRef.id,
      name: newProductData.name,
      price: newProductData.price,
      category: newProductData.category,
      image: newProductData.image,
      active: newProductData.active,
      offer: newProductData.offer,
      stock: newProductData.stock
    };
    
    console.log('✅ Product added to Firebase:', newProduct.name);
    return newProduct;
  } catch (error) {
    console.error('❌ Error adding product to Firebase:', error);
    throw new Error('Error al agregar producto a la base de datos');
  }
};

/**
 * Update a product in Firebase
 */
export const updateProductInFirebase = async (
  productId: string, 
  updates: Partial<Product>
): Promise<void> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const productRef = doc(db, 'butcheries', butcheryId, 'products', productId);
    
    // Prepare update data
    const updateData: Record<string, FieldValue | Partial<unknown> | undefined> = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Handle offer field compatibility
    if ('offer' in updates) {
      updateData.isOffer = updates.offer;
    }
    
    await updateDoc(productRef, updateData);
    console.log('✅ Product updated in Firebase:', productId);
  } catch (error) {
    console.error('❌ Error updating product in Firebase:', error);
    throw new Error('Error al actualizar producto en la base de datos');
  }
};

/**
 * Update product image in Firebase
 */
export const updateProductImageInFirebase = async (
  productId: string, 
  newImageFile: File
): Promise<void> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const productRef = doc(db, 'butcheries', butcheryId, 'products', productId);
    
    // Get current product data for cleanup log
    const productDoc = await getDoc(productRef);
    let oldImageUrl = '';
    if (productDoc.exists()) {
      const currentData = productDoc.data();
      oldImageUrl = currentData.image || '';
    }
    
    // Upload new image to ImgBB
    const newImageUrl = await uploadImageToImgBB(newImageFile);
    
    // Update product with new image URL
    await updateDoc(productRef, {
      image: newImageUrl,
      updatedAt: serverTimestamp()
    });
    
    // Log cleanup of old image
    if (oldImageUrl) {
      await deleteImageFromImgBB(oldImageUrl);
    }
    
    console.log('✅ Product image updated in Firebase:', productId);
  } catch (error) {
    console.error('❌ Error updating product image in Firebase:', error);
    throw new Error('Error al actualizar imagen del producto');
  }
};

/**
 * Delete a product from Firebase
 */
export const deleteProductFromFirebase = async (productId: string): Promise<void> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const productRef = doc(db, 'butcheries', butcheryId, 'products', productId);
    
    // Get product data to log associated image cleanup
    const productDoc = await getDoc(productRef);
    if (productDoc.exists()) {
      const productData = productDoc.data();
      if (productData.image) {
        await deleteImageFromImgBB(productData.image);
      }
    }
    
    // Delete product document
    await deleteDoc(productRef);
    console.log('✅ Product deleted from Firebase:', productId);
  } catch (error) {
    console.error('❌ Error deleting product from Firebase:', error);
    throw new Error('Error al eliminar producto de la base de datos');
  }
};

/**
 * Toggle product status (active/inactive)
 */
export const toggleProductStatusInFirebase = async (productId: string): Promise<void> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const productRef = doc(db, 'butcheries', butcheryId, 'products', productId);
    
    // Get current status
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      throw new Error('Producto no encontrado');
    }
    
    const currentData = productDoc.data();
    const newStatus = !currentData.active;
    
    await updateDoc(productRef, {
      active: newStatus,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Product status toggled in Firebase:', productId, 'Active:', newStatus);
  } catch (error) {
    console.error('❌ Error toggling product status in Firebase:', error);
    throw new Error('Error al cambiar estado del producto');
  }
};

/**
 * Toggle product offer status
 */
export const toggleProductOfferInFirebase = async (productId: string): Promise<void> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const productRef = doc(db, 'butcheries', butcheryId, 'products', productId);
    
    // Get current offer status
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      throw new Error('Producto no encontrado');
    }
    
    const currentData = productDoc.data();
    const newOfferStatus = !(currentData.offer || currentData.isOffer);
    
    await updateDoc(productRef, {
      offer: newOfferStatus,
      isOffer: newOfferStatus, // Keep both for compatibility
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Product offer status toggled in Firebase:', productId, 'Offer:', newOfferStatus);
  } catch (error) {
    console.error('❌ Error toggling product offer in Firebase:', error);
    throw new Error('Error al cambiar estado de oferta del producto');
  }
};

/**
 * Update product price
 */
export const updateProductPriceInFirebase = async (
  productId: string, 
  newPrice: number
): Promise<void> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const productRef = doc(db, 'butcheries', butcheryId, 'products', productId);
    
    await updateDoc(productRef, {
      price: newPrice,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Product price updated in Firebase:', productId, 'New price:', newPrice);
  } catch (error) {
    console.error('❌ Error updating product price in Firebase:', error);
    throw new Error('Error al actualizar precio del producto');
  }
};

/**
 * Update product name
 */
export const updateProductNameInFirebase = async (
  productId: string, 
  newName: string
): Promise<void> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const productRef = doc(db, 'butcheries', butcheryId, 'products', productId);
    
    await updateDoc(productRef, {
      name: newName,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Product name updated in Firebase:', productId, 'New name:', newName);
  } catch (error) {
    console.error('❌ Error updating product name in Firebase:', error);
    throw new Error('Error al actualizar nombre del producto');
  }
};

/**
 * Update product stock
 */
export const updateProductStockInFirebase = async (
  productId: string, 
  newStock: number
): Promise<void> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const productRef = doc(db, 'butcheries', butcheryId, 'products', productId);
    
    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Product stock updated in Firebase:', productId, 'New stock:', newStock);
  } catch (error) {
    console.error('❌ Error updating product stock in Firebase:', error);
    throw new Error('Error al actualizar stock del producto');
  }
};

/**
 * Create a new sale with items
 */
export const createSale = async (saleData: {
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    category: string;
  }>;
  notes?: string;
  status?: 'completed' | 'pending' | 'cancelled';
}): Promise<Sale> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    
    // Calculate totals
    const totalAmount = saleData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalQuantity = saleData.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalItems = saleData.items.length;
    
    // Generate sale ID
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
    const saleId = `sale_${dateStr}_${timeStr}`;
    
    // Create sale document
    const saleDoc = {
      date: serverTimestamp(),
      totalAmount,
      totalItems,
      totalQuantity,
      status: saleData.status || 'completed' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      notes: saleData.notes || null
    };
    
    const salesRef = collection(db, 'butcheries', butcheryId, 'sales');
    const saleDocRef = doc(salesRef, saleId);
    await setDoc(saleDocRef, saleDoc);
    
    // Create items subcollection
    const itemsRef = collection(saleDocRef, 'items');
    const itemPromises = saleData.items.map(async (item, index) => {
      const itemDoc = {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
        category: item.category,
        createdAt: serverTimestamp()
      };
      
      const itemDocRef = doc(itemsRef, (index + 1).toString());
      await setDoc(itemDocRef, itemDoc);
    });
    
    await Promise.all(itemPromises);
    
    const sale: Sale = {
      id: saleId,
      date: now,
      totalAmount,
      totalItems,
      totalQuantity,
      status: saleData.status || 'completed',
      createdAt: now,
      updatedAt: now,
      notes: saleData.notes
    };
    
    console.log('✅ Sale created successfully:', saleId);
    return sale;
    
  } catch (error) {
    console.error('❌ Error creating sale:', error);
    throw new Error('Error al crear la venta');
  }
};

/**
 * Get sales history with optional filters
 */
export const getSalesHistory = async (
  limitCount: number = 50,
  startDate?: Date,
  endDate?: Date,
  status?: string
): Promise<Sale[]> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const salesRef = collection(db, 'butcheries', butcheryId, 'sales');
    
    // Build query with filters
    const queryConstraints: QueryConstraint[] = [];
    
    if (startDate) {
      queryConstraints.push(where('date', '>=', startDate));
    }
    if (endDate) {
      queryConstraints.push(where('date', '<=', endDate));
    }
    if (status) {
      queryConstraints.push(where('status', '==', status));
    }
    
    // Order by date descending and limit
    queryConstraints.push(orderBy('date', 'desc'));
    queryConstraints.push(limitQuery(limitCount));
    
    const q = query(salesRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const sales: Sale[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sales.push({
        id: doc.id,
        date: data.date?.toDate() || new Date(),
        totalAmount: data.totalAmount || 0,
        totalItems: data.totalItems || 0,
        totalQuantity: data.totalQuantity || 0,
        status: data.status || 'completed',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        notes: data.notes
      });
    });
    
    console.log(`✅ Fetched ${sales.length} sales from Firebase`);
    return sales;
    
  } catch (error) {
    console.error('❌ Error fetching sales history:', error);
    throw new Error('Error al obtener el historial de ventas');
  }
};

/**
 * Get a specific sale with its items
 */
export const getSaleWithItems = async (saleId: string): Promise<SaleWithItems> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    
    // Get sale document
    const saleDocRef = doc(db, 'butcheries', butcheryId, 'sales', saleId);
    const saleDoc = await getDoc(saleDocRef);
    
    if (!saleDoc.exists()) {
      throw new Error('Venta no encontrada');
    }
    
    const saleData = saleDoc.data();
    const sale: Sale = {
      id: saleDoc.id,
      date: saleData.date?.toDate() || new Date(),
      totalAmount: saleData.totalAmount || 0,
      totalItems: saleData.totalItems || 0,
      totalQuantity: saleData.totalQuantity || 0,
      status: saleData.status || 'completed',
      createdAt: saleData.createdAt?.toDate() || new Date(),
      updatedAt: saleData.updatedAt?.toDate() || new Date(),
      notes: saleData.notes
    };
    
    // Get items subcollection
    const itemsRef = collection(saleDocRef, 'items');
    const itemsSnapshot = await getDocs(itemsRef);
    
    const items: SaleItem[] = [];
    itemsSnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        productId: data.productId || '',
        productName: data.productName || '',
        quantity: data.quantity || 0,
        unitPrice: data.unitPrice || 0,
        subtotal: data.subtotal || 0,
        category: data.category || '',
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });
    
    console.log(`✅ Fetched sale ${saleId} with ${items.length} items`);
    return { ...sale, items };
    
  } catch (error) {
    console.error('❌ Error fetching sale with items:', error);
    throw new Error('Error al obtener los detalles de la venta');
  }
};

/**
 * Update sale status and handle stock changes
 */
export const updateSaleStatus = async (
  saleId: string, 
  newStatus: 'completed' | 'pending' | 'cancelled',
  currentStatus: 'completed' | 'pending' | 'cancelled'
): Promise<{ needsStockUpdate: boolean; saleItems?: SaleItem[] }> => {
  try {
    const butcheryId = await getCurrentButcheryId();
    const saleDocRef = doc(db, 'butcheries', butcheryId, 'sales', saleId);
    
    // Determine if we need to update stock
    const shouldDeductStock = (currentStatus === 'pending' || currentStatus === 'cancelled') && newStatus === 'completed';
    const shouldRestoreStock = currentStatus === 'completed' && (newStatus === 'pending' || newStatus === 'cancelled');
    
    let saleItems: SaleItem[] = [];
    
    // If we need to modify stock, get the sale items first
    if (shouldDeductStock || shouldRestoreStock) {
      const itemsRef = collection(saleDocRef, 'items');
      const itemsSnapshot = await getDocs(itemsRef);
      
      saleItems = [];
      itemsSnapshot.forEach((doc) => {
        const data = doc.data();
        saleItems.push({
          id: doc.id,
          productId: data.productId || '',
          productName: data.productName || '',
          quantity: data.quantity || 0,
          unitPrice: data.unitPrice || 0,
          subtotal: data.subtotal || 0,
          category: data.category || '',
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
    }
    
    // Update the sale status
    await updateDoc(saleDocRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    console.log(`✅ Sale status updated: ${saleId} -> ${newStatus}`);
    
    return {
      needsStockUpdate: shouldDeductStock || shouldRestoreStock,
      saleItems: shouldDeductStock || shouldRestoreStock ? saleItems : undefined
    };
    
  } catch (error) {
    console.error('❌ Error updating sale status:', error);
    throw new Error('Error al actualizar el estado de la venta');
  }
};

export default {
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
};