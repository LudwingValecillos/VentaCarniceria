# 🔥 Firebase Integration Guide / Guía de Integración de Firebase

## ✅ What's Already Done / Lo que ya está hecho

### 1. Firebase Configuration / Configuración de Firebase
- ✅ **File created**: `src/config/firebase.ts`
- ✅ **Firebase SDK**: Already installed in package.json (v12.0.0)
- ✅ **Auto-initialization**: Added to `src/main.tsx`

### 2. Custom Hooks / Hooks Personalizados
- ✅ **File created**: `src/hooks/useFirebase.ts`
- ✅ **Authentication hook**: `useAuth()`
- ✅ **Products hook**: `useProducts()`
- ✅ **Analytics hook**: `useAnalytics()`

### 3. Examples / Ejemplos
- ✅ **File created**: `src/examples/FirebaseIntegration.tsx`
- ✅ **Auth example**: Login/logout functionality
- ✅ **Products example**: CRUD operations with Firestore
- ✅ **Analytics example**: Event tracking

---

## 🚀 How to Use / Cómo Usar

### Authentication / Autenticación

```tsx
import { useAuth } from '../hooks/useFirebase';

const MyComponent = () => {
  const { user, loading, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('admin@email.com', 'password');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

### Products with Firestore / Productos con Firestore

```tsx
import { useProducts } from '../hooks/useFirebase';

const ProductList = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();

  const handleAddProduct = async () => {
    await addProduct({
      name: 'Asado',
      price: 1500,
      category: 'vacuno',
      image: 'https://example.com/image.jpg',
      isOffer: true
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

### Analytics / Analíticas

```tsx
import { useAnalytics } from '../hooks/useFirebase';

const CartComponent = () => {
  const { logAddToCart, logPurchase, logEvent } = useAnalytics();

  const handleAddToCart = (product) => {
    logAddToCart('ARS', product.price, [{
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      price: product.price
    }]);
  };

  const handlePurchase = (cartItems, total) => {
    logPurchase(total, 'ARS', cartItems);
  };

  return (
    <div>
      {/* Your cart UI */}
    </div>
  );
};
```

---

## 🛠️ Next Steps / Próximos Pasos

### 1. Set up Firestore Database / Configurar Base de Datos Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nextcodecarniceria`
3. Navigate to **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select a location close to your users

### 2. Create Collections / Crear Colecciones

Create these collections in Firestore:

```
📁 products/
  └── {productId}/
      ├── name: string
      ├── price: number
      ├── category: string
      ├── image: string
      ├── isOffer: boolean
      ├── status: string
      ├── createdAt: timestamp
      └── updatedAt: timestamp

📁 orders/
  └── {orderId}/
      ├── userId: string
      ├── items: array
      ├── total: number
      ├── status: string
      ├── customerInfo: object
      └── createdAt: timestamp

📁 users/
  └── {userId}/
      ├── email: string
      ├── name: string
      ├── phone: string
      └── address: object
```

### 3. Set up Authentication / Configurar Autenticación

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Add your admin user in the **Users** tab

### 4. Configure Security Rules / Configurar Reglas de Seguridad

For Firestore (`rules_firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products can be read by anyone, but only authenticated users can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders can only be accessed by authenticated users
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Integrate with Existing Code / Integrar con Código Existente

#### Replace current ProductContext with Firebase:

```tsx
// In ProductContext.tsx, you can now use:
import { useProducts } from '../hooks/useFirebase';

// Instead of local state management
```

#### Add Analytics to Cart actions:

```tsx
// In Cart.tsx
import { useAnalytics } from '../hooks/useFirebase';

const Cart = () => {
  const { logAddToCart, logPurchase } = useAnalytics();
  
  // Track when user adds item to cart
  const addToCart = (product) => {
    // Your existing logic
    logAddToCart('ARS', product.price, [product]);
  };
};
```

---

## 🔒 Security Best Practices / Mejores Prácticas de Seguridad

### Environment Variables / Variables de Entorno

Create `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

Update `firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
};
```

### Production Rules / Reglas de Producción

For production, update Firestore rules to be more restrictive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null && isAdmin(request.auth);
      allow update, delete: if request.auth != null && isAdmin(request.auth);
    }
  }
  
  function isAdmin(auth) {
    return auth.token.admin == true;
  }
}
```

---

## 📊 Available Analytics Events / Eventos de Analytics Disponibles

- `add_to_cart` - When user adds item to cart
- `purchase` - When user completes purchase
- `view_item` - When user views product details
- `begin_checkout` - When user starts checkout process
- `add_payment_info` - When user adds payment method
- Custom events for your specific needs

---

## 🆘 Troubleshooting / Solución de Problemas

### Common Issues / Problemas Comunes

1. **Firebase not initialized**
   - Make sure `import './config/firebase'` is in `main.tsx`

2. **Firestore permission denied**
   - Check your security rules
   - Ensure user is authenticated for protected operations

3. **Analytics not working**
   - Analytics only works in browser environment
   - Check if `measurementId` is configured correctly

4. **Build errors**
   - Make sure all Firebase dependencies are installed
   - Check TypeScript configurations

---

## 📚 Additional Resources / Recursos Adicionales

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Analytics Events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

---

¡Firebase está listo para usar en tu carnicería! 🥩🔥