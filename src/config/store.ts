export const STORE_CONFIG = {
  // Información básica de la carnicería
  name: "Carnicería Lo De Nacho",
  tagline: "Los mejores cortes de carne fresca y de alta calidad",
  description: "Más de 20 años ofreciendo los mejores cortes de carne fresca y de alta calidad para tu hogar.",
  
  // Información de contacto
  contact: {
    phone: "11 6145-0595",
    whatsapp: "91161450595",
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
      url: "https://wa.me/91161450595",
      message: "Hola, me gustaría hacer un pedido."
    }
  },
  
  // Horarios de atención
  hours: {
    weekdays: {
      days: "Lunes a Sábado",
      morning: "9:00 - 13:00",
      afternoon: "17:00 - 21:00"
    },
    weekend: {
      days: "Domingos",
      hours: "9:00 - 13:00"
    }
  },
  
  // Configuración del carrito
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
      value: 'cash', 
      label: 'Efectivo', 
      desc: 'Pago al recibir',
      icon: '💵'
    },
    { 
      value: 'card', 
      label: 'Tarjeta', 
      desc: 'Débito/Crédito',
      icon: '💳'
    },
    { 
      value: 'transfer', 
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