import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { app } from '../config/firebase';
import { WhatsAppNumber } from '../types';

const db = getFirestore(app);

// Resuelve la carnicería por URL, igual que store.ts
const getCurrentButcheryId = async (): Promise<string> => {
  let searchUrl = window.location.origin;
  if (searchUrl.includes('localhost') || searchUrl.includes('127.0.0.1')) {
    searchUrl = 'https://voluble-squirrel-a30bd3.netlify.app';
  }
  const butcheriesRef = collection(db, 'butcheries');
  const snap = await getDocs(butcheriesRef);
  let id = 'demo';
  snap.forEach(d => { 
    const data = d.data() as { url?: string }; 
    if (data.url === searchUrl) id = d.id; 
  });
  return id;
};

interface FirebaseWhatsAppNumber {
  name: string;
  role: string;
  number: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useWhatsAppNumbers = () => {
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const butcheryId = await getCurrentButcheryId();
      console.log('🔍 Cargando números para carnicería:', butcheryId);
      
      const ref = doc(db, 'butcheries', butcheryId);
      const d = await getDoc(ref);
      const data = d.data() || {};
      
      console.log('📄 Datos obtenidos de Firebase:', data);
      
      const arr = Array.isArray((data as { whatsappNumbers?: FirebaseWhatsAppNumber[] }).whatsappNumbers) 
        ? (data as { whatsappNumbers: FirebaseWhatsAppNumber[] }).whatsappNumbers 
        : [];
      
      console.log('📱 Array de números encontrado:', arr);
      
      // Convert array of objects to WhatsAppNumber[] with proper timestamps
      const convertedNumbers: WhatsAppNumber[] = arr.map((item: FirebaseWhatsAppNumber, index: number) => ({
        id: `temp-${index}`,
        name: item.name || '',
        role: item.role || '',
        number: item.number || '',
        createdAt: item.createdAt?.toDate() || new Date(),
        updatedAt: item.updatedAt?.toDate() || new Date(),
      }));
      
      console.log('✅ Números convertidos:', convertedNumbers);
      setNumbers(convertedNumbers);
    } catch (e) {
      console.error('❌ Error al cargar los números de WhatsApp:', e);
      setError('Error al cargar los números de WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const save = async (next: WhatsAppNumber[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const butcheryId = await getCurrentButcheryId();
      console.log('💾 Guardando números para carnicería:', butcheryId);
      
      const ref = doc(db, 'butcheries', butcheryId);
      
      // Convert WhatsAppNumber[] back to the format expected by Firebase
      const firebaseNumbers = next.map((num) => {
        const now = new Date();
        return {
          name: num.name,
          role: num.role,
          number: num.number,
          createdAt: num.createdAt ? Timestamp.fromDate(num.createdAt) : Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        };
      });
      
      console.log('💾 Guardando números en Firebase:', firebaseNumbers);
      console.log('💾 Estructura del documento a actualizar:', { whatsappNumbers: firebaseNumbers });
      
      await updateDoc(ref, { whatsappNumbers: firebaseNumbers });
      
      // Actualizar el estado local inmediatamente
      setNumbers(next);
      
      console.log('✅ Números guardados exitosamente');
      return true;
    } catch (e) {
      console.error('❌ Error al guardar los números de WhatsApp:', e);
      console.error('❌ Detalles del error:', {
        message: e instanceof Error ? e.message : 'Error desconocido',
        stack: e instanceof Error ? e.stack : undefined
      });
      setError('Error al guardar los números de WhatsApp');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    console.log('🔄 Hook inicializado, cargando datos...');
    load(); 
  }, []);

  return { numbers, isLoading, error, load, save, setNumbers };
};
