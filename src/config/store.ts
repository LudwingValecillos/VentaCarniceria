import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from './firebase';
import { WhatsAppNumber } from '../types';

const db = getFirestore(app);

// Configuración por defecto (fallback)
const DEFAULT_CONFIG = {
  // Información básica de la carnicería
  name: "..",
  tagline: "Los mejores cortes de carne fresca y de alta calidad",
  description: "Más de 20 años ofreciendo los mejores cortes de carne fresca y de alta calidad para tu hogar.",
  logoUrl: "",
  bannerUrl: "",
  primaryColor: "#D32F2F",
  secondaryColor: "#FFCDD2",
  
  // Información de contacto
  contact: {
    phone: "11 2728-1099",
    whatsapp: "5491127281099",
    location: "Buenos Aires, Argentina",
    delivery: "Envíos gratis a toda la zona",
  },
  
  // Redes sociales
  social: {
    instagram: {
      url: "https://www.instagram.com/lodenachocarniceria/",
      username: "@lodenachocarniceria"
    },
    facebook: {
      url: "https://www.facebook.com/share/196s7xmSpP/",
      username: "Carnicería Lo De Nacho"
    },
    whatsapp: {
      url: "https://wa.me/5491127281099", 
      message: "Hola, me gustaría hacer un pedido."
    }
  },
  
  // Horarios de atención
  schedules: "Lunes a Sábado: 9:00 - 13:00 y 17:00 - 21:00 | Domingos: 9:00 - 13:00",
  
  // WhatsApp numbers array
  whatsappNumbers: [] as WhatsAppNumber[],
};

// Interfaz para la configuración dinámica
interface DynamicConfig {
  name: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  schedules: string;
  tagline: string;
  description: string;
  contact: {
    phone: string;
    whatsapp: string;
    location: string;
    delivery: string;
  };
  social: {
    instagram: { url: string; username: string };
    facebook: { url: string; username: string };
    whatsapp: { url: string; message: string };
  };
  whatsappNumbers: WhatsAppNumber[];
}

// Configuración dinámica que se carga desde Firebase
let DYNAMIC_CONFIG: DynamicConfig = { ...DEFAULT_CONFIG };

// Evitar múltiples cargas simultáneas o repetidas
let hasLoadedConfig = false;
let loadConfigPromise: Promise<void> | null = null;

// Cache local para configuración
const CONFIG_CACHE_KEY = 'STORE_CONFIG_CACHE_V1';
const CONFIG_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface CachedConfig {
  timestamp: number;
  butcheryId?: string;
  config: DynamicConfig;
}

// Función para obtener la URL de búsqueda
const getSearchUrl = (): string => {
  let searchUrl = window.location.origin;
  if (searchUrl.includes('localhost') || searchUrl.includes('127.0.0.1')) {
    searchUrl = 'https://voluble-squirrel-a30bd3.netlify.app';
  }
  return searchUrl;
};

// Función para actualizar el favicon y título dinámicamente
const updateFaviconAndTitle = (logoUrl: string, name: string): void => {
  try {
    // Actualizar favicon
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (!favicon) {
      // Si no existe, crear uno nuevo
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    
    // Actualizar la URL del favicon
    favicon.href = logoUrl;
    
    // También actualizar apple-touch-icon si existe
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (appleTouchIcon) {
      appleTouchIcon.href = logoUrl;
    }
    
    // Actualizar título de la página
    document.title = `${name} - Los mejores cortes de carne fresca`;
   
  } catch (error) {
    console.error('❌ Error al actualizar favicon/título:', error);
  }
};

// Función para cargar la configuración desde Firebase
export const loadStoreConfig = async (): Promise<void> => {
  if (hasLoadedConfig) return;
  if (loadConfigPromise) return loadConfigPromise;

  loadConfigPromise = (async () => {
    try {
      // 1) Intentar leer desde cache válido
      try {
        const raw = localStorage.getItem(CONFIG_CACHE_KEY);
        if (raw) {
          const cached: CachedConfig = JSON.parse(raw);
          if (cached && cached.timestamp && (Date.now() - cached.timestamp) < CONFIG_TTL_MS && cached.config) {
            DYNAMIC_CONFIG = { ...DEFAULT_CONFIG, ...cached.config };
            // Actualizar favicon/título con datos cacheados
            if (DYNAMIC_CONFIG.logoUrl) {
              updateFaviconAndTitle(DYNAMIC_CONFIG.logoUrl, DYNAMIC_CONFIG.name);
            } else if (DYNAMIC_CONFIG.name) {
              document.title = `${DYNAMIC_CONFIG.name} - Los mejores cortes de carne fresca`;
            }
            hasLoadedConfig = true;
            return; // No hacer red si cache está fresco
          }
        }
      } catch { /* noop */ }

      // 2) Cargar desde Firestore si no hay cache fresco
      const searchUrl = getSearchUrl();

      // Buscar la carnicería por URL con query directa
      const butcheriesRef = collection(db, 'butcheries');
      const urlQuery = query(butcheriesRef, where('url', '==', searchUrl));
      const butcheriesSnapshot = await getDocs(urlQuery);

      let butcheryData: Record<string, unknown> | null = null;
      if (!butcheriesSnapshot.empty) {
        const found = butcheriesSnapshot.docs[0];
        butcheryData = { id: found.id, ...found.data() };
      }

      // Si no encuentra por URL, usar 'demo' como fallback
      if (!butcheryData) {
        const demoDocRef = doc(db, 'butcheries', 'demo');
        const demoDoc = await getDoc(demoDocRef);
        if (demoDoc.exists()) {
          butcheryData = { id: 'demo', ...demoDoc.data() } as Record<string, unknown>;
        }
      }

      if (butcheryData) {
        const data = butcheryData as {
          id?: string;
          name?: string;
          logoUrl?: string;
          bannerUrl?: string;
          primaryColor?: string;
          secondaryColor?: string;
          schedules?: string;
          whatsappNumber?: string;
          instagram?: string;
          instagramUsername?: string;
          facebook?: string;
          facebookUsername?: string;
          whatsappNumbers?: Array<{ name?: string; role?: string; number?: string; createdAt?: { toDate: () => Date }; updatedAt?: { toDate: () => Date } }>;
        };

        DYNAMIC_CONFIG = {
          ...DEFAULT_CONFIG,
          name: data.name || DEFAULT_CONFIG.name,
          logoUrl: data.logoUrl || '',
          bannerUrl: data.bannerUrl || '',
          primaryColor: data.primaryColor || DEFAULT_CONFIG.primaryColor,
          secondaryColor: data.secondaryColor || DEFAULT_CONFIG.secondaryColor,
          schedules: data.schedules || DEFAULT_CONFIG.schedules,
          contact: {
            ...DEFAULT_CONFIG.contact,
            whatsapp: data.whatsappNumber?.replace('+', '') || DEFAULT_CONFIG.contact.whatsapp,
          },
          social: {
            instagram: {
              url: data.instagram || DEFAULT_CONFIG.social.instagram.url,
              username: data.instagramUsername || (data.instagram ? `@${data.instagram.split('/').pop()}` : DEFAULT_CONFIG.social.instagram.username),
            },
            facebook: {
              url: data.facebook || DEFAULT_CONFIG.social.facebook.url,
              username: data.facebookUsername || data.name || DEFAULT_CONFIG.social.facebook.username,
            },
            whatsapp: {
              url: data.whatsappNumber ? `https://wa.me/${data.whatsappNumber.replace('+', '')}` : DEFAULT_CONFIG.social.whatsapp.url,
              message: 'Hola, me gustaría hacer un pedido.',
            },
          },
          whatsappNumbers: Array.isArray(data.whatsappNumbers)
            ? data.whatsappNumbers.map((item, index) => ({
                id: `temp-${index}`,
                name: item.name || '',
                role: item.role || '',
                number: item.number || '',
                createdAt: item.createdAt?.toDate() || new Date(),
                updatedAt: item.updatedAt?.toDate() || new Date(),
              }))
            : DEFAULT_CONFIG.whatsappNumbers,
        };

        // Actualizar favicon y título si hay logoUrl
        if (data.logoUrl) {
          updateFaviconAndTitle(data.logoUrl, data.name || DEFAULT_CONFIG.name);
        } else if (data.name) {
          document.title = `${data.name} - Los mejores cortes de carne fresca`;
        }

        // 3) Guardar en cache local
        try {
          const cachePayload: CachedConfig = {
            timestamp: Date.now(),
            butcheryId: (butcheryData as { id?: string }).id,
            config: DYNAMIC_CONFIG,
          };
          localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(cachePayload));
        } catch { /* noop */ }
      }
    } catch (error) {
      console.error('❌ Error al cargar configuración:', error);
    } finally {
      hasLoadedConfig = true;
      loadConfigPromise = null;
    }
  })();

  return loadConfigPromise;
};

// Configuración exportada que se actualiza dinámicamente
export const STORE_CONFIG = {
  get name() { return DYNAMIC_CONFIG.name; },
  get logoUrl() { return DYNAMIC_CONFIG.logoUrl; },
  get bannerUrl() { return DYNAMIC_CONFIG.bannerUrl; },
  get primaryColor() { return DYNAMIC_CONFIG.primaryColor; },
  get secondaryColor() { return DYNAMIC_CONFIG.secondaryColor; },
  get schedules() { return DYNAMIC_CONFIG.schedules; },
  get tagline() { return DYNAMIC_CONFIG.tagline; },
  get description() { return DYNAMIC_CONFIG.description; },
  get contact() { return DYNAMIC_CONFIG.contact; },
  get social() { return DYNAMIC_CONFIG.social; },
  get whatsappNumbers() { return DYNAMIC_CONFIG.whatsappNumbers; },
  
  // Configuración del carrito (estática)
  cart: {
    defaultQuantity: 1,
    quantityStep: 0.5,
    currency: "ARS",
    currencySymbol: "$",
    deliveryMessage: "Envíos gratis a toda la zona"
  },
  
  // Mensajes del sistema
  messages: {
    loading: {
      title: "Cargando productos frescos...",
      subtitle: "Estamos preparando los mejores cortes para vos"
    },
    emptyCart: {
      title: "Tu carrito está vacío",
      subtitle: "¡Agrega algunos productos deliciosos de nuestra carnicería!",
      button: "Explorar productos"
    },
    noProducts: {
      title: "No encontramos productos",
      subtitle: "Intenta buscar con otras palabras o explora nuestras categorías",
      button: "Ver todos los productos"
    },
    offers: {
      title: "¡Ofertas Especiales! 🔥",
      subtitle: "Los mejores cortes al mejor precio",
      button: "Ver todas las ofertas"
    },
    error: {
      title: "Oops! Algo salió mal",
      subtitle: "Error al cargar los productos"
    }
  },
  
  // Configuración de categorías
  categories: [
    { name: 'Todos', icon: '🛒', key: 'todos' },
    { name: 'Ofertas', icon: '🔥', key: 'ofertas', isHot: true },
    { name: 'Vacuno', icon: '🥩', key: 'vacuno' },
    { name: 'Cerdo', icon: '🥓', key: 'cerdo' },
    { name: 'Pollo', icon: '🍗', key: 'pollo' },
    { name: 'Embutidos', icon: '🌭', key: 'embutidos' },
    { name: 'Anchuras', icon: '🥘', key: 'anchuras' },
    { name: 'Fiambres', icon: '🍖', key: 'fiambres' },
    { name: 'Congelados', icon: '🧊', key: 'congelados' },
    { name: 'Carbon', icon: '🔥', key: 'carbon' },
    { name: 'Bebidas', icon: '🥤', key: 'bebidas' },
  ],
  
  // Configuración de métodos de pago
  paymentMethods: [
    { 
      value: 'efectivo', 
      label: 'Efectivo', 
      desc: 'Pago al recibir',
      icon: '💵'
    },
    { 
      value: 'tarjeta', 
      label: 'Tarjeta', 
      desc: 'Débito/Crédito',
      icon: '💳'
    },
    { 
      value: 'transferencia', 
      label: 'Transferencia', 
      desc: 'Bancaria',
      icon: '🏦'
    },
    { 
      value: 'mercadopago', 
      label: 'MercadoPago', 
      desc: 'Digital',
      icon: '📱'
    }
  ],
  
  // Configuración de SEO y meta
  seo: {
    title: "Carnicería Lo De Nacho - Los mejores cortes de carne fresca",
    description: "Carnicería Lo De Nacho. Más de 20 años ofreciendo los mejores cortes de carne fresca y de alta calidad. Envíos gratis a toda la zona.",
    keywords: "carnicería, carne fresca, vacuno, cerdo, pollo, embutidos, Buenos Aires, envíos gratis"
  }
};

// Función helper para formatear precios
export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Función helper para capitalizar texto
export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Función helper para obtener el año actual
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
}; 