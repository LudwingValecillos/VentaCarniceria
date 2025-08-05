import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  QuerySnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { app } from '../config/firebase';

// Initialize Firestore
const db = getFirestore(app);

// Interface para los productos
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  isOffer?: boolean;
  status?: string;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any; // Para propiedades adicionales
}

// Interface para la carnicería
export interface Butchery {
  id: string;
  name: string;
  url: string;
  [key: string]: any; // Para propiedades adicionales
}

/**
 * Obtiene los productos de una carnicería basándose en la URL actual
 * Gets products from a butchery based on the current URL
 * 
 * @returns Promise<Product[]> - Array de productos de la carnicería
 */
export const getProductsByCurrentUrl = async (): Promise<Product[]> => {
  try {
    // 1. Obtener la URL actual
    const currentUrl = window.location.origin;
    console.log('🔍 Buscando carnicería para URL:', currentUrl);

    // 2. Buscar el documento de carnicería que coincida con la URL
    const butcheriesRef = collection(db, 'butcheries');
    const urlQuery = query(butcheriesRef, where('url', '==', currentUrl));
    const butcherySnapshot: QuerySnapshot<DocumentData> = await getDocs(urlQuery);

    // Verificar si encontramos una carnicería
    if (butcherySnapshot.empty) {
      console.warn('⚠️ No se encontró ninguna carnicería para la URL:', currentUrl);
      return [];
    }

    // Obtener el primer documento que coincida (debería ser único)
    const butcheryDoc = butcherySnapshot.docs[0];
    const butcheryId = butcheryDoc.id;
    const butcheryData = butcheryDoc.data() as Butchery;
    
    console.log('✅ Carnicería encontrada:', butcheryData.name, '(ID:', butcheryId, ')');

    // 3. Obtener todos los productos de la subcolección "products"
    const productsRef = collection(db, 'butcheries', butcheryId, 'products');
    const productsSnapshot: QuerySnapshot<DocumentData> = await getDocs(productsRef);

    // 4. Convertir los documentos a objetos Product
    const products: Product[] = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));

    console.log('📦 Productos obtenidos:', products.length);
    return products;

  } catch (error) {
    console.error('❌ Error al obtener productos por URL:', error);
    throw new Error(`Error al cargar productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Obtiene los productos de una carnicería específica por ID
 * Gets products from a specific butchery by ID
 * 
 * @param butcheryId - ID del documento de la carnicería
 * @returns Promise<Product[]> - Array de productos
 */
export const getProductsByButcheryId = async (butcheryId: string): Promise<Product[]> => {
  try {
    console.log('🔍 Obteniendo productos para carnicería ID:', butcheryId);

    const productsRef = collection(db, 'butcheries', butcheryId, 'products');
    const productsSnapshot: QuerySnapshot<DocumentData> = await getDocs(productsRef);

    const products: Product[] = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));

    console.log('📦 Productos obtenidos:', products.length);
    return products;

  } catch (error) {
    console.error('❌ Error al obtener productos por ID:', error);
    throw new Error(`Error al cargar productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Obtiene la información de la carnicería basándose en la URL actual
 * Gets butchery information based on the current URL
 * 
 * @returns Promise<Butchery | null> - Datos de la carnicería o null si no se encuentra
 */
export const getButcheryByCurrentUrl = async (): Promise<Butchery | null> => {
  try {
    const currentUrl = window.location.origin;
    console.log('🔍 Buscando información de carnicería para URL:', currentUrl);

    const butcheriesRef = collection(db, 'butcheries');
    const urlQuery = query(butcheriesRef, where('url', '==', currentUrl));
    const butcherySnapshot: QuerySnapshot<DocumentData> = await getDocs(urlQuery);

    if (butcherySnapshot.empty) {
      console.warn('⚠️ No se encontró carnicería para la URL:', currentUrl);
      return null;
    }

    const butcheryDoc = butcherySnapshot.docs[0];
    const butchery: Butchery = {
      id: butcheryDoc.id,
      ...butcheryDoc.data()
    } as Butchery;

    console.log('✅ Información de carnicería obtenida:', butchery.name);
    return butchery;

  } catch (error) {
    console.error('❌ Error al obtener información de carnicería:', error);
    throw new Error(`Error al cargar información: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

/**
 * Función combinada que obtiene tanto la información de la carnicería como sus productos
 * Combined function that gets both butchery info and its products
 * 
 * @returns Promise<{butchery: Butchery | null, products: Product[]}> - Carnicería y productos
 */
export const getButcheryAndProductsByUrl = async (): Promise<{
  butchery: Butchery | null;
  products: Product[];
}> => {
  try {
    const currentUrl = window.location.origin;
    console.log('🔍 Obteniendo carnicería completa para URL:', currentUrl);

    // Buscar carnicería
    const butcheriesRef = collection(db, 'butcheries');
    const urlQuery = query(butcheriesRef, where('url', '==', currentUrl));
    const butcherySnapshot: QuerySnapshot<DocumentData> = await getDocs(urlQuery);

    if (butcherySnapshot.empty) {
      console.warn('⚠️ No se encontró carnicería para la URL:', currentUrl);
      return { butchery: null, products: [] };
    }

    const butcheryDoc = butcherySnapshot.docs[0];
    const butchery: Butchery = {
      id: butcheryDoc.id,
      ...butcheryDoc.data()
    } as Butchery;

    // Obtener productos
    const productsRef = collection(db, 'butcheries', butchery.id, 'products');
    const productsSnapshot: QuerySnapshot<DocumentData> = await getDocs(productsRef);

    const products: Product[] = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));

    console.log('✅ Carnicería completa obtenida:', butchery.name, 'con', products.length, 'productos');
    
    return { butchery, products };

  } catch (error) {
    console.error('❌ Error al obtener carnicería completa:', error);
    throw new Error(`Error al cargar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// Hook personalizado para React
export { db };