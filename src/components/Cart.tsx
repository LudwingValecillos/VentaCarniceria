import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, X, Plus, Minus, Trash2, Send, CreditCard, DollarSign, Smartphone } from "lucide-react";
import { CartItem, CustomerInfo } from "../types";
import { STORE_CONFIG } from "../config/store";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem }: CartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    location: "",
    paymentMethod: "cash",
  });

  const total = items.reduce(
    (sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return sum + price * item.quantity;
    },
    0
  );

  // Función para formatear precios con separadores de miles
  const formatPrice = (price: number): string => {
    return price.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleWhatsAppOrder = () => {
    const message =
      `*Nuevo Pedido*\n\n` +
      `*Cliente:* ${customerInfo.name}\n` +
      `*Ubicación:* ${customerInfo.location}\n` +
      `*Método de Pago:* ${customerInfo.paymentMethod}\n\n` +
      `*Productos:*\n${items
        .map(
          (item) => {
            const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            return `- ${item.name}: ${item.quantity}kg x $${formatPrice(
              price
            )} = $${formatPrice(price * item.quantity)}`;
          }
        )
        .join("\n")}\n\n` +
      `*Total:* $${formatPrice(total)}`;

    window.open(
      `${STORE_CONFIG.social.whatsapp.url}?text=${encodeURIComponent(message)}`
    );
    setIsOpen(false);
    setShowCustomerForm(false);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'transfer':
        return <Smartphone className="w-4 h-4" />;
      case 'mercadopago':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Cerrar modal con tecla Escape y manejar body scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl shadow-medium hover:shadow-colored transition-all duration-200 hover:scale-105 group"
      >
        <ShoppingCart className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse">
            {items.length}
          </span>
        )}
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {items.length === 0 ? 'Carrito vacío' : `${totalItems}kg en carrito`}
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-2 md:p-4 animate-fade-in "
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
          <div 
            className=" bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] md:max-h-[95vh] overflow-hidden animate-scale-in border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-lobster">Mi Carrito</h2>
                  <p className="text-white/90 text-sm">
                    {items.length} {items.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {!showCustomerForm ? (
              <div className="flex flex-col h-[calc(90vh-10rem)] md:h-[calc(90vh-8rem)]">
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                  {items.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mb-6">
                        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <div className="text-6xl mb-4">🛒</div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {STORE_CONFIG.messages.emptyCart.title}
                      </h3>
                      <p className="text-gray-500 text-base mb-6">
                        {STORE_CONFIG.messages.emptyCart.subtitle}
                      </p>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                      >
                        {STORE_CONFIG.messages.emptyCart.button}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg shadow-soft"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                              <p className="text-sm text-gray-600">
                                ${formatPrice(typeof item.price === 'string' ? parseFloat(item.price) : item.price)}/kg
                              </p>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.id,
                                      Math.max(0, item.quantity - 0.5)
                                    )
                                  }
                                  className="bg-white border border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-600 p-1.5 rounded-lg transition-all duration-200"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-medium min-w-[60px] text-center bg-white px-3 py-1.5 rounded-lg border">
                                  {item.quantity}kg
                                </span>
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(item.id, item.quantity + 0.5)
                                  }
                                  className="bg-white border border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-600 p-1.5 rounded-lg transition-all duration-200"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Price and Remove */}
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-800">
                                ${formatPrice((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity)}
                              </p>
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with Total and Checkout */}
                {items.length > 0 && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-700">Total:</span>
                      <span className="text-2xl font-bold text-red-600">
                        ${formatPrice(total)}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCustomerForm(true)}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Finalizar Pedido
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Customer Information Form */
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Información de Contacto</h3>
                  <p className="text-gray-600 text-sm">Completa tus datos para finalizar el pedido</p>
                </div>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleWhatsAppOrder();
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-modern w-full"
                      placeholder="Ingresa tu nombre"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección de entrega *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-modern w-full"
                      placeholder="Calle, número, ciudad"
                      value={customerInfo.location}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pago *
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'cash', label: 'Efectivo', desc: 'Pago al recibir' },
                        { value: 'card', label: 'Tarjeta', desc: 'Débito/Crédito' },
                        { value: 'transfer', label: 'Transferencia', desc: 'Bancaria' },
                        { value: 'mercadopago', label: 'MercadoPago', desc: 'Digital' }
                      ].map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            customerInfo.paymentMethod === method.value
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                          }`}
                        >
                          <input
                            type="radio"
                            value={method.value}
                            checked={customerInfo.paymentMethod === method.value}
                                                         onChange={(e) =>
                               setCustomerInfo({
                                 ...customerInfo,
                                 paymentMethod: e.target.value as 'cash' | 'card' | 'transfer' | 'mercadopago',
                               })
                             }
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            {getPaymentIcon(method.value)}
                            <div>
                              <div className="font-medium text-gray-800">{method.label}</div>
                              <div className="text-sm text-gray-500">{method.desc}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCustomerForm(false)}
                        className="flex-1 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 py-2 px-4 rounded-xl font-semibold transition-all duration-200"
                      >
                        Volver
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Enviar Pedido
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
