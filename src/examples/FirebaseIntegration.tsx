// EJEMPLO DE INTEGRACIÓN DE FIREBASE
// Este archivo muestra cómo usar los hooks de Firebase en tu aplicación

import React, { useState } from 'react';
import { useAuth, useProducts, useAnalytics } from '../hooks/useFirebase';
import { Product } from '../types';

// Ejemplo 1: Componente de autenticación
export const AuthExample: React.FC = () => {
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      console.log('Usuario autenticado correctamente');
    } catch (error) {
      console.error('Error de autenticación:', error);
    }
  };

  if (loading) return <div>Cargando autenticación...</div>;

  return (
    <div className="p-4">
      {isAuthenticated ? (
        <div>
          <p>Bienvenido: {user?.email}</p>
          <button 
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Iniciar Sesión
          </button>
        </form>
      )}
    </div>
  );
};

// Ejemplo 2: Componente de gestión de productos con Firebase
export const ProductsFirebaseExample: React.FC = () => {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();
  const { logEvent, logAddToCart, logViewItem } = useAnalytics();
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    isOffer: false
  });

  // Agregar producto a Firebase
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        status: 'active'
      });
      
      // Log event para analytics
      logEvent('product_added', {
        product_name: newProduct.name,
        category: newProduct.category
      });

      // Limpiar formulario
      setNewProduct({
        name: '',
        price: '',
        category: '',
        image: '',
        isOffer: false
      });
      
      console.log('Producto agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  // Simular agregar al carrito con analytics
  const handleAddToCart = (product: any) => {
    logAddToCart('ARS', product.price, [{
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      price: product.price
    }]);
    console.log('Evento add_to_cart enviado a Firebase Analytics');
  };

  // Simular ver producto con analytics
  const handleViewProduct = (product: any) => {
    logViewItem('ARS', product.price, [{
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      price: product.price
    }]);
    console.log('Evento view_item enviado a Firebase Analytics');
  };

  if (loading) return <div>Cargando productos desde Firebase...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Productos desde Firebase</h2>
      
      {/* Formulario para agregar producto */}
      <form onSubmit={handleAddProduct} className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Agregar Nuevo Producto</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Precio"
            value={newProduct.price}
            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Categoría"
            value={newProduct.category}
            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="url"
            placeholder="URL de imagen"
            value={newProduct.image}
            onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
            className="border px-3 py-2 rounded"
          />
        </div>
        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newProduct.isOffer}
              onChange={(e) => setNewProduct({...newProduct, isOffer: e.target.checked})}
              className="mr-2"
            />
            ¿Es una oferta?
          </label>
        </div>
        <button 
          type="submit"
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Agregar Producto
        </button>
      </form>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded p-4">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-gray-600">Precio: ${product.price}</p>
            <p className="text-sm text-gray-500">Categoría: {product.category}</p>
            {product.isOffer && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                ¡Oferta!
              </span>
            )}
            
            <div className="mt-2 space-x-2">
              <button 
                onClick={() => handleViewProduct(product)}
                className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
              >
                Ver Producto
              </button>
              <button 
                onClick={() => handleAddToCart(product)}
                className="bg-green-500 text-white px-2 py-1 rounded text-sm"
              >
                Agregar al Carrito
              </button>
              <button 
                onClick={() => deleteProduct(product.id)}
                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No hay productos en Firebase. ¡Agrega el primer producto!
        </p>
      )}
    </div>
  );
};

// Ejemplo 3: Cómo integrar analytics en acciones del carrito
export const CartWithAnalytics: React.FC = () => {
  const { logPurchase, logAddToCart, logEvent } = useAnalytics();

  const handlePurchase = (cartItems: any[], total: number) => {
    // Log de compra completa
    logPurchase(total, 'ARS', cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price
    })));

    // Log personalizado
    logEvent('checkout_completed', {
      value: total,
      currency: 'ARS',
      items_count: cartItems.length
    });

    console.log('Eventos de compra enviados a Firebase Analytics');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Ejemplo de Analytics en Carrito</h2>
      <p className="text-gray-600 mt-2">
        Este componente muestra cómo integrar Firebase Analytics 
        en las acciones del carrito de compras.
      </p>
      
      <button 
        onClick={() => handlePurchase([
          { id: '1', name: 'Asado', category: 'vacuno', quantity: 2, price: 1500 },
          { id: '2', name: 'Pollo', category: 'pollo', quantity: 1, price: 800 }
        ], 3800)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Simular Compra
      </button>
    </div>
  );
};

export default {
  AuthExample,
  ProductsFirebaseExample,
  CartWithAnalytics
};