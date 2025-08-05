# ✅ **CONFIGURACIÓN DINÁMICA IMPLEMENTADA**

## **🚀 ¿Qué se implementó?**

Tu aplicación ahora toma **automáticamente** todos los datos de configuración desde Firebase según la carnicería actual, en lugar de usar datos estáticos.

---

## **📊 Datos que se Obtienen de Firebase:**

### **Desde `butcheries/demo` (o la carnicería según URL):**

```javascript
{
  name: "Carnicería Demo",              // ✅ Nombre dinámico
  logoUrl: "https://...",               // ✅ Logo dinámico
  bannerUrl: "https://...",             // ✅ Banner dinámico
  primaryColor: "#D32F2F",              // ✅ Color principal
  secondaryColor: "#FFCDD2",            // ✅ Color secundario
  schedules: "10 a 11",                 // ✅ Horarios como string
  whatsappNumber: "+5491123456789",     // ✅ WhatsApp dinámico
  url: "https://voluble-squirrel-a30bd3.netlify.app/"
}
```

---

## **🎯 Cambios en la Aplicación:**

### **1. Nombre de la Carnicería:**
- **Antes:** `"Daniele Carniceria"` (estático)
- **Ahora:** `STORE_CONFIG.name` → **toma desde Firebase**

### **2. Logo:**
- **Antes:** Logo local estático
- **Ahora:** `STORE_CONFIG.logoUrl` → **imagen desde Firebase**
- **Fallback:** Si no hay logoUrl, usa el logo local

### **3. Banner del Carousel:**
- **Antes:** Múltiples imágenes locales
- **Ahora:** `STORE_CONFIG.bannerUrl` → **imagen desde Firebase**
- **Fallback:** Si no hay bannerUrl, usa banners locales

### **4. Colores de la Marca:**
- **Antes:** Colores fijos rojos
- **Ahora:** `STORE_CONFIG.primaryColor` y `secondaryColor` → **desde Firebase**

### **5. Horarios:**
- **Antes:** Estructura compleja con días/horarios separados
- **Ahora:** `STORE_CONFIG.schedules` → **string directo desde Firebase**
- **Formato:** Acepta `|` como separador de líneas

### **6. WhatsApp:**
- **Antes:** Número fijo
- **Ahora:** `STORE_CONFIG.social.whatsapp.url` → **desde Firebase**
- **Auto-formato:** Convierte `+5491123456789` a `https://wa.me/5491123456789`

---

## **🔧 Cómo Funciona:**

### **1. Al iniciar la app:**
```javascript
// main.tsx
loadStoreConfig() // Se ejecuta automáticamente
```

### **2. Búsqueda por URL:**
```javascript
// Si está en localhost → busca https://voluble-squirrel-a30bd3.netlify.app
// Si está en producción → busca window.location.origin
// Si no encuentra → usa 'demo' como fallback
```

### **3. Actualización dinámica:**
```javascript
// STORE_CONFIG ahora usa getters
get name() { return DYNAMIC_CONFIG.name; }
get logoUrl() { return DYNAMIC_CONFIG.logoUrl; }
// etc...
```

---

## **📍 Dónde se Reflejan los Cambios:**

### **Header:**
- ✅ **Nombre:** `{STORE_CONFIG.name}`
- ✅ **Logo:** `src={STORE_CONFIG.logoUrl || logo}`

### **Carousel/Banner:**
- ✅ **Banner:** `[STORE_CONFIG.bannerUrl]` (si existe)
- ✅ **Fallback:** Imágenes locales si no hay banner

### **Botones/Colores:**
- ✅ **Color principal:** `style={{ color: STORE_CONFIG.primaryColor }}`
- ✅ **Bordes:** `style={{ borderColor: STORE_CONFIG.primaryColor }}`

### **Horarios (Sidebar y Footer):**
- ✅ **Formato:** `STORE_CONFIG.schedules.replace(/\|/g, '<br/>')`
- ✅ **Ejemplo:** `"Lunes a Sábado: 9-13 | Domingos: 9-13"` → se convierte en líneas separadas

### **WhatsApp:**
- ✅ **URL:** `https://wa.me/{número sin +}`
- ✅ **Botones:** Automáticamente usan el número correcto

---

## **🎯 Resultado Final:**

### **Tu aplicación ahora:**

1. **🔍 Detecta automáticamente** qué carnicería es según la URL
2. **📥 Carga la configuración** desde Firebase
3. **🎨 Aplica los estilos** (colores, logo, banner)  
4. **📱 Actualiza WhatsApp** con el número correcto
5. **⏰ Muestra horarios** en formato dinámico
6. **🏪 Personaliza la marca** completamente

### **Ejemplo con los datos de Firebase:**

```
Nombre: "Carnicería Demo"
Logo: https://imgs.search.brave.com/R8Z2Ed-cWLDrSuMmAlzLd-cnFbxYtwSpuWuh02...
Banner: https://imgs.search.brave.com/-7hcSnuhBmTKqmiIodgAlRKYPKGc4rO4_InvY7fR3s0...
Color: #D32F2F (rojo)
WhatsApp: https://wa.me/5491123456789
Horarios: "10 a 11" (se puede cambiar a lo que necesites)
```

---

## **⚡ Ventajas:**

1. **✅ Multi-carnicería:** Cada URL puede tener su configuración
2. **✅ Sin código:** Cambios desde Firebase Console
3. **✅ Instantáneo:** Actualización automática
4. **✅ Fallback:** Funciona aunque Firebase falle
5. **✅ Escalable:** Fácil agregar más carnicerívas

---

## **🔧 Para Cambiar la Configuración:**

1. **Ir a Firebase Console**
2. **Firestore Database**
3. **`butcheries` → `demo`**
4. **Editar campos:**
   - `name`: "Tu Carnicería Nueva"
   - `logoUrl`: "https://tu-logo-nuevo.jpg"
   - `bannerUrl`: "https://tu-banner-nuevo.jpg"
   - `primaryColor`: "#007BFF" (azul)
   - `schedules`: "Lunes a Viernes: 8-18 | Sábados: 9-15"
   - `whatsappNumber`: "+5491122334455"

5. **Guardar → Refrescar app**

**¡Los cambios se ven inmediatamente!** 🚀