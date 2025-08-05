# 🔧 **ACTUALIZAR FIREBASE - REDES SOCIALES**

## **❌ Problema Identificado**

El código estaba buscando campos con nombres diferentes a los que tienes en Firebase.

### **📊 Estado Actual en Firebase:**
```javascript
// butcheries/demo
{
  facebook: "face",  // ❌ Valor incorrecto
  instagram: "https://www.instagram.com/nextcode.com.ar/"  // ✅ Correcto
}
```

---

## **✅ SOLUCIÓN IMPLEMENTADA**

### **1. Código Actualizado:**
- ✅ Ahora busca `instagram` (no `instagramUrl`)
- ✅ Ahora busca `facebook` (no `facebookUrl`)  
- ✅ Auto-genera usernames si no están definidos
- ✅ Logs mejorados para debugging

### **2. Auto-generación de Usernames:**
```javascript
// Instagram: extrae username de URL
"https://www.instagram.com/nextcode.com.ar/" → "@nextcode.com.ar"

// Facebook: usa el nombre de la carnicería
facebook: "..." → username: "Carnicería Demo"
```

---

## **🔧 PARA CORREGIR EN FIREBASE:**

### **1. Ir a Firebase Console:**
- **Firestore Database** → **`butcheries`** → **`demo`**

### **2. Actualizar el campo `facebook`:**
```javascript
// CAMBIAR ESTO:
facebook: "face"

// POR ESTO:
facebook: "https://facebook.com/tu-pagina-de-carniceria"
```

### **3. El Instagram ya está bien:**
```javascript
// ✅ YA CORRECTO:
instagram: "https://www.instagram.com/nextcode.com.ar/"
```

### **4. (Opcional) Agregar usernames personalizados:**
```javascript
// Si quieres usernames específicos:
instagramUsername: "@carniceria_lo_de_nacho"
facebookUsername: "Carnicería Lo de Nacho"
```

---

## **📱 RESULTADO DESPUÉS DE LA CORRECCIÓN:**

### **Con los campos corregidos, verás:**

#### **Instagram:**
- **URL:** `https://www.instagram.com/nextcode.com.ar/`
- **Username:** `@nextcode.com.ar` (auto-generado)
- **Tooltip:** Muestra el username al hacer hover

#### **Facebook:**
- **URL:** Tu URL de Facebook corregida
- **Username:** "Carnicería Demo" (nombre de la carnicería)
- **Tooltip:** Muestra el nombre al hacer hover

#### **WhatsApp:**
- **URL:** `https://wa.me/5491127281099` (auto-generado)
- **Tooltip:** "Escríbenos por WhatsApp"

---

## **🔍 PARA VERIFICAR QUE FUNCIONA:**

### **1. Actualiza Firebase con las URLs correctas**

### **2. Recarga tu aplicación (F5)**

### **3. Abre la consola del navegador (F12)**

### **4. Busca estos logs:**
```
✅ Configuración cargada: {objeto completo}
📱 Instagram URL: https://www.instagram.com/nextcode.com.ar/
📘 Facebook URL: https://facebook.com/tu-pagina
📞 WhatsApp: +5491127281099
```

### **5. Verifica en la aplicación:**
- ✅ **Footer:** Los iconos de redes sociales deben ser clicables
- ✅ **Sidebar:** Los enlaces deben funcionar
- ✅ **Tooltips:** Deben mostrar usernames al hacer hover

---

## **⚡ PASOS RÁPIDOS:**

### **1. Firebase Console:**
```
butcheries → demo → Editar
```

### **2. Cambiar Facebook:**
```javascript
facebook: "https://facebook.com/carniceria-lo-de-nacho"
```

### **3. Guardar y refrescar app**

### **4. ¡Listo!** Los enlaces ya funcionarán correctamente.

---

## **💡 URLs DE EJEMPLO:**

### **Para Facebook:**
```
https://facebook.com/carniceria.lonacho
https://facebook.com/carniceria.lodeanacho
https://facebook.com/pages/carniceria-lo-de-nacho/123456789
```

### **Para Instagram:**
```
https://www.instagram.com/carniceria_lo_de_nacho/
https://www.instagram.com/lodenachocarniceria/
https://www.instagram.com/carniceria.nacho/
```

---

**🔧 Una vez que actualices el campo `facebook` en Firebase con una URL real, ¡las redes sociales funcionarán perfectamente!** 🚀📱