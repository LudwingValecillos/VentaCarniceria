import React, { useState, useMemo, useEffect } from 'react';
// Removed unused ToastOptions import
import 'react-toastify/dist/ReactToastify.css';
import { PencilIcon, MagnifyingGlassIcon, SparklesIcon, PlusIcon, TrashIcon, ShoppingCartIcon, ClockIcon, CubeIcon } from '@heroicons/react/24/solid';
import { Package } from 'lucide-react';
import { useProductContext, safeToast } from '../context/ProductContext';
import SalesModal from '../components/SalesModal';
import SalesHistory from '../components/SalesHistory';
import AddStockModal from '../components/AddStockModal';
import clsx from 'clsx';

// Toast configuration is now handled by safeToast function

export const AdminProducts: React.FC = () => {
  const {
    state,
    toggleProductStatusAction,
    updateProductPriceAction,
    fetchProductsAction,
    addProductAction,
    toggleProductOfferAction,
    updateProductNameAction,
    deleteProductAction,
    updateProductImageAction
  } = useProductContext();
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductOffer, setNewProductOffer] = useState(false);
  const [deleteModalProductId, setDeleteModalProductId] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'sales'>('products');

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://plausible.io/js/script.js";
    script.defer = true;
    script.setAttribute("data-domain", "lodenachocarniceria.com");
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    fetchProductsAction();
  }, [fetchProductsAction]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleToggleProductStatus = async (productId: string) => {
    try {
      await toggleProductStatusAction(productId);
      safeToast('Estado del producto actualizado', 'success');
    } catch {
      safeToast('Error al cambiar el estado del producto', 'error');
    }
  };

  const handleUpdateProductPrice = async (productId: string) => {
    const numericPrice = parseFloat(newPrice.replace(/\./g, ''));
    if (!isNaN(numericPrice)) {
      try {
        await updateProductPriceAction(productId, numericPrice);
        setEditingPriceId(null);
        safeToast('Precio actualizado exitosamente', 'success');
      } catch {
        safeToast('Error al actualizar el precio', 'error');
      }
    }
  };

  const handleUpdateProductName = async (productId: string) => {
    if (newName.trim()) {
      try {
        await updateProductNameAction(productId, newName.trim());
        setEditingNameId(null);
        safeToast('Nombre actualizado exitosamente', 'success');
      } catch {
        safeToast('Error al actualizar el nombre', 'error');
      }
    }
  };

  const handleToggleProductOffer = async (productId: string) => {
    try {
      await toggleProductOfferAction(productId);
      safeToast('Estado de oferta actualizado', 'success');
    } catch {
      safeToast('Error al cambiar el estado de oferta', 'error');
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName || !newProductPrice || !newProductCategory || !newProductImage) {
      safeToast('Por favor completa todos los campos', 'error');
      return;
    }

    const priceValue = parseFloat(newProductPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      safeToast('Precio debe ser un número válido mayor que 0', 'error');
      return;
    }

    setIsAddingProduct(true);
    try {
      await addProductAction({
        name: newProductName.trim(),
        price: priceValue,
        category: newProductCategory.trim(),
        image: newProductImage,
        description: '',
        offer: newProductOffer
      });
      
      setNewProductName('');
      setNewProductPrice('');
      setNewProductCategory('');
      setNewProductImage(null);
      setNewProductOffer(false);
      setIsModalOpen(false);
      
      safeToast('Producto agregado exitosamente', 'success');
    } catch {
      safeToast('Error al agregar el producto', 'error');
    }
    setIsAddingProduct(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductAction(productId);
      safeToast('Producto eliminado exitosamente', 'success');
    } catch {
      safeToast('Error al eliminar el producto', 'error');
    }
  };

  const confirmDeleteProduct = () => {
    if (deleteModalProductId) {
      handleDeleteProduct(deleteModalProductId);
      setDeleteModalProductId(null);
    }
  };

  const cancelDeleteProduct = () => {
    setDeleteModalProductId(null);
  };

  const handleImageUpdate = async (productId: string, file: File) => {
    try {
      await updateProductImageAction(productId, file);
      setEditingImageId(null);
      safeToast('Imagen actualizada exitosamente', 'success');
    } catch {
      safeToast('Error al actualizar la imagen', 'error');
    }
  };

  const filteredProducts = useMemo(() => {
    return state.products.filter(product => 
      (selectedCategory === null || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.products, searchTerm, selectedCategory]);

  if (state.error) {
    return <div className="text-center text-red-500">Error: {state.error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* Header - Optimizado para móvil */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          Panel de Administración
        </h1>
        {activeTab === 'products' && (
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setIsAddStockModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Agregar Stock</span>
              <span className="sm:hidden">Stock</span>
            </button>
            <button
              onClick={() => setIsSalesModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nueva Venta</span>
              <span className="sm:hidden">Venta</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs - Optimizado para móvil */}
      <div className="mb-4 md:mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <CubeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Gestión de Productos</span>
                <span className="sm:hidden">Productos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Historial de Ventas</span>
                <span className="sm:hidden">Ventas</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' ? (
        <div className="space-y-4">
          {/* Search and filters - Optimizado para móvil */}
          <div className="mb-4 space-y-3 md:space-y-0 md:flex md:items-center md:space-x-4">
            {/* Búsqueda - Ancho completo en móvil */}
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 md:py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            
            {/* Filtros y botón - Flex en una fila en móvil */}
            <div className="flex gap-2 md:gap-4">
              <div className="relative flex-1 md:flex-none">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full bg-white border rounded-lg px-3 py-2.5 md:px-4 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {Array.from(new Set(state.products.map(p => p.category))).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2.5 md:px-4 md:py-2 rounded-lg text-sm flex items-center space-x-1 md:space-x-2 flex-shrink-0"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden md:inline">Agregar</span>
                <span className="md:hidden">+</span>
              </button>
            </div>
          </div>

          {/* Products grid */}
          {state.loading ? (
            <div className="text-center">Cargando productos...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white border rounded-lg p-2 md:p-3 shadow-sm">
                  <div className="relative mb-2 md:mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-20 md:h-32 object-contain rounded-lg"
                      loading="lazy"
                    />
                    {editingImageId === product.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpdate(product.id, file);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <PencilIcon className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <button
                      onClick={() => setEditingImageId(editingImageId === product.id ? null : product.id)}
                      className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1 rounded-full"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    {/* Product name */}
                    {editingNameId === product.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1 border rounded px-1 py-1 text-xs md:text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateProductName(product.id)}
                        />
                        <button
                          onClick={() => handleUpdateProductName(product.id)}
                          className="bg-green-500 text-white px-1.5 py-1 rounded text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingNameId(null)}
                          className="bg-gray-500 text-white px-1.5 py-1 rounded text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-blue-600 group"
                        onClick={() => {
                          setEditingNameId(product.id);
                          setNewName(product.name);
                        }}
                      >
                        <h3 className="font-semibold text-xs md:text-sm leading-tight">
                          {product.name}
                        </h3>
                        <PencilIcon className="h-2.5 w-2.5 md:h-3 md:w-3 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                      </div>
                    )}

                    {/* Product price */}
                    {editingPriceId === product.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="flex-1 border rounded px-1 py-1 text-xs md:text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateProductPrice(product.id)}
                          placeholder="Nuevo precio"
                        />
                        <button
                          onClick={() => handleUpdateProductPrice(product.id)}
                          className="bg-green-500 text-white px-1.5 py-1 rounded text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingPriceId(null)}
                          className="bg-gray-500 text-white px-1.5 py-1 rounded text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:text-green-700 group"
                        onClick={() => {
                          setEditingPriceId(product.id);
                          setNewPrice(typeof product.price === 'number' ? product.price.toString() : product.price);
                        }}
                      >
                        <p className="text-sm md:text-lg font-bold text-green-600">
                          ${formatPrice(typeof product.price === 'number' ? product.price : parseFloat(product.price))}
                        </p>
                        <PencilIcon className="h-2.5 w-2.5 md:h-3 md:w-3 text-gray-400 group-hover:text-green-500 transition-colors flex-shrink-0" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-[10px] md:text-xs text-gray-600">{product.category}</p>
                      <p className="text-[10px] md:text-xs text-gray-600">Stock: {product.stock || 0}</p>
                    </div>

                    {/* Product controls - Optimizado para móvil */}
                    <div className="flex flex-col gap-1 pt-1 md:pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleProductStatus(product.id)}
                            className={clsx(
                              'px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-medium',
                              product.active 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            )}
                          >
                            {product.active ? 'Activo' : 'Inactivo'}
                          </button>

                          <button
                            onClick={() => handleToggleProductOffer(product.id)}
                            className={clsx(
                              'px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-medium',
                              product.offer
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            )}
                          >
                            {product.offer ? (
                              <div className="flex items-center space-x-0.5">
                                <SparklesIcon className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                <span className="hidden md:inline">Oferta</span>
                                <span className="md:hidden">★</span>
                              </div>
                            ) : (
                              <span className="hidden md:inline">Sin oferta</span>
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => setDeleteModalProductId(product.id)}
                          className="text-red-500 hover:text-red-700 p-0.5 md:p-1"
                        >
                          <TrashIcon className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Product Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4">Agregar Nuevo Producto</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Categoría"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewProductImage(e.target.files?.[0] || null)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="newProductOffer"
                      checked={newProductOffer}
                      onChange={(e) => setNewProductOffer(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="newProductOffer" className="text-sm">Marcar como oferta</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddProduct}
                    disabled={isAddingProduct}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {isAddingProduct ? 'Agregando...' : 'Agregar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModalProductId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-sm mx-4">
                <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres eliminar este producto?
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelDeleteProduct}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmDeleteProduct}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <SalesHistory />
      )}

      {/* Sales Modal */}
      <SalesModal 
        isOpen={isSalesModalOpen}
        onClose={() => setIsSalesModalOpen(false)}
      />

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
};

export default AdminProducts;