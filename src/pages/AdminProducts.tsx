import React, { useState, useMemo, useEffect } from 'react';
import { ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Product } from '../types';
import { PencilIcon, MagnifyingGlassIcon, SparklesIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useProductContext, safeToast } from '../context/ProductContext';
import { addNewProduct, deleteProduct, updateProductImage } from '../data/api';
import clsx from 'clsx';

const toastConfig: ToastOptions = {
  position: "top-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const AdminProducts: React.FC = () => {
  const {
    state,
    toggleProductStatusAction,
    updateProductPriceAction,
    fetchProductsAction,
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleToggleProductStatus = (productId: string) => {
    toggleProductStatusAction(productId);
  };

  const handleUpdateProductPrice = (productId: string) => {
    const numericPrice = parseFloat(newPrice.replace(/\./g, ''));
    if (!isNaN(numericPrice)) {
      updateProductPriceAction(productId, numericPrice);
      setEditingPriceId(null);
    }
  };

  const handleUpdateProductName = (productId: string) => {
    if (newName.trim()) {
      updateProductNameAction(productId, newName.trim());
      setEditingNameId(null);
    }
  };

  const handleToggleProductOffer = (productId: string) => {
    toggleProductOfferAction(productId);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProductImage(file);
    }
  };

  const handleAddProduct = async () => {
    if (isAddingProduct) return;
    
    if (!newProductName || !newProductPrice || !newProductCategory || !newProductImage) {
      safeToast('Por favor, complete todos los campos', 'error', toastConfig);
      return;
    }

    setIsAddingProduct(true);
    
    try {
      await addNewProduct({
        name: newProductName,
        price: newProductPrice,
        category: newProductCategory,
        image: newProductImage,
        offer: newProductOffer
      });

      setIsModalOpen(false);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductCategory('');
      setNewProductImage(null);
      setNewProductOffer(false);
      await fetchProductsAction();
    } catch (error) {
      safeToast('Error al agregar el producto', 'error', toastConfig);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteModalProductId(productId);
  };

  const confirmDeleteProduct = () => {
    if (deleteModalProductId) {
      deleteProductAction(deleteModalProductId);
      setDeleteModalProductId(null);
    }
  };

  const cancelDeleteProduct = () => {
    setDeleteModalProductId(null);
  };

  const handleUpdateProductImage = (productId: string) => {
    if (newProductImage) {
      updateProductImageAction(productId, newProductImage);
      setEditingImageId(null);
      setNewProductImage(null);
      setImagePreview(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = useMemo(() => {
    return state.products.filter((product) => 
      (selectedCategory === null || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.products, searchTerm, selectedCategory]);

  if (state.error) {
    return <div className="text-center text-red-500">Error: {state.error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Administración de Productos
      </h1>
      <div className="mb-4 flex items-center space-x-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="relative">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full  py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {[
              'vacuno',
              'cerdo',
              'pollo',
              'anchuras',
              'fiambres',
              'congelados',
              'carbon',
              'bebidas'
            ].map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {state.loading ? (
        <div className="text-center">Cargando productos...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={clsx("border rounded p-2", product.active ? 'bg-white' : 'bg-gray-200', "flex flex-col relative")}
            >
              {editingImageId === product.id ? (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg p-6 w-96 max-w-md">
                    <h2 className="text-xl font-bold mb-4">Editar Imagen del Producto</h2>
                    
                    <div className="mb-4 flex justify-center">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Vista previa" 
                          className="max-h-48 object-contain rounded"
                        />
                      ) : (
                        <div className="h-48 w-full flex items-center justify-center border-2 border-dashed text-gray-400">
                          Sin imagen seleccionada
                        </div>
                      )}
                    </div>
                    
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full mb-4 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => {
                          setEditingImageId(null);
                          setNewProductImage(null);
                          setImagePreview(null);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => handleUpdateProductImage(editingImageId)}
                        disabled={!newProductImage}
                        className={`px-4 py-2 rounded ${
                          newProductImage 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="mb-2 flex justify-center items-center h-32 w-full">
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
              <button 
                onClick={() => setEditingImageId(product.id)}
                className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <div className="flex justify-between items-center mb-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleProductStatus(product.id)}
                    className={clsx("px-1 sm:px-2 py-1 rounded text-xs", product.active ? 'bg-red-500' : 'bg-green-500', "text-white")}
                  >
                    {product.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleToggleProductOffer(product.id)}
                    className={clsx("px-1 sm:px-2 py-1 rounded text-xs", product.offer ? 'bg-yellow-500' : 'bg-gray-300', "text-white")}
                  >
                    <SparklesIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1 rounded bg-red-100 text-red-500 hover:bg-red-200"
                    title="Eliminar producto"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                {editingNameId === product.id ? (
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-1 border rounded text-sm md:text-base mr-2"
                      placeholder="Nuevo nombre"
                    />
                    <button
                      onClick={() => handleUpdateProductName(product.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs md:text-base"
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center w-full">
                    <h2 className="text-xs sm:text-2xl font-semibold truncate flex-grow">
                      {product.name.charAt(0).toUpperCase() + product.name.slice(1)}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingNameId(product.id);
                        setNewName(product.name);
                      }}
                      className="text-blue-500 hover:text-blue-700 ml-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                {editingPriceId === product.id ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-20 sm:w-24 p-1 border rounded text-xs mr-2"
                      placeholder="Nuevo precio"
                    />
                    <button
                      onClick={() => handleUpdateProductPrice(product.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <p className="font-bold text-xs sm:text-sm">
                    ${' '}
                    {formatPrice(
                      typeof product.price === 'number'
                        ? product.price
                        : parseFloat(product.price)
                    )}
                  </p>
                )}
                {editingPriceId !== product.id && (
                  <button
                    onClick={() => {
                      setEditingPriceId(product.id);
                      setNewPrice(
                        formatPrice(
                          typeof product.price === 'number'
                            ? product.price
                            : parseFloat(product.price)
                        )
                      );
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Estado: {product.active ? 'Activo' : 'Inactivo'} {product.offer && ' • En Oferta'}
              </p>
            </div>
          ))}
        </div>
      )}
      {filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No se encontraron productos que coincidan con la búsqueda.
        </div>
      )}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Agregar Nuevo Producto</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del Producto"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Precio"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <select
                value={newProductCategory}
                onChange={(e) => setNewProductCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar Categoría</option>
                {[
                  'vacuno',
                  'cerdo',
                  'pollo',
                  'anchuras',
                  'fiambres',
                  'congelados',
                  'carbon',
                  'bebidas'
                ].map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <div className="flex items-center">
                <label>
                  <input
                    type="checkbox"
                    checked={newProductOffer}
                    onChange={(e) => setNewProductOffer(e.target.checked)}
                    className="mr-2"
                  />
                  Oferta
                </label>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded"
                />
                {newProductImage && (
                  <p className="text-sm text-gray-600 mt-2">
                    {newProductImage.name}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                disabled={isAddingProduct}
                className={clsx(
                  "px-4 py-2 rounded",
                  isAddingProduct 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                )}
              >
                {isAddingProduct ? 'Agregando...' : 'Agregar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteModalProductId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="mb-4">¿Estás seguro de que quieres eliminar este producto?</p>
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
  );
};