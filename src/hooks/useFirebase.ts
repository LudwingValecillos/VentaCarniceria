import { useEffect, useState } from 'react';
import { app, analytics } from '../config/firebase';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Firestore 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);

// Hook para autenticación
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
};

// Hook para productos
export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productsQuery = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching products:', error);
        setError('Error al cargar productos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addProduct = async (productData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId: string, productData: any) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct
  };
};

// Hook para analytics
export const useAnalytics = () => {
  const logEvent = (eventName: string, parameters?: any) => {
    if (analytics && typeof window !== 'undefined') {
      import('firebase/analytics').then(({ logEvent }) => {
        logEvent(analytics, eventName, parameters);
      });
    }
  };

  const logPurchase = (value: number, currency: string = 'ARS', items?: any[]) => {
    logEvent('purchase', {
      currency,
      value,
      items
    });
  };

  const logAddToCart = (currency: string = 'ARS', value: number, items?: any[]) => {
    logEvent('add_to_cart', {
      currency,
      value,
      items
    });
  };

  const logViewItem = (currency: string = 'ARS', value: number, items?: any[]) => {
    logEvent('view_item', {
      currency,
      value,
      items
    });
  };

  return {
    logEvent,
    logPurchase,
    logAddToCart,
    logViewItem
  };
};

// Exportar instancias para uso directo si es necesario
export { db, auth, app, analytics };