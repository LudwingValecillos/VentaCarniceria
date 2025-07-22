# Configuración Centralizada - Carnicería Lo De Nacho

## 📋 Descripción

Este sistema permite modificar toda la información de la carnicería desde un solo archivo: `src/config/store.ts`. Solo necesitas editar este archivo para cambiar:

- ✅ Nombre de la carnicería
- ✅ Información de contacto (teléfono, ubicación)
- ✅ Redes sociales (Instagram, Facebook, WhatsApp)
- ✅ Horarios de atención
- ✅ Mensajes del sistema
- ✅ Categorías de productos
- ✅ Métodos de pago
- ✅ Información SEO

## 🚀 Cómo usar

### 1. Editar información básica

```typescript
// En src/config/store.ts
export const STORE_CONFIG = {
  name: "Carnicería Lo De Nacho", // ← Cambia el nombre aquí
  tagline: "Los mejores cortes de carne fresca y de alta calidad",
  description: "Más de 20 años ofreciendo los mejores cortes...",
  // ...
};
```

### 2. Cambiar información de contacto

```typescript
contact: {
  phone: "11 6145-0595", // ← Cambia el teléfono
  whatsapp: "91161450595", // ← Cambia WhatsApp
  location: "Buenos Aires, Argentina", // ← Cambia ubicación
  delivery: "Envíos gratis a toda la zona", // ← Cambia mensaje de delivery
},
```

### 3. Actualizar redes sociales

```typescript
social: {
  instagram: {
    url: "https://www.instagram.com/lodenachocarniceria/", // ← Cambia URL
    username: "@lodenachocarniceria" // ← Cambia username
  },
  facebook: {
    url: "https://www.facebook.com/share/196s7xmSpP/", // ← Cambia URL
    username: "Carnicería Lo De Nacho" // ← Cambia nombre
  },
  whatsapp: {
    url: "https://wa.me/91161450595", // ← Cambia número
    message: "Hola, me gustaría hacer un pedido." // ← Cambia mensaje
  }
},
```

### 4. Modificar horarios

```typescript
hours: {
  weekdays: {
    days: "Lunes a Sábado", // ← Cambia días
    morning: "9:00 - 13:00", // ← Cambia horario mañana
    afternoon: "17:00 - 21:00" // ← Cambia horario tarde
  },
  weekend: {
    days: "Domingos", // ← Cambia días
    hours: "9:00 - 13:00" // ← Cambia horario
  }
},
```

### 5. Personalizar mensajes

```typescript
messages: {
  loading: {
    title: "Cargando productos frescos...", // ← Cambia título
    subtitle: "Estamos preparando los mejores cortes para vos" // ← Cambia subtítulo
  },
  emptyCart: {
    title: "Tu carrito está vacío", // ← Cambia título
    subtitle: "¡Agrega algunos productos deliciosos!", // ← Cambia subtítulo
    button: "Explorar productos" // ← Cambia botón
  },
  // ... más mensajes
},
```

### 6. Agregar/quitar categorías

```typescript
categories: [
  { name: 'Todos', icon: '🛒', key: 'todos' },
  { name: 'Ofertas', icon: '🔥', key: 'ofertas', isHot: true },
  { name: 'Vacuno', icon: '🥩', key: 'vacuno' },
  // ← Agrega o quita categorías aquí
  { name: 'Nueva Categoría', icon: '🍖', key: 'nueva' },
],
```

### 7. Configurar métodos de pago

```typescript
paymentMethods: [
  { 
    value: 'cash', 
    label: 'Efectivo', 
    desc: 'Pago al recibir',
    icon: '💵'
  },
  // ← Agrega o modifica métodos de pago
],
```

## 📱 Componentes actualizados automáticamente

Los siguientes componentes se actualizan automáticamente cuando cambias la configuración:

- ✅ **App.tsx** - Header, footer, mensajes de carga
- ✅ **Cart.tsx** - Mensajes del carrito, WhatsApp
- ✅ **Sidebar.tsx** - Categorías, redes sociales, horarios
- ✅ **ProductCard.tsx** - Formateo de precios
- ✅ **index.html** - Título de la página

## 🎯 Beneficios

1. **Centralización**: Todo en un solo archivo
2. **Mantenimiento fácil**: Cambios rápidos sin tocar código
3. **Consistencia**: Misma información en toda la app
4. **Escalabilidad**: Fácil agregar nuevas configuraciones
5. **Reutilización**: Configuración disponible en todos los componentes

## 🔧 Funciones helper incluidas

```typescript
// Formatear precios
formatPrice(price: number | string): string

// Capitalizar texto
capitalizeFirstLetter(string: string): string

// Obtener año actual
getCurrentYear(): number
```

## 📝 Ejemplo de uso completo

```typescript
// Cambiar toda la información de la carnicería
export const STORE_CONFIG = {
  name: "Mi Nueva Carnicería",
  contact: {
    phone: "11 1234-5678",
    whatsapp: "91112345678",
    location: "Mi Nueva Ciudad, Argentina",
  },
  social: {
    instagram: {
      url: "https://www.instagram.com/minuevacarniceria/",
      username: "@minuevacarniceria"
    },
    // ... más redes
  },
  // ... resto de configuración
};
```

¡Con solo cambiar este archivo, toda la aplicación se actualiza automáticamente! 🎉 