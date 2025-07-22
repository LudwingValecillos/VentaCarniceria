import { Plus, Tag } from "lucide-react";
import { Product } from "../types";
import clsx from "clsx";
import { memo } from "react";


// Función para formatear precios con separadores de miles
const formatPrice = (price: number | string | null | undefined): string => {
  if (price == null) return "0.00";
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Función para capitalizar la primera letra
const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  className?: string;
}

const ProductCard = memo(({ product, onAddToCart, className }: ProductCardProps) => {
  const isOffer =
    product.offer ||
    product.name.includes("x") ||
    product.name.includes("X") ||
    product.name.includes("por");

  return (
    <div
      className={clsx(
        "card-modern relative",
        // Dimensiones optimizadas para móvil
        "w-full sm:max-w-[200px] sm:h-[280px] md:max-w-[280px] md:h-[360px]",
        "bg-white",
        "transition-all duration-300 ease-out md:hover-lift md:group md:cursor-pointer",
        "animate-fade-in",
        className
      )}
    >
      {/* Badge de oferta - más pequeño en móvil */}
      {isOffer && (
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg animate-scale-in">
          <Tag className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-1" />
          OFERTA
        </div>
      )}

      {/* Contenedor de imagen - altura optimizada */}
      <div className="relative h-28 sm:h-36 md:h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay gradient en hover solo desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-300" />
      </div>

      {/* Contenido del producto - padding optimizado */}
      <div className="p-2 sm:p-3 md:p-4 flex flex-col justify-between h-[calc(100%-7rem)] sm:h-[calc(100%-9rem)] md:h-[calc(100%-14rem)]">
        {/* Nombre del producto - texto más pequeño en móvil */}
        <div className="mb-2 md:mb-3">
          <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base leading-tight line-clamp-2 md:group-hover:text-red-600 md:transition-colors md:duration-200">
            {capitalizeFirstLetter(product.name)}
          </h3>
        </div>

        {/* Precio y categoría */}
        <div className="flex flex-col gap-1 sm:gap-2">
          {/* Categoría - más pequeña en móvil */}
          <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-medium">
            {product.category}
          </span>
          
          {/* Precio y botón - layout optimizado */}
          <div className="flex items-center justify-between">
            <span
              className={clsx("font-bold text-sm sm:text-base md:text-xl md:transition-colors md:duration-200", {
                "text-red-600 md:group-hover:text-red-700": isOffer,
                "text-gray-800 md:group-hover:text-red-600": !isOffer,
              })}
            >
              {isOffer
                ? `$${formatPrice(product.price)}`
                : `$${formatPrice(product.price)}/kg`}
            </span>

            {/* Botón de agregar al carrito - más pequeño en móvil */}
            <button
              onClick={() => onAddToCart(product)}
              className="bg-red-600 text-white p-1.5 sm:p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-medium transition-all duration-200 md:hover:bg-red-700 md:hover:shadow-colored md:hover:scale-105"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de disponibilidad */}
      <div className={clsx("absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-colors duration-300", {
        "bg-gradient-to-r from-green-400 to-emerald-500": product.active,
        "bg-gradient-to-r from-gray-300 to-gray-400": !product.active,
      })} />
    </div>
  );
  });
  
  ProductCard.displayName = "ProductCard";
  
  export { ProductCard };