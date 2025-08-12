import { useCallback, useEffect, useRef, useState } from 'react';
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
  const lastLoadedAtRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const CACHE_TTL_MS = 60_000; // 1 minuto

  const normalizePhoneForStorage = (raw: string): string => {
    const digitsOnly = (raw || '').replace(/\D/g, '');
    if (!digitsOnly) return '';

    let normalized = digitsOnly;

    // Remove leading plus if present (we store digits only)
    if (normalized.startsWith('54') && !normalized.startsWith('549')) {
      normalized = `549${normalized.slice(2)}`;
    } else if (!normalized.startsWith('549')) {
      // Catch other cases like local numbers, or starting with 9
      normalized = `549${normalized}`;
    }

    // Remove potential leading zero after country+mobile code
    if (normalized.startsWith('5490')) {
      normalized = '549' + normalized.slice(4);
    }

    return normalized;
  };

  const load = useCallback(async (opts?: { force?: boolean }) => {
    const force = !!opts?.force;
    const now = Date.now();
    if (!force && numbers.length > 0 && now - lastLoadedAtRef.current < CACHE_TTL_MS) {
      // Cache fresca: no volver a pedir
      return;
    }
    if (isFetchingRef.current) {
      // Evitar requests paralelos
      return;
    }
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const butcheryId = await getCurrentButcheryId();
     
      
      const ref = doc(db, 'butcheries', butcheryId);
      const d = await getDoc(ref);
      const data = d.data() || {};
      
     
      
      const arr = Array.isArray((data as { whatsappNumbers?: FirebaseWhatsAppNumber[] }).whatsappNumbers) 
        ? (data as { whatsappNumbers: FirebaseWhatsAppNumber[] }).whatsappNumbers 
        : [];
      
     
      
      // Convert array of objects to WhatsAppNumber[] with proper timestamps
      const convertedNumbers: WhatsAppNumber[] = arr.map((item: FirebaseWhatsAppNumber, index: number) => ({
        id: `temp-${index}`,
        name: item.name || '',
        role: item.role || '',
        number: normalizePhoneForStorage(item.number || ''),
        createdAt: item.createdAt?.toDate() || new Date(),
        updatedAt: item.updatedAt?.toDate() || new Date(),
      }));
      
     
      setNumbers(convertedNumbers);
      lastLoadedAtRef.current = Date.now();
    } catch (err) {
      console.error('Error al cargar los números de WhatsApp', err);
      setError('Error al cargar los números de WhatsApp');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [numbers.length]);

  const save = async (next: WhatsAppNumber[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const butcheryId = await getCurrentButcheryId();
      const ref = doc(db, 'butcheries', butcheryId);

      // Obtener estado actual para detectar cuáles son nuevos
      const currentSnap = await getDoc(ref);
      const currentData = (currentSnap.data() || {}) as { name?: string; whatsappNumbers?: FirebaseWhatsAppNumber[] };
      const currentNumbersRaw: FirebaseWhatsAppNumber[] = Array.isArray(currentData.whatsappNumbers)
        ? currentData.whatsappNumbers
        : [];

      // Normalizar números de la lista a persistir
      const normalizedNext: WhatsAppNumber[] = next.map((n) => ({
        ...n,
        number: normalizePhoneForStorage(n.number),
        updatedAt: new Date(),
      }));

      // Convert WhatsAppNumber[] back to the format expected by Firebase
      const firebaseNumbers = normalizedNext.map((num) => {
        const now = new Date();
        return {
          name: num.name,
          role: num.role,
          number: num.number,
          createdAt: num.createdAt ? Timestamp.fromDate(num.createdAt) : Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        };
      });

      // Persistir cambios
      await updateDoc(ref, { whatsappNumbers: firebaseNumbers });

      // Detectar nuevos números agregados comparando contra el estado anterior
      const currentNumbersNormalized = currentNumbersRaw.map((n) => normalizePhoneForStorage(n.number || ''));
      const newNumbers = normalizedNext.filter((n) => !currentNumbersNormalized.includes(normalizePhoneForStorage(n.number)));

      // Disparar webhook de bienvenida por cada número nuevo
      if (newNumbers.length > 0) {
        const butcheryName = currentData?.name || 'Carnicería Lo de Nacho';
        const endpoint = 'https://primary-production-047da.up.railway.app/webhook-test/welcomeWhatsApp';

        await Promise.allSettled(
          newNumbers.map(async (n) => {
            try {
              await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'new_whatsapp_user',
                  timestamp: new Date().toISOString(),
                  data: {
                    name: n.name,
                    phone: normalizePhoneForStorage(n.number),
                    role: n.role,
                    butcheryName,
                    butcheryId,
                    createdAt: (n.createdAt || new Date()).toISOString?.() || new Date().toISOString(),
                  },
                }),
              });
            } catch (err) {
              // No bloquear guardado por fallo de webhook
              console.warn('Welcome webhook failed for', n.number, err);
            }
          })
        );
      }

      // Actualizar el estado local inmediatamente
      setNumbers(normalizedNext);
      lastLoadedAtRef.current = Date.now();
      
      return true;
    } catch (e) {
     
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
  }, [load]);

  return { numbers, isLoading, error, load, save, setNumbers };
};
