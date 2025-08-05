import React from 'react';
import { useButcheryComplete, useProductsByUrl, useButcheryByUrl } from '../hooks/useButchery';
import { getProductsByCurrentUrl } from '../services/butcheryService';

/**
 * Ejemplo 1: Uso del hook completo (recomendado)
 * Example 1: Using the complete hook (recommended)
 */
export const ButcheryCompleteExample: React.FC = () => {
  const { 
    butchery, 
    products, 
    loading, 
    error, 
    isButcheryFound, 
    hasProducts,
    productCount,
    refetch 
  } = useButcheryComplete();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p>Cargando carnicería...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={refetch}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!isButcheryFound) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
        <h3 className="text-yellow-800 font-semibold">Carnicería no encontrada</h3>
        <p className="text-yellow-600">
          No se encontró una carnicería configurada para la URL: <br />
          <code className="bg-yellow-100 px-2 py-1 rounded">{window.location.origin}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Información de la carnicería */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {butchery?.name || 'Carnicería'}
        </h1>
        <p className="text-gray-600 mb-1">
          <strong>URL:</strong> {butchery?.url}
        </p>
        <p className="text-gray-600">
          <strong>Productos disponibles:</strong> {productCount}
        </p>
      </div>

      {/* Lista de productos */}
      {hasProducts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
              {product.image && (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {product.name}
              </h3>
              <p className="text-xl font-bold text-orange-600 mb-2">
                ${product.price}
              </p>
              {product.category && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                  {product.category}
                </span>
              )}
              {product.isOffer && (
                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm ml-2">
                  ¡Oferta!
                </span>
              )}
              {product.description && (
                <p className="text-gray-600 text-sm mt-2">
                  {product.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No hay productos disponibles</p>
        </div>
      )}
    </div>
  );
};

/**
 * Ejemplo 2: Uso solo de productos
 * Example 2: Products only usage
 */
export const ProductsOnlyExample: React.FC = () => {
  const { products, loading, error, refetch } = useProductsByUrl();

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Productos ({products.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-orange-600 font-bold">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Ejemplo 3: Uso solo de información de carnicería
 * Example 3: Butchery info only usage
 */
export const ButcheryInfoExample: React.FC = () => {
  const { butchery, loading, error } = useButcheryByUrl();

  if (loading) return <div>Cargando información...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!butchery) return <div>Carnicería no encontrada</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{butchery.name}</h1>
      <p>URL: {butchery.url}</p>
      {/* Mostrar otros campos de la carnicería */}
    </div>
  );
};

/**
 * Ejemplo 4: Uso directo de la función (sin hook)
 * Example 4: Direct function usage (without hook)
 */
export const DirectUsageExample: React.FC = () => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getProductsByCurrentUrl();
      setProducts(fetchedProducts);
      console.log('Productos cargados:', fetchedProducts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button 
        onClick={loadProducts}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Cargando...' : 'Cargar Productos'}
      </button>
      
      {products.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Productos cargados:</h3>
          <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
            {JSON.stringify(products, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default {
  ButcheryCompleteExample,
  ProductsOnlyExample,
  ButcheryInfoExample,
  DirectUsageExample
};