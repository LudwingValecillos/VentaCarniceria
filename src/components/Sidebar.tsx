import { X, ChevronDown, ChevronUp, Home, Package, MessageCircle, Instagram, Facebook, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { STORE_CONFIG } from '../config/store';
import logo from '../images/logolodenacho.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (category: string | null) => void;
}

export function Sidebar({ isOpen, onClose, onCategorySelect }: SidebarProps) {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const location = useLocation();

  const categories = STORE_CONFIG.categories;

  // Check if we're on the demo site
  const isDemoSite = window.location.href === 'https://voluble-squirrel-a30bd3.netlify.app/' || window.location.href === 'http://localhost:5173/';

  const clearStorage = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img 
                  src={STORE_CONFIG.logoUrl || logo} 
                  alt="Logo" 
                  className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1"
                />
                <div>
                  <h2 className="text-lg font-bold font-lobster tracking-wide">Menú</h2>
                  <p className="text-white/90 text-sm">{STORE_CONFIG.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation content */}
          <nav className="flex-1 overflow-y-auto">
            {location.pathname === '/admin/productos' ? (
              <div className="p-4 space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-4 p-4 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
                  onClick={onClose}
                >
                  <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Volver al Inicio</span>
                </Link>
                <Link
                  to="/"
                  className="flex items-center gap-4 p-4 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
                  onClick={clearStorage}
                >
                  <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Cerrar Sesión</span>
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {/* Inicio */}
                <Link
                  to="/"
                  className="flex items-center gap-4 p-4 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
                  onClick={onClose}
                >
                  <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Inicio</span>
                </Link>

                {/* Demo Login Button */}
                

                {/* Productos section */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <button
                    onClick={() => setIsProductsOpen(!isProductsOpen)}
                    className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Productos</span>
                    </div>
                    {isProductsOpen ? (
                      <ChevronUp className="w-5 h-5 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="w-5 h-5 transition-transform duration-200" />
                    )}
                  </button>

                  {/* Categories dropdown */}
                  <div className={`overflow-hidden transition-all duration-300 ease-out ${
                    isProductsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pl-4 pr-2 py-2 space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category.name}
                          onClick={() => {
                            onCategorySelect(category.name === 'Todos' ? null : category.name);
                            onClose();
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left hover:bg-red-50 group ${
                            category.name === 'Ofertas' 
                              ? 'text-red-600 bg-red-50 font-semibold' 
                              : 'text-gray-600 hover:text-red-600'
                          }`}
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform">
                            {category.icon}
                          </span>
                          <span className="font-medium">{category.name}</span>
                          {category.name === 'Ofertas' && (
                            <span className="ml-auto bg-red-100 text-red-600 px-2 py-1 text-xs rounded-full font-bold">
                              HOT
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <a
                    href={STORE_CONFIG.social.whatsapp.url}
                    className="flex items-center gap-4 p-4 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-200 group"
                    onClick={onClose}
                  >
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Contacto WhatsApp</span>
                  </a>
                </div>
                {isDemoSite && (
                  <Link
                    to="/login"
                    className="flex items-center gap-4 p-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200 group"
                    onClick={onClose}
                  >
                    <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Iniciar Sesión (Demo)</span>
                  </Link>
                )}
              </div>
            )}
          </nav>

          {/* Footer del sidebar */}
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 font-medium">Síguenos en</p>
            </div>
            <div className="flex justify-center space-x-4">
              <a 
                href={STORE_CONFIG.social.instagram.url} 
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all duration-200 shadow-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-sm font-medium">Instagram</span>
              </a>
              <a 
                href={STORE_CONFIG.social.facebook.url} 
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all duration-200 shadow-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-4 h-4" />
                <span className="text-sm font-medium">Facebook</span>
              </a>
            </div>
            
            {/* Info adicional */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center leading-relaxed">
                <span className="font-medium">Horarios:</span>
                <div className="mt-1" dangerouslySetInnerHTML={{ __html: STORE_CONFIG.schedules.replace(/\|/g, '<br/>') }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}