import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { Product, CartItem } from './types';
import { Menu, MessageCircle } from 'lucide-react';
import { useProductContext } from './context/ProductContext';
import logo from './images/logolodenacho.png';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { STORE_CONFIG } from './config/store';
  
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

const App: React.FC = () => {
  const { state, fetchProductsAction } = useProductContext(); // Use global state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    fetchProductsAction();
  }, [fetchProductsAction]);

  // Memoize filtered products to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    return state.products.filter(product => {
      // Validate product object
      if (!product || !product.name || !product.category) {
        console.warn('Invalid product:', product);
        return false;
      }

      const matchesCategory = !selectedCategory || 
        (selectedCategory === 'Ofertas' 
          ? product.offer === true 
          : product.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Only show active products
      return (product.active === true) && matchesCategory && matchesSearch;
    });
  }, [state.products, selectedCategory, searchQuery]);

  // Memoize cart-related handlers to prevent unnecessary re-renders
  const handleAddToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        // Use a single, unique toast ID for cart updates
        toast.info(`Se agregó 0.5 kg de ${product.name} al carrito`, {
          ...toastConfig,
          toastId: 'cart-update'
        });
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 0.5 }
            : item
        );
      }
      
      // Use a unique toast ID for new cart items
      toast.success(`Se agregó ${product.name} al carrito`, {
        ...toastConfig,
        toastId: 'cart-add'
      });
      
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleWhatsAppContact = useCallback(() => {
    window.open(STORE_CONFIG.social.whatsapp.url, '_blank');
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
    const productSection = document.getElementById('product-section');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const location = useLocation();
  const showSearch = location.pathname !== '/admin/productos';
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleSidebar()}
              className="p-2.5 hover:bg-red-50 rounded-xl transition-colors duration-200 group"
            >
              <Menu className="w-6 h-6 text-red-600 group-hover:text-red-700" />
            </button>
            <Link to="/" className='flex items-center justify-center group' onClick={() => setSelectedCategory(null)}>
              <h1 className="hidden md:block text-2xl font-bold text-red-600 font-lobster tracking-wide">
                {STORE_CONFIG.name}
              </h1>
              <img 
                src={logo} 
                alt="Logo" 
                className="w-20 h-16 ml-2 transition-transform duration-300 group-hover:scale-105 drop-shadow-md" 
              />
            </Link>
          </div>
          
          <div className="flex-1 justify-center items-center max-w-xl mx-4 md:mr-24">
            {showSearch && (
              <div className="relative md:pr-0">
                <input
                  type="text"
                  placeholder="Buscar productos, ofertas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-modern w-full pl-12 pr-4 py-3 text-sm md:text-base placeholder:text-gray-400"
                />
                
              </div>
            )}
          </div>
          
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCategorySelect={handleCategorySelect}
      />

      {/* Main Content */}
      <div className="mt-16">
        <Outlet /> {/* This will render nested routes */}
      </div>

      {/* Products Section */}
      {showSearch && (
        <div id="product-section" className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {state.loading ? (
              <div className="flex flex-col justify-center items-center py-16">
                <div className="card-modern p-8 text-center max-w-md mx-auto">
                  <div className="animate-spin w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                  <h2 className="text-2xl font-bold text-red-600 mb-4">
                    {STORE_CONFIG.messages.loading.title}
                  </h2>
                  <p className="text-gray-600">{STORE_CONFIG.messages.loading.subtitle}</p>
                </div>
              </div>
            ) : state.error ? (
              <div className="text-center py-16">
                <div className="card-modern p-8 max-w-md mx-auto">
                  <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{STORE_CONFIG.messages.error.title}</h2>
                  <p className="text-gray-600">Error: {state.error}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Category Header */}
                {selectedCategory !== null ? (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
                      <span className="text-2xl">🥩</span>
                      <h2 className="text-xl font-bold font-lobster">
                        {selectedCategory}
                      </h2>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="card-modern p-2 md:p-8 max-w-2xl mx-auto bg-gradient-to-r from-orange-500 to-red-500">
                      <h2 className="font-lobster text-2xl md:text-4xl mb-4 tracking-wide">
                        {STORE_CONFIG.messages.offers.title}
                      </h2>
                      <p className=" text-lg">
                        {STORE_CONFIG.messages.offers.subtitle}
                      </p>
                      <button 
                        onClick={() => handleCategorySelect('Ofertas')} 
                        className="bg-white text-red-600 hover:bg-red-50 border-2 border-white hover:border-red-200 px-8 py-3 text-lg font-bold rounded-xl transition-all duration-200 hover:scale-105"
                      >
                        {STORE_CONFIG.messages.offers.button}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 justify-items-center">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart} 
                      className={clsx(
                        "animate-fade-in",
                        {
                          'opacity-50': !product.active,
                        }
                      )}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && !state.loading && (
                  <div className="text-center py-16">
                    <div className="card-modern p-8 max-w-md mx-auto">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {STORE_CONFIG.messages.noProducts.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {STORE_CONFIG.messages.noProducts.subtitle}
                      </p>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory(null);
                        }}
                        className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                      >
                        {STORE_CONFIG.messages.noProducts.button}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed WhatsApp Button */}
      {window.location.href.includes('admin') ? null : <button
        onClick={handleWhatsAppContact}
        className="fixed bottom-6 right-6 z-40 bg-green-500 p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>}
      

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <img src={logo} alt="Logo" className="w-12 h-12" />
                  <h3 className="text-2xl font-bold font-lobster text-orange-400">
                    {STORE_CONFIG.name}
                  </h3>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {STORE_CONFIG.description}
                </p>
                <div className="flex gap-4">
                  <a 
                    href={STORE_CONFIG.social.instagram.url} 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:scale-110 transition-all duration-200 shadow-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a 
                    href={STORE_CONFIG.social.facebook.url} 
                    className="bg-blue-600 text-white p-3 rounded-xl hover:scale-110 transition-all duration-200 shadow-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a 
                    href={STORE_CONFIG.social.whatsapp.url}
                    className="bg-green-500 text-white p-3 rounded-xl hover:scale-110 transition-all duration-200 shadow-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Contact Section */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-orange-400">Contacto</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">📞</span>
                    <span>{STORE_CONFIG.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">🚚</span>
                    <span>{STORE_CONFIG.contact.delivery}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-400">📍</span>
                    <span>{STORE_CONFIG.contact.location}</span>
                  </div>
                </div>
              </div>

              {/* Schedule Section */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-orange-400">Horarios</h3>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <div className="font-medium text-white">{STORE_CONFIG.hours.weekdays.days}</div>
                    <div className="text-sm">{STORE_CONFIG.hours.weekdays.morning}</div>
                    <div className="text-sm">{STORE_CONFIG.hours.weekdays.afternoon}</div>
                  </div>
                  <div>
                    <div className="font-medium text-white">{STORE_CONFIG.hours.weekend.days}</div>
                    <div className="text-sm">{STORE_CONFIG.hours.weekend.hours}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} {STORE_CONFIG.name}. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Hecho con</span>
                <span className="text-red-400 text-lg">❤️</span>
                <span>para nuestros clientes</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ToastContainer {...toastConfig} />
    </div>
  );
};

export default React.memo(App);